import { AppError } from '../../utils/errors.js';
import { prisma } from '../../config/database.js';
import { AuthorizationService } from '../../services/authorization.service.js';
import { UserRepository } from '../users/user.repository.js';
import { CampaignCompetencyRepository } from './campaignCompetency.repository.js';
import { EvaluationRepository } from '../evaluations/evaluation.repository.js';
import { GroupRepository } from '../groups/group.repository.js';

class CampaignService {
  constructor(campaignRepository, evaluationRepository) {
    this.campaignRepository = campaignRepository;
    this.evaluationRepository = evaluationRepository || new EvaluationRepository();
    this.userRepository = new UserRepository();
    this.campaignCompetencyRepository = new CampaignCompetencyRepository();
    this.groupRepository = new GroupRepository();
  }

  async create(data, userTipo) {
    AuthorizationService.requireAdmin(userTipo);

    this._validateCompetencyIds(data.competencyIds);
    this._validateDatas(data.dataInicio, data.dataFim);

    // Valida gestores se fornecidos
    if (data.gestorIds && data.gestorIds.length > 0) {
      await this._validateGestores(data.gestorIds);
    }

    const tiposAlvo = ['colaborador', 'gestor', 'todos'];
    if (!tiposAlvo.includes(data.tipoAlvo)) {
      throw new AppError('tipoAlvo deve ser: colaborador, gestor ou todos', 400);
    }

    const tiposAvaliacao = ['desempenho', 'potencial'];
    if (!tiposAvaliacao.includes(data.tipoAvaliacao)) {
      throw new AppError('tipoAvaliacao deve ser: desempenho ou potencial', 400);
    }

    // Cria a campanha sem competencyIds e criterios
    const { competencyIds, gestorIds, gestorColaboradores, ...campaignData } = data;
    
    return await prisma.$transaction(async (tx) => {
      const campaign = await this.campaignRepository.create({
        ...campaignData,
        gestorIds,
        gestorColaboradores
      });

      // Associa as competências à campanha
      if (competencyIds && competencyIds.length > 0) {
        await tx.campaignCompetency.createMany({
          data: competencyIds.map(id => ({
            campaignId: campaign.id,
            competencyId: id
          }))
        });
      }

      return campaign;
    });
  }

  async findById(id, userId, userTipo) {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    // Gestor só pode ver campanhas onde é responsável
    if (userTipo === 'gestor') {
      const isResponsavel = campaign.gestores.some(g => g.gestorId === userId);
      if (!isResponsavel) {
        throw new AppError('Sem permissão para ver esta campanha', 403);
      }
    }

    // Colaborador só pode ver campanhas ativas onde pode participar
    if (userTipo === 'colaborador') {
      if (campaign.status !== 'ativa') {
        throw new AppError('Sem permissão para ver esta campanha', 403);
      }
      // Colaborador pode ver campanhas tipoAlvo: gestor (para avaliar gestor)
      if (campaign.tipoAlvo !== 'gestor') {
        throw new AppError('Sem permissão para ver esta campanha', 403);
      }
    }

    return campaign;
  }

  async findAll(filters, userId, userTipo) {
    AuthorizationService.forbidColaborador(userTipo);

    // Gestor só vê suas próprias campanhas
    if (userTipo === 'gestor') {
      filters.gestorId = userId;
    }

    return this.campaignRepository.findAll(filters);
  }

  async findActiveForGestor(gestorId, userId, userTipo) {
    AuthorizationService.forbidColaborador(userTipo);

    // Gestor só pode ver as próprias campanhas ativas
    const targetId = userTipo === 'gestor' ? userId : gestorId;
    return this.campaignRepository.findActiveForGestor(targetId);
  }

  async update(id, data, userTipo) {
    AuthorizationService.requireAdmin(userTipo);

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    if (campaign.status === 'finalizada') {
      throw new AppError('Não é possível editar uma campanha finalizada', 400);
    }

    if (data.competencyIds) {
      this._validateCompetencyIds(data.competencyIds);
      // Remove associações antigas
      await this.campaignCompetencyRepository.deleteByCampaignId(id);
      // Adiciona novas associações
      for (const competencyId of data.competencyIds) {
        await this.campaignCompetencyRepository.create({
          campaignId: id,
          competencyId
        });
      }
    }

    if (data.dataInicio || data.dataFim) {
      const inicio = data.dataInicio || campaign.dataInicio;
      const fim = data.dataFim || campaign.dataFim;
      this._validateDatas(inicio, fim);
    }

    // Remove competencyIds e criterios antes de atualizar
    const { competencyIds, criterios, gestorColaboradores, ...updateData } = data;
    return this.campaignRepository.update(id, { ...updateData, gestorColaboradores });
  }

  async updateStatus(id, status, userTipo) {
    AuthorizationService.requireAdmin(userTipo);

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    const transicoes = {
      planejamento: ['ativa'],
      ativa: ['finalizada'],
      finalizada: []
    };

    if (!transicoes[campaign.status].includes(status)) {
      throw new AppError(
        `Não é possível mudar status de '${campaign.status}' para '${status}'`,
        400
      );
    }

    return this.campaignRepository.update(id, { status });
  }

  async delete(id, userTipo) {
    AuthorizationService.requireAdmin(userTipo);

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    if (campaign.status === 'ativa') {
      throw new AppError('Não é possível deletar uma campanha ativa. Finalize-a primeiro.', 400);
    }

    await this.campaignRepository.delete(id);
    return { message: 'Campanha deletada com sucesso' };
  }

  async getCampaignProgress(campaignId, gestorId, userId, userTipo) {
    AuthorizationService.forbidColaborador(userTipo);

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    const targetGestorId = userTipo === 'gestor' ? userId : gestorId;
    return this.campaignRepository.getCampaignProgress(campaignId, targetGestorId);
  }

  async getResponsavelGestores(campaignId, userId, userTipo) {
    AuthorizationService.forbidColaborador(userTipo);

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    // Gestor só pode ver se é responsável por essa campanha
    if (userTipo === 'gestor') {
      const isResponsavel = campaign.gestores.some(g => g.gestorId === userId);
      if (!isResponsavel) {
        throw new AppError('Você não é responsável por esta campanha', 403);
      }
    }

    return this.campaignRepository.getResponsavelGestores(campaignId);
  }

  async getColaboradoresNaoAvaliados(campaignId, gestorId, userId, userTipo) {
    AuthorizationService.forbidColaborador(userTipo);

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    // Gestor só pode ver colaboradores que não avaliou
    if (userTipo === 'gestor' && gestorId !== userId) {
      throw new AppError('Sem permissão para ver colaboradores de outro gestor', 403);
    }

    return this.campaignRepository.getColaboradoresNaoAvaliados(campaignId, gestorId);
  }

  async getPendingCampaignsForColaborador(userId, userTipo) {
    AuthorizationService.requireColaborador(userTipo);

    try {
      // Busca campanhas ativas
      const campaigns = await this.campaignRepository.findAll({ status: 'ativa' });

      // Buscar todas avaliações do usuário de uma vez
      const todasAvaliacoes = await this.evaluationRepository.findByAvaliador(
        userId, 
        { page: 1, limit: 1000 }
      );
      
      const campaignsIds = campaigns.campaigns.map(c => c.id);
      const avaliacoesPorCampanha = todasAvaliacoes.evaluations.reduce((acc, av) => {
        acc[av.campaignId] = true;
        return acc;
      }, {});
      
      // Buscar todos relacionamentos gestor-colaborador de uma vez
      const gruposDoUsuario = await this.groupRepository.findGestoresByColaborador(userId);
      const gestoresIdsDoUsuario = new Set(gruposDoUsuario.map(g => g.id));

      // Filtra campanhas onde o colaborador ainda não respondeu
      const campaignsPendentes = campaigns.campaigns.filter(campaign => {
        // Se já avaliou esta campanha, pular
        if (avaliacoesPorCampanha[campaign.id]) return false;
        
        // Para tipoAlvo: gestor, colaborador avalia gestor
        if (campaign.tipoAlvo === 'gestor') {
          const temGestorResponsavel = campaign.gestores.some(g => 
            gestoresIdsDoUsuario.has(g.gestorId)
          );
          return temGestorResponsavel;
        }
        
        // Para tipoAlvo: todos, colaborador pode avaliar gestores que são seus responsáveis
        if (campaign.tipoAlvo === 'todos') {
          const temGestorResponsavel = campaign.gestores.some(g => 
            gestoresIdsDoUsuario.has(g.gestorId)
          );
          return temGestorResponsavel;
        }
        
        return false;
      });

      return campaignsPendentes;
    } catch (error) {
      console.error('Erro em getPendingCampaignsForColaborador:', error);
      throw error;
    }
  }

  async getPendingCampaignsForGestor(userId, userTipo) {
    AuthorizationService.requireGestor(userTipo);

    try {
      // Busca campanhas ativas onde o gestor é responsável
      const campaigns = await this.campaignRepository.findActiveForGestor(userId);

      // Filtra campanhas onde gestores avaliam colaboradores (tipoAlvo: colaborador)
      // Gestores não podem avaliar em campanhas tipoAlvo: gestor
      const filteredCampaigns = campaigns.filter(c => c.tipoAlvo === 'colaborador' || c.tipoAlvo === 'todos');

      // Para cada campanha, verifica se o gestor ainda tem colaboradores para avaliar
      const campaignsPendentes = [];

      for (const campaign of filteredCampaigns) {
        try {
          // Busca colaboradores que o gestor deve avaliar nesta campanha
          const colaboradoresNaoAvaliados = await this.campaignRepository.getColaboradoresNaoAvaliados(campaign.id, userId);

          if (colaboradoresNaoAvaliados.length > 0) {
            campaignsPendentes.push(campaign);
          }
        } catch (error) {
          console.error(`Erro ao processar campanha ${campaign.id}:`, error);
          // Continue with next campaign
        }
      }

      return campaignsPendentes;
    } catch (error) {
      console.error('Erro em getPendingCampaignsForGestor:', error);
      throw error;
    }
  }

  // --- Helpers privados ---

  _validateCompetencyIds(competencyIds) {
    if (!Array.isArray(competencyIds) || competencyIds.length === 0) {
      throw new AppError('A campanha deve ter pelo menos 1 competência', 400);
    }
    if (competencyIds.length > 20) {
      throw new AppError('A campanha pode ter no máximo 20 competências', 400);
    }
  }

  _validateDatas(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new AppError('Datas inválidas', 400);
    }
    if (fim <= inicio) {
      throw new AppError('Data de fim deve ser posterior à data de início', 400);
    }
  }

  async _validateGestores(gestorIds) {
    for (const gestorId of gestorIds) {
      const user = await this.userRepository.findById(gestorId);
      if (!user) {
        throw new AppError(`Gestor com id '${gestorId}' não encontrado`, 404);
      }
      if (user.tipo !== 'gestor') {
        throw new AppError(`Usuário '${user.nome}' não é um gestor`, 400);
      }
    }
  }
}

export { CampaignService };

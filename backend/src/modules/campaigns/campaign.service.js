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
      const meusGestores = await this.groupRepository.findGestoresByColaborador(userId);
      if (meusGestores.length === 0) return [];
      const meuGestorId = meusGestores[0].id;

      // Campanhas ativas onde colaborador pode avaliar gestor
      const campaigns = await this.campaignRepository.findAll({ status: 'ativa' });
      const campsFiltradas = (campaigns.campaigns || []).filter(c =>
        c.tipoAlvo === 'gestor' || c.tipoAlvo === 'todos'
      );

      if (campsFiltradas.length === 0) return [];

      const campaignIds = campsFiltradas.map(c => c.id);

      // Uma query: verificar se meu gestor está em alguma dessas campanhas
      const gestorNasCampanhas = await prisma.campaignGestor.findMany({
        where: { campaignId: { in: campaignIds }, gestorId: meuGestorId },
        select: { campaignId: true }
      });
      const campanhasComMeuGestor = new Set(gestorNasCampanhas.map(cg => cg.campaignId));

      // Uma query: avaliacoes que já fiz nessas campanhas
      const jaFiz = await prisma.evaluation.findMany({
        where: { avaliadorId: userId, campaignId: { in: [...campanhasComMeuGestor] } },
        select: { campaignId: true, avaliadoId: true }
      });
      const jaAvalieiMap = new Set(jaFiz.map(av => `${av.campaignId}_${av.avaliadoId}`));

      return campsFiltradas.filter(campaign => {
        if (!campanhasComMeuGestor.has(campaign.id)) return false;
        return !jaAvalieiMap.has(`${campaign.id}_${meuGestorId}`);
      });
    } catch (error) {
      console.error('Erro em getPendingCampaignsForColaborador:', error);
      throw error;
    }
  }

  async getPendingCampaignsForGestor(userId, userTipo) {
    AuthorizationService.requireGestor(userTipo);

    try {
      // Campanhas ativas onde o gestor é responsável e avalia colaboradores
      const campaigns = await this.campaignRepository.findActiveForGestor(userId);
      const filteredCampaigns = campaigns.filter(c => c.tipoAlvo === 'colaborador' || c.tipoAlvo === 'todos');

      if (filteredCampaigns.length === 0) return [];

      const campaignIds = filteredCampaigns.map(c => c.id);

      // Uma única query: busca todos os CampaignGestor + colaboradores avaliáveis para este gestor
      const campaignGestores = await prisma.campaignGestor.findMany({
        where: { campaignId: { in: campaignIds }, gestorId: userId },
        select: {
          campaignId: true,
          colaboradoresAvaliaveis: { select: { colaboradorId: true } }
        }
      });

      // Uma única query: todas as avaliações já feitas por este gestor nessas campanhas
      const avaliacoes = await prisma.evaluation.findMany({
        where: { campaignId: { in: campaignIds }, avaliadorId: userId },
        select: { campaignId: true, avaliadoId: true }
      });

      // Mapa: campaignId → Set de avaliadoIds já avaliados
      const avaliadosPorCampanha = {};
      for (const av of avaliacoes) {
        if (!avaliadosPorCampanha[av.campaignId]) avaliadosPorCampanha[av.campaignId] = new Set();
        avaliadosPorCampanha[av.campaignId].add(av.avaliadoId);
      }

      // Mapa: campaignId → array de colaboradorIds esperados
      const colaboradoresPorCampanha = {};
      for (const cg of campaignGestores) {
        colaboradoresPorCampanha[cg.campaignId] = cg.colaboradoresAvaliaveis.map(c => c.colaboradorId);
      }

      // Filtra campanhas que ainda têm colaboradores pendentes
      return filteredCampaigns.filter(campaign => {
        const esperados  = colaboradoresPorCampanha[campaign.id] || [];
        const avaliados  = avaliadosPorCampanha[campaign.id]     || new Set();
        return esperados.some(id => !avaliados.has(id));
      });
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

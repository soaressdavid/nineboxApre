import { AppError } from '../../utils/errors.js';
import { AuthorizationService } from '../../services/authorization.service.js';
import { UserRepository } from '../users/user.repository.js';
import { EvaluationRepository } from '../evaluations/evaluation.repository.js';
import { NineBoxRepository } from '../ninebox/ninebox.repository.js';
import { CompetencyRepository } from '../competencies/competency.repository.js';
import { CampaignRepository } from '../campaigns/campaign.repository.js';
import { GroupRepository } from '../groups/group.repository.js';
import { prisma } from '../../config/database.js';

class ReportsService {
  constructor() {
    this.userRepository = new UserRepository();
    this.evaluationRepository = new EvaluationRepository();
    this.nineBoxRepository = new NineBoxRepository();
    this.competencyRepository = new CompetencyRepository();
    this.campaignRepository = new CampaignRepository();
    this.groupRepository = new GroupRepository();
  }

  async getDashboardStats(userTipo) {
    AuthorizationService.forbidColaborador(userTipo);

    // Todas as contagens em paralelo via count() direto — sem fetch de objetos
    const [
      totalGestores,
      totalColaboradores,
      totalAvaliacoes,
      nineBoxStats,
      competencyStats,
      totalCampanhas,
      campanhasAtivas,
      groupsCount,
      mediaGeralResult
    ] = await Promise.all([
      prisma.user.count({ where: { tipo: 'gestor',       deletedAt: null } }),
      prisma.user.count({ where: { tipo: 'colaborador',  deletedAt: null } }),
      prisma.evaluation.count(),
      this.nineBoxRepository.getGridDistribution(),
      this.competencyRepository.getStatsByTipo(),
      prisma.evaluationCampaign.count(),
      prisma.evaluationCampaign.count({ where: { status: 'ativa' } }),
      this.groupRepository.countGroups(),
      // Calcula média geral direto no banco com aggregate
      prisma.evaluation.aggregate({ _avg: { media: true } })
    ]);

    const mediaGeral = mediaGeralResult._avg.media
      ? parseFloat(mediaGeralResult._avg.media.toFixed(2))
      : 0;

    return {
      totalUsuarios:      totalGestores + totalColaboradores,
      totalGestores,
      totalColaboradores,
      totalAvaliacoes,
      avaliacoesPendentes: 0,
      mediaGeral,
      nineBox:            nineBoxStats,
      totalNineBox:       nineBoxStats?.total ?? 0,
      competencias:       competencyStats,
      totalCompetencias:  competencyStats?.total ?? competencyStats?.length ?? 0,
      totalCampanhas,
      campanhasAtivas,
      totalGrupos:        groupsCount ?? 0,
      usuariosAtivos:     totalGestores + totalColaboradores,
      timestamp:          new Date().toISOString()
    };
  }

  async getUserReport(userId, requestUserId, requestUserTipo) {
    AuthorizationService.requireOwnerOrAdmin(userId, requestUserId, requestUserTipo);

    // Todas as queries em paralelo
    const [user, evaluationsResult, nineBoxes, evalsMadeResult] = await Promise.all([
      this.userRepository.findById(userId),
      // Só busca campos necessários: media, tipoAvaliacao, comentario, data
      prisma.evaluation.findMany({
        where: { avaliadoId: userId },
        select: {
          id: true,
          media: true,
          comentario: true,
          criterios: true,
          anonima: true,
          data: true,
          createdAt: true,
          campaign: { select: { id: true, nome: true, tipoAvaliacao: true, tipoAlvo: true, status: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.nineBoxRepository.findByPessoa(userId),
      prisma.evaluation.count({ where: { avaliadorId: userId } })
    ]);

    if (!user) throw new AppError('Usuário não encontrado', 404);

    const mediaGeral = evaluationsResult.length > 0
      ? parseFloat((evaluationsResult.reduce((sum, ev) => sum + (ev.media || 0), 0) / evaluationsResult.length).toFixed(2))
      : 0;

    // Calcula médias por critério de forma dinâmica
    const criteriosMap = {};
    for (const ev of evaluationsResult) {
      if (ev.criterios && typeof ev.criterios === 'object') {
        for (const [chave, valor] of Object.entries(ev.criterios)) {
          const num = Number(valor);
          if (!isNaN(num)) {
            if (!criteriosMap[chave]) criteriosMap[chave] = [];
            criteriosMap[chave].push(num);
          }
        }
      }
    }
    const criteriosMedia = {};
    for (const [chave, vals] of Object.entries(criteriosMap)) {
      if (vals.length > 0) {
        criteriosMedia[chave] = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
      }
    }

    const latestNineBox = nineBoxes.length > 0 ? nineBoxes[0] : null;
    delete user.senha;

    return {
      user,
      usuario: user,
      avaliacoesRecebidas:  evaluationsResult.length,
      avaliacoesFeitas:     evalsMadeResult,
      mediaGeral,
      criteriosMedia,
      ultimasAvaliacoes:    evaluationsResult.slice(0, 10),
      nineBox: {
        total:     nineBoxes.length,
        ultima:    latestNineBox,
        historico: nineBoxes
      },
      timestamp: new Date().toISOString()
    };
  }

  async getTeamReport(gestorId, requestUserId, requestUserTipo) {
    AuthorizationService.forbidColaborador(requestUserTipo);
    if (requestUserTipo === 'gestor' && gestorId !== requestUserId) {
      throw new AppError('Gestor só pode ver a própria equipe', 403);
    }

    const gestor = await this.userRepository.findById(gestorId);
    if (!gestor) throw new AppError('Gestor não encontrado', 404);

    const [colaboradores, campanhasAtivas] = await Promise.all([
      this.groupRepository.findColaboradoresByGestor(gestorId),
      this.campaignRepository.findActiveForGestor(gestorId)
    ]);

    return {
      gestor,
      equipe: colaboradores,
      campanhasAtivas,
      estatisticas: {
        totalColaboradores: colaboradores.length,
        departamento: gestor.departamento
      },
      timestamp: new Date().toISOString()
    };
  }

  async exportUserReport(userId, requestUserId, requestUserTipo) {
    const report = await this.getUserReport(userId, requestUserId, requestUserTipo);
    return { exportDate: new Date().toISOString(), data: report };
  }
}

export { ReportsService };

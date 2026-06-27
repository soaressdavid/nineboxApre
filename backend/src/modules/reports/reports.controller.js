import { ReportsService } from './reports.service.js';

const reportsService = new ReportsService();

class ReportsController {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await reportsService.getDashboardStats(req.user.tipo);
      
      return res.json({
        success: true,
        data: {
          totalUsuarios:       stats.totalUsuarios,
          totalGestores:       stats.totalGestores,
          totalColaboradores:  stats.totalColaboradores,
          totalAvaliacoes:     stats.totalAvaliacoes,
          totalNineBox:        stats.totalNineBox,
          totalCampanhas:      stats.totalCampanhas,
          campanhasAtivas:     stats.campanhasAtivas,
          totalCompetencias:   stats.totalCompetencias,
          totalGrupos:         stats.totalGrupos,
          usuariosAtivos:      stats.usuariosAtivos,
          avaliacoesPendentes: stats.avaliacoesPendentes,
          mediaGeral:          stats.mediaGeral,
          nineBox:             stats.nineBox,
          competencias:        stats.competencias,
          timestamp:           stats.timestamp,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserReport(req, res, next) {
    try {
      const report = await reportsService.getUserReport(
        req.params.userId,
        req.user.userId,
        req.user.tipo
      );
      
      return res.json({
        success: true,
        data: {
          user:                report.user,
          usuario:             report.usuario,
          avaliacoesRecebidas: report.avaliacoesRecebidas,
          avaliacoesFeitas:    report.avaliacoesFeitas,
          mediaGeral:          report.mediaGeral,
          ultimasAvaliacoes:   report.ultimasAvaliacoes,
          criteriosMedia:      report.criteriosMedia,
          nineBox:             report.nineBox,
          timestamp:           report.timestamp,
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  calcularMediaCriterios(avaliacoes) {
    if (!avaliacoes || avaliacoes.length === 0) return {};

    // Critérios são dinâmicos — agrega todos os critérios encontrados nas avaliações
    const totais = {};
    const contagens = {};

    for (const av of avaliacoes) {
      if (av.criterios && typeof av.criterios === 'object') {
        for (const [nome, nota] of Object.entries(av.criterios)) {
          if (typeof nota === 'number') {
            totais[nome] = (totais[nome] || 0) + nota;
            contagens[nome] = (contagens[nome] || 0) + 1;
          }
        }
      }
    }

    const medias = {};
    for (const nome of Object.keys(totais)) {
      medias[nome] = parseFloat((totais[nome] / contagens[nome]).toFixed(1));
    }
    return medias;
  }

  async getTeamReport(req, res, next) {
    try {
      const report = await reportsService.getTeamReport(
        req.params.gestorId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async exportUserReport(req, res, next) {
    try {
      const data = await reportsService.exportUserReport(
        req.params.userId,
        req.user.userId,
        req.user.tipo
      );

      // Define headers para download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=export-${Date.now()}.json`);
      
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

export { ReportsController };

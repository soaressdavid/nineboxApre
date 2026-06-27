import { AppError } from '../../utils/errors.js';
import { AuthorizationService } from '../../services/authorization.service.js';
import { UserRepository } from '../users/user.repository.js';
import { EvaluationRepository } from '../evaluations/evaluation.repository.js';

class NineBoxService {
  constructor(nineBoxRepository) {
    this.nineBoxRepository = nineBoxRepository;
    this.userRepository = new UserRepository();
    this.evaluationRepository = new EvaluationRepository();
  }

  // Classifica uma nota em BAIXO (1), MÉDIO (2) ou ALTO (3)
  // Escala 1-4: Ruim(1), Regular(2), Bom(3), Excelente(4)
  // BAIXO: 1.0–2.0 | MÉDIO: 2.01–3.0 | ALTO: 3.01–4.0
  classifyScore(score) {
    if (score === null || score === undefined) return 'INDEFINIDO';
    if (score < 2.01) return 'BAIXO';   // 1.00 a 2.00
    if (score < 3.01) return 'MÉDIO';   // 2.01 a 3.00
    return 'ALTO';                      // 3.01 a 4.00
  }

  // Converte score para posição 1-3 do grid
  scoreToGridPos(score) {
    const cls = this.classifyScore(score);
    if (cls === 'BAIXO') return 1;
    if (cls === 'MÉDIO') return 2;
    if (cls === 'ALTO')  return 3;
    return null;
  }

  // Calcula a categoria baseada em performance (X) e potential (Y)
  // Usa classifyScore: BAIXO (<2.01), MÉDIO (<3.01), ALTO (>=3.01)
  calculateCategoria(performance, potential) {
    const xClass = this.classifyScore(performance);
    const yClass = this.classifyScore(potential);

    // Matriz (Y = Potencial | X = Desempenho)
    // Numeração Q1-Q9: esquerda→direita, baixo→cima
    const matriz = {
      'ALTO-BAIXO': 'Q7 (Enigma)',
      'ALTO-MÉDIO': 'Q8 (Alto Potencial)',
      'ALTO-ALTO': 'Q9 (Estrela)',
      'MÉDIO-BAIXO': 'Q4 (Inconsistente)',
      'MÉDIO-MÉDIO': 'Q5 (Profissional)',
      'MÉDIO-ALTO': 'Q6 (Destaque)',
      'BAIXO-BAIXO': 'Q1 (Insuficiente)',
      'BAIXO-MÉDIO': 'Q2 (Questionável)',
      'BAIXO-ALTO': 'Q3 (Especialista)'
    };

    return matriz[`${yClass}-${xClass}`] || 'Indefinido';
  }

  // Calcula Performance (X) e Potential (Y) a partir das avaliações RECEBIDAS pela pessoa
  // (avaliações onde a pessoa é o avaliado, não o avaliador)
  async calculateScoresFromEvaluations(avaliadoId) {
    const evaluations = await this.evaluationRepository.findByAvaliado(avaliadoId, { page: 1, limit: 1000 });
    const all = evaluations.evaluations;

    const mediasDes = all
      .filter(ev => ev.campaign?.tipoAvaliacao === 'desempenho' && ev.media != null)
      .map(ev => ev.media);

    const mediasPot = all
      .filter(ev => ev.campaign?.tipoAvaliacao === 'potencial' && ev.media != null)
      .map(ev => ev.media);

    const performance = mediasDes.length > 0
      ? parseFloat((mediasDes.reduce((a, b) => a + b, 0) / mediasDes.length).toFixed(2))
      : null;

    const potential = mediasPot.length > 0
      ? parseFloat((mediasPot.reduce((a, b) => a + b, 0) / mediasPot.length).toFixed(2))
      : null;

    return { performance, potential };
  }

  // Mantidos por compatibilidade com outros pontos do código
  async calculatePerformanceFromEvaluations(avaliadoId) {
    const { performance } = await this.calculateScoresFromEvaluations(avaliadoId);
    return performance;
  }

  async calculatePotentialFromEvaluations(avaliadoId) {
    const { potential } = await this.calculateScoresFromEvaluations(avaliadoId);
    return potential;
  }

  // Calcula Nine Box automaticamente a partir das avaliações RECEBIDAS pela pessoa
  async calculateNineBoxFromEvaluations(avaliadoId) {
    const { performance, potential } = await this.calculateScoresFromEvaluations(avaliadoId);

    // Se não há nenhuma avaliação recebida, retorna sem dados
    if (performance === null && potential === null) {
      return {
        avaliadoId,
        performance: null,
        potential: null,
        categoria: 'Sem dados suficientes',
        message: 'Não há avaliações recebidas suficientes para calcular o Nine Box'
      };
    }

    // Se só tem um tipo de campanha, usa o mesmo valor para ambos os eixos
    const perfFinal = performance ?? potential;
    const potFinal  = potential  ?? performance;

    const categoria = this.calculateCategoria(perfFinal, potFinal);

    return {
      avaliadoId,
      performance: perfFinal,
      potential:   potFinal,
      gridX: this.scoreToGridPos(perfFinal),
      gridY: this.scoreToGridPos(potFinal),
      categoria,
      // Valores reais recebidos (null se não houve avaliação daquele tipo)
      performanceReal: performance,
      potentialReal:   potential,
      performanceInferido: performance === null,
      potentialInferido:   potential   === null,
    };
  }

  // Calcula Nine Box para todos os usuários (para admin)
  // Usa uma única query em batch para buscar TODAS as avaliações de uma vez (evita N+1)
  async calculateAllNineBoxes() {
    try {
      const { prisma } = await import('../../config/database.js');

      // 1. Busca todos os usuários ativos em uma query
      const users = await this.userRepository.findAll({ page: 1, limit: 1000 });
      const allUsers = users.users || [];
      if (allUsers.length === 0) return { team: [], total: 0 };

      const userIds = allUsers.map(u => u.id);

      // 2. Busca TODAS as avaliações de todos os usuários de uma única vez
      const allEvaluations = await prisma.evaluation.findMany({
        where: { avaliadoId: { in: userIds } },
        select: {
          avaliadoId: true,
          media: true,
          campaign: { select: { tipoAvaliacao: true } }
        }
      });

      // 3. Agrupa as avaliações por avaliadoId em memória
      const evalsByUser = {};
      for (const ev of allEvaluations) {
        if (!evalsByUser[ev.avaliadoId]) evalsByUser[ev.avaliadoId] = [];
        evalsByUser[ev.avaliadoId].push(ev);
      }

      // 4. Calcula scores em memória (zero queries extras)
      const result = [];
      for (const user of allUsers) {
        const evals = evalsByUser[user.id] || [];

        const mediasDes = evals.filter(ev => ev.campaign?.tipoAvaliacao === 'desempenho' && ev.media != null).map(ev => ev.media);
        const mediasPot = evals.filter(ev => ev.campaign?.tipoAvaliacao === 'potencial'   && ev.media != null).map(ev => ev.media);

        const avg = arr => arr.length > 0 ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : null;
        const performance = avg(mediasDes);
        const potential   = avg(mediasPot);

        if (performance === null && potential === null) continue;

        const perfFinal = performance ?? potential;
        const potFinal  = potential  ?? performance;
        const categoria = this.calculateCategoria(perfFinal, potFinal);

        result.push({
          avaliadoId: user.id,
          id: user.id,
          performance: perfFinal,
          potential:   potFinal,
          gridX: this.scoreToGridPos(perfFinal),
          gridY: this.scoreToGridPos(potFinal),
          categoria,
          performanceReal:      performance,
          potentialReal:        potential,
          performanceInferido:  performance === null,
          potentialInferido:    potential   === null,
          pessoa: {
            id: user.id, nome: user.nome, email: user.email, tipo: user.tipo,
            cargo: user.cargo, departamento: user.departamento, ra: user.ra, foto: user.foto
          }
        });
      }

      return { team: result, total: result.length };
    } catch (error) {
      console.error('[calculateAllNineBoxes] Error:', error);
      throw error;
    }
  }

  // Calcula Nine Box para todo o time de um gestor
  // Usa batch query para evitar N+1
  async calculateTeamNineBox(gestorId) {
    const { prisma } = await import('../../config/database.js');

    const pessoas = await this.userRepository.findByGestorId(gestorId);
    const gestoresSubordinados = await this.userRepository.findGestoresByGestorId(gestorId);

    const todasPessoas = [...pessoas];
    gestoresSubordinados.forEach(g => {
      if (!todasPessoas.some(p => p.id === g.id)) todasPessoas.push(g);
    });

    if (todasPessoas.length === 0) return { gestorId, team: [], total: 0 };

    const ids = todasPessoas.map(p => p.id);

    // Busca todas as avaliações do time em uma única query
    const allEvaluations = await prisma.evaluation.findMany({
      where: { avaliadoId: { in: ids } },
      select: {
        avaliadoId: true,
        media: true,
        campaign: { select: { tipoAvaliacao: true } }
      }
    });

    const evalsByUser = {};
    for (const ev of allEvaluations) {
      if (!evalsByUser[ev.avaliadoId]) evalsByUser[ev.avaliadoId] = [];
      evalsByUser[ev.avaliadoId].push(ev);
    }

    const avg = arr => arr.length > 0 ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : null;

    const teamNineBox = todasPessoas.map(pessoa => {
      const evals = evalsByUser[pessoa.id] || [];
      const mediasDes = evals.filter(ev => ev.campaign?.tipoAvaliacao === 'desempenho' && ev.media != null).map(ev => ev.media);
      const mediasPot = evals.filter(ev => ev.campaign?.tipoAvaliacao === 'potencial'   && ev.media != null).map(ev => ev.media);

      const performance = avg(mediasDes);
      const potential   = avg(mediasPot);

      if (performance === null && potential === null) {
        return {
          avaliadoId: pessoa.id, id: pessoa.id,
          performance: null, potential: null,
          categoria: 'Sem dados suficientes',
          message: 'Não há avaliações recebidas suficientes para calcular o Nine Box',
          pessoa: { id: pessoa.id, nome: pessoa.nome, email: pessoa.email, tipo: pessoa.tipo, cargo: pessoa.cargo, departamento: pessoa.departamento, ra: pessoa.ra, foto: pessoa.foto }
        };
      }

      const perfFinal = performance ?? potential;
      const potFinal  = potential  ?? performance;
      const categoria = this.calculateCategoria(perfFinal, potFinal);

      return {
        avaliadoId: pessoa.id, id: pessoa.id,
        performance: perfFinal, potential: potFinal,
        gridX: this.scoreToGridPos(perfFinal),
        gridY: this.scoreToGridPos(potFinal),
        categoria,
        performanceReal: performance, potentialReal: potential,
        performanceInferido: performance === null, potentialInferido: potential === null,
        pessoa: { id: pessoa.id, nome: pessoa.nome, email: pessoa.email, tipo: pessoa.tipo, cargo: pessoa.cargo, departamento: pessoa.departamento, ra: pessoa.ra, foto: pessoa.foto }
      };
    });

    return { gestorId, team: teamNineBox, total: todasPessoas.length };
  }

  async create(data, userTipo) {
    AuthorizationService.forbidColaborador(userTipo);

    // Verifica se a pessoa existe
    const pessoa = await this.userRepository.findById(data.pessoaId);
    if (!pessoa) {
      throw new AppError('Pessoa não encontrada', 404);
    }

    // Verificar se já existe avaliação Nine Box para esta pessoa
    const avaliacaoExistente = await this.nineBoxRepository.findByPessoa(data.pessoaId);
    
    if (avaliacaoExistente.length > 0) {
      throw new AppError('Esta pessoa já possui uma avaliação Nine Box. Edite a avaliação existente se necessário.', 400);
    }

    // Calcula a categoria
    const categoria = this.calculateCategoria(data.performance, data.potential);

    // Cria a avaliação
    const nineBox = await this.nineBoxRepository.create({
      ...data,
      categoria
    });

    return nineBox;
  }

  async findById(id, userId, userTipo) {
    const nineBox = await this.nineBoxRepository.findById(id);
    if (!nineBox) {
      throw new AppError('Avaliação Nine Box não encontrada', 404);
    }

    // Colaborador só pode ver suas próprias avaliações
    AuthorizationService.requireOwnerOrAdmin(nineBox.pessoaId, userId, userTipo);

    return nineBox;
  }

  async findAll(filters, userId, userTipo) {
    // Colaborador só pode ver suas próprias avaliações
    if (userTipo === 'colaborador') {
      filters.pessoaId = userId;
    }

    return this.nineBoxRepository.findAll(filters);
  }

  async findByPessoa(pessoaId, userId, userTipo) {
    // Verifica se a pessoa existe
    const pessoa = await this.userRepository.findById(pessoaId);
    if (!pessoa) {
      throw new AppError('Pessoa não encontrada', 404);
    }

    // Colaborador só pode ver suas próprias avaliações
    if (userTipo === 'colaborador' && pessoaId !== userId) {
      throw new AppError('Sem permissão para ver estas avaliações', 403);
    }

    return this.nineBoxRepository.findByPessoa(pessoaId);
  }

  async findLatestByPessoa(pessoaId, userId, userTipo) {
    // Verifica se a pessoa existe
    const pessoa = await this.userRepository.findById(pessoaId);
    if (!pessoa) {
      throw new AppError('Pessoa não encontrada', 404);
    }

    // Colaborador só pode ver sua própria avaliação
    if (userTipo === 'colaborador' && pessoaId !== userId) {
      throw new AppError('Sem permissão para ver esta avaliação', 403);
    }

    const nineBox = await this.nineBoxRepository.findLatestByPessoa(pessoaId);
    if (!nineBox) {
      throw new AppError('Nenhuma avaliação Nine Box encontrada para esta pessoa', 404);
    }

    return nineBox;
  }

  async update(id, data, userTipo) {
    AuthorizationService.forbidColaborador(userTipo);

    const nineBox = await this.nineBoxRepository.findById(id);
    if (!nineBox) {
      throw new AppError('Avaliação Nine Box não encontrada', 404);
    }

    // Recalcula categoria se performance ou potential mudaram
    if (data.performance || data.potential) {
      const performance = data.performance || nineBox.performance;
      const potential = data.potential || nineBox.potential;
      data.categoria = this.calculateCategoria(performance, potential);
    }

    return this.nineBoxRepository.update(id, data);
  }

  async delete(id, userId, userTipo) {
    const nineBox = await this.nineBoxRepository.findById(id);
    if (!nineBox) {
      throw new AppError('Avaliação Nine Box não encontrada', 404);
    }

    // Admin pode deletar sempre
    if (userTipo === 'admin') {
      await this.nineBoxRepository.delete(id);
      return { message: 'Avaliação Nine Box deletada com sucesso' };
    }

    // Gestor pode deletar dentro de 24 horas
    if (userTipo === 'gestor') {
      const now = new Date();
      const createdAt = new Date(nineBox.createdAt);
      const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        throw new AppError('Não é possível deletar avaliações Nine Box após 24 horas', 403);
      }

      await this.nineBoxRepository.delete(id);
      return { message: 'Avaliação Nine Box deletada com sucesso' };
    }

    // Colaborador não pode deletar
    throw new AppError('Sem permissão para deletar avaliações Nine Box', 403);
  }

  async getGridDistribution(userTipo) {
    AuthorizationService.forbidColaborador(userTipo);

    return this.nineBoxRepository.getGridDistribution();
  }

  async getStatsByTipo(userTipo) {
    AuthorizationService.requireAdmin(userTipo);

    return this.nineBoxRepository.getStatsByTipo();
  }
}

export { NineBoxService };

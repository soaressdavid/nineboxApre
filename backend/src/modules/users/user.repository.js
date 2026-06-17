import { prisma } from '../../config/database.js';
import { BaseRepository } from '../../repositories/base.repository.js';

// ─────────────────────────────────────────────────────────────────────────────
// Select reutilizável — nunca expõe senha nem deletedAt para o cliente
// ─────────────────────────────────────────────────────────────────────────────
const userSelect = {
  id: true,
  ra: true,
  nome: true,
  email: true,
  tipo: true,
  cargo: true,
  departamento: true,
  foto: true,
  createdAt: true
};

// Select interno — inclui deletedAt para lógica de soft delete
const userSelectInternal = {
  ...userSelect,
  deletedAt: true
};

// Select estendido — inclui senha (apenas para autenticação)
const userSelectWithPassword = {
  ...userSelectInternal,
  senha: true
};

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  /** Busca por email sem senha — uso geral */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      select: userSelectInternal  // inclui deletedAt para verificações no service
    });
  }

  /** Busca por email com senha — exclusivo para autenticação */
  async findByEmailWithPassword(email) {
    return prisma.user.findUnique({
      where: { email },
      select: userSelectWithPassword
    });
  }

  async findByRA(ra) {
    return prisma.user.findUnique({
      where: { ra },
      select: userSelect
    });
  }

  async findAll({ page = 1, limit = 10, tipo, tipoIn, search, departamento, includeDeleted = false }) {
    // Garante limit seguro para evitar divisão por zero
    const safeLimit = limit > 0 ? limit : 10;
    const safePage  = page  > 0 ? page  : 1;
    const skip      = (safePage - 1) * safeLimit;

    const where = {};

    // Soft delete: por padrão exclui usuários desativados
    if (!includeDeleted) where.deletedAt = null;

    // tipo: string = filtro exato; tipoIn: string[] = filtro de lista (ex: gestor excluindo admin)
    if (tipo)         where.tipo = tipo;
    else if (tipoIn)  where.tipo = { in: tipoIn };

    if (departamento) where.departamento = departamento;
    if (search)       where.nome = { contains: search, mode: 'insensitive' };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: safeLimit,
        select: userSelect,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    };
  }

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: userSelect
    });
  }

  async emailExists(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    return !!user;
  }

  async raExists(ra) {
    const user = await prisma.user.findUnique({
      where: { ra },
      select: { id: true }
    });
    return !!user;
  }

  async findByGestorId(gestorId) {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
        gruposComoColaborador: { some: { gestorId } }
      },
      select: userSelect
    });
  }

  async findGestoresByGestorId(gestorId) {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
        tipo: 'gestor',
        gruposComoColaborador: { some: { gestorId } }
      },
      select: userSelect
    });
  }

  async count() {
    return prisma.user.count({ where: { deletedAt: null } });
  }

  async addGestorColaborador(gestorId, colaboradorId) {
    return prisma.gestorColaborador.create({
      data: { gestorId, colaboradorId }
    });
  }

  /** Soft delete — marca deletedAt sem apagar fisicamente */
  async softDelete(id) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  /** Restaura um usuário desativado */
  async restore(id) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: null }
    });
  }

  /**
   * Retorna departamentos distintos dos usuários ativos, ordenados A-Z.
   * Ignora entradas nulas ou vazias.
   */
  async findDepartamentosDistintos() {
    const result = await prisma.user.findMany({
      where: {
        deletedAt: null,
        departamento: { not: null }
      },
      select: { departamento: true },
      distinct: ['departamento'],
      orderBy: { departamento: 'asc' }
    });

    return result
      .map(r => r.departamento)
      .filter(d => d && d.trim() !== '');
  }
}

export { UserRepository };

import { prisma } from '../../config/database.js';
import { BaseRepository } from '../../repositories/base.repository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByRA(ra) {
    return prisma.user.findUnique({ where: { ra } });
  }

  async findAll({ page = 1, limit = 10, tipo, search, departamento }) {
    const skip = (page - 1) * limit;
    const where = {};
    
    if (tipo) where.tipo = tipo;
    if (departamento) where.departamento = departamento;
    if (search) {
      where.nome = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: skip >= 0 ? skip : 0,
        take: limit > 0 ? limit : 10,
        select: {
          id: true,
          ra: true,
          nome: true,
          email: true,
          tipo: true,
          cargo: true,
          departamento: true,
          foto: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
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
        gruposComoColaborador: {
          some: {
            gestorId
          }
        }
      },
      select: {
        id: true,
        ra: true,
        nome: true,
        email: true,
        tipo: true,
        cargo: true,
        departamento: true,
        foto: true
      }
    });
  }

  async findGestoresByGestorId(gestorId) {
    return prisma.user.findMany({
      where: {
        gruposComoColaborador: {
          some: {
            gestorId
          }
        },
        tipo: 'gestor'
      },
      select: {
        id: true,
        ra: true,
        nome: true,
        email: true,
        tipo: true,
        cargo: true,
        departamento: true,
        foto: true
      }
    });
  }

  async count() {
    return prisma.user.count();
  }

  async addGestorColaborador(gestorId, colaboradorId) {
    return prisma.gestorColaborador.create({
      data: {
        gestorId,
        colaboradorId
      }
    });
  }
}

export { UserRepository };

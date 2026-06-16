import { prisma } from '../../config/database.js';
import { BaseRepository } from '../../repositories/base.repository.js';

class TemplateRepository extends BaseRepository {
  constructor() {
    super(prisma.evaluationTemplate);
  }

  async findAll(filters = {}) {
    const { tipo, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;
    const where = {};

    if (tipo) {
      where.tipo = tipo;
    }

    const [templates, total] = await Promise.all([
      prisma.evaluationTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.evaluationTemplate.count({ where })
    ]);

    return {
      templates,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
}

export { TemplateRepository };

import { prisma } from '../config/database.js';

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, include = {}) {
    return this.model.findUnique({
      where: { id },
      ...include
    });
  }

  async findAll({ page = 1, limit = 10, where = {}, orderBy = {}, include = {} }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy,
        ...include
      }),
      this.model.count({ where })
    ]);
    return {
      items,
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total, 
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  async create(data) {
    return this.model.create({ data });
  }

  async update(id, data) {
    return this.model.update({ where: { id }, data });
  }

  async delete(id) {
    return this.model.delete({ where: { id } });
  }

  async count(where = {}) {
    return this.model.count({ where });
  }

  async exists(where) {
    const item = await this.model.findFirst({ where });
    return !!item;
  }
}

export { BaseRepository };

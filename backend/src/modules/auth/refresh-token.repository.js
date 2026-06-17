import { prisma } from '../../config/database.js';
import crypto from 'crypto';

class RefreshTokenRepository {
  /**
   * Cria um novo refresh token para o usuário
   * @param {string} userId
   * @param {number} expiresInDays - Padrão 7 dias
   */
  async create(userId, expiresInDays = 7) {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return prisma.refreshToken.create({
      data: { token, userId, expiresAt }
    });
  }

  /**
   * Busca um refresh token pelo valor do token
   */
  async findByToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, tipo: true, ra: true, deletedAt: true } } }
    });
  }

  /**
   * Revoga (invalida) um token específico
   */
  async revoke(token) {
    return prisma.refreshToken.updateMany({
      where: { token, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  /**
   * Revoga todos os tokens de um usuário (logout em todos os dispositivos)
   */
  async revokeAllByUser(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  /**
   * Remove tokens expirados ou revogados (limpeza periódica)
   */
  async deleteExpiredAndRevoked() {
    return prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } }
        ]
      }
    });
  }
}

export { RefreshTokenRepository };

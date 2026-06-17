import jwt from 'jsonwebtoken';
import { AppError } from '../../utils/errors.js';
import { RefreshTokenRepository } from './refresh-token.repository.js';
import logger from '../../config/logger.js';

class RefreshTokenService {
  constructor() {
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  /**
   * Gera par de tokens (access + refresh) para um usuário
   */
  generateTokenPair(user) {
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, tipo: user.tipo, ra: user.ra },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    return { accessToken };
  }

  /**
   * Cria refresh token no banco e retorna o par completo
   */
  async createTokenPair(user) {
    const { accessToken } = this.generateTokenPair(user);
    const refreshTokenRecord = await this.refreshTokenRepository.create(
      user.id,
      parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7
    );

    return {
      accessToken,
      refreshToken: refreshTokenRecord.token,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    };
  }

  /**
   * Renova o access token usando um refresh token válido
   */
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token não fornecido', 401);
    }

    const record = await this.refreshTokenRepository.findByToken(refreshToken);

    if (!record) {
      throw new AppError('Refresh token inválido', 401);
    }

    if (record.revokedAt) {
      // Token foi revogado — possível reutilização maliciosa, revogar todos
      logger.warn({ userId: record.userId }, 'Tentativa de uso de refresh token revogado — revogando todos os tokens do usuário');
      await this.refreshTokenRepository.revokeAllByUser(record.userId);
      throw new AppError('Refresh token revogado. Faça login novamente.', 401);
    }

    if (new Date() > record.expiresAt) {
      throw new AppError('Refresh token expirado. Faça login novamente.', 401);
    }

    if (record.user.deletedAt) {
      throw new AppError('Usuário inativo', 401);
    }

    // Rotação de token: revogar o atual e emitir um novo par
    await this.refreshTokenRepository.revoke(refreshToken);
    const tokens = await this.createTokenPair(record.user);

    logger.info({ userId: record.userId }, 'Access token renovado via refresh token');

    return tokens;
  }

  /**
   * Revoga o refresh token (logout)
   */
  async logout(refreshToken) {
    if (!refreshToken) return;
    await this.refreshTokenRepository.revoke(refreshToken);
  }

  /**
   * Revoga todos os tokens do usuário (logout em todos os dispositivos)
   */
  async logoutAll(userId) {
    await this.refreshTokenRepository.revokeAllByUser(userId);
    logger.info({ userId }, 'Todos os refresh tokens revogados');
  }
}

export { RefreshTokenService };

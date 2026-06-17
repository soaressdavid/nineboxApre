import { RefreshTokenService } from './refresh-token.service.js';

const refreshTokenService = new RefreshTokenService();

class RefreshTokenController {
  /**
   * POST /api/auth/refresh
   * Renova o access token usando um refresh token
   */
  async refresh(req, res, next) {
    try {
      // Aceita do body ou do cookie
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

      const tokens = await refreshTokenService.refresh(refreshToken);

      return res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: tokens
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Revoga o refresh token atual
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
      await refreshTokenService.logout(refreshToken);

      return res.json({
        success: true,
        message: 'Logout realizado com sucesso',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout-all
   * Revoga todos os refresh tokens do usuário (requer estar autenticado)
   */
  async logoutAll(req, res, next) {
    try {
      await refreshTokenService.logoutAll(req.user.userId);

      return res.json({
        success: true,
        message: 'Logout em todos os dispositivos realizado com sucesso',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}

export { RefreshTokenController };

import express from 'express';
import { RefreshTokenController } from './refresh-token.controller.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { loginLimiter } from '../../middlewares/rateLimiter.js';

const router = express.Router();
const refreshTokenController = new RefreshTokenController();

// Renovar access token (público — autenticado pelo refresh token)
router.post('/refresh', loginLimiter, (req, res, next) =>
  refreshTokenController.refresh(req, res, next)
);

// Logout (revoga refresh token atual — não precisa de access token válido)
router.post('/logout', (req, res, next) =>
  refreshTokenController.logout(req, res, next)
);

// Logout em todos os dispositivos (requer access token válido)
router.post('/logout-all', authMiddleware, (req, res, next) =>
  refreshTokenController.logoutAll(req, res, next)
);

export default router;

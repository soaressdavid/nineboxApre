import express from 'express';
import { PasswordResetController } from './password-reset.controller.js';
import { passwordResetLimiter } from '../../middlewares/rateLimiter.js';

const router = express.Router();
const passwordResetController = new PasswordResetController();

router.post('/request', passwordResetLimiter, (req, res, next) =>
  passwordResetController.requestReset(req, res, next)
);
router.post('/reset', passwordResetLimiter, (req, res, next) =>
  passwordResetController.resetPassword(req, res, next)
);
router.get('/validate/:token', (req, res, next) =>
  passwordResetController.validateToken(req, res, next)
);

export default router;

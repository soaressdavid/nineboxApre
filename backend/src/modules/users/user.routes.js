import express from 'express';
import { UserController } from './user.controller.js';
import { authMiddleware, isAdminMiddleware, isGestorOrAdminMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from './user.validation.js';
import { loginLimiter, registerLimiter } from '../../middlewares/rateLimiter.js';

const router = express.Router();
const userController = new UserController();

// Rotas públicas com rate limiting específico
router.post('/login', loginLimiter, validate(loginSchema), (req, res, next) => userController.login(req, res, next));

// Rotas protegidas
router.use(authMiddleware);

router.get('/profile', isAdminMiddleware, (req, res, next) => userController.getProfile(req, res, next));
router.put('/profile', isAdminMiddleware, validate(updateProfileSchema), (req, res, next) => userController.updateProfile(req, res, next));

router.get('/ra/:ra', isAdminMiddleware, (req, res, next) => userController.findByRA(req, res, next));

// Rotas de admin
router.get('/', isAdminMiddleware, (req, res, next) => userController.findAll(req, res, next));
router.get('/:id', isAdminMiddleware, (req, res, next) => userController.findById(req, res, next));

// Rotas de admin
router.post('/register', isAdminMiddleware, registerLimiter, validate(registerSchema), (req, res, next) => userController.register(req, res, next));
router.delete('/:id', isAdminMiddleware, (req, res, next) => userController.delete(req, res, next));

export default router;

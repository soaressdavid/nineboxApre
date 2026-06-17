import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';
import logger from '../config/logger.js';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Token não fornecido', 401);
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      throw new AppError('Token inválido', 401);
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      throw new AppError('Token mal formatado', 401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.warn({ path: req.path }, 'Token inválido ou expirado');
        throw new AppError('Token inválido ou expirado', 401);
      }

      req.user = decoded;
      return next();
    });
  } catch (error) {
    next(error);
  }
};

const isAdminMiddleware = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    logger.warn({ userId: req.user?.id, path: req.path }, 'Acesso negado - não é admin');
    return next(new AppError('Acesso negado. Apenas administradores', 403));
  }
  next();
};

const isGestorOrAdminMiddleware = (req, res, next) => {
  if (req.user.tipo !== 'admin' && req.user.tipo !== 'gestor') {
    logger.warn({ userId: req.user?.id, path: req.path }, 'Acesso negado - não é gestor nem admin');
    return next(new AppError('Acesso negado. Apenas gestores ou administradores', 403));
  }
  next();
};

export {
  authMiddleware,
  isAdminMiddleware,
  isGestorOrAdminMiddleware
};

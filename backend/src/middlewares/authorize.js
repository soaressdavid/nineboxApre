import { AppError } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * Middleware genérico de autorização baseado em roles
 * @param {...string} allowedRoles - Roles permitidas para acessar o recurso
 * @returns {Function} Middleware do Express
 * 
 * @example
 * // Permitir apenas admin
 * router.get('/users', authorize('admin'), userController.findAll);
 * 
 * @example
 * // Permitir admin ou gestor
 * router.get('/reports', authorize('admin', 'gestor'), reportController.get);
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Verifica se o usuário está autenticado (deve vir do middleware auth)
      if (!req.user) {
        logger.warn('Tentativa de acesso sem autenticação');
        throw new AppError('Usuário não autenticado', 401);
      }

      // Verifica se o tipo do usuário está nas roles permitidas
      if (!allowedRoles.includes(req.user.tipo)) {
        logger.warn({
          userId: req.user.id,
          userTipo: req.user.tipo,
          allowedRoles,
          path: req.path
        }, 'Acesso negado - permissão insuficiente');
        
        throw new AppError('Acesso negado - permissão insuficiente', 403);
      }

      // Usuário autorizado, continua
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar se o usuário é o dono do recurso ou admin
 * @param {string} paramName - Nome do parâmetro da rota que contém o ID do recurso
 * @returns {Function} Middleware do Express
 * 
 * @example
 * // Permitir apenas o próprio usuário ou admin acessar/editar perfil
 * router.put('/users/:id', authorizeOwnerOrAdmin('id'), userController.update);
 */
export const authorizeOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const resourceId = req.params[paramName];
      const isOwner = req.user.id === resourceId;
      const isAdmin = req.user.tipo === 'admin';

      if (!isOwner && !isAdmin) {
        logger.warn({
          userId: req.user.id,
          resourceId,
          path: req.path
        }, 'Acesso negado - não é dono nem admin');
        
        throw new AppError('Acesso negado', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

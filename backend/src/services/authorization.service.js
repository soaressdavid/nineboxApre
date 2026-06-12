import { AppError } from '../utils/errors.js';

class AuthorizationService {
  /**
   * Verifica se o usuário é admin
   * @param {string} userTipo - Tipo do usuário
   * @throws {AppError} Se o usuário não for admin
   */
  static requireAdmin(userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas administradores podem realizar esta ação', 403);
    }
  }

  /**
   * Verifica se o usuário é gestor ou admin
   * @param {string} userTipo - Tipo do usuário
   * @throws {AppError} Se o usuário não for gestor ou admin
   */
  static requireGestorOrAdmin(userTipo) {
    if (userTipo !== 'admin' && userTipo !== 'gestor') {
      throw new AppError('Apenas gestores ou administradores podem realizar esta ação', 403);
    }
  }

  /**
   * Verifica se o usuário é o dono do recurso ou admin
   * @param {string} resourceOwnerId - ID do dono do recurso
   * @param {string} requestUserId - ID do usuário que está fazendo a requisição
   * @param {string} userTipo - Tipo do usuário
   * @throws {AppError} Se o usuário não for o dono ou admin
   */
  static requireOwnerOrAdmin(resourceOwnerId, requestUserId, userTipo) {
    if (userTipo !== 'admin' && resourceOwnerId !== requestUserId) {
      throw new AppError('Sem permissão para acessar este recurso', 403);
    }
  }

  /**
   * Impede que colaboradores acessem determinado recurso
   * @param {string} userTipo - Tipo do usuário
   * @throws {AppError} Se o usuário for colaborador
   */
  static forbidColaborador(userTipo) {
    if (userTipo === 'colaborador') {
      throw new AppError('Colaboradores não têm permissão para realizar esta ação', 403);
    }
  }

  /**
   * Verifica se o usuário pode acessar o recurso baseado no tipo
   * @param {string} userTipo - Tipo do usuário
   * @param {string[]} allowedTypes - Tipos permitidos
   * @throws {AppError} Se o usuário não tiver permissão
   */
  static requireAnyOf(userTipo, allowedTypes) {
    if (!allowedTypes.includes(userTipo)) {
      throw new AppError('Sem permissão para realizar esta ação', 403);
    }
  }

  /**
   * Verifica se o usuário é gestor
   * @param {string} userTipo - Tipo do usuário
   * @throws {AppError} Se o usuário não for gestor
   */
  static requireGestor(userTipo) {
    if (userTipo !== 'gestor') {
      throw new AppError('Apenas gestores podem realizar esta ação', 403);
    }
  }

  /**
   * Verifica se o usuário é colaborador
   * @param {string} userTipo - Tipo do usuário
   * @throws {AppError} Se o usuário não for colaborador
   */
  static requireColaborador(userTipo) {
    if (userTipo !== 'colaborador') {
      throw new AppError('Apenas colaboradores podem realizar esta ação', 403);
    }
  }
}

export { AuthorizationService };

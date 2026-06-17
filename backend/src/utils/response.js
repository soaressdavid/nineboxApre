/**
 * Utilidade para padronizar respostas da API
 */

/**
 * Resposta de sucesso padrão
 * @param {Object} res - Express response object
 * @param {*} data - Dados a serem retornados
 * @param {string} message - Mensagem opcional de sucesso
 * @param {number} statusCode - Código HTTP (padrão: 200)
 */
export const successResponse = (res, data = null, message = '', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Resposta de erro padrão
 * @param {Object} res - Express response object
 * @param {string} message - Mensagem de erro
 * @param {number} statusCode - Código HTTP (padrão: 500)
 * @param {*} errors - Detalhes adicionais do erro (opcional)
 */
export const errorResponse = (res, message = 'Erro interno do servidor', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    data: null
  };

  // Adiciona detalhes do erro apenas em desenvolvimento
  if (errors && process.env.NODE_ENV !== 'production') {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Resposta de sucesso com paginação
 * @param {Object} res - Express response object
 * @param {Array} data - Array de dados
 * @param {Object} pagination - Objeto de paginação
 * @param {string} message - Mensagem opcional
 */
export const paginatedResponse = (res, data, pagination, message = '') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages
    }
  });
};

/**
 * Resposta de criação bem-sucedida
 * @param {Object} res - Express response object
 * @param {*} data - Dados criados
 * @param {string} message - Mensagem de sucesso
 */
export const createdResponse = (res, data, message = 'Recurso criado com sucesso') => {
  return successResponse(res, data, message, 201);
};

/**
 * Resposta de exclusão bem-sucedida
 * @param {Object} res - Express response object
 * @param {string} message - Mensagem de sucesso
 */
export const deletedResponse = (res, message = 'Recurso deletado com sucesso') => {
  return successResponse(res, null, message, 200);
};

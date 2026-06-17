import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  // Log estruturado com pino
  if (err.statusCode >= 500 || !err.isOperational) {
    logger.error({
      err,
      method: req.method,
      url: req.url,
      userId: req.user?.id
    }, 'Erro interno do servidor');
  } else {
    logger.warn({
      message: err.message,
      statusCode: err.statusCode,
      method: req.method,
      url: req.url,
      userId: req.user?.id
    }, 'Erro operacional');
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Erro do Prisma - Unique constraint
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'campo';
    return res.status(400).json({
      success: false,
      message: `Já existe um registro com esse ${field}`,
      errors: [`${field} já está em uso`]
    });
  }

  // Erro do Prisma - Record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro não encontrado',
      errors: ['O registro solicitado não existe']
    });
  }

  // Erro de validação Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.details.map(d => d.message)
    });
  }

  // Erro genérico
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    errors: process.env.NODE_ENV !== 'production'
      ? [err.message]
      : ['Ocorreu um erro inesperado. Tente novamente mais tarde.']
  });
};

export { errorHandler };

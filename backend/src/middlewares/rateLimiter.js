import rateLimit from 'express-rate-limit';

// Rate limiter geral - 100 requisições por 15 minutos
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true, // Retorna info no `RateLimit-*` headers
  legacyHeaders: false, // Desabilita `X-RateLimit-*` headers
});

// Rate limiter estrito para login - 5 tentativas por 15 minutos
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo de 5 tentativas de login por IP
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Conta todas as requisições, mesmo bem-sucedidas
});

// Rate limiter para registro - 3 registros por hora
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo de 3 registros por IP por hora
  message: 'Muitas tentativas de registro. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para reset de senha - 3 tentativas por hora
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo de 3 tentativas por IP
  message: 'Muitas solicitações de reset de senha. Tente novamente em 1 hora.',
  standardHeaders: true,
  legacyHeaders: false,
});

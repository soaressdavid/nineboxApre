import Joi from 'joi';

// Validação customizada de senha forte
const passwordValidator = (value, helpers) => {
  const errors = [];

  if (value.length < 8) {
    errors.push('mínimo 8 caracteres');
  }
  if (!/[A-Z]/.test(value)) {
    errors.push('uma letra maiúscula');
  }
  if (!/[a-z]/.test(value)) {
    errors.push('uma letra minúscula');
  }
  if (!/[0-9]/.test(value)) {
    errors.push('um número');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
    errors.push('um caractere especial');
  }

  if (errors.length > 0) {
    return helpers.error('password.weak', { errors: errors.join(', ') });
  }

  return value;
};

const registerSchema = Joi.object({
  ra: Joi.string()
    .min(5)
    .max(10)
    .required()
    .messages({
      'string.min': 'RA deve ter entre 5 e 10 caracteres',
      'string.max': 'RA deve ter entre 5 e 10 caracteres',
      'any.required': 'RA é obrigatório'
    }),
  nome: Joi.string().min(3).required(),
  email: Joi.string().email().pattern(/\.edu\.br$/i).required().messages({
    'string.pattern.base': 'Use um e-mail institucional (ex: nome@faculdade.edu.br)',
    'string.email': 'Email inválido',
    'any.required': 'Email é obrigatório'
  }),
  senha: Joi.string()
    .required()
    .custom(passwordValidator)
    .messages({
      'password.weak': 'A senha deve conter: {{#errors}}',
      'any.required': 'Senha é obrigatória'
    }),
  tipo: Joi.string().valid('admin', 'gestor', 'colaborador').required(),
  cargo: Joi.string().optional(),
  departamento: Joi.string().optional(),
  foto: Joi.string().uri().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().pattern(/\.edu\.br$/i).required().messages({
    'string.pattern.base': 'Use um e-mail institucional (ex: nome@faculdade.edu.br)',
    'string.email': 'Email inválido',
    'any.required': 'Email é obrigatório'
  }),
  senha: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  nome: Joi.string().min(3).optional(),
  cargo: Joi.string().optional(),
  departamento: Joi.string().optional(),
  foto: Joi.string().uri().optional()
});

export {
  registerSchema,
  loginSchema,
  updateProfileSchema
};

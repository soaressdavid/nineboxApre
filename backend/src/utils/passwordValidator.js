/**
 * Valida força da senha
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 * 
 * @param {string} password - Senha a ser validada
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('A senha deve ter no mínimo 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial (!@#$%^&* etc.)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Verifica se a senha contém padrões comuns fracos
 * @param {string} password - Senha a ser verificada
 * @returns {boolean} true se a senha for fraca
 */
export const isCommonPassword = (password) => {
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'password1',
    '123456789', '12345', '1234567', 'password123', 'admin',
    'letmein', 'welcome', 'monkey', '1234', 'admin123'
  ];

  return commonPasswords.some(common => 
    password.toLowerCase().includes(common)
  );
};

/**
 * Valida senha completa (força + padrões comuns)
 * @param {string} password - Senha a ser validada
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const strengthValidation = validatePasswordStrength(password);
  
  if (!strengthValidation.isValid) {
    return strengthValidation;
  }

  if (isCommonPassword(password)) {
    return {
      isValid: false,
      errors: ['A senha é muito comum. Escolha uma senha mais única.']
    };
  }

  return {
    isValid: true,
    errors: []
  };
};

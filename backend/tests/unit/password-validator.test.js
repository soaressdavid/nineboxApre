/**
 * Testes unitários — passwordValidator
 */
import { validatePasswordStrength, isCommonPassword, validatePassword } from '../../src/utils/passwordValidator.js';

describe('validatePasswordStrength', () => {
  it('deve aprovar senha forte', () => {
    const { isValid, errors } = validatePasswordStrength('SenhaForte@123');
    expect(isValid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('deve rejeitar senha com menos de 8 caracteres', () => {
    const { isValid, errors } = validatePasswordStrength('Ab1@');
    expect(isValid).toBe(false);
    expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(/8 caracteres/)]));
  });

  it('deve rejeitar senha sem maiúscula', () => {
    const { isValid, errors } = validatePasswordStrength('senhaforte@123');
    expect(isValid).toBe(false);
    expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(/maiúscula/)]));
  });

  it('deve rejeitar senha sem minúscula', () => {
    const { isValid, errors } = validatePasswordStrength('SENHAFORTE@123');
    expect(isValid).toBe(false);
    expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(/minúscula/)]));
  });

  it('deve rejeitar senha sem número', () => {
    const { isValid, errors } = validatePasswordStrength('SenhaForte@ABC');
    expect(isValid).toBe(false);
    expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(/número/)]));
  });

  it('deve rejeitar senha sem caractere especial', () => {
    const { isValid, errors } = validatePasswordStrength('SenhaForte123');
    expect(isValid).toBe(false);
    expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(/especial/)]));
  });
});

describe('isCommonPassword', () => {
  it('deve identificar senha comum', () => {
    expect(isCommonPassword('password123')).toBe(true);
    expect(isCommonPassword('admin123')).toBe(true);
    expect(isCommonPassword('letmein')).toBe(true);
  });

  it('deve retornar false para senha não comum', () => {
    expect(isCommonPassword('SenhaForte@XYZ789')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('deve aprovar senha forte e incomum', () => {
    const { isValid } = validatePassword('SenhaForte@789!');
    expect(isValid).toBe(true);
  });

  it('deve rejeitar senha fraca', () => {
    const { isValid, errors } = validatePassword('abc');
    expect(isValid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });
});

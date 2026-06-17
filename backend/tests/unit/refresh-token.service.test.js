/**
 * Testes unitários — RefreshTokenService
 * Testa renovação, revogação e detecção de reutilização maliciosa
 */
import { jest } from '@jest/globals';

// ── Mocks ────────────────────────────────────────────────────
const mockCreate = jest.fn();
const mockFindByToken = jest.fn();
const mockRevoke = jest.fn();
const mockRevokeAllByUser = jest.fn();

jest.unstable_mockModule('../../src/modules/auth/refresh-token.repository.js', () => ({
  RefreshTokenRepository: jest.fn().mockImplementation(() => ({
    create: mockCreate,
    findByToken: mockFindByToken,
    revoke: mockRevoke,
    revokeAllByUser: mockRevokeAllByUser
  }))
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
}));

const { RefreshTokenService } = await import('../../src/modules/auth/refresh-token.service.js');

// ── Helpers ──────────────────────────────────────────────────
const makeUser = () => ({
  id: 'user-uuid-123',
  email: 'joao@faculdade.edu.br',
  tipo: 'colaborador',
  ra: '12345',
  deletedAt: null
});

const makeTokenRecord = (overrides = {}) => ({
  id: 'token-uuid',
  token: 'valid-refresh-token',
  userId: 'user-uuid-123',
  expiresAt: new Date(Date.now() + 86400000), // +1 dia
  revokedAt: null,
  user: makeUser(),
  ...overrides
});

let service;

beforeEach(() => {
  jest.clearAllMocks();
  service = new RefreshTokenService();
  mockCreate.mockResolvedValue({ token: 'new-refresh-token', ...makeTokenRecord() });
});

// ════════════════════════════════════════════════════════════
// REFRESH
// ════════════════════════════════════════════════════════════
describe('RefreshTokenService.refresh', () => {
  it('deve retornar novo par de tokens para refresh token válido', async () => {
    mockFindByToken.mockResolvedValue(makeTokenRecord());
    mockRevoke.mockResolvedValue({});

    const result = await service.refresh('valid-refresh-token');

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(mockRevoke).toHaveBeenCalledWith('valid-refresh-token');
  });

  it('deve lançar 401 se refresh token não existir', async () => {
    mockFindByToken.mockResolvedValue(null);

    await expect(service.refresh('inexistente'))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('deve lançar 401 e revogar todos os tokens se refresh token foi revogado', async () => {
    mockFindByToken.mockResolvedValue(makeTokenRecord({ revokedAt: new Date() }));
    mockRevokeAllByUser.mockResolvedValue({});

    await expect(service.refresh('revoked-token'))
      .rejects.toMatchObject({ statusCode: 401 });

    expect(mockRevokeAllByUser).toHaveBeenCalledWith('user-uuid-123');
  });

  it('deve lançar 401 se refresh token estiver expirado', async () => {
    mockFindByToken.mockResolvedValue(makeTokenRecord({
      expiresAt: new Date(Date.now() - 1000) // passado
    }));

    await expect(service.refresh('expired-token'))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('deve lançar 401 se usuário estiver com soft delete', async () => {
    mockFindByToken.mockResolvedValue(makeTokenRecord({
      user: { ...makeUser(), deletedAt: new Date() }
    }));

    await expect(service.refresh('valid-token'))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('deve lançar 401 se refreshToken não for fornecido', async () => {
    await expect(service.refresh(null))
      .rejects.toMatchObject({ statusCode: 401 });
  });
});

// ════════════════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════════════════
describe('RefreshTokenService.logout', () => {
  it('deve revogar o token', async () => {
    mockRevoke.mockResolvedValue({});
    await service.logout('some-token');
    expect(mockRevoke).toHaveBeenCalledWith('some-token');
  });

  it('não deve lançar erro se token for null', async () => {
    await expect(service.logout(null)).resolves.not.toThrow();
    expect(mockRevoke).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════
// LOGOUT ALL
// ════════════════════════════════════════════════════════════
describe('RefreshTokenService.logoutAll', () => {
  it('deve revogar todos os tokens do usuário', async () => {
    mockRevokeAllByUser.mockResolvedValue({});
    await service.logoutAll('user-uuid-123');
    expect(mockRevokeAllByUser).toHaveBeenCalledWith('user-uuid-123');
  });
});

/**
 * Testes de integração — Rotas de Auth
 * POST /api/users/login
 * POST /api/auth/refresh
 * POST /api/auth/logout
 */
import { jest } from '@jest/globals';
import request from 'supertest';

// ── Mocks antes dos imports do app ────────────────────────────
const mockFindByEmailWithPassword = jest.fn();
const mockCreateToken = jest.fn();
const mockFindByToken = jest.fn();
const mockRevoke = jest.fn();
const mockRevokeAll = jest.fn();

jest.unstable_mockModule('../../src/config/database.js', () => ({
  prisma: {
    user: { findUnique: mockFindByEmailWithPassword },
    refreshToken: { findUnique: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
    $disconnect: jest.fn()
  }
}));

jest.unstable_mockModule('../../src/modules/auth/refresh-token.repository.js', () => ({
  RefreshTokenRepository: jest.fn().mockImplementation(() => ({
    create: mockCreateToken,
    findByToken: mockFindByToken,
    revoke: mockRevoke,
    revokeAllByUser: mockRevokeAll
  }))
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
}));

jest.unstable_mockModule('../../src/modules/users/user.repository.js', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findByEmailWithPassword: mockFindByEmailWithPassword,
    findById: jest.fn(),
    emailExists: jest.fn().mockResolvedValue(false),
    raExists: jest.fn().mockResolvedValue(false),
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn().mockResolvedValue({ users: [], pagination: {} }),
    softDelete: jest.fn(),
    addGestorColaborador: jest.fn()
  }))
}));

const { default: app } = await import('../../src/app.js');

// ── Helpers ──────────────────────────────────────────────────
const bcrypt = await import('bcryptjs');

const validUser = {
  id: 'user-uuid-test',
  ra: '12345',
  nome: 'Test User',
  email: 'test@faculdade.edu.br',
  tipo: 'admin',
  cargo: 'Dev',
  departamento: 'TI',
  foto: null,
  deletedAt: null,
  createdAt: new Date()
};

// ════════════════════════════════════════════════════════════
// POST /api/users/login
// ════════════════════════════════════════════════════════════
describe('POST /api/users/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateToken.mockResolvedValue({
      token: 'refresh-token-abc',
      expiresAt: new Date(Date.now() + 86400000)
    });
  });

  it('deve retornar 200 com tokens ao logar com credenciais válidas', async () => {
    const senha = 'SenhaForte@123';
    const hash = await bcrypt.hash(senha, 10);
    mockFindByEmailWithPassword.mockResolvedValue({ ...validUser, senha: hash });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: validUser.email, senha });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user).not.toHaveProperty('senha');
  });

  it('deve retornar 401 com credenciais inválidas', async () => {
    mockFindByEmailWithPassword.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'wrong@faculdade.edu.br', senha: 'WrongPass@1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('deve retornar 400 sem email', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ senha: 'SenhaForte@123' });

    expect(res.status).toBe(400);
  });

  it('deve retornar 400 sem senha', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@faculdade.edu.br' });

    expect(res.status).toBe(400);
  });

  it('deve retornar 401 para usuário com soft delete', async () => {
    mockFindByEmailWithPassword.mockResolvedValue({ ...validUser, deletedAt: new Date() });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: validUser.email, senha: 'qualquer' });

    expect(res.status).toBe(401);
  });
});

// ════════════════════════════════════════════════════════════
// POST /api/auth/refresh
// ════════════════════════════════════════════════════════════
describe('POST /api/auth/refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateToken.mockResolvedValue({
      token: 'new-refresh-token',
      expiresAt: new Date(Date.now() + 86400000)
    });
  });

  it('deve retornar novo par de tokens com refresh token válido', async () => {
    mockFindByToken.mockResolvedValue({
      id: 'rt-uuid',
      token: 'valid-rt',
      userId: validUser.id,
      expiresAt: new Date(Date.now() + 86400000),
      revokedAt: null,
      user: validUser
    });
    mockRevoke.mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'valid-rt' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('deve retornar 401 com refresh token inválido', async () => {
    mockFindByToken.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-rt' });

    expect(res.status).toBe(401);
  });

  it('deve retornar 401 sem refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({});

    expect(res.status).toBe(401);
  });
});

// ════════════════════════════════════════════════════════════
// POST /api/auth/logout
// ════════════════════════════════════════════════════════════
describe('POST /api/auth/logout', () => {
  it('deve retornar 200 ao fazer logout', async () => {
    mockRevoke.mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken: 'some-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('deve retornar 200 mesmo sem refresh token (idempotente)', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({});

    expect(res.status).toBe(200);
  });
});

// ════════════════════════════════════════════════════════════
// GET /health
// ════════════════════════════════════════════════════════════
describe('GET /health', () => {
  it('deve retornar status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

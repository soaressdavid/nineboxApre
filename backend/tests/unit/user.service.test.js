/**
 * Testes unitários — UserService
 * Testa login, registro, soft delete e perfil
 */
import { jest } from '@jest/globals';

// ── Mocks ───────────────────────────────────────────────────
const mockFindByEmailWithPassword = jest.fn();
const mockCreate = jest.fn();
const mockFindById = jest.fn();
const mockSoftDelete = jest.fn();
const mockEmailExists = jest.fn();
const mockRaExists = jest.fn();
const mockUpdate = jest.fn();

const mockUserRepository = {
  findByEmailWithPassword: mockFindByEmailWithPassword,
  findById: mockFindById,
  create: mockCreate,
  softDelete: mockSoftDelete,
  emailExists: mockEmailExists,
  raExists: mockRaExists,
  update: mockUpdate,
  addGestorColaborador: jest.fn()
};

// Mock do RefreshTokenService
const mockCreateTokenPair = jest.fn();
const mockLogoutAll = jest.fn();

jest.unstable_mockModule('../../src/modules/auth/refresh-token.service.js', () => ({
  RefreshTokenService: jest.fn().mockImplementation(() => ({
    createTokenPair: mockCreateTokenPair,
    logoutAll: mockLogoutAll
  }))
}));

jest.unstable_mockModule('../../src/services/authorization.service.js', () => ({
  AuthorizationService: { requireOwnerOrAdmin: jest.fn() }
}));

const { UserService } = await import('../../src/modules/users/user.service.js');

// ── Helpers ─────────────────────────────────────────────────
const makeUser = (overrides = {}) => ({
  id: 'user-uuid-123',
  ra: '12345',
  nome: 'João Silva',
  email: 'joao@faculdade.edu.br',
  tipo: 'colaborador',
  cargo: 'Analista',
  departamento: 'TI',
  foto: null,
  deletedAt: null,
  senha: '$2a$10$hashedpassword',
  createdAt: new Date(),
  ...overrides
});

// ── Setup ────────────────────────────────────────────────────
let userService;

beforeEach(() => {
  jest.clearAllMocks();
  userService = new UserService(mockUserRepository);

  mockCreateTokenPair.mockResolvedValue({
    accessToken: 'access.token.jwt',
    refreshToken: 'refresh-token-hex',
    expiresIn: '15m'
  });
});

// ════════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════════
describe('UserService.login', () => {
  it('deve retornar tokens e user ao logar com credenciais válidas', async () => {
    const user = makeUser();
    mockFindByEmailWithPassword.mockResolvedValue(user);

    // Importa bcrypt para gerar hash real
    const bcrypt = await import('bcryptjs');
    const senha = 'SenhaForte@123';
    user.senha = await bcrypt.hash(senha, 10);

    const result = await userService.login(user.email, senha);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user).not.toHaveProperty('senha');
    expect(result.user.email).toBe(user.email);
  });

  it('deve lançar 401 se email não existir', async () => {
    mockFindByEmailWithPassword.mockResolvedValue(null);

    await expect(userService.login('nao@existe.edu.br', 'qualquer'))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('deve lançar 401 se senha for incorreta', async () => {
    const user = makeUser();
    const bcrypt = await import('bcryptjs');
    user.senha = await bcrypt.hash('SenhaCorreta@1', 10);
    mockFindByEmailWithPassword.mockResolvedValue(user);

    await expect(userService.login(user.email, 'SenhaErrada@1'))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('deve lançar 401 para usuário com soft delete', async () => {
    const user = makeUser({ deletedAt: new Date() });
    mockFindByEmailWithPassword.mockResolvedValue(user);

    await expect(userService.login(user.email, 'qualquer'))
      .rejects.toMatchObject({ statusCode: 401 });
  });
});

// ════════════════════════════════════════════════════════════
// REGISTER
// ════════════════════════════════════════════════════════════
describe('UserService.register', () => {
  it('deve criar usuário e retornar sem senha', async () => {
    mockEmailExists.mockResolvedValue(false);
    mockRaExists.mockResolvedValue(false);
    const user = makeUser();
    mockCreate.mockResolvedValue({ ...user });

    const result = await userService.register({
      ra: user.ra, nome: user.nome, email: user.email,
      senha: 'SenhaForte@123', tipo: 'colaborador'
    });

    expect(result).not.toHaveProperty('senha');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('deve lançar 400 se email já existir', async () => {
    mockEmailExists.mockResolvedValue(true);

    await expect(userService.register({
      ra: '99999', nome: 'Teste', email: 'joao@faculdade.edu.br',
      senha: 'SenhaForte@123', tipo: 'colaborador'
    })).rejects.toMatchObject({ statusCode: 400 });
  });

  it('deve lançar 400 se RA já existir', async () => {
    mockEmailExists.mockResolvedValue(false);
    mockRaExists.mockResolvedValue(true);

    await expect(userService.register({
      ra: '12345', nome: 'Teste', email: 'outro@faculdade.edu.br',
      senha: 'SenhaForte@123', tipo: 'colaborador'
    })).rejects.toMatchObject({ statusCode: 400 });
  });
});

// ════════════════════════════════════════════════════════════
// DELETE (SOFT DELETE)
// ════════════════════════════════════════════════════════════
describe('UserService.delete', () => {
  it('deve fazer soft delete de colaborador', async () => {
    const user = makeUser();
    mockFindById.mockResolvedValue(user);
    mockSoftDelete.mockResolvedValue({ ...user, deletedAt: new Date() });
    mockLogoutAll.mockResolvedValue(undefined);

    const result = await userService.delete(user.id);

    expect(mockSoftDelete).toHaveBeenCalledWith(user.id);
    expect(mockLogoutAll).toHaveBeenCalledWith(user.id);
    expect(result.message).toMatch(/desativado/i);
  });

  it('não deve deletar admin', async () => {
    mockFindById.mockResolvedValue(makeUser({ tipo: 'admin' }));

    await expect(userService.delete('user-uuid-123'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('deve lançar 404 se usuário não existir', async () => {
    mockFindById.mockResolvedValue(null);

    await expect(userService.delete('inexistente'))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

// ════════════════════════════════════════════════════════════
// GET PROFILE
// ════════════════════════════════════════════════════════════
describe('UserService.getProfile', () => {
  it('deve retornar perfil sem senha', async () => {
    const user = makeUser();
    mockFindById.mockResolvedValue(user);

    const result = await userService.getProfile(user.id);

    expect(result).not.toHaveProperty('senha');
    expect(result.id).toBe(user.id);
  });

  it('deve lançar 404 se usuário não existir', async () => {
    mockFindById.mockResolvedValue(null);

    await expect(userService.getProfile('inexistente'))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

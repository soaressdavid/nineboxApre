/**
 * Testes unitários — Middleware authorize
 */
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
}));

const { authorize, authorizeOwnerOrAdmin } = await import('../../src/middlewares/authorize.js');

// ── Helpers ──────────────────────────────────────────────────
const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

const makeReq = (tipo, params = {}) => ({
  user: { id: 'user-id', tipo },
  params,
  path: '/test'
});

// ════════════════════════════════════════════════════════════
// authorize
// ════════════════════════════════════════════════════════════
describe('authorize middleware', () => {
  it('deve chamar next() se tipo estiver na lista de roles', () => {
    const req = makeReq('admin');
    const next = jest.fn();

    authorize('admin', 'gestor')(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('deve chamar next(error 403) se tipo não estiver na lista', () => {
    const req = makeReq('colaborador');
    const next = jest.fn();

    authorize('admin')(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('deve chamar next(error 401) se req.user não existir', () => {
    const req = { params: {}, path: '/test' }; // sem user
    const next = jest.fn();

    authorize('admin')(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('deve aceitar múltiplas roles', () => {
    const next = jest.fn();
    authorize('admin', 'gestor', 'colaborador')(makeReq('colaborador'), makeRes(), next);
    expect(next).toHaveBeenCalledWith();
  });
});

// ════════════════════════════════════════════════════════════
// authorizeOwnerOrAdmin
// ════════════════════════════════════════════════════════════
describe('authorizeOwnerOrAdmin middleware', () => {
  it('deve permitir ao dono do recurso', () => {
    const req = { user: { id: 'user-123', tipo: 'colaborador' }, params: { id: 'user-123' }, path: '/test' };
    const next = jest.fn();

    authorizeOwnerOrAdmin('id')(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('deve permitir ao admin', () => {
    const req = { user: { id: 'admin-id', tipo: 'admin' }, params: { id: 'outro-user' }, path: '/test' };
    const next = jest.fn();

    authorizeOwnerOrAdmin('id')(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('deve bloquear usuário que não é dono nem admin', () => {
    const req = { user: { id: 'user-123', tipo: 'gestor' }, params: { id: 'outro-user' }, path: '/test' };
    const next = jest.fn();

    authorizeOwnerOrAdmin('id')(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

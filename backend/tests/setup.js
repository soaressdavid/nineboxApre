/**
 * Setup global dos testes
 * Mock do Prisma para não precisar de banco de dados real nos testes unitários
 */

// Silencia o logger durante os testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.JWT_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_DAYS = '7';

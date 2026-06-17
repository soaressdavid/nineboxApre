/**
 * Especificação OpenAPI 3.0 da API NineBox
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'NineBox API',
    version: '1.0.0',
    description: 'API para gerenciamento de avaliações de desempenho e Nine Box',
    contact: {
      name: 'Suporte',
      email: 'suporte@faculdade.edu.br'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de Desenvolvimento'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o access token JWT obtido no login'
      }
    },
    schemas: {
      // ── Genéricos ────────────────────────────────────────
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operação realizada com sucesso' },
          data: { type: 'object' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Erro ao processar requisição' }
        }
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 10 },
          total:      { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 5 }
        }
      },
      // ── User ────────────────────────────────────────────
      User: {
        type: 'object',
        properties: {
          id:          { type: 'string', format: 'uuid' },
          ra:          { type: 'string', example: '12345' },
          nome:        { type: 'string', example: 'João Silva' },
          email:       { type: 'string', format: 'email', example: 'joao@faculdade.edu.br' },
          tipo:        { type: 'string', enum: ['admin', 'gestor', 'colaborador'] },
          cargo:       { type: 'string', example: 'Analista' },
          departamento:{ type: 'string', example: 'TI' },
          foto:        { type: 'string', nullable: true },
          createdAt:   { type: 'string', format: 'date-time' }
        }
      },
      RegisterInput: {
        type: 'object',
        required: ['ra', 'nome', 'email', 'senha', 'tipo'],
        properties: {
          ra:          { type: 'string', minLength: 5, maxLength: 10 },
          nome:        { type: 'string', minLength: 3 },
          email:       { type: 'string', format: 'email', example: 'usuario@faculdade.edu.br' },
          senha:       { type: 'string', minLength: 8, description: 'Mínimo 8 chars, maiúscula, minúscula, número e caractere especial' },
          tipo:        { type: 'string', enum: ['admin', 'gestor', 'colaborador'] },
          cargo:       { type: 'string' },
          departamento:{ type: 'string' },
          gestorId:    { type: 'string', format: 'uuid', description: 'Obrigatório se tipo=colaborador' }
        }
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@faculdade.edu.br' },
          senha: { type: 'string', example: 'SenhaForte@123' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success:      { type: 'boolean' },
          message:      { type: 'string' },
          data: {
            type: 'object',
            properties: {
              user:         { $ref: '#/components/schemas/User' },
              accessToken:  { type: 'string' },
              refreshToken: { type: 'string' },
              expiresIn:    { type: 'string', example: '15m' }
            }
          }
        }
      },
      // ── Auth ────────────────────────────────────────────
      RefreshTokenInput: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' }
        }
      },
      // ── Campaign ─────────────────────────────────────────
      Campaign: {
        type: 'object',
        properties: {
          id:           { type: 'string', format: 'uuid' },
          nome:         { type: 'string' },
          descricao:    { type: 'string', nullable: true },
          dataInicio:   { type: 'string', format: 'date-time' },
          dataFim:      { type: 'string', format: 'date-time' },
          status:       { type: 'string', enum: ['planejamento', 'ativa', 'finalizada'] },
          tipoAlvo:     { type: 'string' },
          tipoAvaliacao:{ type: 'string', enum: ['desempenho', 'potencial'] },
          createdAt:    { type: 'string', format: 'date-time' }
        }
      },
      // ── Competency ───────────────────────────────────────
      Competency: {
        type: 'object',
        properties: {
          id:        { type: 'string', format: 'uuid' },
          nome:      { type: 'string' },
          descricao: { type: 'string' },
          tipo:      { type: 'string' },
          criterios: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      // ── Evaluation ───────────────────────────────────────
      Evaluation: {
        type: 'object',
        properties: {
          id:          { type: 'string', format: 'uuid' },
          campaignId:  { type: 'string', format: 'uuid' },
          avaliadorId: { type: 'string', format: 'uuid' },
          avaliadoId:  { type: 'string', format: 'uuid' },
          criterios:   { type: 'object' },
          media:       { type: 'number', nullable: true },
          comentario:  { type: 'string', nullable: true },
          anonima:     { type: 'boolean' },
          data:        { type: 'string', format: 'date-time' }
        }
      },
      // ── NineBox ──────────────────────────────────────────
      NineBox: {
        type: 'object',
        properties: {
          id:         { type: 'string', format: 'uuid' },
          pessoaId:   { type: 'string', format: 'uuid' },
          performance:{ type: 'number', minimum: 0, maximum: 10 },
          potential:  { type: 'number', minimum: 0, maximum: 10 },
          categoria:  { type: 'string' },
          comentario: { type: 'string', nullable: true },
          data:       { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    // ════════════════════════════════════════════
    // AUTH
    // ════════════════════════════════════════════
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar access token',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenInput' } } }
        },
        responses: {
          200: { description: 'Token renovado', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
          401: { description: 'Refresh token inválido ou expirado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (revoga refresh token)',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenInput' } } }
        },
        responses: {
          200: { description: 'Logout realizado' }
        }
      }
    },
    '/api/auth/logout-all': {
      post: {
        tags: ['Auth'],
        summary: 'Logout em todos os dispositivos',
        responses: {
          200: { description: 'Todos os tokens revogados' },
          401: { description: 'Não autorizado' }
        }
      }
    },
    // ════════════════════════════════════════════
    // USERS
    // ════════════════════════════════════════════
    '/api/users/login': {
      post: {
        tags: ['Usuários'],
        summary: 'Login',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } }
        },
        responses: {
          200: { description: 'Login realizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
          401: { description: 'Credenciais inválidas' },
          429: { description: 'Muitas tentativas de login' }
        }
      }
    },
    '/api/users/register': {
      post: {
        tags: ['Usuários'],
        summary: 'Cadastrar novo usuário (admin)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } }
        },
        responses: {
          201: { description: 'Usuário criado' },
          400: { description: 'Dados inválidos ou duplicados' },
          403: { description: 'Acesso negado' }
        }
      }
    },
    '/api/users': {
      get: {
        tags: ['Usuários'],
        summary: 'Listar usuários (admin)',
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'tipo', schema: { type: 'string', enum: ['admin', 'gestor', 'colaborador'] } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'departamento', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Lista de usuários' },
          403: { description: 'Acesso negado' }
        }
      }
    },
    '/api/users/profile': {
      get: {
        tags: ['Usuários'],
        summary: 'Obter perfil do usuário autenticado',
        responses: {
          200: { description: 'Perfil do usuário', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }
        }
      },
      put: {
        tags: ['Usuários'],
        summary: 'Atualizar perfil',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome:         { type: 'string' },
                  cargo:        { type: 'string' },
                  departamento: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Perfil atualizado' }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['Usuários'],
        summary: 'Buscar usuário por ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Usuário encontrado' },
          404: { description: 'Usuário não encontrado' }
        }
      },
      delete: {
        tags: ['Usuários'],
        summary: 'Desativar usuário (soft delete, admin)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Usuário desativado' },
          403: { description: 'Acesso negado' },
          404: { description: 'Usuário não encontrado' }
        }
      }
    },
    // ════════════════════════════════════════════
    // CAMPAIGNS
    // ════════════════════════════════════════════
    '/api/campaigns': {
      get: {
        tags: ['Campanhas'],
        summary: 'Listar campanhas',
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['planejamento', 'ativa', 'finalizada'] } }
        ],
        responses: { 200: { description: 'Lista de campanhas' } }
      },
      post: {
        tags: ['Campanhas'],
        summary: 'Criar campanha (admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'dataInicio', 'dataFim', 'tipoAlvo'],
                properties: {
                  nome:         { type: 'string' },
                  descricao:    { type: 'string' },
                  dataInicio:   { type: 'string', format: 'date-time' },
                  dataFim:      { type: 'string', format: 'date-time' },
                  tipoAlvo:     { type: 'string' },
                  tipoAvaliacao:{ type: 'string', enum: ['desempenho', 'potencial'] }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Campanha criada' }, 403: { description: 'Acesso negado' } }
      }
    },
    '/api/campaigns/{id}': {
      get: {
        tags: ['Campanhas'],
        summary: 'Buscar campanha por ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Campanha encontrada' }, 404: { description: 'Não encontrada' } }
      },
      put: {
        tags: ['Campanhas'],
        summary: 'Atualizar campanha (admin)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Campaign' } } } },
        responses: { 200: { description: 'Campanha atualizada' } }
      },
      delete: {
        tags: ['Campanhas'],
        summary: 'Deletar campanha (admin)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Campanha deletada' } }
      }
    },
    // ════════════════════════════════════════════
    // EVALUATIONS
    // ════════════════════════════════════════════
    '/api/evaluations': {
      get: {
        tags: ['Avaliações'],
        summary: 'Listar avaliações (admin)',
        responses: { 200: { description: 'Lista de avaliações' } }
      },
      post: {
        tags: ['Avaliações'],
        summary: 'Criar avaliação',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['campaignId', 'avaliadoId', 'criterios'],
                properties: {
                  campaignId:  { type: 'string', format: 'uuid' },
                  avaliadoId:  { type: 'string', format: 'uuid' },
                  criterios:   { type: 'object' },
                  comentario:  { type: 'string' },
                  anonima:     { type: 'boolean', default: true }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Avaliação criada' } }
      }
    },
    '/api/evaluations/{id}': {
      get: {
        tags: ['Avaliações'],
        summary: 'Buscar avaliação por ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Avaliação encontrada' } }
      }
    },
    '/api/evaluations/avaliado/{avaliadoId}': {
      get: {
        tags: ['Avaliações'],
        summary: 'Listar avaliações de um colaborador',
        parameters: [{ in: 'path', name: 'avaliadoId', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Avaliações encontradas' } }
      }
    },
    '/api/evaluations/dashboard/colaborador': {
      get: { tags: ['Dashboard'], summary: 'Dashboard do colaborador', responses: { 200: { description: 'Dados do dashboard' } } }
    },
    '/api/evaluations/dashboard/gestor': {
      get: { tags: ['Dashboard'], summary: 'Dashboard do gestor', responses: { 200: { description: 'Dados do dashboard' } } }
    },
    '/api/evaluations/dashboard/admin': {
      get: { tags: ['Dashboard'], summary: 'Dashboard do admin', responses: { 200: { description: 'Dados do dashboard' } } }
    },
    // ════════════════════════════════════════════
    // COMPETENCIES
    // ════════════════════════════════════════════
    '/api/competencies': {
      get: {
        tags: ['Competências'],
        summary: 'Listar competências',
        responses: { 200: { description: 'Lista de competências' } }
      },
      post: {
        tags: ['Competências'],
        summary: 'Criar competência (admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'descricao'],
                properties: {
                  nome:      { type: 'string' },
                  descricao: { type: 'string' },
                  tipo:      { type: 'string' },
                  criterios: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Competência criada' } }
      }
    },
    '/api/competencies/{id}': {
      get: {
        tags: ['Competências'],
        summary: 'Buscar competência por ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Competência encontrada' } }
      },
      put: {
        tags: ['Competências'],
        summary: 'Atualizar competência (admin)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Competency' } } } },
        responses: { 200: { description: 'Competência atualizada' } }
      },
      delete: {
        tags: ['Competências'],
        summary: 'Deletar competência (soft delete, admin)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Competência deletada' } }
      }
    },
    // ════════════════════════════════════════════
    // NINEBOX
    // ════════════════════════════════════════════
    '/api/ninebox': {
      get: {
        tags: ['Nine Box'],
        summary: 'Listar registros Nine Box',
        responses: { 200: { description: 'Lista Nine Box' } }
      },
      post: {
        tags: ['Nine Box'],
        summary: 'Classificar colaborador no Nine Box',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['pessoaId', 'performance', 'potential'],
                properties: {
                  pessoaId:   { type: 'string', format: 'uuid' },
                  performance:{ type: 'number', minimum: 0, maximum: 10 },
                  potential:  { type: 'number', minimum: 0, maximum: 10 },
                  comentario: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Registro criado' } }
      }
    },
    '/api/ninebox/{id}': {
      get: {
        tags: ['Nine Box'],
        summary: 'Buscar Nine Box por pessoa',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Nine Box encontrado' } }
      }
    },
    // ════════════════════════════════════════════
    // REPORTS
    // ════════════════════════════════════════════
    '/api/reports/individual/{userId}': {
      get: {
        tags: ['Relatórios'],
        summary: 'Relatório individual do usuário',
        parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Relatório individual' } }
      }
    },
    '/api/reports/campaign/{campaignId}': {
      get: {
        tags: ['Relatórios'],
        summary: 'Relatório de uma campanha',
        parameters: [{ in: 'path', name: 'campaignId', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Relatório da campanha' } }
      }
    },
    '/api/export/campaign/{campaignId}/csv': {
      get: {
        tags: ['Relatórios'],
        summary: 'Exportar campanha em CSV',
        parameters: [{ in: 'path', name: 'campaignId', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Arquivo CSV', content: { 'text/csv': {} } }
        }
      }
    },
    // ════════════════════════════════════════════
    // GROUPS
    // ════════════════════════════════════════════
    '/api/groups': {
      get: {
        tags: ['Grupos'],
        summary: 'Listar grupos gestor-colaborador',
        responses: { 200: { description: 'Lista de grupos' } }
      },
      post: {
        tags: ['Grupos'],
        summary: 'Criar associação gestor-colaborador',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['gestorId', 'colaboradorId'],
                properties: {
                  gestorId:     { type: 'string', format: 'uuid' },
                  colaboradorId:{ type: 'string', format: 'uuid' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Grupo criado' } }
      }
    },
    // ════════════════════════════════════════════
    // PASSWORD RESET
    // ════════════════════════════════════════════
    '/api/password-reset/request': {
      post: {
        tags: ['Auth'],
        summary: 'Solicitar reset de senha',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } } }
        },
        responses: { 200: { description: 'Instruções enviadas (se email existir)' }, 429: { description: 'Muitas tentativas' } }
      }
    },
    '/api/password-reset/reset': {
      post: {
        tags: ['Auth'],
        summary: 'Redefinir senha com token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'novaSenha'],
                properties: {
                  token:    { type: 'string' },
                  novaSenha:{ type: 'string', minLength: 8 }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Senha redefinida' }, 400: { description: 'Token inválido' } }
      }
    },
    // ════════════════════════════════════════════
    // NOTIFICATIONS
    // ════════════════════════════════════════════
    '/api/notifications': {
      get: {
        tags: ['Notificações'],
        summary: 'Listar notificações do usuário',
        responses: { 200: { description: 'Lista de notificações' } }
      }
    },
    '/api/notifications/{id}/read': {
      patch: {
        tags: ['Notificações'],
        summary: 'Marcar notificação como lida',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Notificação marcada como lida' } }
      }
    },
    // ════════════════════════════════════════════
    // AUDIT
    // ════════════════════════════════════════════
    '/api/audit': {
      get: {
        tags: ['Auditoria'],
        summary: 'Listar logs de auditoria (admin)',
        parameters: [
          { in: 'query', name: 'entityType', schema: { type: 'string' } },
          { in: 'query', name: 'userId', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'action', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Logs de auditoria' } }
      }
    },
    // ════════════════════════════════════════════
    // HEALTH
    // ════════════════════════════════════════════
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Health check',
        security: [],
        responses: {
          200: {
            description: 'API online',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' }, timestamp: { type: 'string', format: 'date-time' } } } } }
          }
        }
      }
    }
  }
};

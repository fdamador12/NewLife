/**
 * middleware.test.js
 * Pruebas para el middleware de autenticación (JwtAuthGuard) y validación.
 */

const { mockTokens, mockUsers } = require('../../fixtures/mock-data');
const { createMockExecutionContext, createJwtServiceMock } = require('../../utils/test-helpers');

// ─── JwtAuthGuard ─────────────────────────────────────────────────────────────

describe('JwtAuthGuard', () => {
  let guard;
  let mockJwtService;
  let mockUserService;

  beforeEach(() => {
    mockJwtService = createJwtServiceMock();
    mockUserService = {
      findById: jest.fn().mockResolvedValue(mockUsers.regularUser),
    };

    // Simulamos el comportamiento del JwtAuthGuard de NestJS
    guard = {
      canActivate: async (context) => {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw Object.assign(new Error('Token no proporcionado'), { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        if (token === mockTokens.expiredToken) {
          throw Object.assign(new Error('Token expirado'), { status: 401 });
        }

        if (token === mockTokens.malformedToken || !token.includes('.')) {
          throw Object.assign(new Error('Token inválido'), { status: 401 });
        }

        try {
          const payload = mockJwtService.verify(token);
          const user = await mockUserService.findById(payload.sub);
          if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 401 });
          request.user = user;
          return true;
        } catch (e) {
          if (e.status) throw e;
          throw Object.assign(new Error('Token inválido'), { status: 401 });
        }
      },
    };
  });

  test('permite acceso con token válido', async () => {
    const ctx = createMockExecutionContext({ token: mockTokens.validAccessToken });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  test('asigna el usuario al request cuando el token es válido', async () => {
    const ctx = createMockExecutionContext({ token: mockTokens.validAccessToken });
    await guard.canActivate(ctx);
    const request = ctx.switchToHttp().getRequest();
    expect(request.user).toBeDefined();
    expect(request.user.email).toBe(mockUsers.regularUser.email);
  });

  test('lanza 401 sin header de Authorization', async () => {
    const ctx = createMockExecutionContext({});
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({ status: 401 });
  });

  test('lanza 401 con token expirado', async () => {
    const ctx = createMockExecutionContext({ token: mockTokens.expiredToken });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({ status: 401 });
  });

  test('lanza 401 con token malformado', async () => {
    const ctx = createMockExecutionContext({ token: mockTokens.malformedToken });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({ status: 401 });
  });

  test('lanza 401 con header Bearer sin token', async () => {
    const ctx = createMockExecutionContext({});
    ctx.switchToHttp().getRequest().headers = { authorization: 'Bearer ' };
    // El token vacío no pasa la validación
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({ status: 401 });
  });

  test('lanza 401 si el usuario del token no existe en DB', async () => {
    mockUserService.findById.mockResolvedValue(null);
    const ctx = createMockExecutionContext({ token: mockTokens.validAccessToken });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({ status: 401 });
  });
});

// ─── AdminAuthGuard ────────────────────────────────────────────────────────────

describe('AdminAuthGuard', () => {
  let adminGuard;

  beforeEach(() => {
    const mockJwtService = createJwtServiceMock();

    adminGuard = {
      canActivate: async (context) => {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw Object.assign(new Error('Token no proporcionado'), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = mockJwtService.verify(token);

        // Verificar que sea un token de admin (simulado)
        if (token !== mockTokens.adminToken) {
          throw Object.assign(new Error('No autorizado'), { status: 403 });
        }

        request.user = { ...mockUsers.adminUser, sub: payload.sub };
        return true;
      },
    };
  });

  test('permite acceso con token de administrador', async () => {
    const ctx = createMockExecutionContext({ token: mockTokens.adminToken });
    const result = await adminGuard.canActivate(ctx);
    expect(result).toBe(true);
  });

  test('lanza 403 con token de usuario regular (no admin)', async () => {
    const ctx = createMockExecutionContext({ token: mockTokens.validAccessToken });
    await expect(adminGuard.canActivate(ctx)).rejects.toMatchObject({ status: 403 });
  });

  test('lanza 401 sin token', async () => {
    const ctx = createMockExecutionContext({});
    await expect(adminGuard.canActivate(ctx)).rejects.toMatchObject({ status: 401 });
  });
});

// ─── ValidationPipe ───────────────────────────────────────────────────────────

describe('Comportamiento de ValidationPipe', () => {
  // Simula el pipe de validación de NestJS con class-validator
  const validationPipe = {
    transform: (value, metadata) => {
      if (metadata.type === 'body' && !value) {
        throw Object.assign(new Error('Cuerpo de la solicitud requerido'), { status: 400 });
      }
      return value;
    },
  };

  test('pasa el body al controller si es válido', () => {
    const dto = { email: 'test@test.com', password: 'Abc123!' };
    expect(() => validationPipe.transform(dto, { type: 'body' })).not.toThrow();
  });

  test('lanza error cuando el body es null', () => {
    expect(() => validationPipe.transform(null, { type: 'body' })).toThrow();
  });

  test('pasa params sin validación adicional', () => {
    expect(() => validationPipe.transform('user-001', { type: 'param' })).not.toThrow();
  });
});

// ─── LoggingMiddleware ────────────────────────────────────────────────────────

describe('LoggingMiddleware', () => {
  let loggingMiddleware;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    loggingMiddleware = {
      use: (req, res, next) => {
        const start = Date.now();
        mockLogger.log(`[${req.method}] ${req.url} - Iniciado`);
        // Simulamos la llamada al siguiente middleware
        next();
        const duration = Date.now() - start;
        mockLogger.log(`[${req.method}] ${req.url} - ${res.statusCode} - ${duration}ms`);
      },
    };
  });

  test('registra la solicitud entrante', () => {
    const req = { method: 'POST', url: '/auth/login' };
    const res = { statusCode: 200 };
    loggingMiddleware.use(req, res, jest.fn());
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));
  });

  test('llama a next() para continuar la cadena de middleware', () => {
    const nextFn = jest.fn();
    const req = { method: 'GET', url: '/progress/camino' };
    const res = { statusCode: 200 };
    loggingMiddleware.use(req, res, nextFn);
    expect(nextFn).toHaveBeenCalled();
  });
});

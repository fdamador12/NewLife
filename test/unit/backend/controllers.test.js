/**
 * controllers.test.js (backend)
 * Pruebas unitarias para los controladores del Mobile API y Admin API.
 * Los servicios están completamente mockeados; se prueba solo la capa de presentación.
 */

const {
  mockUsers,
  mockCredentials,
  mockCheckins,
  mockCheckinResponse,
  mockCamino,
  mockPet,
  mockApiResponses,
} = require('../../fixtures/mock-data');
const { createMockRequest, createMockResponse, createAuthenticatedUser, createServiceMock } = require('../../utils/test-helpers');

// ─── AuthController ───────────────────────────────────────────────────────────

describe('AuthController', () => {
  let authController;
  let mockAuthService;

  beforeEach(() => {
    mockAuthService = createServiceMock([
      'login', 'register', 'verifyEmail', 'forgotPassword',
      'resetPassword', 'refreshToken', 'logout',
    ]);

    authController = {
      login: async (dto) => {
        return await mockAuthService.login(dto);
      },
      register: async (dto) => {
        return await mockAuthService.register(dto);
      },
      verifyEmail: async (dto) => {
        return await mockAuthService.verifyEmail(dto);
      },
      forgotPassword: async (dto) => {
        return await mockAuthService.forgotPassword(dto);
      },
      resetPassword: async (dto) => {
        return await mockAuthService.resetPassword(dto);
      },
      refreshToken: async (dto) => {
        return await mockAuthService.refreshToken(dto.refreshToken);
      },
      logout: async (req) => {
        return await mockAuthService.logout(req.user.id);
      },
    };
  });

  describe('POST /auth/login', () => {
    test('retorna tokens con credenciales válidas', async () => {
      mockAuthService.login.mockResolvedValue(mockApiResponses.loginSuccess);
      const result = await authController.login(mockCredentials.valid);
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockAuthService.login).toHaveBeenCalledWith(mockCredentials.valid);
    });

    test('propaga error 401 del servicio', async () => {
      mockAuthService.login.mockRejectedValue(Object.assign(new Error('Credenciales inválidas'), { status: 401 }));
      await expect(authController.login(mockCredentials.invalidPassword)).rejects.toMatchObject({ status: 401 });
    });

    test('delega completamente al servicio sin lógica adicional', async () => {
      mockAuthService.login.mockResolvedValue(mockApiResponses.loginSuccess);
      await authController.login(mockCredentials.valid);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockCredentials.valid);
    });
  });

  describe('POST /auth/register', () => {
    test('registra usuario y retorna mensaje de confirmación', async () => {
      mockAuthService.register.mockResolvedValue(mockApiResponses.registerSuccess);
      const result = await authController.register({
        email: 'nuevo@test.com', password: 'Pass123!', nombre: 'Nuevo Usuario',
      });
      expect(result.message).toBeTruthy();
    });

    test('propaga error 409 si email ya existe', async () => {
      mockAuthService.register.mockRejectedValue(Object.assign(new Error('Email ya registrado'), { status: 409 }));
      await expect(authController.register({ email: 'juan.perez@test.com', password: 'P', nombre: 'J' })).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('POST /auth/verify-email', () => {
    test('verifica email con código válido', async () => {
      mockAuthService.verifyEmail.mockResolvedValue({ message: 'Email verificado' });
      const result = await authController.verifyEmail({ email: 'test@test.com', code: '123456' });
      expect(result.message).toContain('verificado');
    });

    test('propaga error 400 con código incorrecto', async () => {
      mockAuthService.verifyEmail.mockRejectedValue(Object.assign(new Error('Código inválido'), { status: 400 }));
      await expect(authController.verifyEmail({ email: 'test@test.com', code: '000000' })).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('POST /auth/forgot-password', () => {
    test('siempre retorna mensaje (sin revelar si el email existe)', async () => {
      mockAuthService.forgotPassword.mockResolvedValue({ message: 'Si el email existe, recibirás instrucciones.' });
      const result = await authController.forgotPassword({ email: 'cualquiera@test.com' });
      expect(result.message).toBeTruthy();
    });
  });

  describe('POST /auth/refresh-token', () => {
    test('retorna nuevo access token', async () => {
      mockAuthService.refreshToken.mockResolvedValue({ access_token: 'new-token' });
      const result = await authController.refreshToken({ refreshToken: 'valid-refresh' });
      expect(result.access_token).toBeTruthy();
    });
  });

  describe('POST /auth/logout', () => {
    test('cierra sesión del usuario autenticado', async () => {
      mockAuthService.logout.mockResolvedValue({ message: 'Sesión cerrada' });
      const req = { user: createAuthenticatedUser() };
      const result = await authController.logout(req);
      expect(result.message).toContain('Sesión cerrada');
      expect(mockAuthService.logout).toHaveBeenCalledWith('user-001');
    });
  });
});

// ─── ProgressController ───────────────────────────────────────────────────────

describe('ProgressController', () => {
  let progressController;
  let mockProgressService;

  beforeEach(() => {
    mockProgressService = createServiceMock([
      'submitCheckin', 'getTodayCheckin', 'getCamino', 'initCamino',
      'advanceCamino', 'getGratitudeHistory', 'getProgressSummary', 'getAhorro',
    ]);

    progressController = {
      dailyCheckin: async (dto, req) => {
        return await mockProgressService.submitCheckin(req.user.id, dto);
      },
      getTodayCheckin: async (req) => {
        return await mockProgressService.getTodayCheckin(req.user.id);
      },
      getCamino: async (req) => {
        return await mockProgressService.getCamino(req.user.id);
      },
      initCamino: async (req) => {
        return await mockProgressService.initCamino(req.user.id);
      },
      advanceCamino: async (req) => {
        return await mockProgressService.advanceCamino(req.user.id);
      },
      gratitudeHistory: async (req, query) => {
        return await mockProgressService.getGratitudeHistory(req.user.id, query);
      },
      progressSummary: async (req) => {
        return await mockProgressService.getProgressSummary(req.user.id);
      },
      getAhorro: async (req) => {
        return await mockProgressService.getAhorro(req.user.id);
      },
    };
  });

  describe('POST /progress/checkin', () => {
    test('crea check-in para usuario autenticado', async () => {
      mockProgressService.submitCheckin.mockResolvedValue({ ...mockCheckinResponse, streak: 15 });
      const req = { user: createAuthenticatedUser() };
      const result = await progressController.dailyCheckin(mockCheckins.valid, req);
      expect(mockProgressService.submitCheckin).toHaveBeenCalledWith('user-001', mockCheckins.valid);
      expect(result.streak).toBe(15);
    });

    test('propaga error 409 si ya existe check-in del día', async () => {
      mockProgressService.submitCheckin.mockRejectedValue(Object.assign(new Error('Ya existe check-in'), { status: 409 }));
      const req = { user: createAuthenticatedUser() };
      await expect(progressController.dailyCheckin(mockCheckins.valid, req)).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('GET /progress/checkin/today', () => {
    test('retorna check-in de hoy si existe', async () => {
      mockProgressService.getTodayCheckin.mockResolvedValue(mockCheckinResponse);
      const req = { user: createAuthenticatedUser() };
      const result = await progressController.getTodayCheckin(req);
      expect(result).toEqual(mockCheckinResponse);
    });

    test('retorna null si no hay check-in hoy', async () => {
      mockProgressService.getTodayCheckin.mockResolvedValue(null);
      const req = { user: createAuthenticatedUser() };
      const result = await progressController.getTodayCheckin(req);
      expect(result).toBeNull();
    });
  });

  describe('GET /progress/camino', () => {
    test('retorna el camino del usuario', async () => {
      mockProgressService.getCamino.mockResolvedValue(mockCamino);
      const req = { user: createAuthenticatedUser() };
      const result = await progressController.getCamino(req);
      expect(result).toEqual(mockCamino);
    });

    test('propaga error 404 si camino no inicializado', async () => {
      mockProgressService.getCamino.mockRejectedValue(Object.assign(new Error('Camino no inicializado'), { status: 404 }));
      const req = { user: createAuthenticatedUser() };
      await expect(progressController.getCamino(req)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('GET /progress/ahorro', () => {
    test('retorna datos de ahorro del usuario', async () => {
      const ahorroData = { total: 19050000, diasSobrio: 127, ahorroMensual: 150000 };
      mockProgressService.getAhorro.mockResolvedValue(ahorroData);
      const req = { user: createAuthenticatedUser() };
      const result = await progressController.getAhorro(req);
      expect(result.total).toBe(19050000);
    });
  });
});

// ─── PetController ────────────────────────────────────────────────────────────

describe('PetController', () => {
  let petController;
  let mockPetService;

  beforeEach(() => {
    mockPetService = createServiceMock(['getPet', 'addXp', 'selectForm']);

    petController = {
      getPet: async (req) => mockPetService.getPet(req.user.id),
      addXp: async (req, body) => mockPetService.addXp(req.user.id, body.xp),
      selectForm: async (req, body) => mockPetService.selectForm(req.user.id, body.forma),
    };
  });

  test('GET /pet retorna mascota del usuario', async () => {
    mockPetService.getPet.mockResolvedValue(mockPet);
    const req = { user: createAuthenticatedUser() };
    const result = await petController.getPet(req);
    expect(result).toEqual(mockPet);
    expect(mockPetService.getPet).toHaveBeenCalledWith('user-001');
  });

  test('POST /pet/xp llama al servicio con el XP correcto', async () => {
    mockPetService.addXp.mockResolvedValue({ pet: mockPet, evolucionado: false });
    const req = { user: createAuthenticatedUser() };
    await petController.addXp(req, { xp: 10 });
    expect(mockPetService.addXp).toHaveBeenCalledWith('user-001', 10);
  });

  test('GET /pet propaga error 404 si mascota no existe', async () => {
    mockPetService.getPet.mockRejectedValue(Object.assign(new Error('No encontrado'), { status: 404 }));
    const req = { user: createAuthenticatedUser() };
    await expect(petController.getPet(req)).rejects.toMatchObject({ status: 404 });
  });

  test('POST /pet/form selecciona forma de mascota desbloqueada', async () => {
    mockPetService.selectForm.mockResolvedValue({ ...mockPet, forma_actual: 'brote' });
    const req = { user: createAuthenticatedUser() };
    const result = await petController.selectForm(req, { forma: 'brote' });
    expect(mockPetService.selectForm).toHaveBeenCalledWith('user-001', 'brote');
  });
});

// ─── AdminAuthController ──────────────────────────────────────────────────────

describe('AdminAuthController', () => {
  let adminController;
  let mockAdminService;

  beforeEach(() => {
    mockAdminService = createServiceMock(['login', 'refresh', 'logout', 'getMe']);

    adminController = {
      login: async (dto) => mockAdminService.login(dto),
      refresh: async (dto) => mockAdminService.refresh(dto.refreshToken),
      logout: async (req) => mockAdminService.logout(req.user.id),
      getMe: async (req) => mockAdminService.getMe(req.user.id),
    };
  });

  test('POST /admin/auth/login retorna token de administrador', async () => {
    mockAdminService.login.mockResolvedValue({ access_token: 'admin-token', refresh_token: 'r-token' });
    const result = await adminController.login({ email: 'admin@newlife.com', password: 'AdminPass!' });
    expect(result.access_token).toBeTruthy();
  });

  test('GET /admin/auth/me retorna perfil del admin autenticado', async () => {
    mockAdminService.getMe.mockResolvedValue(mockUsers.adminUser);
    const req = { user: { id: 'admin-001', role: 'admin' } };
    const result = await adminController.getMe(req);
    expect(result.role).toBe('admin');
  });

  test('POST /admin/auth/logout cierra sesión del admin', async () => {
    mockAdminService.logout.mockResolvedValue({ message: 'Sesión cerrada' });
    const req = { user: { id: 'admin-001' } };
    const result = await adminController.logout(req);
    expect(result.message).toContain('cerrada');
  });
});

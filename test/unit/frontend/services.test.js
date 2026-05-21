/**
 * services.test.js (frontend)
 * Pruebas unitarias para los servicios del frontend móvil de NewLife.
 * Las llamadas HTTP están completamente mockeadas con axios.
 */

const {
  mockUsers,
  mockCredentials,
  mockTokens,
  mockCheckins,
  mockCheckinResponse,
  mockCamino,
  mockPet,
  mockApiResponses,
  mockSobrietyData,
} = require('../../fixtures/mock-data');

// Mock de AsyncStorage
const asyncStorage = new Map();
const AsyncStorage = {
  getItem: jest.fn((key) => Promise.resolve(asyncStorage.get(key) || null)),
  setItem: jest.fn((key, val) => { asyncStorage.set(key, val); return Promise.resolve(); }),
  removeItem: jest.fn((key) => { asyncStorage.delete(key); return Promise.resolve(); }),
};

// Mock del cliente axios
const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

// ─── authService (simulado) ───────────────────────────────────────────────────

const authService = {
  loginUser: async ({ email, password }) => {
    const response = await mockApi.post('/auth/login', { email, password });
    if (response.data.access_token) {
      await AsyncStorage.setItem('accessToken', response.data.access_token);
      await AsyncStorage.setItem('refreshToken', response.data.refresh_token);
    }
    return response.data;
  },

  registerUser: async ({ email, password, nombre }) => {
    const response = await mockApi.post('/auth/register', { email, password, nombre });
    return response.data;
  },

  verifyEmail: async ({ email, code }) => {
    const response = await mockApi.post('/auth/verify-email', { email, code });
    return response.data;
  },

  forgotPassword: async ({ email }) => {
    const response = await mockApi.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async ({ token, newPassword }) => {
    const response = await mockApi.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  logoutUser: async () => {
    await mockApi.post('/auth/logout');
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  },

  getProfile: async () => {
    const response = await mockApi.get('/users/profile');
    return response.data;
  },
};

// ─── progressService (simulado) ──────────────────────────────────────────────

const progressService = {
  saveDailyCheckin: async (data) => {
    const response = await mockApi.post('/progress/checkin', data);
    return response.data;
  },

  getTodayCheckin: async () => {
    const response = await mockApi.get('/progress/checkin/today');
    return response.data;
  },

  getCamino: async () => {
    const response = await mockApi.get('/progress/camino');
    return response.data;
  },

  getProgressSummary: async () => {
    const response = await mockApi.get('/progress/summary');
    return response.data;
  },

  getAhorro: async () => {
    const response = await mockApi.get('/progress/ahorro');
    return response.data;
  },

  getAllRegistros: async () => {
    const response = await mockApi.get('/progress/registros');
    return response.data;
  },
};

// ─── cacheService (simulado) ──────────────────────────────────────────────────

const cacheService = {
  _store: new Map(),

  get: function(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  },

  set: function(key, value, ttlMs = 5 * 60 * 1000) {
    this._store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  invalidate: function(key) {
    this._store.delete(key);
  },

  clear: function() {
    this._store.clear();
  },

  has: function(key) {
    return this.get(key) !== null;
  },
};

// ─── PRUEBAS: authService ─────────────────────────────────────────────────────

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    asyncStorage.clear();
  });

  describe('loginUser()', () => {
    test('almacena tokens en AsyncStorage al hacer login exitoso', async () => {
      mockApi.post.mockResolvedValueOnce({ data: mockApiResponses.loginSuccess });
      await authService.loginUser(mockCredentials.valid);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', mockTokens.validAccessToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('refreshToken', mockTokens.validRefreshToken);
    });

    test('llama al endpoint correcto con las credenciales', async () => {
      mockApi.post.mockResolvedValueOnce({ data: mockApiResponses.loginSuccess });
      await authService.loginUser(mockCredentials.valid);
      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', mockCredentials.valid);
    });

    test('retorna datos del usuario en la respuesta', async () => {
      mockApi.post.mockResolvedValueOnce({ data: mockApiResponses.loginSuccess });
      const result = await authService.loginUser(mockCredentials.valid);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockCredentials.valid.email);
    });

    test('propaga error cuando las credenciales son inválidas', async () => {
      mockApi.post.mockRejectedValueOnce({ response: { status: 401, data: mockApiResponses.loginFailure } });
      await expect(authService.loginUser(mockCredentials.invalidPassword)).rejects.toBeDefined();
    });

    test('no almacena tokens si el login falla', async () => {
      mockApi.post.mockRejectedValueOnce({ response: { status: 401 } });
      try { await authService.loginUser(mockCredentials.invalidPassword); } catch {}
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('registerUser()', () => {
    test('llama al endpoint de registro con los datos correctos', async () => {
      mockApi.post.mockResolvedValueOnce({ data: mockApiResponses.registerSuccess });
      const registerData = { email: 'nuevo@test.com', password: 'Pass123!', nombre: 'Nuevo' };
      await authService.registerUser(registerData);
      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', registerData);
    });

    test('retorna mensaje de confirmación', async () => {
      mockApi.post.mockResolvedValueOnce({ data: mockApiResponses.registerSuccess });
      const result = await authService.registerUser({ email: 'n@t.com', password: 'P123!', nombre: 'N' });
      expect(result.message).toBeTruthy();
    });
  });

  describe('logoutUser()', () => {
    test('elimina tokens de AsyncStorage al hacer logout', async () => {
      asyncStorage.set('accessToken', mockTokens.validAccessToken);
      asyncStorage.set('refreshToken', mockTokens.validRefreshToken);
      mockApi.post.mockResolvedValueOnce({ data: {} });
      await authService.logoutUser();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });

    test('llama al endpoint de logout', async () => {
      mockApi.post.mockResolvedValueOnce({ data: {} });
      await authService.logoutUser();
      expect(mockApi.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('verifyEmail()', () => {
    test('envía código de verificación al endpoint correcto', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { message: 'Email verificado' } });
      const dto = { email: 'test@test.com', code: '123456' };
      await authService.verifyEmail(dto);
      expect(mockApi.post).toHaveBeenCalledWith('/auth/verify-email', dto);
    });
  });

  describe('forgotPassword()', () => {
    test('envía solicitud de recuperación al endpoint correcto', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { message: 'Email enviado' } });
      await authService.forgotPassword({ email: 'test@test.com' });
      expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@test.com' });
    });
  });
});

// ─── PRUEBAS: progressService ─────────────────────────────────────────────────

describe('progressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDailyCheckin()', () => {
    test('envía check-in al endpoint correcto', async () => {
      mockApi.post.mockResolvedValueOnce({ data: mockCheckinResponse });
      await progressService.saveDailyCheckin(mockCheckins.valid);
      expect(mockApi.post).toHaveBeenCalledWith('/progress/checkin', mockCheckins.valid);
    });

    test('retorna respuesta con streak', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { ...mockCheckinResponse, streak: 15 } });
      const result = await progressService.saveDailyCheckin(mockCheckins.valid);
      expect(result.streak).toBe(15);
    });

    test('propaga error de red', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network Error'));
      await expect(progressService.saveDailyCheckin(mockCheckins.valid)).rejects.toBeDefined();
    });
  });

  describe('getTodayCheckin()', () => {
    test('retorna check-in de hoy cuando existe', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockCheckinResponse });
      const result = await progressService.getTodayCheckin();
      expect(result.emocion).toBe('bien');
    });

    test('retorna null cuando no hay check-in hoy', async () => {
      mockApi.get.mockResolvedValueOnce({ data: null });
      const result = await progressService.getTodayCheckin();
      expect(result).toBeNull();
    });
  });

  describe('getCamino()', () => {
    test('retorna el progreso del camino', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockCamino });
      const result = await progressService.getCamino();
      expect(result.nivel_actual).toBe(3);
    });
  });

  describe('getAhorro()', () => {
    test('retorna datos de ahorro calculados', async () => {
      const ahorroData = { total: 19050000, diasSobrio: 127 };
      mockApi.get.mockResolvedValueOnce({ data: ahorroData });
      const result = await progressService.getAhorro();
      expect(result.total).toBeGreaterThan(0);
    });
  });
});

// ─── PRUEBAS: cacheService ────────────────────────────────────────────────────

describe('cacheService', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  test('almacena y recupera un valor', () => {
    cacheService.set('key1', { data: 'test' });
    expect(cacheService.get('key1')).toEqual({ data: 'test' });
  });

  test('retorna null para clave inexistente', () => {
    expect(cacheService.get('nonexistent')).toBeNull();
  });

  test('retorna null para entrada expirada', () => {
    cacheService.set('expiredKey', 'valor', -1000); // TTL negativo = expirado inmediatamente
    expect(cacheService.get('expiredKey')).toBeNull();
  });

  test('invalida una entrada específica', () => {
    cacheService.set('key1', 'valor1');
    cacheService.set('key2', 'valor2');
    cacheService.invalidate('key1');
    expect(cacheService.get('key1')).toBeNull();
    expect(cacheService.get('key2')).toBe('valor2');
  });

  test('clear() elimina todas las entradas', () => {
    cacheService.set('a', 1);
    cacheService.set('b', 2);
    cacheService.set('c', 3);
    cacheService.clear();
    expect(cacheService.get('a')).toBeNull();
    expect(cacheService.get('b')).toBeNull();
  });

  test('has() retorna true para clave existente no expirada', () => {
    cacheService.set('key1', 'valor');
    expect(cacheService.has('key1')).toBe(true);
  });

  test('has() retorna false para clave inexistente', () => {
    expect(cacheService.has('nonexistent')).toBe(false);
  });

  test('almacena diferentes tipos de datos', () => {
    cacheService.set('string', 'texto');
    cacheService.set('number', 42);
    cacheService.set('object', { id: 1 });
    cacheService.set('array', [1, 2, 3]);
    expect(cacheService.get('string')).toBe('texto');
    expect(cacheService.get('number')).toBe(42);
    expect(cacheService.get('object')).toEqual({ id: 1 });
    expect(cacheService.get('array')).toEqual([1, 2, 3]);
  });
});

/**
 * setup.js
 * Configuración global del ambiente de pruebas NewLife.
 * Este archivo se ejecuta una vez antes de todas las pruebas.
 */

// ─── TIMEOUT GLOBAL ───────────────────────────────────────────────────────────
jest.setTimeout(10000); // 10 segundos por prueba

// ─── MOCKS GLOBALES ──────────────────────────────────────────────────────────

// Mock global de AsyncStorage (React Native — virtual porque el paquete no está instalado en la raíz)
jest.mock('@react-native-async-storage/async-storage', () => {
  const storage = new Map();
  return {
    getItem: jest.fn((key) => Promise.resolve(storage.get(key) || null)),
    setItem: jest.fn((key, value) => {
      storage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      storage.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      storage.clear();
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve([...storage.keys()])),
    multiGet: jest.fn((keys) =>
      Promise.resolve(keys.map((k) => [k, storage.get(k) || null]))
    ),
    multiSet: jest.fn((pairs) => {
      pairs.forEach(([k, v]) => storage.set(k, v));
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys) => {
      keys.forEach((k) => storage.delete(k));
      return Promise.resolve();
    }),
    _storage: storage,
  };
}, { virtual: true });

// Mock global de axios para pruebas unitarias
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  };
  return { default: mockAxios, ...mockAxios };
});

// Mock de variables de entorno de prueba
process.env.NODE_ENV = 'test';
process.env.ROBLE_BASE_URL = 'https://roble-mock-test.uninorte.edu.co';
process.env.ROBLE_PROJECT_TOKEN = 'test-project-token-mock';
process.env.ROBLE_DB_NAME = 'New_Life_Test';
process.env.ROBLE_SYSTEM_EMAIL = 'system@test.com';
process.env.ROBLE_SYSTEM_PASSWORD = 'test-system-password';
process.env.ADMIN_JWT_SECRET = 'test-admin-jwt-secret-very-long-at-least-32-chars!!';
process.env.ADMIN_JWT_EXPIRES_IN = '8h';
process.env.JWT_SECRET = 'test-mobile-jwt-secret-very-long-at-least-32-chars!';
process.env.JWT_EXPIRES_IN = '7d';
process.env.MINIO_ENDPOINT = 'http://localhost:5183';
process.env.MINIO_PUBLIC_ENDPOINT = 'http://localhost:5183';
process.env.MINIO_ACCESS_KEY = 'test-access-key';
process.env.MINIO_SECRET_KEY = 'test-secret-key';
process.env.ANALYTICS_ENABLED = 'false';
process.env.ANALYTICS_SALT = 'test-salt-for-hashing';
process.env.CORS_ORIGIN = 'http://localhost:5182';

// ─── LIMPIEZA GLOBAL ──────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

// ─── SUPRESIÓN DE CONSOLE EN TESTS ────────────────────────────────────────────
// Suprimir console.error y console.warn en tests para output limpio
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// ─── MATCHERS PERSONALIZADOS ──────────────────────────────────────────────────

expect.extend({
  /**
   * Verifica que un string sea un JWT válido (formato xxx.yyy.zzz)
   */
  toBeValidJWT(received) {
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    const pass = typeof received === 'string' && jwtPattern.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} NOT to be a valid JWT`
          : `Expected ${received} to be a valid JWT (format: header.payload.signature)`,
    };
  },

  /**
   * Verifica que un número represente días de sobriedad válido (>= 0)
   */
  toBeValidSobrietyDays(received) {
    const pass = typeof received === 'number' && Number.isInteger(received) && received >= 0;
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} NOT to be valid sobriety days`
          : `Expected ${received} to be a non-negative integer (sobriety days)`,
    };
  },

  /**
   * Verifica que un string sea un email válido
   */
  toBeValidEmail(received) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = typeof received === 'string' && emailPattern.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} NOT to be a valid email`
          : `Expected ${received} to be a valid email address`,
    };
  },
});

/**
 * test-helpers.js
 * Funciones auxiliares reutilizables para las pruebas de NewLife.
 */

const { mockTokens } = require('../fixtures/mock-data');

// ─── SIMULACIÓN DE SOLICITUDES HTTP ──────────────────────────────────────────

/**
 * Construye un objeto de request simulado para pruebas de controladores NestJS.
 * @param {object} options - Opciones de la request
 */
function createMockRequest({ body = {}, params = {}, query = {}, headers = {}, user = null } = {}) {
  return {
    body,
    params,
    query,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    user,
  };
}

/**
 * Construye un objeto de response simulado para pruebas de controladores.
 */
function createMockResponse() {
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
  };
  res.status = jest.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation((data) => {
    res.body = data;
    return res;
  });
  res.send = jest.fn().mockImplementation((data) => {
    res.body = data;
    return res;
  });
  res.setHeader = jest.fn().mockImplementation((key, value) => {
    res.headers[key] = value;
    return res;
  });
  return res;
}

/**
 * Construye un objeto de ExecutionContext de NestJS simulado.
 * @param {object} options - Opciones del contexto
 */
function createMockExecutionContext({ user = null, token = null, body = {} } = {}) {
  const mockRequest = createMockRequest({
    user,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body,
  });
  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => createMockResponse(),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  };
}

// ─── HELPERS DE AUTENTICACIÓN ─────────────────────────────────────────────────

/**
 * Simula la obtención de un token JWT para pruebas.
 * @param {string} userId - ID del usuario
 * @param {string} role - Rol del usuario ('user' | 'admin')
 */
function getMockToken(userId = 'user-001', role = 'user') {
  return role === 'admin' ? mockTokens.adminToken : mockTokens.validAccessToken;
}

/**
 * Crea un usuario autenticado mock para usar en guards.
 */
function createAuthenticatedUser(overrides = {}) {
  return {
    id: 'user-001',
    email: 'juan.perez@test.com',
    nombre: 'Juan Pérez',
    role: 'user',
    ...overrides,
  };
}

// ─── HELPERS DE TIEMPO Y FECHAS ───────────────────────────────────────────────

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD.
 */
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Retorna una fecha en el pasado (hace N días).
 * @param {number} daysAgo - Cuántos días atrás
 */
function getPastDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

/**
 * Retorna una fecha en el futuro (en N días).
 * @param {number} daysAhead - Cuántos días adelante
 */
function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

// ─── HELPERS DE DATOS ALEATORIOS ─────────────────────────────────────────────

/**
 * Genera un email único para pruebas.
 */
function generateUniqueEmail() {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@test.com`;
}

/**
 * Genera una contraseña que cumpla los requisitos mínimos.
 */
function generateValidPassword() {
  return `TestPass${Math.random().toString(36).substr(2, 8)}!`;
}

/**
 * Genera un nickname único.
 */
function generateUniqueNickname() {
  return `user_${Math.random().toString(36).substr(2, 8)}`;
}

// ─── HELPERS DE COMPARACIÓN ───────────────────────────────────────────────────

/**
 * Compara dos objetos ignorando campos especificados.
 * Útil para comparar objetos que tienen campos de timestamp o IDs auto-generados.
 * @param {object} actual - Objeto real
 * @param {object} expected - Objeto esperado
 * @param {string[]} ignoreFields - Campos a ignorar en la comparación
 */
function compareIgnoring(actual, expected, ignoreFields = []) {
  const cleanActual = { ...actual };
  const cleanExpected = { ...expected };
  ignoreFields.forEach((field) => {
    delete cleanActual[field];
    delete cleanExpected[field];
  });
  return JSON.stringify(cleanActual) === JSON.stringify(cleanExpected);
}

/**
 * Espera a que una condición sea verdadera (polling simple).
 * @param {Function} condition - Función que retorna boolean
 * @param {number} timeout - Timeout en ms
 * @param {number} interval - Intervalo de polling en ms
 */
async function waitFor(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) return true;
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(`Condition not met after ${timeout}ms`);
}

// ─── HELPERS DE SERVICIOS MOCK ────────────────────────────────────────────────

/**
 * Crea un mock genérico de un servicio NestJS.
 * @param {string[]} methods - Nombres de métodos a mockear
 */
function createServiceMock(methods = []) {
  const mock = {};
  methods.forEach((method) => {
    mock[method] = jest.fn();
  });
  return mock;
}

/**
 * Crea un mock del JwtService de NestJS.
 */
function createJwtServiceMock() {
  return {
    sign: jest.fn().mockReturnValue(mockTokens.validAccessToken),
    verify: jest.fn().mockReturnValue({ sub: 'user-001', email: 'juan.perez@test.com' }),
    decode: jest.fn().mockReturnValue({ sub: 'user-001' }),
  };
}

/**
 * Crea un mock del logger de NestJS.
 */
function createLoggerMock() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };
}

module.exports = {
  createMockRequest,
  createMockResponse,
  createMockExecutionContext,
  getMockToken,
  createAuthenticatedUser,
  getTodayString,
  getPastDate,
  getFutureDate,
  generateUniqueEmail,
  generateValidPassword,
  generateUniqueNickname,
  compareIgnoring,
  waitFor,
  createServiceMock,
  createJwtServiceMock,
  createLoggerMock,
};

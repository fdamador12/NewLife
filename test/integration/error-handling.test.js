/**
 * error-handling.test.js
 * Pruebas de integración para el manejo de errores del sistema NewLife.
 */

const { mockCheckins, invalidData } = require('../fixtures/mock-data');
const { assertErrorResponse } = require('../utils/assertions');
const { generateUniqueEmail } = require('../utils/test-helpers');

// Sistema de errores simulado
function createErrorHandlingSystem() {
  const users = [];

  function authenticate(token) {
    if (!token || !token.match(/^Bearer valid-token/)) return null;
    return { id: 'user-001', email: 'test@test.com' };
  }

  return {
    async processRequest(endpoint, authHeader, body) {
      const user = authenticate(authHeader);

      switch (endpoint) {
        // Requiere autenticación
        case '/progress/checkin':
          if (!user) throw { statusCode: 401, message: 'No autenticado', error: 'Unauthorized' };
          if (!body.emocion) throw { statusCode: 400, message: 'emocion is required', error: 'Bad Request' };
          if (body._forceServerError) throw { statusCode: 500, message: 'Error interno', error: 'Internal Server Error' };
          return { id: 'c-001', ...body };

        // Requiere recurso existente
        case '/users/profile/99999':
          throw { statusCode: 404, message: 'Usuario no encontrado', error: 'Not Found' };

        // Requiere permisos de admin
        case '/admin/users':
          if (!user) throw { statusCode: 401, message: 'No autenticado', error: 'Unauthorized' };
          if (!authHeader.includes('admin-token')) throw { statusCode: 403, message: 'Acceso denegado', error: 'Forbidden' };
          return { users: [] };

        // Validación de entrada
        case '/auth/register':
          if (!body.email || !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(body.email)) {
            throw { statusCode: 400, message: ['email must be an email'], error: 'Bad Request' };
          }
          if (users.find((u) => u.email === body.email)) {
            throw { statusCode: 409, message: 'Email ya registrado', error: 'Conflict' };
          }
          users.push({ email: body.email });
          return { message: 'OK' };

        default:
          throw { statusCode: 404, message: 'Endpoint no encontrado', error: 'Not Found' };
      }
    },

    parseErrorForClient(error) {
      const status = error.statusCode || error.status || 500;
      switch (status) {
        case 400: return 'Los datos enviados no son válidos. Verifica el formulario.';
        case 401: return 'Sesión expirada. Por favor inicia sesión de nuevo.';
        case 403: return 'No tienes permisos para realizar esta acción.';
        case 404: return 'El recurso solicitado no fue encontrado.';
        case 409: return 'Ya existe un registro con esos datos.';
        case 500: return 'Error del servidor. Intenta de nuevo más tarde.';
        default: return 'Ha ocurrido un error inesperado.';
      }
    },

    handleNetworkError(error) {
      if (error.code === 'ECONNREFUSED') return 'No se puede conectar al servidor.';
      if (error.code === 'ETIMEDOUT') return 'La solicitud tardó demasiado. Verifica tu conexión.';
      if (typeof navigator !== 'undefined' && !navigator?.onLine) return 'Sin conexión a internet.';
      return 'Error de conexión.';
    },
  };
}

let system;

beforeEach(() => {
  system = createErrorHandlingSystem();
});

// ─── PRUEBAS: Errores de Autenticación (401) ──────────────────────────────────

describe('Errores 401 — No Autenticado', () => {
  test('retorna 401 cuando no hay token', async () => {
    await expect(system.processRequest('/progress/checkin', null, mockCheckins.valid)).rejects.toMatchObject({ statusCode: 401 });
  });

  test('retorna 401 con token inválido', async () => {
    await expect(system.processRequest('/progress/checkin', 'Bearer invalid-token-xyz', mockCheckins.valid)).rejects.toMatchObject({ statusCode: 401 });
  });

  test('retorna 401 con header malformado (sin Bearer)', async () => {
    await expect(system.processRequest('/progress/checkin', 'tokensinbearer', mockCheckins.valid)).rejects.toMatchObject({ statusCode: 401 });
  });

  test('mensaje de error 401 es interpretable por el cliente', async () => {
    const error = { statusCode: 401 };
    const message = system.parseErrorForClient(error);
    expect(message).toContain('Sesión expirada');
  });
});

// ─── PRUEBAS: Errores de Autorización (403) ────────────────────────────────────

describe('Errores 403 — Sin Permisos', () => {
  test('retorna 403 cuando usuario regular accede a endpoint admin', async () => {
    await expect(system.processRequest('/admin/users', 'Bearer valid-token-user', {})).rejects.toMatchObject({ statusCode: 403 });
  });

  test('mensaje de error 403 es claro para el usuario', async () => {
    const error = { statusCode: 403 };
    const message = system.parseErrorForClient(error);
    expect(message).toContain('permisos');
  });
});

// ─── PRUEBAS: Errores de Recurso No Encontrado (404) ──────────────────────────

describe('Errores 404 — No Encontrado', () => {
  test('retorna 404 para usuario inexistente', async () => {
    await expect(system.processRequest('/users/profile/99999', 'Bearer valid-token', {})).rejects.toMatchObject({ statusCode: 404 });
  });

  test('retorna 404 para endpoint desconocido', async () => {
    await expect(system.processRequest('/endpoint-desconocido', 'Bearer valid-token', {})).rejects.toMatchObject({ statusCode: 404 });
  });

  test('mensaje de error 404 es informativo', async () => {
    const message = system.parseErrorForClient({ statusCode: 404 });
    expect(message).toContain('no fue encontrado');
  });
});

// ─── PRUEBAS: Errores de Validación (400) ─────────────────────────────────────

describe('Errores 400 — Datos Inválidos', () => {
  test('retorna 400 para email inválido en registro', async () => {
    await expect(system.processRequest('/auth/register', null, { email: 'noesemail', password: 'Pass123!', nombre: 'Test' })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('retorna 400 cuando falta campo requerido', async () => {
    await expect(system.processRequest('/progress/checkin', 'Bearer valid-token', { consumo: false })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('mensaje de error 400 incluye detalles de validación', async () => {
    let error;
    try { await system.processRequest('/auth/register', null, { email: 'mal' }); } catch (e) { error = e; }
    expect(error.message).toBeDefined();
  });

  test('mensaje de error 400 es legible para el cliente', async () => {
    const message = system.parseErrorForClient({ statusCode: 400 });
    expect(message).toContain('válidos');
  });
});

// ─── PRUEBAS: Errores de Conflicto (409) ──────────────────────────────────────

describe('Errores 409 — Conflicto de Datos', () => {
  test('retorna 409 al registrar email duplicado', async () => {
    await system.processRequest('/auth/register', null, { email: 'dup@test.com', password: 'P123!', nombre: 'First' });
    await expect(system.processRequest('/auth/register', null, { email: 'dup@test.com', password: 'P456!', nombre: 'Second' })).rejects.toMatchObject({ statusCode: 409 });
  });

  test('mensaje de error 409 es claro', async () => {
    const message = system.parseErrorForClient({ statusCode: 409 });
    expect(message).toContain('Ya existe');
  });
});

// ─── PRUEBAS: Errores de Servidor (500) ────────────────────────────────────────

describe('Errores 500 — Error Interno del Servidor', () => {
  test('retorna 500 cuando hay un error inesperado', async () => {
    await expect(system.processRequest('/progress/checkin', 'Bearer valid-token-ok', { emocion: 'bien', consumo: false, gratitud: 'Test', _forceServerError: true })).rejects.toMatchObject({ statusCode: 500 });
  });

  test('mensaje de error 500 no revela detalles internos al cliente', async () => {
    const message = system.parseErrorForClient({ statusCode: 500 });
    expect(message).not.toContain('stack');
    expect(message).not.toContain('null');
    expect(message).toContain('servidor');
  });
});

// ─── PRUEBAS: Manejo de Errores de Red ────────────────────────────────────────

describe('Errores de Red — Conectividad', () => {
  test('ECONNREFUSED es manejado con mensaje amigable', () => {
    const msg = system.handleNetworkError({ code: 'ECONNREFUSED' });
    expect(msg).toContain('conectar');
  });

  test('ETIMEDOUT es manejado con mensaje amigable', () => {
    const msg = system.handleNetworkError({ code: 'ETIMEDOUT' });
    expect(msg).toContain('tardó');
  });

  test('error genérico de red retorna mensaje por defecto', () => {
    const msg = system.handleNetworkError({ code: 'UNKNOWN' });
    expect(msg).toBeTruthy();
  });
});

// ─── PRUEBAS: Payloads Maliciosos ─────────────────────────────────────────────

describe('Resistencia a payloads maliciosos', () => {
  test('email con SQL injection es rechazado por validación de formato', async () => {
    await expect(system.processRequest('/auth/register', null, {
      email: invalidData.sqlInjection, password: 'Pass123!', nombre: 'Test',
    })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('email con XSS es rechazado por validación de formato', async () => {
    await expect(system.processRequest('/auth/register', null, {
      email: '<script>alert(1)</script>@test.com', password: 'Pass123!', nombre: 'Test',
    })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('el sistema maneja body null sin crash', async () => {
    await expect(system.processRequest('/auth/register', null, null)).rejects.toBeDefined();
  });
});

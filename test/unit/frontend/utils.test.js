/**
 * utils.test.js (frontend)
 * Pruebas para las funciones utilitarias del frontend móvil.
 */

const { mockSobrietyData } = require('../../fixtures/mock-data');

// ─── apiError handler ─────────────────────────────────────────────────────────

function parseApiError(error) {
  if (!error) return 'Error desconocido';

  // Error de respuesta del servidor
  if (error.response) {
    const { status, data } = error.response;
    const message = Array.isArray(data?.message) ? data.message[0] : (data?.message || 'Error del servidor');

    switch (status) {
      case 400: return `Datos inválidos: ${message}`;
      case 401: return 'Sesión expirada. Por favor inicia sesión de nuevo.';
      case 403: return 'No tienes permisos para realizar esta acción.';
      case 404: return 'El recurso solicitado no fue encontrado.';
      case 409: return `Conflicto: ${message}`;
      case 422: return `Error de validación: ${message}`;
      case 500: return 'Error del servidor. Intenta de nuevo más tarde.';
      default: return `Error (${status}): ${message}`;
    }
  }

  // Error de red
  if (error.request) {
    return 'Sin conexión a internet. Verifica tu red.';
  }

  return error.message || 'Error desconocido';
}

describe('parseApiError()', () => {
  test('retorna mensaje para error 401 (token expirado)', () => {
    const error = { response: { status: 401, data: { message: 'Unauthorized' } } };
    expect(parseApiError(error)).toContain('Sesión expirada');
  });

  test('retorna mensaje para error 400 (datos inválidos)', () => {
    const error = { response: { status: 400, data: { message: 'email must be an email' } } };
    expect(parseApiError(error)).toContain('email must be an email');
  });

  test('retorna mensaje para error 403 (sin permisos)', () => {
    const error = { response: { status: 403, data: { message: 'Forbidden' } } };
    expect(parseApiError(error)).toContain('permisos');
  });

  test('retorna mensaje para error 404 (no encontrado)', () => {
    const error = { response: { status: 404, data: {} } };
    expect(parseApiError(error)).toContain('no fue encontrado');
  });

  test('retorna mensaje para error 409 (conflicto)', () => {
    const error = { response: { status: 409, data: { message: 'Ya existe un check-in para hoy' } } };
    expect(parseApiError(error)).toContain('Ya existe un check-in');
  });

  test('retorna mensaje de red cuando no hay respuesta del servidor', () => {
    const error = { request: {}, message: 'Network Error' };
    expect(parseApiError(error)).toContain('Sin conexión');
  });

  test('maneja arrays de mensajes de error (class-validator)', () => {
    const error = { response: { status: 400, data: { message: ['error1', 'error2'] } } };
    expect(parseApiError(error)).toContain('error1');
  });

  test('retorna mensaje por defecto para error null', () => {
    expect(parseApiError(null)).toBe('Error desconocido');
  });

  test('retorna mensaje por defecto para error undefined', () => {
    expect(parseApiError(undefined)).toBe('Error desconocido');
  });

  test('retorna mensaje para error 500 (servidor)', () => {
    const error = { response: { status: 500, data: {} } };
    expect(parseApiError(error)).toContain('Error del servidor');
  });
});

// ─── formatSobrietyTime ───────────────────────────────────────────────────────

function formatSobrietyTime(diasSobrio) {
  if (!diasSobrio || diasSobrio < 0) return { texto: '0 días', dias: 0 };

  const years = Math.floor(diasSobrio / 365);
  const months = Math.floor((diasSobrio % 365) / 30);
  const days = diasSobrio % 30;

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);

  return { texto: parts.join(', '), dias: diasSobrio };
}

describe('formatSobrietyTime()', () => {
  test('formatea 1 día correctamente', () => {
    expect(formatSobrietyTime(1).texto).toBe('1 día');
  });

  test('formatea 7 días correctamente', () => {
    expect(formatSobrietyTime(7).texto).toContain('7 días');
  });

  test('formatea 30 días como 1 mes', () => {
    const result = formatSobrietyTime(30);
    expect(result.texto).toContain('1 mes');
  });

  test('formatea 365 días como 1 año', () => {
    const result = formatSobrietyTime(365);
    expect(result.texto).toContain('1 año');
  });

  test('formatea 400 días correctamente (1 año + meses)', () => {
    const result = formatSobrietyTime(400);
    expect(result.texto).toContain('1 año');
    expect(result.dias).toBe(400);
  });

  test('retorna 0 días para valor null', () => {
    expect(formatSobrietyTime(null).texto).toBe('0 días');
  });

  test('retorna 0 días para valor negativo', () => {
    expect(formatSobrietyTime(-5).texto).toBe('0 días');
  });

  test('incluye los días en el resultado', () => {
    const result = formatSobrietyTime(127);
    expect(result.dias).toBe(127);
  });
});

// ─── validateFormFields ───────────────────────────────────────────────────────

function validateLoginForm({ email, password }) {
  const errors = {};
  if (!email) errors.email = 'El email es requerido';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Ingresa un email válido';
  if (!password) errors.password = 'La contraseña es requerida';
  else if (password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres';
  return errors;
}

describe('validateLoginForm()', () => {
  test('retorna objeto vacío con datos válidos', () => {
    expect(validateLoginForm({ email: 'test@test.com', password: 'Abc123!' })).toEqual({});
  });

  test('retorna error cuando email está vacío', () => {
    const errors = validateLoginForm({ email: '', password: 'Abc123!' });
    expect(errors.email).toBeTruthy();
  });

  test('retorna error cuando email tiene formato inválido', () => {
    const errors = validateLoginForm({ email: 'noesemail', password: 'Abc123!' });
    expect(errors.email).toContain('válido');
  });

  test('retorna error cuando password está vacía', () => {
    const errors = validateLoginForm({ email: 'test@test.com', password: '' });
    expect(errors.password).toBeTruthy();
  });

  test('retorna error cuando password es muy corta', () => {
    const errors = validateLoginForm({ email: 'test@test.com', password: '123' });
    expect(errors.password).toContain('6 caracteres');
  });

  test('puede retornar múltiples errores simultáneamente', () => {
    const errors = validateLoginForm({ email: 'mal', password: '1' });
    expect(Object.keys(errors)).toHaveLength(2);
  });
});

// ─── formatCurrency ───────────────────────────────────────────────────────────

function formatCurrency(amount, currency = 'COP') {
  if (amount === null || amount === undefined) return '$0';
  if (typeof amount !== 'number') return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

describe('formatCurrency()', () => {
  test('formatea número en pesos colombianos', () => {
    const result = formatCurrency(150000);
    expect(result).toContain('150');
    expect(result).toBeTruthy();
  });

  test('retorna $0 para valor null', () => {
    expect(formatCurrency(null)).toBe('$0');
  });

  test('retorna $0 para valor undefined', () => {
    expect(formatCurrency(undefined)).toBe('$0');
  });

  test('retorna $0 para tipo no numérico', () => {
    expect(formatCurrency('texto')).toBe('$0');
  });

  test('formatea cero correctamente', () => {
    const result = formatCurrency(0);
    expect(result).toBeTruthy();
  });
});

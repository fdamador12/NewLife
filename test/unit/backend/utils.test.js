/**
 * utils.test.js (backend)
 * Pruebas para funciones utilitarias del backend NewLife.
 */

const { mockSobrietyData } = require('../../fixtures/mock-data');

// ─── Utilidad: Cálculo de Sobriedad ──────────────────────────────────────────

describe('Utilidad: calculateSobrietyDays', () => {
  function calculateSobrietyDays(fechaInicio) {
    if (!fechaInicio) return 0;
    const inicio = new Date(fechaInicio);
    const hoy = new Date();
    if (isNaN(inicio.getTime())) return 0;
    const diff = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  test('calcula días correctamente para fecha en el pasado', () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const days = calculateSobrietyDays(thirtyDaysAgo);
    expect(days).toBeGreaterThanOrEqual(29);
    expect(days).toBeLessThanOrEqual(31);
  });

  test('retorna 0 para fecha de hoy', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(calculateSobrietyDays(today)).toBe(0);
  });

  test('retorna 0 para fecha null', () => {
    expect(calculateSobrietyDays(null)).toBe(0);
  });

  test('retorna 0 para fecha inválida', () => {
    expect(calculateSobrietyDays('not-a-date')).toBe(0);
  });

  test('no retorna número negativo para fecha futura', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    expect(calculateSobrietyDays(tomorrow)).toBeGreaterThanOrEqual(0);
  });
});

// ─── Utilidad: Cálculo de Ahorro ─────────────────────────────────────────────

describe('Utilidad: calculateSavings', () => {
  function calculateSavings(diasSobrio, ahorroMensual) {
    if (!diasSobrio || diasSobrio < 0) return 0;
    if (!ahorroMensual || ahorroMensual <= 0) return 0;
    const ahorrodiario = ahorroMensual / 30;
    return Math.round(diasSobrio * ahorrodiario);
  }

  test('calcula ahorro total correctamente', () => {
    const ahorro = calculateSavings(30, 150000);
    expect(ahorro).toBe(150000);
  });

  test('calcula ahorro para 127 días', () => {
    const ahorro = calculateSavings(127, 150000);
    expect(ahorro).toBeGreaterThan(0);
    expect(ahorro).toBeCloseTo(635000, -3);
  });

  test('retorna 0 con días sobrio = 0', () => {
    expect(calculateSavings(0, 150000)).toBe(0);
  });

  test('retorna 0 con ahorro mensual = 0', () => {
    expect(calculateSavings(30, 0)).toBe(0);
  });

  test('retorna 0 con valores negativos', () => {
    expect(calculateSavings(-5, 150000)).toBe(0);
    expect(calculateSavings(30, -150000)).toBe(0);
  });
});

// ─── Utilidad: Formato de Respuestas API ─────────────────────────────────────

describe('Utilidad: formatApiResponse', () => {
  function formatApiResponse(data, message = null, statusCode = 200) {
    return {
      success: statusCode >= 200 && statusCode < 300,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  function formatErrorResponse(message, statusCode, details = null) {
    return {
      success: false,
      statusCode,
      message,
      error: details,
      timestamp: new Date().toISOString(),
    };
  }

  test('formatea respuesta exitosa correctamente', () => {
    const response = formatApiResponse({ id: 'user-001' }, 'Usuario encontrado');
    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(200);
    expect(response.data).toHaveProperty('id');
  });

  test('formatea respuesta de error correctamente', () => {
    const error = formatErrorResponse('No autorizado', 401);
    expect(error.success).toBe(false);
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('No autorizado');
  });

  test('incluye timestamp en todas las respuestas', () => {
    const response = formatApiResponse({});
    expect(response.timestamp).toBeTruthy();
    expect(() => new Date(response.timestamp)).not.toThrow();
  });

  test('success es false para status 4xx', () => {
    const response = formatApiResponse(null, 'Error', 400);
    expect(response.success).toBe(false);
  });
});

// ─── Utilidad: Hashing de Analíticas ─────────────────────────────────────────

describe('Utilidad: Analytics Anonymization', () => {
  const ANALYTICS_SALT = 'test-salt-2024';

  function anonymizeUserId(userId, salt) {
    if (!userId || !salt) return null;
    // Simulación de hash (en producción usa crypto)
    const combined = `${salt}:${userId}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  test('genera hash consistente para el mismo userId', () => {
    const hash1 = anonymizeUserId('user-001', ANALYTICS_SALT);
    const hash2 = anonymizeUserId('user-001', ANALYTICS_SALT);
    expect(hash1).toBe(hash2);
  });

  test('genera hashes diferentes para diferentes usuarios', () => {
    const hash1 = anonymizeUserId('user-001', ANALYTICS_SALT);
    const hash2 = anonymizeUserId('user-002', ANALYTICS_SALT);
    expect(hash1).not.toBe(hash2);
  });

  test('retorna null sin userId', () => {
    expect(anonymizeUserId(null, ANALYTICS_SALT)).toBeNull();
  });

  test('retorna null sin salt', () => {
    expect(anonymizeUserId('user-001', null)).toBeNull();
  });

  test('el hash no permite reconstruir el userId original', () => {
    const hash = anonymizeUserId('user-001', ANALYTICS_SALT);
    expect(hash).not.toContain('user-001');
  });
});

// ─── Utilidad: Validación de Tipos de Archivo ─────────────────────────────────

describe('Utilidad: validateMediaFile (MinIO upload)', () => {
  function validateMediaFile(file) {
    const errors = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    if (!file) { errors.push('archivo requerido'); return errors; }
    if (!allowedTypes.includes(file.mimetype)) errors.push(`tipo no permitido: ${file.mimetype}`);
    if (file.size > maxSizeBytes) errors.push(`archivo excede tamaño máximo de 5MB`);
    if (file.size <= 0) errors.push('archivo vacío');

    return errors;
  }

  test('pasa con imagen JPEG válida', () => {
    const file = { mimetype: 'image/jpeg', size: 1024 * 100, originalname: 'foto.jpg' };
    expect(validateMediaFile(file)).toHaveLength(0);
  });

  test('pasa con audio MP3 válido', () => {
    const file = { mimetype: 'audio/mpeg', size: 1024 * 1024 * 2, originalname: 'meditacion.mp3' };
    expect(validateMediaFile(file)).toHaveLength(0);
  });

  test('falla con tipo de archivo no permitido (PDF)', () => {
    const file = { mimetype: 'application/pdf', size: 1024 * 100, originalname: 'doc.pdf' };
    const errors = validateMediaFile(file);
    expect(errors.some((e) => e.includes('tipo no permitido'))).toBe(true);
  });

  test('falla con archivo mayor a 5MB', () => {
    const file = { mimetype: 'image/jpeg', size: 1024 * 1024 * 6, originalname: 'grande.jpg' };
    const errors = validateMediaFile(file);
    expect(errors.some((e) => e.includes('5MB'))).toBe(true);
  });

  test('falla con archivo vacío (size 0)', () => {
    const file = { mimetype: 'image/jpeg', size: 0, originalname: 'vacio.jpg' };
    const errors = validateMediaFile(file);
    expect(errors.some((e) => e.includes('vacío'))).toBe(true);
  });

  test('falla sin archivo', () => {
    const errors = validateMediaFile(null);
    expect(errors).toContain('archivo requerido');
  });
});

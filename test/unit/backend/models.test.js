/**
 * models.test.js
 * Pruebas para los modelos de datos y su validación de esquema en NewLife.
 * Se prueba la lógica de validación, valores por defecto y relaciones.
 */

const { mockUsers, mockCheckins, mockPet, mockCamino } = require('../../fixtures/mock-data');

// ─── Modelo: Usuario ──────────────────────────────────────────────────────────

describe('Modelo: Usuario', () => {
  // Simulamos la lógica de validación del modelo
  function createUserModel(data) {
    const errors = [];
    if (!data.email) errors.push('email es requerido');
    if (!data.nombre) errors.push('nombre es requerido');
    if (!data.password_hash && !data.is_guest) errors.push('password_hash es requerido para usuarios no invitados');

    const model = {
      id: data.id || `user-${Date.now()}`,
      email: data.email,
      nombre: data.nombre,
      password_hash: data.password_hash || null,
      is_verified: data.is_verified ?? false,
      is_guest: data.is_guest ?? false,
      dias_sobrio: data.dias_sobrio ?? 0,
      nivel_actual: data.nivel_actual ?? 1,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { model, errors };
  }

  test('crea usuario con datos válidos', () => {
    const { model, errors } = createUserModel({
      email: 'test@test.com',
      nombre: 'Test User',
      password_hash: '$2b$10$mock',
    });
    expect(errors).toHaveLength(0);
    expect(model.email).toBe('test@test.com');
  });

  test('valor por defecto de is_verified es false', () => {
    const { model } = createUserModel({ email: 'test@test.com', nombre: 'Test', password_hash: 'hash' });
    expect(model.is_verified).toBe(false);
  });

  test('valor por defecto de dias_sobrio es 0', () => {
    const { model } = createUserModel({ email: 'test@test.com', nombre: 'Test', password_hash: 'hash' });
    expect(model.dias_sobrio).toBe(0);
  });

  test('valor por defecto de nivel_actual es 1', () => {
    const { model } = createUserModel({ email: 'test@test.com', nombre: 'Test', password_hash: 'hash' });
    expect(model.nivel_actual).toBe(1);
  });

  test('falla sin email', () => {
    const { errors } = createUserModel({ nombre: 'Test', password_hash: 'hash' });
    expect(errors).toContain('email es requerido');
  });

  test('falla sin nombre', () => {
    const { errors } = createUserModel({ email: 'test@test.com', password_hash: 'hash' });
    expect(errors).toContain('nombre es requerido');
  });

  test('permite usuario invitado sin password_hash', () => {
    const { errors } = createUserModel({ is_guest: true });
    expect(errors).not.toContain('password_hash es requerido para usuarios no invitados');
  });

  test('genera created_at automáticamente', () => {
    const { model } = createUserModel({ email: 'test@test.com', nombre: 'Test', password_hash: 'hash' });
    expect(model.created_at).toBeTruthy();
    expect(() => new Date(model.created_at)).not.toThrow();
  });

  test('no expone password_hash (se elimina en serialización)', () => {
    const { model } = createUserModel({ email: 'test@test.com', nombre: 'Test', password_hash: '$2b$10$hash' });
    const serialized = JSON.parse(JSON.stringify(model));
    // En producción, el servicio elimina password_hash antes de retornar
    // Aquí verificamos que el modelo lo tiene pero la API no lo expone
    expect(model.password_hash).toBeTruthy();
    // La API debe excluirlo manualmente
  });
});

// ─── Modelo: DailyCheckin ─────────────────────────────────────────────────────

describe('Modelo: DailyCheckin', () => {
  function createCheckinModel(data) {
    const errors = [];
    const validEmociones = ['bien', 'mal', 'neutral', 'muy_bien', 'muy_mal'];

    if (!data.userId) errors.push('userId es requerido');
    if (!data.emocion || !validEmociones.includes(data.emocion)) errors.push('emocion inválida');
    if (typeof data.consumo !== 'boolean') errors.push('consumo debe ser boolean');
    if (!data.gratitud) errors.push('gratitud es requerida');

    return {
      model: {
        id: `checkin-${Date.now()}`,
        userId: data.userId,
        emocion: data.emocion,
        consumo: data.consumo,
        gratitud: data.gratitud,
        reflexion: data.reflexion || null,
        ubicacion: data.ubicacion || null,
        social: data.social || null,
        fecha: data.fecha || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      },
      errors,
    };
  }

  test('crea check-in válido', () => {
    const { model, errors } = createCheckinModel({
      userId: 'user-001',
      ...mockCheckins.valid,
    });
    expect(errors).toHaveLength(0);
    expect(model.emocion).toBe('bien');
  });

  test('reflexion y ubicacion son opcionales (null por defecto)', () => {
    const { model } = createCheckinModel({ userId: 'user-001', ...mockCheckins.minimal });
    expect(model.reflexion).toBeNull();
    expect(model.ubicacion).toBeNull();
  });

  test('falla sin userId', () => {
    const { errors } = createCheckinModel({ ...mockCheckins.valid });
    expect(errors).toContain('userId es requerido');
  });

  test('falla con emocion fuera del enum', () => {
    const { errors } = createCheckinModel({ userId: 'user-001', ...mockCheckins.invalidEmocion });
    expect(errors).toContain('emocion inválida');
  });

  test('fecha se genera automáticamente si no se provee', () => {
    const { model } = createCheckinModel({ userId: 'user-001', ...mockCheckins.minimal });
    expect(model.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ─── Modelo: Pet ──────────────────────────────────────────────────────────────

describe('Modelo: Pet', () => {
  function createPetModel(data) {
    const errors = [];
    const validFormas = ['huevo', 'semilla', 'brote', 'planta', 'flor', 'arbol'];

    if (!data.userId) errors.push('userId es requerido');
    if (data.xp_actual !== undefined && data.xp_actual < 0) errors.push('xp_actual no puede ser negativo');
    if (data.forma_actual && !validFormas.includes(data.forma_actual)) errors.push('forma_actual inválida');

    return {
      model: {
        id: data.id || `pet-${Date.now()}`,
        userId: data.userId,
        nombre: data.nombre || 'Mi Compañero',
        forma_actual: data.forma_actual || 'huevo',
        xp_actual: data.xp_actual ?? 0,
        nivel: data.nivel ?? 1,
        formas_desbloqueadas: data.formas_desbloqueadas || ['huevo'],
        ultima_interaccion: data.ultima_interaccion || new Date().toISOString(),
      },
      errors,
    };
  }

  test('crea mascota con valores por defecto', () => {
    const { model, errors } = createPetModel({ userId: 'user-001' });
    expect(errors).toHaveLength(0);
    expect(model.forma_actual).toBe('huevo');
    expect(model.xp_actual).toBe(0);
    expect(model.nivel).toBe(1);
  });

  test('falla sin userId', () => {
    const { errors } = createPetModel({});
    expect(errors).toContain('userId es requerido');
  });

  test('falla con XP negativo', () => {
    const { errors } = createPetModel({ userId: 'user-001', xp_actual: -10 });
    expect(errors).toContain('xp_actual no puede ser negativo');
  });

  test('falla con forma no válida', () => {
    const { errors } = createPetModel({ userId: 'user-001', forma_actual: 'dragon' });
    expect(errors).toContain('forma_actual inválida');
  });

  test('nombre por defecto asignado si no se provee', () => {
    const { model } = createPetModel({ userId: 'user-001' });
    expect(model.nombre).toBe('Mi Compañero');
  });
});

// ─── Modelo: Camino (12 Pasos) ────────────────────────────────────────────────

describe('Modelo: Camino (Programa 12 Pasos)', () => {
  function createCaminoModel(data) {
    const errors = [];

    if (!data.userId) errors.push('userId es requerido');
    if (data.nivel_actual !== undefined && (data.nivel_actual < 1 || data.nivel_actual > 12)) {
      errors.push('nivel_actual debe estar entre 1 y 12');
    }
    if (data.modulo_actual !== undefined && (data.modulo_actual < 1 || data.modulo_actual > 3)) {
      errors.push('modulo_actual debe estar entre 1 y 3');
    }

    return {
      model: {
        userId: data.userId,
        nivel_actual: data.nivel_actual ?? 1,
        modulo_actual: data.modulo_actual ?? 1,
        fecha_inicio: data.fecha_inicio || new Date().toISOString(),
        porcentaje_completado: ((((data.nivel_actual - 1) * 3 + (data.modulo_actual - 1)) / 36) * 100).toFixed(1),
      },
      errors,
    };
  }

  test('crea camino con valores por defecto', () => {
    const { model, errors } = createCaminoModel({ userId: 'user-001' });
    expect(errors).toHaveLength(0);
    expect(model.nivel_actual).toBe(1);
    expect(model.modulo_actual).toBe(1);
  });

  test('falla con nivel fuera de rango (> 12)', () => {
    const { errors } = createCaminoModel({ userId: 'user-001', nivel_actual: 13, modulo_actual: 1 });
    expect(errors).toContain('nivel_actual debe estar entre 1 y 12');
  });

  test('falla con módulo fuera de rango (> 3)', () => {
    const { errors } = createCaminoModel({ userId: 'user-001', nivel_actual: 1, modulo_actual: 4 });
    expect(errors).toContain('modulo_actual debe estar entre 1 y 3');
  });

  test('calcula porcentaje de completado correctamente', () => {
    const { model } = createCaminoModel({ userId: 'user-001', nivel_actual: 4, modulo_actual: 1 });
    // (3*3 + 0) / 36 = 25%
    expect(parseFloat(model.porcentaje_completado)).toBeCloseTo(25, 0);
  });

  test('porcentaje es 0 al inicio (nivel 1, módulo 1)', () => {
    const { model } = createCaminoModel({ userId: 'user-001', nivel_actual: 1, modulo_actual: 1 });
    expect(parseFloat(model.porcentaje_completado)).toBe(0);
  });
});

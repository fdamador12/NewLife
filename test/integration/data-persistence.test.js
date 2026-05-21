/**
 * data-persistence.test.js
 * Pruebas de persistencia de datos: CRUD completo, consistencia y relaciones.
 */

const { mockContent, mockCategories } = require('../fixtures/mock-data');
const { assertExistsInDb, assertNotExistsInDb } = require('../utils/assertions');
const { setupTestDatabase, teardownTestDatabase, resetTestDatabase, db } = require('../fixtures/test-database');

beforeAll(async () => { await setupTestDatabase(); });
afterAll(async () => { await teardownTestDatabase(); });
beforeEach(async () => { await resetTestDatabase(); });

// ─── USUARIOS ─────────────────────────────────────────────────────────────────

describe('Persistencia: Usuarios', () => {
  test('crea usuario y lo recupera por ID', async () => {
    const newUser = db.users.create({
      email: 'persist@test.com',
      nombre: 'Persist Test',
      is_verified: false,
      password_hash: 'hash-test',
    });
    const found = db.users.findById(newUser.id);
    expect(found).toBeDefined();
    expect(found.email).toBe('persist@test.com');
  });

  test('crea usuario y lo recupera por email', async () => {
    db.users.create({ email: 'byemail@test.com', nombre: 'By Email', password_hash: 'h', is_verified: false });
    const found = db.users.findByEmail('byemail@test.com');
    expect(found).toBeDefined();
    expect(found.nombre).toBe('By Email');
  });

  test('actualiza datos del usuario', async () => {
    const user = db.users.create({ email: 'update@test.com', nombre: 'Original', password_hash: 'h', is_verified: false });
    const updated = db.users.update(user.id, { nombre: 'Actualizado', is_verified: true });
    expect(updated.nombre).toBe('Actualizado');
    expect(updated.is_verified).toBe(true);
  });

  test('elimina usuario y no puede ser encontrado', async () => {
    const user = db.users.create({ email: 'delete@test.com', nombre: 'To Delete', password_hash: 'h', is_verified: false });
    db.users.delete(user.id);
    expect(db.users.findById(user.id)).toBeNull();
  });

  test('retorna null al buscar usuario inexistente por ID', () => {
    expect(db.users.findById('nonexistent-id')).toBeNull();
  });

  test('retorna null al buscar usuario inexistente por email', () => {
    expect(db.users.findByEmail('noexiste@test.com')).toBeNull();
  });

  test('contador de usuarios actualiza al crear', () => {
    const countBefore = db.users.count();
    db.users.create({ email: 'count@test.com', nombre: 'Count', password_hash: 'h', is_verified: false });
    expect(db.users.count()).toBe(countBefore + 1);
  });
});

// ─── CHECK-INS ────────────────────────────────────────────────────────────────

describe('Persistencia: Check-ins Diarios', () => {
  test('crea check-in y lo recupera por userId', async () => {
    const checkin = db.checkins.create({ userId: 'user-001', emocion: 'bien', consumo: false, gratitud: 'Test.' });
    const found = db.checkins.findByUserId('user-001');
    expect(found.length).toBeGreaterThan(0);
    expect(found.find((c) => c.id === checkin.id)).toBeDefined();
  });

  test('findToday retorna check-in del día actual', async () => {
    db.checkins.create({ userId: 'user-001', emocion: 'bien', consumo: false, gratitud: 'Hoy.' });
    const today = db.checkins.findToday('user-001');
    expect(today).not.toBeNull();
    expect(today.emocion).toBe('bien');
  });

  test('findToday retorna null si no hay check-in hoy', async () => {
    const result = db.checkins.findToday('user-002');
    expect(result).toBeNull();
  });

  test('check-in tiene fecha asignada automáticamente', async () => {
    const checkin = db.checkins.create({ userId: 'user-001', emocion: 'neutral', consumo: false, gratitud: 'Ok.' });
    expect(checkin.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('check-in tiene ID único generado', async () => {
    const c1 = db.checkins.create({ userId: 'user-001', emocion: 'bien', consumo: false, gratitud: 'A.' });
    const c2 = db.checkins.create({ userId: 'user-001', emocion: 'mal', consumo: true, gratitud: 'B.' });
    // Forzar fechas diferentes para poder crear ambos
    c1.fecha = '2024-05-19';
    expect(c1.id).not.toBe(c2.id);
  });

  test('contador de check-ins por userId', async () => {
    db.checkins.create({ userId: 'user-special', emocion: 'bien', consumo: false, gratitud: 'A.' });
    db.checkins.create({ userId: 'user-special', emocion: 'mal', consumo: false, gratitud: 'B.' });
    expect(db.checkins.count('user-special')).toBe(2);
  });
});

// ─── MASCOTAS ─────────────────────────────────────────────────────────────────

describe('Persistencia: Mascotas', () => {
  test('encuentra mascota por userId', async () => {
    const pet = db.pets.findByUserId('user-001');
    expect(pet).not.toBeNull();
    expect(pet.userId).toBe('user-001');
  });

  test('actualiza XP de mascota', async () => {
    db.pets.update('user-001', { xp_actual: 300 });
    const pet = db.pets.findByUserId('user-001');
    expect(pet.xp_actual).toBe(300);
  });

  test('actualiza forma de mascota', async () => {
    db.pets.update('user-001', { forma_actual: 'brote' });
    const pet = db.pets.findByUserId('user-001');
    expect(pet.forma_actual).toBe('brote');
  });

  test('retorna null para usuario sin mascota', () => {
    expect(db.pets.findByUserId('user-without-pet')).toBeNull();
  });
});

// ─── CONTENIDO ────────────────────────────────────────────────────────────────

describe('Persistencia: Contenido (Artículos)', () => {
  test('findAll retorna solo contenidos publicados', async () => {
    const contents = db.content.findAll();
    expect(contents.every((c) => c.publicado === true)).toBe(true);
  });

  test('crea contenido y lo recupera por ID', async () => {
    const newContent = db.content.create({
      titulo: 'Nuevo artículo de prueba',
      cuerpo: 'Contenido del artículo de prueba.',
      categoria_id: 'cat-001',
      publicado: true,
    });
    const found = db.content.findById(newContent.id);
    expect(found).toBeDefined();
    expect(found.titulo).toBe('Nuevo artículo de prueba');
  });

  test('actualiza contenido existente', async () => {
    const content = db.content.create({ titulo: 'Original', cuerpo: 'Cuerpo.', categoria_id: 'cat-001', publicado: true });
    const updated = db.content.update(content.id, { titulo: 'Actualizado' });
    expect(updated.titulo).toBe('Actualizado');
  });

  test('elimina contenido correctamente', async () => {
    const content = db.content.create({ titulo: 'A eliminar', cuerpo: 'Cuerpo.', categoria_id: 'cat-001', publicado: true });
    db.content.delete(content.id);
    expect(db.content.findById(content.id)).toBeNull();
  });

  test('findByCategory filtra correctamente', async () => {
    const results = db.content.findByCategory('cat-001');
    results.forEach((c) => expect(c.categoria_id).toBe('cat-001'));
  });

  test('contenido no publicado no aparece en findAll', async () => {
    db.content.create({ titulo: 'Borrador', cuerpo: 'Oculto.', categoria_id: 'cat-001', publicado: false });
    const contents = db.content.findAll();
    expect(contents.find((c) => c.titulo === 'Borrador')).toBeUndefined();
  });
});

// ─── CONSISTENCIA DE DATOS ────────────────────────────────────────────────────

describe('Consistencia de datos', () => {
  test('update retorna null para ID inexistente', () => {
    const result = db.users.update('nonexistent-99', { nombre: 'Test' });
    expect(result).toBeNull();
  });

  test('delete retorna false para ID inexistente', () => {
    const result = db.users.delete('nonexistent-99');
    expect(result).toBe(false);
  });

  test('múltiples usuarios tienen IDs únicos', () => {
    const u1 = db.users.create({ email: 'u1@t.com', nombre: 'U1', password_hash: 'h', is_verified: false });
    const u2 = db.users.create({ email: 'u2@t.com', nombre: 'U2', password_hash: 'h', is_verified: false });
    expect(u1.id).not.toBe(u2.id);
  });

  test('created_at es asignado automáticamente en usuarios', () => {
    const user = db.users.create({ email: 'ts@t.com', nombre: 'TS', password_hash: 'h', is_verified: false });
    expect(user.created_at).toBeTruthy();
    expect(() => new Date(user.created_at)).not.toThrow();
  });
});

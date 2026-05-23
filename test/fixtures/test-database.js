/**
 * test-database.js
 * Configuración y helpers para la base de datos de pruebas (Roble UN simulado).
 * En el entorno de pruebas, Roble DB se simula con un store en memoria.
 */

// Contador global para garantizar IDs únicos incluso cuando Date.now() colisiona
let _idSeq = 0;
const nextId = () => `${Date.now()}-${++_idSeq}`;

// Store en memoria que simula Roble DB durante las pruebas
let inMemoryStore = {
  users: [],
  checkins: [],
  caminos: [],
  pets: [],
  content: [],
  categories: [],
  medals: [],
  communities: [],
  contacts: [],
};

// ─── SETUP ────────────────────────────────────────────────────────────────────

/**
 * Inicializa la base de datos de pruebas con datos de base.
 * Llamar en beforeAll() de las suites de integración.
 */
async function setupTestDatabase() {
  const { mockUsers, mockContent, mockCategories, mockMedals } = require('./mock-data');

  inMemoryStore.users = [
    { ...mockUsers.regularUser, password_hash: '$2b$10$mock_hash_regular' },
    { ...mockUsers.adminUser, password_hash: '$2b$10$mock_hash_admin' },
    { ...mockUsers.unverifiedUser, password_hash: '$2b$10$mock_hash_unverified' },
  ];

  inMemoryStore.content = [...mockContent];
  inMemoryStore.categories = [...mockCategories];
  inMemoryStore.medals = [...mockMedals];

  inMemoryStore.pets = [
    {
      id: 'pet-001',
      userId: 'user-001',
      nombre: 'Nube',
      forma_actual: 'semilla',
      xp_actual: 250,
      nivel: 2,
    },
  ];

  inMemoryStore.caminos = [
    {
      userId: 'user-001',
      nivel_actual: 3,
      modulo_actual: 2,
      fecha_inicio: '2024-01-15T10:00:00Z',
    },
  ];

  return inMemoryStore;
}

/**
 * Limpia completamente la base de datos de pruebas.
 * Llamar en afterAll() de las suites de integración.
 */
async function teardownTestDatabase() {
  inMemoryStore = {
    users: [],
    checkins: [],
    caminos: [],
    pets: [],
    content: [],
    categories: [],
    medals: [],
    communities: [],
    contacts: [],
  };
}

/**
 * Resetea la BD al estado inicial entre pruebas individuales.
 * Llamar en beforeEach() para garantizar aislamiento.
 */
async function resetTestDatabase() {
  await teardownTestDatabase();
  await setupTestDatabase();
}

// ─── CRUD DE PRUEBA ───────────────────────────────────────────────────────────

const db = {
  users: {
    findByEmail: (email) => inMemoryStore.users.find((u) => u.email === email) || null,
    findById: (id) => inMemoryStore.users.find((u) => u.id === id) || null,
    create: (userData) => {
      const newUser = { ...userData, id: `user-${nextId()}`, created_at: new Date().toISOString() };
      inMemoryStore.users.push(newUser);
      return newUser;
    },
    update: (id, updates) => {
      const idx = inMemoryStore.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      inMemoryStore.users[idx] = { ...inMemoryStore.users[idx], ...updates };
      return inMemoryStore.users[idx];
    },
    delete: (id) => {
      const idx = inMemoryStore.users.findIndex((u) => u.id === id);
      if (idx === -1) return false;
      inMemoryStore.users.splice(idx, 1);
      return true;
    },
    count: () => inMemoryStore.users.length,
  },

  checkins: {
    findByUserId: (userId) => inMemoryStore.checkins.filter((c) => c.userId === userId),
    findToday: (userId) => {
      const today = new Date().toISOString().split('T')[0];
      return inMemoryStore.checkins.find((c) => c.userId === userId && c.fecha === today) || null;
    },
    create: (data) => {
      const newCheckin = {
        ...data,
        id: `checkin-${nextId()}`,
        fecha: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      inMemoryStore.checkins.push(newCheckin);
      return newCheckin;
    },
    count: (userId) =>
      userId ? inMemoryStore.checkins.filter((c) => c.userId === userId).length : inMemoryStore.checkins.length,
  },

  pets: {
    findByUserId: (userId) => inMemoryStore.pets.find((p) => p.userId === userId) || null,
    update: (userId, updates) => {
      const idx = inMemoryStore.pets.findIndex((p) => p.userId === userId);
      if (idx === -1) return null;
      inMemoryStore.pets[idx] = { ...inMemoryStore.pets[idx], ...updates };
      return inMemoryStore.pets[idx];
    },
  },

  content: {
    findAll: () => inMemoryStore.content.filter((c) => c.publicado),
    findById: (id) => inMemoryStore.content.find((c) => c.id === id) || null,
    findByCategory: (categoryId) =>
      inMemoryStore.content.filter((c) => c.categoria_id === categoryId && c.publicado),
    create: (data) => {
      const newContent = { ...data, id: `content-${nextId()}`, created_at: new Date().toISOString() };
      inMemoryStore.content.push(newContent);
      return newContent;
    },
    update: (id, updates) => {
      const idx = inMemoryStore.content.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      inMemoryStore.content[idx] = { ...inMemoryStore.content[idx], ...updates };
      return inMemoryStore.content[idx];
    },
    delete: (id) => {
      const idx = inMemoryStore.content.findIndex((c) => c.id === id);
      if (idx === -1) return false;
      inMemoryStore.content.splice(idx, 1);
      return true;
    },
  },
};

// ─── MOCK DEL CLIENTE DE ROBLE ────────────────────────────────────────────────

/**
 * Crea un mock del cliente HTTP de Roble para usar en pruebas.
 * Simula las respuestas de la API de Roble UN sin necesitar red.
 */
function createRobleClientMock() {
  return {
    get: jest.fn().mockImplementation((path) => {
      if (path.includes('/users/')) {
        const userId = path.split('/users/')[1];
        const user = db.users.findById(userId);
        return Promise.resolve({ data: user, status: user ? 200 : 404 });
      }
      return Promise.resolve({ data: [], status: 200 });
    }),
    post: jest.fn().mockImplementation((path, body) => {
      if (path.includes('/users')) {
        const newUser = db.users.create(body);
        return Promise.resolve({ data: newUser, status: 201 });
      }
      return Promise.resolve({ data: {}, status: 201 });
    }),
    put: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
    delete: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
  };
}

// Exportar el store para inspección en pruebas
function getStore() {
  return inMemoryStore;
}

module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
  resetTestDatabase,
  db,
  createRobleClientMock,
  getStore,
};

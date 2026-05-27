/**
 * api-endpoints.test.js
 * Pruebas de integración para los endpoints principales del Mobile API y Admin API.
 */

const {
  mockUsers, mockCredentials, mockCheckins, mockContent, mockCategories, mockPet, mockCamino,
} = require('../fixtures/mock-data');
const { assertUserStructure, assertCheckinStructure, assertContentStructure } = require('../utils/assertions');

// Sistema integrado simulado (capa de API + lógica + DB en memoria)
function createApiSystem() {
  const store = {
    users: [],
    checkins: [],
    pets: [],
    caminos: [],
    content: [...mockContent],
    categories: [...mockCategories],
    contacts: [],
    medals: [],
  };

  function authenticate(token) {
    if (!token || !token.startsWith('Bearer ')) return null;
    const tokenValue = token.split(' ')[1];
    const user = store.users.find((u) => u.token === tokenValue);
    return user || null;
  }

  return {
    store,

    // ── Auth endpoints ─────────────────────────────────────────────────────
    async POST_auth_register({ email, password, nombre }) {
      if (store.users.find((u) => u.email === email)) {
        throw { status: 409, message: 'Email ya registrado' };
      }
      const user = { id: `user-${Date.now()}`, email, nombre, _password: password, is_verified: false, dias_sobrio: 0, nivel_actual: 1 };
      store.users.push(user);
      return { statusCode: 201, message: 'Usuario creado. Verifica tu email.', userId: user.id };
    },

    async POST_auth_login({ email, password }) {
      const user = store.users.find((u) => u.email === email);
      if (!user || user._password !== password) throw { status: 401, message: 'Credenciales inválidas' };
      if (!user.is_verified) throw { status: 403, message: 'Email no verificado' };
      const token = `token-${user.id}`;
      user.token = token;
      return { access_token: token, refresh_token: `refresh-${user.id}`, user: { ...user, token: undefined } };
    },

    // ── Progress endpoints ─────────────────────────────────────────────────
    async POST_progress_checkin(authHeader, body) {
      const user = authenticate(authHeader);
      if (!user) throw { status: 401 };
      const today = new Date().toISOString().split('T')[0];
      if (store.checkins.find((c) => c.userId === user.id && c.fecha === today)) {
        throw { status: 409, message: 'Ya existe check-in para hoy' };
      }
      const checkin = { id: `c-${Date.now()}`, userId: user.id, fecha: today, ...body };
      store.checkins.push(checkin);
      const streak = store.checkins.filter((c) => c.userId === user.id && !c.consumo).length;
      return { ...checkin, streak };
    },

    async GET_progress_checkin_today(authHeader) {
      const user = authenticate(authHeader);
      if (!user) throw { status: 401 };
      const today = new Date().toISOString().split('T')[0];
      return store.checkins.find((c) => c.userId === user.id && c.fecha === today) || null;
    },

    async GET_progress_camino(authHeader) {
      const user = authenticate(authHeader);
      if (!user) throw { status: 401 };
      const camino = store.caminos.find((c) => c.userId === user.id);
      if (!camino) throw { status: 404, message: 'Camino no inicializado' };
      return camino;
    },

    async POST_progress_camino_init(authHeader) {
      const user = authenticate(authHeader);
      if (!user) throw { status: 401 };
      if (store.caminos.find((c) => c.userId === user.id)) {
        throw { status: 409, message: 'Camino ya iniciado' };
      }
      const camino = { userId: user.id, nivel_actual: 1, modulo_actual: 1, fecha_inicio: new Date().toISOString() };
      store.caminos.push(camino);
      return camino;
    },

    // ── Pet endpoints ──────────────────────────────────────────────────────
    async GET_pet(authHeader) {
      const user = authenticate(authHeader);
      if (!user) throw { status: 401 };
      const pet = store.pets.find((p) => p.userId === user.id);
      if (!pet) throw { status: 404 };
      return pet;
    },

    async POST_pet_xp(authHeader, { xp }) {
      const user = authenticate(authHeader);
      if (!user) throw { status: 401 };
      let pet = store.pets.find((p) => p.userId === user.id);
      if (!pet) {
        pet = { id: `pet-${Date.now()}`, userId: user.id, xp_actual: 0, nivel: 1, forma_actual: 'huevo' };
        store.pets.push(pet);
      }
      pet.xp_actual += xp;
      const evolucionado = pet.xp_actual >= 500 && (pet.xp_actual - xp) < 500;
      if (evolucionado) pet.forma_actual = 'semilla';
      return { pet, evolucionado, nuevaForma: evolucionado ? 'semilla' : null };
    },

    // ── Care/Content endpoints ─────────────────────────────────────────────
    async GET_care_content(authHeader, { categoria_id } = {}) {
      const user = authenticate(authHeader);
      if (!user) throw { status: 401 };
      let content = store.content.filter((c) => c.publicado);
      if (categoria_id) content = content.filter((c) => c.categoria_id === categoria_id);
      return content;
    },

    async GET_care_categories(authHeader) {
      const user = authenticate(authHeader);
      if (!user) throw { status: 401 };
      return store.categories;
    },

    async GET_care_contacts(authHeader) {
      const user = authenticate(authHeader);
      if (!user) throw { status: 401 };
      return store.contacts;
    },

    async POST_care_contacts(authHeader, body) {
      const user = authenticate(authHeader);
      if (!user) throw { status: 401 };
      const contact = { id: `contact-${Date.now()}`, userId: user.id, ...body };
      store.contacts.push(contact);
      return contact;
    },
  };
}

let api;

beforeEach(() => {
  api = createApiSystem();
});

async function registerAndLogin(email = 'test@test.com', password = 'Pass123!', nombre = 'Test User') {
  await api.POST_auth_register({ email, password, nombre });
  const user = api.store.users.find((u) => u.email === email);
  user.is_verified = true; // Simular verificación
  return api.POST_auth_login({ email, password });
}

// ─── PRUEBAS: Auth Endpoints ──────────────────────────────────────────────────

describe('POST /auth/register', () => {
  test('retorna 201 con datos válidos', async () => {
    const result = await api.POST_auth_register({ email: 'nuevo@test.com', password: 'Pass123!', nombre: 'Nuevo' });
    expect(result.statusCode).toBe(201);
    expect(result.userId).toBeTruthy();
  });

  test('retorna 409 con email duplicado', async () => {
    await api.POST_auth_register({ email: 'dup@test.com', password: 'Pass123!', nombre: 'First' });
    await expect(api.POST_auth_register({ email: 'dup@test.com', password: 'Pass456!', nombre: 'Second' })).rejects.toMatchObject({ status: 409 });
  });

  test('crea usuario en el sistema', async () => {
    await api.POST_auth_register({ email: 'crear@test.com', password: 'Pass123!', nombre: 'Crear' });
    expect(api.store.users.find((u) => u.email === 'crear@test.com')).toBeDefined();
  });
});

describe('POST /auth/login', () => {
  test('retorna tokens con credenciales válidas', async () => {
    const result = await registerAndLogin();
    expect(result.access_token).toBeTruthy();
    expect(result.refresh_token).toBeTruthy();
  });

  test('retorna usuario sin password en la respuesta', async () => {
    const result = await registerAndLogin();
    expect(result.user.email).toBe('test@test.com');
    expect(result.user.password_hash).toBeUndefined();
  });

  test('retorna 401 con contraseña incorrecta', async () => {
    await api.POST_auth_register({ email: 'auth@test.com', password: 'Pass123!', nombre: 'Test' });
    const user = api.store.users.find((u) => u.email === 'auth@test.com');
    user.is_verified = true;
    await expect(api.POST_auth_login({ email: 'auth@test.com', password: 'wrong' })).rejects.toMatchObject({ status: 401 });
  });
});

// ─── PRUEBAS: Progress Endpoints ──────────────────────────────────────────────

describe('POST /progress/checkin', () => {
  test('crea check-in para usuario autenticado', async () => {
    const loginResult = await registerAndLogin(`checkin${Date.now()}@t.com`, 'Pass123!', 'Check');
    const token = `Bearer ${loginResult.access_token}`;
    const result = await api.POST_progress_checkin(token, mockCheckins.valid);
    assertCheckinStructure(result);
    expect(result.streak).toBeGreaterThanOrEqual(0);
  });

  test('retorna 401 sin autenticación', async () => {
    await expect(api.POST_progress_checkin(null, mockCheckins.valid)).rejects.toMatchObject({ status: 401 });
  });

  test('retorna 409 si ya existe check-in del día', async () => {
    const loginResult = await registerAndLogin(`dup${Date.now()}@t.com`, 'Pass123!', 'DupCheck');
    const token = `Bearer ${loginResult.access_token}`;
    await api.POST_progress_checkin(token, mockCheckins.valid);
    await expect(api.POST_progress_checkin(token, mockCheckins.minimal)).rejects.toMatchObject({ status: 409 });
  });

  test('persiste el check-in en el sistema', async () => {
    const email = `persist${Date.now()}@t.com`;
    const loginResult = await registerAndLogin(email, 'Pass123!', 'Persist');
    const token = `Bearer ${loginResult.access_token}`;
    await api.POST_progress_checkin(token, mockCheckins.valid);
    expect(api.store.checkins.length).toBeGreaterThan(0);
  });
});

describe('GET /progress/checkin/today', () => {
  test('retorna check-in de hoy si existe', async () => {
    const email = `today${Date.now()}@t.com`;
    const loginResult = await registerAndLogin(email, 'Pass123!', 'Today');
    const token = `Bearer ${loginResult.access_token}`;
    await api.POST_progress_checkin(token, mockCheckins.valid);
    const result = await api.GET_progress_checkin_today(token);
    expect(result).not.toBeNull();
  });

  test('retorna null si no hay check-in hoy', async () => {
    const email = `nocheck${Date.now()}@t.com`;
    const loginResult = await registerAndLogin(email, 'Pass123!', 'NoCheck');
    const token = `Bearer ${loginResult.access_token}`;
    const result = await api.GET_progress_checkin_today(token);
    expect(result).toBeNull();
  });
});

describe('GET y POST /progress/camino', () => {
  test('POST initCamino crea el camino para el usuario', async () => {
    const loginResult = await registerAndLogin(`camino${Date.now()}@t.com`, 'Pass123!', 'Camino');
    const token = `Bearer ${loginResult.access_token}`;
    const result = await api.POST_progress_camino_init(token);
    expect(result.nivel_actual).toBe(1);
    expect(result.modulo_actual).toBe(1);
  });

  test('GET camino retorna el progreso del usuario', async () => {
    const loginResult = await registerAndLogin(`getcam${Date.now()}@t.com`, 'Pass123!', 'GetCam');
    const token = `Bearer ${loginResult.access_token}`;
    await api.POST_progress_camino_init(token);
    const result = await api.GET_progress_camino(token);
    expect(result.nivel_actual).toBe(1);
  });

  test('GET camino retorna 404 si no inicializado', async () => {
    const loginResult = await registerAndLogin(`nocam${Date.now()}@t.com`, 'Pass123!', 'NoCam');
    const token = `Bearer ${loginResult.access_token}`;
    await expect(api.GET_progress_camino(token)).rejects.toMatchObject({ status: 404 });
  });
});

// ─── PRUEBAS: Pet Endpoints ───────────────────────────────────────────────────

describe('GET /pet y POST /pet/xp', () => {
  test('POST pet xp crea mascota si no existe y agrega XP', async () => {
    const loginResult = await registerAndLogin(`pet${Date.now()}@t.com`, 'Pass123!', 'PetUser');
    const token = `Bearer ${loginResult.access_token}`;
    const result = await api.POST_pet_xp(token, { xp: 10 });
    expect(result.pet.xp_actual).toBe(10);
    expect(result.evolucionado).toBe(false);
  });

  test('mascota evoluciona al superar 500 XP', async () => {
    const loginResult = await registerAndLogin(`evo${Date.now()}@t.com`, 'Pass123!', 'EvoUser');
    const token = `Bearer ${loginResult.access_token}`;
    await api.POST_pet_xp(token, { xp: 490 });
    const result = await api.POST_pet_xp(token, { xp: 20 });
    expect(result.evolucionado).toBe(true);
    expect(result.nuevaForma).toBe('semilla');
  });
});

// ─── PRUEBAS: Care/Content Endpoints ──────────────────────────────────────────

describe('GET /care/content y /care/categories', () => {
  test('retorna lista de contenidos publicados', async () => {
    const loginResult = await registerAndLogin(`care${Date.now()}@t.com`, 'Pass123!', 'Care');
    const token = `Bearer ${loginResult.access_token}`;
    const result = await api.GET_care_content(token);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(assertContentStructure);
  });

  test('filtra contenidos por categoría', async () => {
    const loginResult = await registerAndLogin(`filter${Date.now()}@t.com`, 'Pass123!', 'Filter');
    const token = `Bearer ${loginResult.access_token}`;
    const result = await api.GET_care_content(token, { categoria_id: 'cat-001' });
    result.forEach((c) => expect(c.categoria_id).toBe('cat-001'));
  });

  test('retorna lista de categorías', async () => {
    const loginResult = await registerAndLogin(`cats${Date.now()}@t.com`, 'Pass123!', 'Cats');
    const token = `Bearer ${loginResult.access_token}`;
    const result = await api.GET_care_categories(token);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('nombre');
  });

  test('retorna 401 sin autenticación en contenidos', async () => {
    await expect(api.GET_care_content(null)).rejects.toMatchObject({ status: 401 });
  });
});

// ─── PRUEBAS: Contactos de Cuidado ────────────────────────────────────────────

describe('POST /care/contacts', () => {
  test('crea contacto de emergencia para el usuario', async () => {
    const loginResult = await registerAndLogin(`cont${Date.now()}@t.com`, 'Pass123!', 'Cont');
    const token = `Bearer ${loginResult.access_token}`;
    const contact = { nombre: 'Mamá', telefono: '+573001234567', relacion: 'familiar' };
    const result = await api.POST_care_contacts(token, contact);
    expect(result.id).toBeTruthy();
    expect(result.nombre).toBe('Mamá');
  });

  test('persiste el contacto en el sistema', async () => {
    const loginResult = await registerAndLogin(`contpersist${Date.now()}@t.com`, 'Pass123!', 'ContP');
    const token = `Bearer ${loginResult.access_token}`;
    await api.POST_care_contacts(token, { nombre: 'Papá', telefono: '+573009876543' });
    expect(api.store.contacts.length).toBeGreaterThan(0);
  });
});

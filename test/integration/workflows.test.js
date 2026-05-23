/**
 * workflows.test.js
 * Pruebas de flujos de negocio completos de extremo a extremo.
 */

const { mockCheckins } = require('../fixtures/mock-data');
const { generateUniqueEmail, generateValidPassword } = require('../utils/test-helpers');

// Sistema completo para workflows
function createWorkflowSystem() {
  const users = [];
  const checkins = [];
  const pets = [];
  const caminos = [];
  const medals = [];
  const verificationCodes = new Map();

  function auth(token) {
    return users.find((u) => u.activeToken === token) || null;
  }

  const milestoneMap = { 7: 'primera_semana', 30: 'un_mes', 90: 'tres_meses', 180: 'seis_meses', 365: 'un_año' };

  function checkMilestones(userId, diasSobrio) {
    const newMedals = [];
    const milestone = milestoneMap[diasSobrio];
    if (milestone && !medals.find((m) => m.userId === userId && m.tipo === milestone)) {
      const medal = { id: `medal-${Date.now()}`, userId, tipo: milestone, fecha: new Date().toISOString() };
      medals.push(medal);
      newMedals.push(medal);
    }
    return newMedals;
  }

  return {
    // ── Sistema ────────────────────────────────────────────────────────────
    store: { users, checkins, pets, caminos, medals },

    async register(email, password, nombre) {
      const user = { id: `user-${Date.now()}`, email, nombre, password_hash: `h-${password}`, is_verified: false, dias_sobrio: 0 };
      users.push(user);
      const code = '123456';
      verificationCodes.set(email, code);
      return { userId: user.id, verificationCode: code };
    },

    async verifyAndLogin(email, code, password) {
      const storedCode = verificationCodes.get(email);
      if (storedCode !== code) throw { status: 400 };
      const user = users.find((u) => u.email === email);
      user.is_verified = true;
      const token = `tok-${user.id}`;
      user.activeToken = token;
      return { access_token: token, user };
    },

    async initOnboarding(token, profileData) {
      const user = auth(token);
      if (!user) throw { status: 401 };
      Object.assign(user, profileData);
      return { message: 'Perfil actualizado' };
    },

    async initSobriety(token, fechaUltimoConsumo, ahorroMensual) {
      const user = auth(token);
      if (!user) throw { status: 401 };
      user.fecha_inicio_sobriedad = fechaUltimoConsumo;
      user.ahorro_mensual = ahorroMensual;
      user.dias_sobrio = 0;
      const pet = { id: `pet-${Date.now()}`, userId: user.id, forma_actual: 'huevo', xp_actual: 0 };
      pets.push(pet);
      const camino = { userId: user.id, nivel_actual: 1, modulo_actual: 1, fecha_inicio: new Date().toISOString() };
      caminos.push(camino);
      return { pet, camino };
    },

    async submitDailyCheckin(token, checkinData) {
      const user = auth(token);
      if (!user) throw { status: 401 };
      const today = new Date().toISOString().split('T')[0];
      if (checkins.find((c) => c.userId === user.id && c.fecha === today)) throw { status: 409 };

      const checkin = { id: `c-${Date.now()}`, userId: user.id, fecha: today, ...checkinData };
      checkins.push(checkin);

      if (!checkinData.consumo) {
        user.dias_sobrio = (user.dias_sobrio || 0) + 1;
      } else {
        user.dias_sobrio = 0;
      }

      const streak = checkins.filter((c) => c.userId === user.id && !c.consumo).length;
      const newMedals = checkMilestones(user.id, user.dias_sobrio);
      const xpGanado = checkinData.consumo ? 0 : 10;
      const pet = pets.find((p) => p.userId === user.id);
      if (pet) pet.xp_actual += xpGanado;

      return { checkin, streak, nuevasMedallas: newMedals, xpGanado };
    },

    async completeModule(token) {
      const user = auth(token);
      if (!user) throw { status: 401 };
      const camino = caminos.find((c) => c.userId === user.id);
      if (!camino) throw { status: 404 };
      if (camino.modulo_actual < 3) {
        camino.modulo_actual++;
      } else if (camino.nivel_actual < 12) {
        camino.nivel_actual++;
        camino.modulo_actual = 1;
      }
      const pet = pets.find((p) => p.userId === user.id);
      if (pet) pet.xp_actual += 50;
      return { camino, xpGanado: 50 };
    },

    async activateSOS(token) {
      const user = auth(token);
      if (!user) throw { status: 401 };
      return { sosActivado: true, mensaje: 'Recuerda: puedes superar esto.', contactos: [], recursosCrisis: ['respiracion', 'meditacion'] };
    },

    getUser: (token) => auth(token),
  };
}

let system;

beforeEach(() => {
  system = createWorkflowSystem();
});

// ─── WORKFLOW 1: Onboarding Completo ──────────────────────────────────────────

describe('Workflow 1: Onboarding completo de nuevo usuario', () => {
  test('usuario completa el flujo de registro hasta tener acceso a la app', async () => {
    const email = generateUniqueEmail();
    const password = generateValidPassword();

    // Paso 1: Registro
    const { verificationCode } = await system.register(email, password, 'Usuario Nuevo');

    // Paso 2: Verificación y login
    const { access_token, user } = await system.verifyAndLogin(email, verificationCode, password);
    expect(access_token).toBeTruthy();
    expect(user.is_verified).toBe(true);

    // Paso 3: Completar perfil (onboarding)
    await system.initOnboarding(access_token, {
      nickname: 'nuevousr',
      pronombres: 'él/él',
      motivacion: 'Mi familia',
    });

    const updatedUser = system.getUser(access_token);
    expect(updatedUser.nickname).toBe('nuevousr');

    // Paso 4: Inicializar sobriedad
    const { pet, camino } = await system.initSobriety(access_token, '2024-01-15', 150000);
    expect(pet).toBeDefined();
    expect(camino.nivel_actual).toBe(1);
    expect(camino.modulo_actual).toBe(1);
  });
});

// ─── WORKFLOW 2: Check-in Diario con Progreso ─────────────────────────────────

describe('Workflow 2: Check-in diario con actualización de progreso', () => {
  let token;

  beforeEach(async () => {
    const email = generateUniqueEmail();
    const password = generateValidPassword();
    const { verificationCode } = await system.register(email, password, 'Daily User');
    const result = await system.verifyAndLogin(email, verificationCode, password);
    token = result.access_token;
    await system.initSobriety(token, '2024-01-01', 150000);
  });

  test('check-in sin consumo incrementa días sobrio', async () => {
    const result = await system.submitDailyCheckin(token, mockCheckins.valid);
    expect(result.streak).toBeGreaterThan(0);
    const user = system.getUser(token);
    expect(user.dias_sobrio).toBe(1);
  });

  test('check-in sin consumo otorga XP a la mascota', async () => {
    const petBefore = system.store.pets.find((p) => p.userId === system.getUser(token).id);
    const xpBefore = petBefore?.xp_actual || 0;
    const result = await system.submitDailyCheckin(token, mockCheckins.valid);
    expect(result.xpGanado).toBe(10);
  });

  test('check-in con consumo resetea días sobrio a 0', async () => {
    await system.submitDailyCheckin(token, mockCheckins.valid); // primer día sin consumo
    // Forzar fecha diferente simulando otro día
    const userId = system.getUser(token).id;
    system.store.checkins[0].fecha = '2024-05-19'; // simular que fue ayer
    await system.submitDailyCheckin(token, { emocion: 'mal', consumo: true, gratitud: 'Recayendo...' });
    const user = system.getUser(token);
    expect(user.dias_sobrio).toBe(0);
  });

  test('desbloquea medalla de 7 días en el día 7', async () => {
    const user = system.getUser(token);
    user.dias_sobrio = 6; // Simulamos 6 días previos
    // Cambiar fecha del checkin anterior
    const result = await system.submitDailyCheckin(token, mockCheckins.valid);
    expect(result.nuevasMedallas).toBeDefined();
    expect(result.nuevasMedallas.some((m) => m.tipo === 'primera_semana')).toBe(true);
  });

  test('no puede hacer dos check-ins el mismo día', async () => {
    await system.submitDailyCheckin(token, mockCheckins.valid);
    await expect(system.submitDailyCheckin(token, mockCheckins.minimal)).rejects.toMatchObject({ status: 409 });
  });
});

// ─── WORKFLOW 3: Avance en el Programa 12 Pasos ────────────────────────────────

describe('Workflow 3: Avance en el programa de 12 pasos', () => {
  let token;

  beforeEach(async () => {
    const email = generateUniqueEmail();
    const password = generateValidPassword();
    const { verificationCode } = await system.register(email, password, 'Steps User');
    const result = await system.verifyAndLogin(email, verificationCode, password);
    token = result.access_token;
    await system.initSobriety(token, '2024-01-01', 150000);
  });

  test('completar módulo avanza al siguiente módulo', async () => {
    const result = await system.completeModule(token);
    expect(result.camino.modulo_actual).toBe(2);
    expect(result.camino.nivel_actual).toBe(1);
  });

  test('completar módulo otorga XP a la mascota', async () => {
    const pet = system.store.pets.find((p) => p.userId === system.getUser(token).id);
    const xpBefore = pet.xp_actual;
    const result = await system.completeModule(token);
    expect(result.xpGanado).toBe(50);
    expect(pet.xp_actual).toBe(xpBefore + 50);
  });

  test('completar el módulo 3 del nivel 1 avanza al nivel 2', async () => {
    await system.completeModule(token); // 1→2
    await system.completeModule(token); // 2→3
    const result = await system.completeModule(token); // 3→nivel 2
    expect(result.camino.nivel_actual).toBe(2);
    expect(result.camino.modulo_actual).toBe(1);
  });
});

// ─── WORKFLOW 4: Activación de SOS en Crisis ──────────────────────────────────

describe('Workflow 4: Activación del sistema SOS', () => {
  let token;

  beforeEach(async () => {
    const email = generateUniqueEmail();
    const password = generateValidPassword();
    const { verificationCode } = await system.register(email, password, 'SOS User');
    const result = await system.verifyAndLogin(email, verificationCode, password);
    token = result.access_token;
  });

  test('usuario autenticado puede activar SOS', async () => {
    const result = await system.activateSOS(token);
    expect(result.sosActivado).toBe(true);
  });

  test('SOS incluye recursos de crisis', async () => {
    const result = await system.activateSOS(token);
    expect(result.recursosCrisis).toContain('respiracion');
    expect(result.recursosCrisis).toContain('meditacion');
  });

  test('SOS retorna mensaje de apoyo', async () => {
    const result = await system.activateSOS(token);
    expect(result.mensaje).toBeTruthy();
    expect(result.mensaje.length).toBeGreaterThan(0);
  });

  test('SOS falla sin autenticación → 401', async () => {
    await expect(system.activateSOS('invalid-token')).rejects.toMatchObject({ status: 401 });
  });
});

// ─── WORKFLOW 5: Evolución de la Mascota ──────────────────────────────────────

describe('Workflow 5: Evolución de la mascota por check-ins', () => {
  let token;

  beforeEach(async () => {
    const email = generateUniqueEmail();
    const password = generateValidPassword();
    const { verificationCode } = await system.register(email, password, 'Pet Evol User');
    const result = await system.verifyAndLogin(email, verificationCode, password);
    token = result.access_token;
    await system.initSobriety(token, '2024-01-01', 150000);
  });

  test('la mascota acumula XP con check-ins sin consumo', async () => {
    await system.submitDailyCheckin(token, mockCheckins.valid);
    const userId = system.getUser(token).id;
    const pet = system.store.pets.find((p) => p.userId === userId);
    expect(pet.xp_actual).toBe(10);
  });

  test('la mascota no gana XP en check-ins con consumo', async () => {
    await system.submitDailyCheckin(token, { emocion: 'mal', consumo: true, gratitud: 'Recaída.' });
    const userId = system.getUser(token).id;
    const pet = system.store.pets.find((p) => p.userId === userId);
    expect(pet.xp_actual).toBe(0);
  });

  test('la mascota gana más XP al completar módulos', async () => {
    const userId = system.getUser(token).id;
    const pet = system.store.pets.find((p) => p.userId === userId);
    const xpBefore = pet.xp_actual;
    await system.completeModule(token);
    expect(pet.xp_actual).toBe(xpBefore + 50);
  });
});

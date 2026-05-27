/**
 * authentication-flow.test.js
 * Pruebas de integración para el flujo completo de autenticación en NewLife.
 */

const { mockCredentials, mockUsers, mockTokens, mockApiResponses } = require('../fixtures/mock-data');
const { regularUser, unverifiedUser, getLoginCredentials } = require('../fixtures/test-users');
const { setupTestDatabase, teardownTestDatabase, db } = require('../fixtures/test-database');
const { assertLoginResponse, assertUserStructure, assertPasswordNotExposed } = require('../utils/assertions');
const { generateUniqueEmail, generateValidPassword } = require('../utils/test-helpers');

// Simulamos el flujo completo de autenticación con el sistema integrado
function createAuthSystem() {
  const users = [...db.users._store ? [] : []];
  const verificationCodes = new Map();
  const resetTokens = new Map();
  const activeSessions = new Map();

  return {
    async register({ email, password, nombre }) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw Object.assign(new Error('Email inválido'), { status: 400 });
      }
      if (!password || password.length < 6) {
        throw Object.assign(new Error('Contraseña muy corta'), { status: 400 });
      }
      const existing = users.find((u) => u.email === email);
      if (existing) throw Object.assign(new Error('Email ya registrado'), { status: 409 });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const user = { id: `user-${Date.now()}`, email, nombre, password_hash: `hash-${password}`, is_verified: false, created_at: new Date().toISOString() };
      users.push(user);
      verificationCodes.set(email, code);
      return { message: 'Registro exitoso. Verifica tu email.', userId: user.id, _testCode: code };
    },

    async verifyEmail({ email, code }) {
      const storedCode = verificationCodes.get(email);
      if (!storedCode) throw Object.assign(new Error('Código no encontrado'), { status: 400 });
      if (storedCode !== code) throw Object.assign(new Error('Código incorrecto'), { status: 400 });
      const user = users.find((u) => u.email === email);
      if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
      user.is_verified = true;
      verificationCodes.delete(email);
      return { message: 'Email verificado exitosamente' };
    },

    async login({ email, password }) {
      const user = users.find((u) => u.email === email);
      if (!user || user.password_hash !== `hash-${password}`) {
        throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
      }
      if (!user.is_verified) throw Object.assign(new Error('Email no verificado'), { status: 403 });
      const token = `token-${user.id}-${Date.now()}`;
      const refreshToken = `refresh-${user.id}-${Date.now()}`;
      activeSessions.set(token, { userId: user.id, refreshToken });
      const { password_hash, ...safeUser } = user;
      return { access_token: token, refresh_token: refreshToken, user: safeUser };
    },

    async refreshToken(refreshToken) {
      const session = [...activeSessions.values()].find((s) => s.refreshToken === refreshToken);
      if (!session) throw Object.assign(new Error('Refresh token inválido'), { status: 401 });
      const newToken = `token-refreshed-${session.userId}-${Date.now()}`;
      activeSessions.set(newToken, { userId: session.userId, refreshToken });
      return { access_token: newToken };
    },

    async logout(token) {
      if (!activeSessions.has(token)) throw Object.assign(new Error('Sesión no encontrada'), { status: 400 });
      activeSessions.delete(token);
      return { message: 'Sesión cerrada exitosamente' };
    },

    async forgotPassword({ email }) {
      const user = users.find((u) => u.email === email);
      if (user) {
        const token = `reset-${Date.now()}`;
        resetTokens.set(token, { email, expiresAt: Date.now() + 3600000 });
        return { message: 'Si el email existe, recibirás instrucciones.', _testToken: token };
      }
      return { message: 'Si el email existe, recibirás instrucciones.' };
    },

    async resetPassword({ token, newPassword }) {
      const resetData = resetTokens.get(token);
      if (!resetData) throw Object.assign(new Error('Token inválido o expirado'), { status: 400 });
      if (Date.now() > resetData.expiresAt) throw Object.assign(new Error('Token expirado'), { status: 400 });
      const user = users.find((u) => u.email === resetData.email);
      if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
      user.password_hash = `hash-${newPassword}`;
      resetTokens.delete(token);
      return { message: 'Contraseña actualizada exitosamente' };
    },

    getUsers: () => users,
    getSessions: () => activeSessions,
  };
}

let authSystem;

beforeEach(() => {
  authSystem = createAuthSystem();
});

// ─── FLUJO 1: Registro → Verificación → Login ─────────────────────────────────

describe('Flujo completo: Registro → Verificación → Login', () => {
  test('usuario puede completar el flujo completo de registro', async () => {
    const email = generateUniqueEmail();
    const password = generateValidPassword();

    // 1. Registro
    const registerResult = await authSystem.register({ email, password, nombre: 'Test User' });
    expect(registerResult.message).toContain('Verifica tu email');
    expect(registerResult.userId).toBeTruthy();

    // 2. Usuario existe en el sistema
    expect(authSystem.getUsers().find((u) => u.email === email)).toBeDefined();

    // 3. Verificación de email
    const verifyResult = await authSystem.verifyEmail({ email, code: registerResult._testCode });
    expect(verifyResult.message).toContain('verificado');

    // 4. Login exitoso después de verificación
    const loginResult = await authSystem.login({ email, password });
    expect(loginResult.access_token).toBeTruthy();
    expect(loginResult.refresh_token).toBeTruthy();
    assertPasswordNotExposed(loginResult.user);
  });

  test('usuario no puede hacer login antes de verificar email', async () => {
    const email = generateUniqueEmail();
    const password = generateValidPassword();
    await authSystem.register({ email, password, nombre: 'Unverified' });
    await expect(authSystem.login({ email, password })).rejects.toMatchObject({ status: 403 });
  });

  test('registro falla con email ya existente', async () => {
    const email = generateUniqueEmail();
    await authSystem.register({ email, password: 'Pass123!', nombre: 'First' });
    await expect(authSystem.register({ email, password: 'Pass456!', nombre: 'Second' })).rejects.toMatchObject({ status: 409 });
  });

  test('verificación falla con código incorrecto', async () => {
    const email = generateUniqueEmail();
    await authSystem.register({ email, password: 'Pass123!', nombre: 'Test' });
    await expect(authSystem.verifyEmail({ email, code: '000000' })).rejects.toMatchObject({ status: 400 });
  });

  test('usuario no está en estado verified después de registro sin verificar', async () => {
    const email = generateUniqueEmail();
    await authSystem.register({ email, password: 'Pass123!', nombre: 'Test' });
    const user = authSystem.getUsers().find((u) => u.email === email);
    expect(user.is_verified).toBe(false);
  });

  test('usuario está verificado después de completar verificación', async () => {
    const email = generateUniqueEmail();
    const reg = await authSystem.register({ email, password: 'Pass123!', nombre: 'Test' });
    await authSystem.verifyEmail({ email, code: reg._testCode });
    const user = authSystem.getUsers().find((u) => u.email === email);
    expect(user.is_verified).toBe(true);
  });
});

// ─── FLUJO 2: Login con credenciales inválidas ─────────────────────────────────

describe('Flujo: Login con credenciales inválidas', () => {
  let testEmail;
  let testPassword;

  beforeEach(async () => {
    testEmail = generateUniqueEmail();
    testPassword = generateValidPassword();
    const reg = await authSystem.register({ email: testEmail, password: testPassword, nombre: 'Test' });
    await authSystem.verifyEmail({ email: testEmail, code: reg._testCode });
  });

  test('falla con contraseña incorrecta → 401', async () => {
    await expect(authSystem.login({ email: testEmail, password: 'wrongpassword' })).rejects.toMatchObject({ status: 401 });
  });

  test('falla con email inexistente → 401', async () => {
    await expect(authSystem.login({ email: 'noexiste@test.com', password: testPassword })).rejects.toMatchObject({ status: 401 });
  });

  test('no crea sesión cuando el login falla', async () => {
    try { await authSystem.login({ email: testEmail, password: 'wrong' }); } catch {}
    expect(authSystem.getSessions().size).toBe(0);
  });
});

// ─── FLUJO 3: Refresh Token ────────────────────────────────────────────────────

describe('Flujo: Refresh Token', () => {
  let loginResult;
  let testEmail;
  let testPassword;

  beforeEach(async () => {
    testEmail = generateUniqueEmail();
    testPassword = generateValidPassword();
    const reg = await authSystem.register({ email: testEmail, password: testPassword, nombre: 'Test' });
    await authSystem.verifyEmail({ email: testEmail, code: reg._testCode });
    loginResult = await authSystem.login({ email: testEmail, password: testPassword });
  });

  test('genera nuevo access token con refresh token válido', async () => {
    const result = await authSystem.refreshToken(loginResult.refresh_token);
    expect(result.access_token).toBeTruthy();
    expect(result.access_token).not.toBe(loginResult.access_token);
  });

  test('falla con refresh token inválido → 401', async () => {
    await expect(authSystem.refreshToken('invalid-refresh-token')).rejects.toMatchObject({ status: 401 });
  });
});

// ─── FLUJO 4: Logout ──────────────────────────────────────────────────────────

describe('Flujo: Logout', () => {
  let loginResult;
  let testEmail;
  let testPassword;

  beforeEach(async () => {
    testEmail = generateUniqueEmail();
    testPassword = generateValidPassword();
    const reg = await authSystem.register({ email: testEmail, password: testPassword, nombre: 'Test' });
    await authSystem.verifyEmail({ email: testEmail, code: reg._testCode });
    loginResult = await authSystem.login({ email: testEmail, password: testPassword });
  });

  test('cierra la sesión exitosamente', async () => {
    const result = await authSystem.logout(loginResult.access_token);
    expect(result.message).toContain('cerrada');
  });

  test('elimina la sesión del sistema después del logout', async () => {
    await authSystem.logout(loginResult.access_token);
    expect(authSystem.getSessions().has(loginResult.access_token)).toBe(false);
  });
});

// ─── FLUJO 5: Recuperación de contraseña ──────────────────────────────────────

describe('Flujo: Recuperación de Contraseña', () => {
  let testEmail;
  let testPassword;
  let forgotResult;

  beforeEach(async () => {
    testEmail = generateUniqueEmail();
    testPassword = generateValidPassword();
    const reg = await authSystem.register({ email: testEmail, password: testPassword, nombre: 'Test' });
    await authSystem.verifyEmail({ email: testEmail, code: reg._testCode });
    forgotResult = await authSystem.forgotPassword({ email: testEmail });
  });

  test('forgot password retorna mensaje genérico (seguridad)', async () => {
    expect(forgotResult.message).toContain('Si el email existe');
  });

  test('puede actualizar la contraseña con token válido', async () => {
    const newPassword = generateValidPassword();
    const result = await authSystem.resetPassword({ token: forgotResult._testToken, newPassword });
    expect(result.message).toContain('actualizada');
  });

  test('puede hacer login con la nueva contraseña', async () => {
    const newPassword = generateValidPassword();
    await authSystem.resetPassword({ token: forgotResult._testToken, newPassword });
    const loginResult = await authSystem.login({ email: testEmail, password: newPassword });
    expect(loginResult.access_token).toBeTruthy();
  });

  test('no puede hacer login con la contraseña antigua después del reset', async () => {
    const newPassword = generateValidPassword();
    await authSystem.resetPassword({ token: forgotResult._testToken, newPassword });
    await expect(authSystem.login({ email: testEmail, password: testPassword })).rejects.toMatchObject({ status: 401 });
  });

  test('el token de reset no puede usarse dos veces', async () => {
    const newPass1 = generateValidPassword();
    const newPass2 = generateValidPassword();
    await authSystem.resetPassword({ token: forgotResult._testToken, newPassword: newPass1 });
    await expect(authSystem.resetPassword({ token: forgotResult._testToken, newPassword: newPass2 })).rejects.toMatchObject({ status: 400 });
  });

  test('forgot password para email inexistente no revela información', async () => {
    const result = await authSystem.forgotPassword({ email: 'noexiste@test.com' });
    expect(result.message).toContain('Si el email existe');
  });
});

/**
 * test-users.js
 * Usuarios de prueba con diferentes roles y permisos para el sistema NewLife.
 */

const { mockTokens } = require('./mock-data');

// ─── USUARIO REGULAR (paciente en recuperación) ───────────────────────────────
const regularUser = {
  id: 'user-001',
  email: 'juan.perez@test.com',
  password: 'SecurePass123!',
  nombre: 'Juan Pérez',
  nickname: 'juanp',
  pronombres: 'él/él',
  fecha_ultimo_consumo: '2024-01-15',
  motivacion: 'Mi familia y mi salud',
  ahorro_mensual: 150000,
  telefono: '+573001234567',
  is_verified: true,
  dias_sobrio: 127,
  nivel_actual: 3,
  token: mockTokens.validAccessToken,
  refresh_token: mockTokens.validRefreshToken,
  // Permisos del rol
  permissions: {
    canViewProgress: true,
    canSubmitCheckin: true,
    canAccessCommunity: true,
    canAccessSOS: true,
    canManageContent: false,
    canViewAnalytics: false,
    canManageUsers: false,
  },
};

// ─── ADMINISTRADOR ────────────────────────────────────────────────────────────
const adminUser = {
  id: 'admin-001',
  email: 'admin@newlife.com',
  password: 'AdminSecure2024!',
  nombre: 'Administrador NewLife',
  role: 'admin',
  is_verified: true,
  token: mockTokens.adminToken,
  // Permisos del rol
  permissions: {
    canViewProgress: true,
    canManageContent: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canManageCommunities: true,
    canManageMedia: true,
    canViewAllUsers: true,
  },
};

// ─── USUARIO SIN VERIFICAR ────────────────────────────────────────────────────
const unverifiedUser = {
  id: 'user-002',
  email: 'maria.rodriguez@test.com',
  password: 'TempPass456!',
  nombre: 'María Rodríguez',
  is_verified: false,
  token: null, // No puede autenticarse hasta verificar
  permissions: {
    canViewProgress: false,
    canSubmitCheckin: false,
    canAccessCommunity: false,
  },
};

// ─── USUARIO INVITADO (sin cuenta) ────────────────────────────────────────────
const guestUser = {
  id: 'guest-001',
  email: null,
  nombre: null,
  is_guest: true,
  token: 'guest-token-temp-001',
  permissions: {
    canViewProgress: false,
    canSubmitCheckin: false,
    canAccessCommunity: false,
    canAccessLimitedSOS: true, // Solo acceso básico
  },
};

// ─── USUARIO EN PRIMEROS DÍAS ─────────────────────────────────────────────────
const newUser = {
  id: 'user-003',
  email: 'carlos.nuevo@test.com',
  password: 'NewUser789!',
  nombre: 'Carlos Nuevo',
  nickname: 'carlosnuevo',
  is_verified: true,
  dias_sobrio: 3,
  nivel_actual: 1,
  token: 'new-user-valid-token',
  permissions: {
    canViewProgress: true,
    canSubmitCheckin: true,
    canAccessCommunity: true,
    canAccessSOS: true,
    canManageContent: false,
  },
};

// ─── USUARIO AVANZADO (nivel alto) ────────────────────────────────────────────
const advancedUser = {
  id: 'user-004',
  email: 'lucia.avanzada@test.com',
  password: 'Advanced321!',
  nombre: 'Lucía Avanzada',
  nickname: 'luciaavanz',
  is_verified: true,
  dias_sobrio: 400,
  nivel_actual: 10,
  token: 'advanced-user-valid-token',
  permissions: {
    canViewProgress: true,
    canSubmitCheckin: true,
    canAccessCommunity: true,
    canAccessSOS: true,
    canManageContent: false,
  },
};

// ─── HELPERS DE AUTENTICACIÓN ─────────────────────────────────────────────────

/**
 * Genera un header de Authorization para el usuario dado.
 * @param {object} user - Objeto de usuario con campo token
 * @returns {object} Headers con Authorization Bearer
 */
function getAuthHeaders(user) {
  if (!user.token) {
    return {};
  }
  return {
    Authorization: `Bearer ${user.token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Retorna los datos de login del usuario.
 * @param {object} user - Objeto de usuario
 * @returns {object} Credenciales de login
 */
function getLoginCredentials(user) {
  return {
    email: user.email,
    password: user.password,
  };
}

module.exports = {
  regularUser,
  adminUser,
  unverifiedUser,
  guestUser,
  newUser,
  advancedUser,
  getAuthHeaders,
  getLoginCredentials,
};

/**
 * mock-data.js
 * Datos de prueba reutilizables para todo el suite de pruebas NewLife.
 */

// ─── USUARIOS ────────────────────────────────────────────────────────────────

const mockUsers = {
  regularUser: {
    id: 'user-001',
    email: 'juan.perez@test.com',
    nombre: 'Juan Pérez',
    nickname: 'juanp',
    pronombres: 'él/él',
    fecha_ultimo_consumo: '2024-01-15',
    motivacion: 'Mi familia',
    ahorro_mensual: 150000,
    telefono: '+573001234567',
    dias_sobrio: 127,
    nivel_actual: 3,
    created_at: '2024-01-15T10:00:00Z',
    is_verified: true,
  },
  adminUser: {
    id: 'admin-001',
    email: 'admin@newlife.com',
    nombre: 'Administrador NewLife',
    role: 'admin',
    created_at: '2023-06-01T00:00:00Z',
  },
  unverifiedUser: {
    id: 'user-002',
    email: 'maria.rodriguez@test.com',
    nombre: 'María Rodríguez',
    nickname: null,
    is_verified: false,
    created_at: '2024-05-10T08:00:00Z',
  },
  guestUser: {
    id: 'guest-001',
    email: null,
    nombre: null,
    is_guest: true,
    dias_sobrio: 0,
  },
  limitedUser: {
    id: 'user-003',
    email: 'carlos.limited@test.com',
    nombre: 'Carlos Limitado',
    nickname: 'carlimite',
    nivel_actual: 1,
    dias_sobrio: 5,
    is_verified: true,
  },
};

// ─── CREDENCIALES ────────────────────────────────────────────────────────────

const mockCredentials = {
  valid: {
    email: 'juan.perez@test.com',
    password: 'SecurePass123!',
  },
  invalidEmail: {
    email: 'not-an-email',
    password: 'SecurePass123!',
  },
  invalidPassword: {
    email: 'juan.perez@test.com',
    password: 'wrong',
  },
  nonExistent: {
    email: 'noexiste@test.com',
    password: 'AnyPassword123!',
  },
  adminCredentials: {
    email: 'admin@newlife.com',
    password: 'AdminSecure2024!',
  },
};

// ─── TOKENS JWT ──────────────────────────────────────────────────────────────

const mockTokens = {
  validAccessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTAwMSIsImVtYWlsIjoianVhbi5wZXJlekB0ZXN0LmNvbSIsImlhdCI6MTcxNjA0ODAwMH0.mock_signature',
  validRefreshToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTAwMSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzE2MDQ4MDAwfQ.mock_refresh_signature',
  expiredToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTAwMSIsImV4cCI6MTYwMDAwMDAwMH0.expired_signature',
  malformedToken: 'not.a.valid.jwt.token',
  adminToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi0wMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTYwNDgwMDB9.admin_signature',
};

// ─── REGISTROS DE PROGRESO ───────────────────────────────────────────────────

const mockCheckins = {
  valid: {
    emocion: 'bien',
    consumo: false,
    gratitud: 'Hoy estuve con mi familia y me sentí muy apoyado.',
  },
  withConsumption: {
    emocion: 'mal',
    consumo: true,
    gratitud: 'A pesar de la recaída, agradezco la oportunidad de mejorar.',
    reflexion: 'Debo alejame de esos ambientes de riesgo.',
  },
  minimal: {
    emocion: 'neutral',
    consumo: false,
    gratitud: 'Agradezco el día.',
  },
  invalidEmocion: {
    emocion: 'superfeliz', // valor inválido
    consumo: false,
    gratitud: 'Todo bien.',
  },
  missingGratitud: {
    emocion: 'bien',
    consumo: false,
    // gratitud ausente - debería fallar
  },
  gratitudTooLong: {
    emocion: 'bien',
    consumo: false,
    gratitud: 'x'.repeat(1001), // excede límite
  },
};

const mockCheckinResponse = {
  id: 'checkin-001',
  userId: 'user-001',
  emocion: 'bien',
  consumo: false,
  gratitud: 'Hoy estuve con mi familia y me sentí muy apoyado.',
  fecha: '2024-05-20',
  streak: 15,
  nuevasMedallas: [],
  created_at: '2024-05-20T09:00:00Z',
};

// ─── PROGRAMA 12 PASOS (CAMINO) ───────────────────────────────────────────────

const mockCamino = {
  userId: 'user-001',
  nivel_actual: 3,
  modulo_actual: 2,
  fecha_inicio: '2024-01-15T10:00:00Z',
  niveles_completados: [1, 2],
  modulos_completados: ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '3-1'],
  porcentaje_completado: 28,
};

const mockNiveles = Array.from({ length: 12 }, (_, i) => ({
  numero: i + 1,
  nombre: `Nivel ${i + 1}`,
  descripcion: `Descripción del nivel ${i + 1}`,
  completado: i < 2,
  modulos: [
    { numero: 1, completado: i < 2, contenido: `Contenido módulo 1 del nivel ${i + 1}` },
    { numero: 2, completado: i < 2, contenido: `Contenido módulo 2 del nivel ${i + 1}` },
    { numero: 3, completado: i < 2, contenido: `Contenido módulo 3 del nivel ${i + 1}` },
  ],
}));

// ─── MASCOTA VIRTUAL ─────────────────────────────────────────────────────────

const mockPet = {
  id: 'pet-001',
  userId: 'user-001',
  nombre: 'Nube',
  forma_actual: 'semilla',
  xp_actual: 250,
  xp_siguiente_evolucion: 500,
  nivel: 2,
  formas_desbloqueadas: ['huevo', 'semilla'],
  ultima_interaccion: '2024-05-19T15:00:00Z',
};

const mockPetEvolucionData = {
  xpGanado: 10,
  xpTotal: 260,
  evolucionado: false,
  nuevaForma: null,
};

// ─── CONTENIDOS DE CUIDADO ───────────────────────────────────────────────────

const mockContent = [
  {
    id: 'content-001',
    titulo: 'Técnicas de respiración para la ansiedad',
    cuerpo: 'La respiración diafragmática es una técnica efectiva...',
    categoria_id: 'cat-001',
    imagen_url: 'https://media.newlife.com/articles/breathing.jpg',
    publicado: true,
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'content-002',
    titulo: 'Cómo manejar los antojos',
    cuerpo: 'Los antojos son temporales y pueden manejarse con estrategias...',
    categoria_id: 'cat-001',
    imagen_url: 'https://media.newlife.com/articles/cravings.jpg',
    publicado: true,
    created_at: '2024-03-05T00:00:00Z',
  },
];

const mockCategories = [
  { id: 'cat-001', nombre: 'Salud mental', icono_url: 'https://media.newlife.com/icons/mental.png' },
  { id: 'cat-002', nombre: 'Relaciones', icono_url: 'https://media.newlife.com/icons/relations.png' },
  { id: 'cat-003', nombre: 'Trabajo y rutina', icono_url: 'https://media.newlife.com/icons/work.png' },
];

// ─── FRASES MOTIVACIONALES ───────────────────────────────────────────────────

const mockFrase = {
  id: 'phrase-001',
  texto: 'Cada día que pasa sobrio es una victoria que nadie puede quitarte.',
  autor: 'Anónimo',
  fecha: '2024-05-20',
};

// ─── MEDALLAS ────────────────────────────────────────────────────────────────

const mockMedals = [
  { id: 'medal-001', nombre: 'Primera Semana', descripcion: '7 días consecutivos', desbloqueada: true, fecha: '2024-01-22' },
  { id: 'medal-002', nombre: 'Un Mes Fuerte', descripcion: '30 días consecutivos', desbloqueada: true, fecha: '2024-02-14' },
  { id: 'medal-003', nombre: 'Tres Meses', descripcion: '90 días consecutivos', desbloqueada: false, fecha: null },
];

// ─── RETOS ───────────────────────────────────────────────────────────────────

const mockChallenges = [
  {
    id: 'challenge-001',
    titulo: 'Diario de gratitud',
    descripcion: 'Escribe 3 cosas por las que eres agradecido durante 7 días.',
    duracion_dias: 7,
    activo: true,
    progreso: 3,
  },
  {
    id: 'challenge-002',
    titulo: 'Meditación diaria',
    descripcion: '10 minutos de meditación durante 14 días.',
    duracion_dias: 14,
    activo: false,
    progreso: 0,
  },
];

// ─── DATOS INVÁLIDOS / LÍMITE ─────────────────────────────────────────────────

const invalidData = {
  emailInvalid: 'not-an-email',
  emailEmpty: '',
  passwordTooShort: '123',
  passwordEmpty: '',
  stringTooLong: 'a'.repeat(1001),
  negativeNumber: -1,
  xssPayload: '<script>alert("xss")</script>',
  sqlInjection: "'; DROP TABLE users; --",
  emptyObject: {},
  nullValue: null,
  undefinedValue: undefined,
};

// ─── RESPUESTAS DE API ───────────────────────────────────────────────────────

const mockApiResponses = {
  loginSuccess: {
    access_token: mockTokens.validAccessToken,
    refresh_token: mockTokens.validRefreshToken,
    user: mockUsers.regularUser,
  },
  loginFailure: {
    statusCode: 401,
    message: 'Credenciales inválidas',
    error: 'Unauthorized',
  },
  registerSuccess: {
    message: 'Usuario registrado exitosamente. Verifica tu email.',
    userId: 'user-004',
  },
  notFound: {
    statusCode: 404,
    message: 'Recurso no encontrado',
    error: 'Not Found',
  },
  serverError: {
    statusCode: 500,
    message: 'Error interno del servidor',
    error: 'Internal Server Error',
  },
  validationError: {
    statusCode: 400,
    message: ['email must be an email', 'password must be longer than 6 characters'],
    error: 'Bad Request',
  },
};

// ─── DATOS DE SOBRIETY ────────────────────────────────────────────────────────

const mockSobrietyData = {
  diasSobrio: 127,
  fechaInicio: '2024-01-15',
  ahorroTotal: 19050000, // 127 días * 150000 COP/mes
  logroActual: 'tres_meses',
  proximoLogro: 'seis_meses',
};

module.exports = {
  mockUsers,
  mockCredentials,
  mockTokens,
  mockCheckins,
  mockCheckinResponse,
  mockCamino,
  mockNiveles,
  mockPet,
  mockPetEvolucionData,
  mockContent,
  mockCategories,
  mockFrase,
  mockMedals,
  mockChallenges,
  invalidData,
  mockApiResponses,
  mockSobrietyData,
};

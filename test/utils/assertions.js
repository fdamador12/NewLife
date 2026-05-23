/**
 * assertions.js
 * Aserciones personalizadas para el suite de pruebas NewLife.
 */

// ─── RESPUESTAS DE API ────────────────────────────────────────────────────────

/**
 * Verifica que un objeto tenga la estructura estándar de respuesta de la API NewLife.
 * @param {object} response - Respuesta de la API
 */
function assertValidApiResponse(response) {
  expect(response).toBeDefined();
  expect(response).not.toBeNull();
  // La respuesta puede ser un objeto de datos o un wrapper con statusCode
  expect(typeof response).toBe('object');
}

/**
 * Verifica que una respuesta de error tenga la estructura correcta de NestJS.
 * @param {object} error - Objeto de error
 * @param {number} expectedStatus - Código HTTP esperado
 */
function assertErrorResponse(error, expectedStatus) {
  expect(error).toBeDefined();
  expect(error.statusCode || error.status).toBe(expectedStatus);
  expect(error.message).toBeDefined();
}

/**
 * Verifica que un objeto de respuesta de login tenga los campos requeridos.
 * @param {object} loginResponse - Respuesta del endpoint de login
 */
function assertLoginResponse(loginResponse) {
  expect(loginResponse).toHaveProperty('access_token');
  expect(loginResponse).toHaveProperty('refresh_token');
  expect(typeof loginResponse.access_token).toBe('string');
  expect(typeof loginResponse.refresh_token).toBe('string');
  expect(loginResponse.access_token.length).toBeGreaterThan(20);
}

// ─── OBJETOS DE USUARIO ───────────────────────────────────────────────────────

/**
 * Verifica que un objeto usuario tenga todos los campos requeridos.
 * @param {object} user - Objeto de usuario
 */
function assertUserStructure(user) {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('nombre');
  expect(typeof user.id).toBe('string');
  // El email debe ser un string válido o null (usuario invitado)
  if (user.email !== null) {
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }
}

/**
 * Verifica que el password NO esté expuesto en el objeto usuario.
 * @param {object} user - Objeto de usuario
 */
function assertPasswordNotExposed(user) {
  expect(user).not.toHaveProperty('password');
  expect(user).not.toHaveProperty('password_hash');
  expect(user).not.toHaveProperty('passwordHash');
}

// ─── OBJETOS DE PROGRESO ──────────────────────────────────────────────────────

/**
 * Verifica la estructura de un objeto check-in.
 * @param {object} checkin - Objeto de check-in
 */
function assertCheckinStructure(checkin) {
  expect(checkin).toHaveProperty('id');
  expect(checkin).toHaveProperty('emocion');
  expect(checkin).toHaveProperty('consumo');
  expect(checkin).toHaveProperty('gratitud');
  expect(checkin).toHaveProperty('fecha');
  expect(['bien', 'mal', 'neutral', 'muy_bien', 'muy_mal']).toContain(checkin.emocion);
  expect(typeof checkin.consumo).toBe('boolean');
}

/**
 * Verifica que el streaks sea un número no negativo.
 * @param {object} response - Respuesta con streak
 */
function assertStreakIsValid(response) {
  expect(response).toHaveProperty('streak');
  expect(typeof response.streak).toBe('number');
  expect(response.streak).toBeGreaterThanOrEqual(0);
}

// ─── OBJETOS DE MASCOTA ───────────────────────────────────────────────────────

/**
 * Verifica la estructura de un objeto mascota.
 * @param {object} pet - Objeto mascota
 */
function assertPetStructure(pet) {
  expect(pet).toHaveProperty('id');
  expect(pet).toHaveProperty('userId');
  expect(pet).toHaveProperty('forma_actual');
  expect(pet).toHaveProperty('xp_actual');
  expect(pet).toHaveProperty('nivel');
  expect(typeof pet.xp_actual).toBe('number');
  expect(pet.xp_actual).toBeGreaterThanOrEqual(0);
  expect(typeof pet.nivel).toBe('number');
  expect(pet.nivel).toBeGreaterThanOrEqual(1);
}

// ─── PERMISOS ─────────────────────────────────────────────────────────────────

/**
 * Verifica que una llamada a recurso protegido fue rechazada correctamente.
 * @param {Function} apiCall - Función async que realiza la llamada
 */
async function assertUnauthorizedAccess(apiCall) {
  let threw = false;
  let status = null;
  try {
    await apiCall();
  } catch (err) {
    threw = true;
    status = err.status || err.statusCode || (err.response && err.response.status);
  }
  expect(threw).toBe(true);
  expect(status).toBe(401);
}

/**
 * Verifica que una acción de usuario sin permisos sea rechazada con 403.
 * @param {Function} apiCall - Función async que realiza la llamada
 */
async function assertForbiddenAccess(apiCall) {
  let threw = false;
  let status = null;
  try {
    await apiCall();
  } catch (err) {
    threw = true;
    status = err.status || err.statusCode || (err.response && err.response.status);
  }
  expect(threw).toBe(true);
  expect(status).toBe(403);
}

// ─── BASE DE DATOS ────────────────────────────────────────────────────────────

/**
 * Verifica que un registro exista en el store de prueba.
 * @param {Array} collection - Colección del store
 * @param {object} criteria - Criterios de búsqueda
 */
function assertExistsInDb(collection, criteria) {
  const found = collection.find((item) =>
    Object.keys(criteria).every((key) => item[key] === criteria[key])
  );
  expect(found).toBeDefined();
  return found;
}

/**
 * Verifica que un registro NO exista en el store de prueba.
 * @param {Array} collection - Colección del store
 * @param {object} criteria - Criterios de búsqueda
 */
function assertNotExistsInDb(collection, criteria) {
  const found = collection.find((item) =>
    Object.keys(criteria).every((key) => item[key] === criteria[key])
  );
  expect(found).toBeUndefined();
}

// ─── CONTENIDO ────────────────────────────────────────────────────────────────

/**
 * Verifica la estructura de un objeto de contenido.
 * @param {object} content - Objeto de contenido/artículo
 */
function assertContentStructure(content) {
  expect(content).toHaveProperty('id');
  expect(content).toHaveProperty('titulo');
  expect(content).toHaveProperty('cuerpo');
  expect(typeof content.titulo).toBe('string');
  expect(content.titulo.length).toBeGreaterThan(0);
}

module.exports = {
  assertValidApiResponse,
  assertErrorResponse,
  assertLoginResponse,
  assertUserStructure,
  assertPasswordNotExposed,
  assertCheckinStructure,
  assertStreakIsValid,
  assertPetStructure,
  assertUnauthorizedAccess,
  assertForbiddenAccess,
  assertExistsInDb,
  assertNotExistsInDb,
  assertContentStructure,
};

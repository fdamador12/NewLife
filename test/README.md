# NewLife — Suite de Pruebas

Documentación completa de la infraestructura de pruebas del proyecto NewLife.

---

## Tabla de Contenidos

1. [Estructura de directorios](#estructura-de-directorios)
2. [Cómo ejecutar las pruebas](#cómo-ejecutar-las-pruebas)
3. [Ejecución por módulo](#ejecución-por-módulo)
4. [Cobertura de código](#cobertura-de-código)
5. [Convenciones de nombres](#convenciones-de-nombres)
6. [Crear nuevas pruebas](#crear-nuevas-pruebas)
7. [Fixtures y utilidades](#fixtures-y-utilidades)
8. [Comandos útiles](#comandos-útiles)
9. [Troubleshooting](#troubleshooting)

---

## Estructura de directorios

```
test/
├── README.md                          ← este archivo
│
├── fixtures/                          ← datos compartidos y mocks globales
│   ├── mock-data.js                   ← datos de prueba: usuarios, check-ins, contenido, etc.
│   ├── test-users.js                  ← perfiles de usuario con permisos y helpers
│   └── test-database.js               ← simulación en memoria de Roble DB + factory de mocks
│
├── utils/                             ← utilidades reutilizables
│   ├── test-helpers.js                ← fábricas de objetos mock (request, response, context)
│   ├── assertions.js                  ← aserciones semánticas personalizadas
│   └── setup.js                       ← configuración global de Jest (matchers, mocks, env vars)
│
├── unit/
│   ├── backend/
│   │   ├── validators.test.js         ← DTOs con class-validator (RegisterDto, LoginDto, etc.)
│   │   ├── services.test.js           ← AuthService, ProgressService, PetService, MotivationService
│   │   ├── controllers.test.js        ← AuthController, ProgressController, PetController, AdminAuthController
│   │   ├── middleware.test.js         ← JwtAuthGuard, AdminAuthGuard, ValidationPipe, LoggingMiddleware
│   │   ├── models.test.js             ← entidades de dominio: Usuario, DailyCheckin, Pet, Camino
│   │   └── utils.test.js              ← funciones utilitarias: sobriety, savings, analytics, media
│   │
│   └── frontend/
│       ├── services.test.js           ← authService, progressService, cacheService
│       ├── hooks.test.js              ← useCacheQuery, useLevelProgress, useTrackScreen
│       ├── utils.test.js              ← parseApiError, formatSobrietyTime, validateLoginForm, formatCurrency
│       └── components.test.js         ← lógica de pantallas: Login, DailyCheckIn, Pet, SOS
│
└── integration/
    ├── authentication-flow.test.js    ← flujo completo de registro, verificación y login
    ├── api-endpoints.test.js          ← todos los endpoints del Mobile API
    ├── error-handling.test.js         ← manejo de errores 400/401/403/404/409/500 y red
    ├── workflows.test.js              ← flujos de negocio end-to-end
    ├── data-persistence.test.js       ← CRUD y consistencia en la capa de datos
    └── external-services.test.js      ← Roble DB, MinIO y Socket.io
```

---

## Cómo ejecutar las pruebas

### Requisitos previos

```bash
node --version   # ≥ 20.x
npm --version    # ≥ 10.x
```

Las pruebas **no requieren** ningún servicio externo en ejecución (sin Roble DB, sin MinIO, sin Docker). Todo usa mocks en memoria.

### Todas las pruebas

```bash
npm test
```

### Modo watch (desarrollo)

```bash
npm run test:watch
```

### Una sola ejecución sin watch

```bash
npm test -- --watchAll=false
```

---

## Ejecución por módulo

### Solo pruebas unitarias

```bash
# Todo el bloque unitario
npm test -- --testPathPattern="test/unit"

# Solo backend
npm test -- --testPathPattern="test/unit/backend"

# Solo frontend
npm test -- --testPathPattern="test/unit/frontend"
```

### Solo pruebas de integración

```bash
npm test -- --testPathPattern="test/integration"
```

### Un archivo específico

```bash
npm test -- --testPathPattern="validators.test"
npm test -- --testPathPattern="authentication-flow.test"
npm test -- --testPathPattern="workflows.test"
```

### Un `describe` o `test` específico

```bash
# Por nombre de suite
npm test -- --testNamePattern="AuthService"

# Por nombre de test
npm test -- --testNamePattern="retorna 401 cuando no hay token"
```

---

## Cobertura de código

### Generar reporte de cobertura

```bash
npm test -- --coverage --watchAll=false
```

El reporte se genera en `coverage/` con formato HTML (`coverage/lcov-report/index.html`) y texto en consola.

### Cobertura solo de un módulo

```bash
npm test -- --coverage --testPathPattern="unit/backend" --watchAll=false
```

### Umbrales mínimos recomendados

| Tipo           | Líneas | Funciones | Ramas |
|----------------|--------|-----------|-------|
| Backend unit   | 80 %   | 85 %      | 75 %  |
| Frontend unit  | 75 %   | 80 %      | 70 %  |
| Integración    | 65 %   | 70 %      | 60 %  |

---

## Convenciones de nombres

### Archivos

- `<modulo>.test.js` — prueba unitaria de un módulo
- `<flujo>-flow.test.js` — prueba de integración de flujo completo
- `<categoria>.test.js` — prueba de integración por categoría

### Suites (`describe`)

```
[Tipo]: [Módulo o Recurso]
```

Ejemplos:
- `AuthService — login()`
- `DailyCheckinDto — validación`
- `Workflow 2: Check-in diario con actualización de progreso`
- `Errores 401 — No Autenticado`

### Tests individuales (`test` / `it`)

Descripción en español, voz activa, sin artículos de relleno:

```
retorna 401 cuando no hay token
crea check-in para usuario autenticado
propaga error cuando Roble DB no está disponible
```

### Variables en tests

| Propósito             | Nombre sugerido              |
|-----------------------|------------------------------|
| Sistema bajo prueba   | `sut`, `service`, `api`      |
| Datos de entrada      | `input`, `payload`, `body`   |
| Resultado esperado    | `expected`                   |
| Resultado real        | `result`, `actual`           |
| Usuario autenticado   | `user`, `authUser`           |
| Token de prueba       | `token`, `authHeader`        |

---

## Crear nuevas pruebas

### Prueba unitaria de servicio backend

```javascript
// test/unit/backend/services.test.js  (agregar al archivo existente)

describe('NuevoServicio — metodo()', () => {
  let service;
  let depMock;

  beforeEach(() => {
    depMock = { find: jest.fn(), save: jest.fn() };
    service = new NuevoServicio(depMock);
  });

  test('descripción clara del comportamiento esperado', async () => {
    depMock.find.mockResolvedValueOnce({ id: '1', nombre: 'Test' });
    const result = await service.metodo('1');
    expect(result.nombre).toBe('Test');
    expect(depMock.find).toHaveBeenCalledWith('1');
  });
});
```

### Prueba unitaria de hook frontend

```javascript
// test/unit/frontend/hooks.test.js  (agregar al archivo existente)

describe('useNuevoHook', () => {
  test('retorna estado inicial correcto', () => {
    // Implementar el hook como función pura para testear su lógica
    const hookLogic = createHookLogic();
    expect(hookLogic.state).toEqual({ loading: false, data: null });
  });
});
```

### Prueba de integración de endpoint

```javascript
// test/integration/api-endpoints.test.js  (agregar al archivo existente)

describe('GET /nuevo/endpoint', () => {
  test('retorna datos para usuario autenticado', async () => {
    const loginResult = await registerAndLogin(`test${Date.now()}@t.com`, 'Pass123!', 'Test');
    const token = `Bearer ${loginResult.access_token}`;
    const result = await api.GET_nuevo_endpoint(token);
    expect(Array.isArray(result)).toBe(true);
  });
});
```

### Plantilla de test mínimo

```javascript
describe('[Módulo] — [función/comportamiento]', () => {
  // Setup (si aplica)
  let sut;
  beforeEach(() => {
    sut = createSystemUnderTest();
  });

  test('[descripción en español del comportamiento]', async () => {
    // Arrange
    const input = { /* datos de entrada */ };

    // Act
    const result = await sut.doSomething(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.campo).toBe('valor esperado');
  });
});
```

---

## Fixtures y utilidades

### mock-data.js — Objetos de datos reutilizables

```javascript
const { mockUsers, mockCheckins, mockContent } = require('../fixtures/mock-data');

// mockUsers.regularUser       → usuario verificado estándar
// mockUsers.adminUser         → usuario con rol admin
// mockUsers.unverifiedUser    → usuario sin verificar email
// mockCheckins.valid          → check-in válido sin consumo
// mockCheckins.withConsumption → check-in con consumo = true
// mockContent                 → arreglo con artículos publicados
// mockCategories              → arreglo con categorías
// invalidData.sqlInjection    → payload de prueba SQL injection
// invalidData.xssPayload      → payload de prueba XSS
```

### test-database.js — Base de datos en memoria

```javascript
const { db, resetTestDatabase } = require('../fixtures/test-database');

beforeEach(async () => { await resetTestDatabase(); });

// Operaciones disponibles:
db.users.create({ email, nombre, password_hash, is_verified })
db.users.findById(id)
db.users.findByEmail(email)
db.users.update(id, changes)
db.users.delete(id)
db.users.count()

db.checkins.create({ userId, emocion, consumo, gratitud })
db.checkins.findByUserId(userId)
db.checkins.findToday(userId)
db.checkins.count(userId)

db.pets.findByUserId(userId)
db.pets.update(userId, changes)

db.content.findAll()           // solo publicados
db.content.findById(id)
db.content.findByCategory(categoriaId)
db.content.create(data)
db.content.update(id, changes)
db.content.delete(id)
```

### test-helpers.js — Fábricas de objetos

```javascript
const {
  createMockRequest,
  createMockResponse,
  getMockToken,
  generateUniqueEmail,
  generateValidPassword,
  getTodayString,
  getPastDate,
  getFutureDate,
} = require('../utils/test-helpers');

// Uso típico en pruebas de guard/middleware:
const req = createMockRequest({ user: { id: 'user-001' } });
const res = createMockResponse();

// Generar datos únicos:
const email = generateUniqueEmail();    // test-1716300000000@test.com
const pass = generateValidPassword();   // TestPass123!abc1716...

// Fechas:
getTodayString()        // '2026-05-21'
getPastDate(7)          // fecha hace 7 días
getFutureDate(30)       // fecha en 30 días
```

### assertions.js — Aserciones semánticas

```javascript
const {
  assertUserStructure,
  assertCheckinStructure,
  assertPetStructure,
  assertContentStructure,
  assertLoginResponse,
  assertErrorResponse,
  assertExistsInDb,
  assertNotExistsInDb,
  assertPasswordNotExposed,
  assertUnauthorizedAccess,
} = require('../utils/assertions');

// Ejemplo:
const user = await api.GET_me(token);
assertUserStructure(user);           // verifica campos obligatorios
assertPasswordNotExposed(user);      // confirma que no hay password_hash en la respuesta
```

### Matchers personalizados (setup.js)

```javascript
// Disponibles en todos los tests automáticamente:
expect(token).toBeValidJWT();                // verifica formato header.payload.firma
expect(30).toBeValidSobrietyDays();          // número ≥ 0
expect('user@example.com').toBeValidEmail(); // formato email válido
```

---

## Comandos útiles

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar con cobertura
npm test -- --coverage --watchAll=false

# Ejecutar un archivo
npm test -- --testPathPattern="services.test"

# Ejecutar por nombre de suite o test
npm test -- --testNamePattern="AuthService"

# Ejecutar en modo verbose (muestra cada test individualmente)
npm test -- --verbose --watchAll=false

# Ejecutar solo los tests que fallaron en la última ejecución
npm test -- --onlyFailures

# Actualizar snapshots (si se usan)
npm test -- --updateSnapshot

# Limpiar caché de Jest
npx jest --clearCache

# Ver configuración de Jest
npx jest --showConfig

# Depurar un test (Node.js inspector)
node --inspect-brk node_modules/.bin/jest --runInBand --testPathPattern="nombre.test"
```

---

## Troubleshooting

### `Cannot find module '../fixtures/mock-data'`

Verifica que el `require` usa la ruta relativa correcta desde el archivo de test. Todos los imports de fixtures usan paths relativos (`../fixtures/...`, `../utils/...`).

### `jest is not defined`

Asegúrate de que `setupFilesAfterFramework` en `jest.config.js` o `package.json` apunta a `test/utils/setup.js`. El archivo `setup.js` declara los mocks globales de jest.

### Tests de integración fallan con `ReferenceError: navigator is not defined`

`error-handling.test.js` referencia `navigator?.onLine`. En entorno Node.js esto es `undefined`, lo que hace que la función retorne el mensaje por defecto. Este comportamiento es esperado y los tests están diseñados para ello.

### `Timeout — Async callback was not invoked within the 10000ms timeout`

Algún mock no resuelve su promesa. Verifica que los mocks de jest (`.mockResolvedValueOnce`, `.mockRejectedValueOnce`) estén correctamente configurados. El timeout global está en `test/utils/setup.js`.

### Tests de componentes fallan con errores de React Native

Los tests de componentes en `test/unit/frontend/components.test.js` prueban la **lógica pura** extraída de los componentes, no el render. No se necesita `@testing-library/react-native`. Si el test intenta importar un componente real de React Native, mueve la lógica a una función pura o usa un mock manual.

### `SyntaxError: Cannot use import statement in a module`

La suite usa CommonJS (`require`/`module.exports`). Si algún archivo fuente usa ES Modules (`import/export`), configura `transformIgnorePatterns` en `jest.config.js` o agrega `babel.config.js` con `@babel/preset-env` en modo `commonjs`.

### Pruebas lentas (>5s por archivo)

- Verifica que ningún test llama a servicios reales de red.
- Asegúrate de que `jest.clearAllMocks()` corre en `beforeEach` (configurado en `setup.js`).
- Usa `--runInBand` para detectar si hay interferencia entre tests paralelos.

### Cobertura baja en un módulo específico

```bash
npm test -- --coverage --collectCoverageFrom="src/mobile-api/src/modules/[modulo]/**/*.ts" --watchAll=false
```

Esto muestra exactamente qué líneas del módulo no están cubiertas.

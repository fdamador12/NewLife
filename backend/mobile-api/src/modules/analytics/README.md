# Sistema de Analytics — NewLife

## Tabla de contenidos

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Motivación y problema a resolver](#2-motivación-y-problema-a-resolver)
3. [Filosofía y principios de diseño](#3-filosofía-y-principios-de-diseño)
4. [Arquitectura general del sistema](#4-arquitectura-general-del-sistema)
5. [Stack tecnológico completo](#5-stack-tecnológico-completo)
6. [Anatomía de un evento](#6-anatomía-de-un-evento)
7. [Sistema de anonimización: hash SHA-256 con sal](#7-sistema-de-anonimización-hash-sha-256-con-sal)
8. [Frontend móvil: instrumentación](#8-frontend-móvil-instrumentación)
9. [Backend mobile-api: ingesta de eventos](#9-backend-mobile-api-ingesta-de-eventos)
10. [Backend admin-api: consultas y agregaciones](#10-backend-admin-api-consultas-y-agregaciones)
11. [Frontend admin web: dashboard de visualización](#11-frontend-admin-web-dashboard-de-visualización)
12. [Catálogo completo de los 36 eventos](#12-catálogo-completo-de-los-36-eventos)
13. [Flujo de un evento end-to-end](#13-flujo-de-un-evento-end-to-end)
14. [KPIs principales](#14-kpis-principales)
15. [Cumplimiento legal y privacidad](#15-cumplimiento-legal-y-privacidad)
16. [Decisiones de diseño importantes](#16-decisiones-de-diseño-importantes)
17. [Flujo de pruebas completo](#17-flujo-de-pruebas-completo)

---

## 1. Resumen ejecutivo

NewLife implementa un sistema de analytics **propio y anónimo** diseñado desde cero, sin depender de proveedores externos como Google Analytics, Firebase, Meta Pixel o Mixpanel. Esta decisión se tomó por:

- **Cumplimiento estricto** de la Ley 1581 de 2012 de Colombia (datos sensibles de salud).
- **Protección de la población vulnerable** (jóvenes en proceso de rehabilitación).
- **Control total** sobre qué se mide, cómo se almacena y cómo se usa.

El sistema captura **36 tipos de eventos** organizados en **8 categorías** (sesión, navegación, crisis, contenido, cuidado, gamificación, progreso, retos), todos asociados a un identificador anónimo derivado del usuario mediante un proceso criptográfico irreversible (SHA-256 + sal secreta).

El stack consta de cuatro capas:

1. **Frontend móvil** (React Native/Expo): instrumenta acciones del usuario y envía eventos.
2. **Backend mobile-api** (NestJS): valida e ingiere eventos en ROBLE.
3. **Backend admin-api** (NestJS): consulta y agrega eventos para el panel admin.
4. **Frontend admin web** (Next.js + Recharts): visualiza métricas en dashboard.

---

## 2. Motivación y problema a resolver

### El problema

Las apps de salud mental y rehabilitación enfrentan un dilema fundamental:
- **Necesitan datos** para mejorar la experiencia y entender qué funciona realmente.
- **Sus usuarios son vulnerables**: comparten información extremadamente sensible (consumo de sustancias, recaídas, ideación de crisis).
- **Las herramientas de mercado** (Google Analytics, Firebase, Mixpanel) son intrínsecamente incompatibles con esta sensibilidad, porque:
  - Envían datos a servidores en el extranjero.
  - Vinculan eventos con identificadores publicitarios.
  - Permiten cross-tracking entre apps.
  - Sus términos de servicio reservan derechos de uso secundario de los datos.

### La solución

Construir un sistema de analytics **completamente interno** donde:
- Los datos nunca salen de la infraestructura de OPENLAB/ROBLE.
- El identificador del usuario es matemáticamente irreversible.
- Los datos sensibles (consumo, recaídas, estado emocional) NUNCA se trackean.
- Solo se miden patrones de uso agregables y útiles para mejorar el producto.

---

## 3. Filosofía y principios de diseño

Cinco principios rigen todo el sistema:

### 3.1 Privacidad por diseño (Privacy by Design)

> El `user_id` del usuario nunca se almacena junto al evento. En su lugar, se almacena un **hash criptográfico irreversible** generado con SHA-256 + sal secreta. Esto permite agrupar eventos del mismo usuario (para calcular DAU, funnels, etc.) sin poder identificar a esa persona específica.

### 3.2 Solo usuarios autenticados (login-only)

> Los usuarios en modo **invitado** NUNCA se trackean. Si la app no encuentra un JWT en `AsyncStorage`, descarta el evento silenciosamente. Esto cumple el principio legal de **consentimiento informado**: el usuario solo es trackeado después de aceptar la política de privacidad durante el registro.

### 3.3 Fire-and-forget (no bloquea la UI)

> El track de eventos se ejecuta de forma asíncrona. Si el servidor está caído, lento o devuelve error, la app sigue funcionando con normalidad. El usuario nunca espera por analytics. Solo en modo desarrollo (`__DEV__`) se loggean errores.

### 3.4 Lista blanca (whitelist) de eventos

> El backend mantiene una lista cerrada de 36 `event_types` permitidos. Si el cliente envía un tipo de evento que no está en esta lista, el backend responde con HTTP 400. Esto previene:
> - Inyección maliciosa de eventos arbitrarios.
> - Eventos basura por bugs en el cliente.
> - Crecimiento descontrolado del catálogo.

### 3.5 Categorías automáticas (no confiar en el cliente)

> El cliente solo envía el `event_type` (ej. `sos_triggered`). El backend asigna automáticamente la categoría (`crisis`) según un mapa interno. Esto evita:
> - Inconsistencias (ej. el mismo evento clasificado de dos formas).
> - Manipulación del cliente.
> - Sincronización manual.

---

## 4. Arquitectura general del sistema

```
┌──────────────────────────────────────────────────────────────────┐
│  CLIENTE MÓVIL                                                   │
│  React Native + Expo                                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Pantallas (HomeScreen, SOSScreen, BreathingScreen, etc.)   │  │
│  │   ↓ analytics.track(EVENT_TYPES.X, properties)             │  │
│  │ Servicio analytics/                                        │  │
│  │   ├─ event-types.ts (catálogo de 36 eventos)               │  │
│  │   ├─ session.ts (manejo de session_id, UUID v4)            │  │
│  │   ├─ analytics.ts (track + retry + AsyncStorage queue)     │  │
│  │   └─ api-client.ts (HTTP a mobile-api)                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────────────┘
                   │ POST /analytics/events (con JWT del usuario)
                   ↓
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND mobile-api (puerto 5181)                                │
│  NestJS + Clean Architecture                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ AnalyticsController                                        │  │
│  │   ↓ valida JWT, extrae user_id                             │  │
│  │ TrackEventUseCase                                          │  │
│  │   ├─ Valida event_type contra whitelist (36 tipos)         │  │
│  │   ├─ UserHashService.hashUserId(user_id) → SHA-256 + sal   │  │
│  │   ├─ Asigna event_category automáticamente                 │  │
│  │   ├─ Genera event_id (UUID v4)                             │  │
│  │   └─ Persiste vía AnalyticsStoragePort                     │  │
│  │ AnalyticsRobleAdapter                                      │  │
│  │   ↓ Inserta en tabla `analytics_events` con master token   │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────────────────┐
│  ROBLE (Backend-as-a-Service de OPENLAB)                         │
│  Tabla: analytics_events                                         │
│  Columnas: event_id, event_type, event_category, user_id_hash,   │
│            session_id, app_version, properties (JSON), created_at│
└──────────────────┬───────────────────────────────────────────────┘
                   │ (consulta de lectura)
                   ↑
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND admin-api (puerto 5180)                                 │
│  NestJS + Clean Architecture + Cache 5min                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ AnalyticsController (9 endpoints)                          │  │
│  │   ├─ /overview (resumen general)                           │  │
│  │   ├─ /dau-mau (usuarios activos)                           │  │
│  │   ├─ /funnel-sos (funnel de crisis)                        │  │
│  │   ├─ /funnel-checkin (funnel de checkin diario)            │  │
│  │   ├─ /top-content (contenido más visto)                    │  │
│  │   ├─ /search-queries (búsquedas y zeros)                   │  │
│  │   ├─ /level-progress (avance 12 pasos)                     │  │
│  │   ├─ /challenge-stats (estadísticas de retos)              │  │
│  │   └─ /event-timeline (timeline por evento)                 │  │
│  │ Use cases que consultan ROBLE + caché en memoria           │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────────────┘
                   │ HTTP GET con JWT del admin
                   ↓
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND admin-web (Next.js, puerto 5182)                       │
│  /analytics (ruta protegida del panel admin)                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Componentes Recharts:                                      │  │
│  │   ├─ OverviewCards (4 KPIs principales)                    │  │
│  │   ├─ DAUMAUChart (línea temporal)                          │  │
│  │   ├─ SOSFunnelChart (funnel barra)                         │  │
│  │   ├─ TopContentTable (ranking)                             │  │
│  │   ├─ SearchQueriesTable (con badges de "sin resultados")   │  │
│  │   ├─ LevelProgressChart (radar/barras apiladas)            │  │
│  │   └─ ChallengeStatsChart (por dificultad)                  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Stack tecnológico completo

### Frontend móvil
- **Framework**: React Native con Expo SDK 50+
- **Lenguaje**: TypeScript
- **HTTP client**: Axios con interceptor de JWT
- **Storage local**: AsyncStorage
- **Estado de sesión**: variable de módulo (in-memory) en `session.ts`
- **UUID**: implementación custom sin librerías externas

### Backend mobile-api
- **Framework**: NestJS 10
- **Lenguaje**: TypeScript
- **Arquitectura**: Clean Architecture (Domain / Application / Infrastructure / Presentation)
- **Validación**: `class-validator` + `class-transformer`
- **Hash**: módulo `crypto` nativo de Node.js
- **Auth**: JWT con guards de NestJS
- **Puerto**: 5181 (Docker), 3000 (interno)

### Backend admin-api
- **Framework**: NestJS 10
- **Lenguaje**: TypeScript
- **Caché**: in-memory con TTL de 5 minutos (`CacheModule`)
- **Auth**: JWT separado para admins
- **Puerto**: 5180 (Docker), 3001 (interno)

### Base de datos (ROBLE)
- **Proveedor**: OPENLAB ROBLE (Backend-as-a-Service interno de Uninorte)
- **Tipo**: API REST sobre PostgreSQL gestionado
- **Tabla principal**: `analytics_events`
- **Cifrado**: en tránsito (HTTPS/TLS) y en reposo (gestionado por OPENLAB)

### Frontend admin web
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **UI**: Tailwind CSS + componentes custom
- **Gráficos**: Recharts 2.x
- **Auth**: JWT del admin guardado en cookies HTTP-only
- **Puerto**: 5182 (Docker), 3000 (interno)

---

## 6. Anatomía de un evento

Cada evento guardado en ROBLE tiene esta estructura:

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "sos_triggered",
  "event_category": "crisis",
  "user_id_hash": "f7c3bc1d808e04732adf679965ccc34ca7ae3441",
  "session_id": "sess_a1b2c3d4-e5f6-4789-0abc-def012345678",
  "app_version": "1.1.0",
  "properties": { "source": "home_button" },
  "created_at": "2026-05-12T15:30:00.000Z"
}
```

### Campos explicados

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `event_id` | UUID v4 | Identificador único del evento. Generado por el backend al insertar. |
| `event_type` | string | Uno de los 36 tipos permitidos. Validado contra whitelist. |
| `event_category` | string | Asignado automáticamente por backend: `session`, `navigation`, `crisis`, `content`, `care`, `gamification`, `progress`. |
| `user_id_hash` | string (hex 64 chars) | Resultado de SHA-256(user_id + ANALYTICS_SALT). Irreversible. |
| `session_id` | string | UUID v4 generado por el frontend al iniciar sesión. Agrupa eventos de una misma sesión continua. |
| `app_version` | string | Versión de la app móvil (ej. "1.1.0"). |
| `properties` | JSON | Datos contextuales del evento. Estructura varía por tipo de evento. |
| `created_at` | ISO timestamp | Momento exacto del evento en el servidor. |

### Cómo ver `properties` en ROBLE

El Data Visualizer muestra el campo `properties` como `[object Object]`. Para ver el JSON real, hacer clic en el ícono de lápiz ✏️ de la fila para abrir el modal de detalle.

---

## 7. Sistema de anonimización: hash SHA-256 con sal

### El problema

Necesitamos agrupar eventos del mismo usuario para calcular métricas (¿cuántos usuarios usan el SOS por semana?), pero NO podemos guardar el `user_id` directamente, porque eso vincularía cada acción a una persona identificable.

### La solución: hash criptográfico con sal

```typescript
// backend/mobile-api/src/modules/analytics/infrastructure/services/user-hash.service.ts

import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class UserHashService {
  private readonly salt: string;

  constructor() {
    this.salt = process.env.ANALYTICS_SALT || '';
    if (!this.salt) {
      throw new Error('ANALYTICS_SALT no está configurado');
    }
  }

  hashUserId(userId: string): string {
    return createHash('sha256')
      .update(userId + this.salt)
      .digest('hex');
  }
}
```

### Por qué SHA-256 + sal es la elección correcta

| Propiedad | Garantía |
|-----------|----------|
| **Determinismo** | El mismo `user_id` siempre produce el mismo hash → permite agrupar eventos. |
| **Irreversibilidad** | Imposible recuperar el `user_id` original del hash. |
| **Resistencia a ataques de diccionario** | La sal aleatoria de 64 caracteres hace inviable un ataque de fuerza bruta. |
| **Resistencia a colisiones** | SHA-256 tiene 2^256 valores posibles. La probabilidad de colisión es negligible. |
| **Velocidad** | Hash en ~1ms, sin afectar performance. |

### La sal secreta (ANALYTICS_SALT)

La sal es una cadena aleatoria de 64 caracteres hexadecimales:

```
c90b7c3591065afcf49858926908b964389ccfc86e741ac8f8d9ccad50ea88af
```

Esta sal:
- Está en el archivo `.env` (NUNCA en el repositorio).
- Solo la conoce el backend.
- Si alguien obtiene la base de datos completa, NO puede revertir los hashes sin la sal.
- Si la sal cambia, los hashes ya guardados quedan "huérfanos" (no se vinculan con nuevos hashes del mismo usuario).

### Garantía matemática

> Sin la sal, un atacante con la BD completa enfrenta una búsqueda de 2^256 posibles `user_id`, lo cual es computacionalmente intratable (más que el número de átomos en el universo observable).

---

## 8. Frontend móvil: instrumentación

### Estructura del módulo de analytics

```
frontend/mobile/src/services/analytics/
├── index.ts              # Re-exports públicos
├── analytics.ts          # Función principal track()
├── event-types.ts        # Catálogo de los 36 EVENT_TYPES + SOS_OPTIONS + CONTACT_METHODS
├── session.ts            # Manejo de session_id (UUID + timeout 30min)
└── api-client.ts         # POST /analytics/events con JWT
```

### El archivo `event-types.ts` (catálogo del cliente)

```typescript
export const EVENT_TYPES = {
  // Sesión y autenticación
  APP_OPENED: 'app_opened',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',

  // Navegación general
  TAB_SWITCHED: 'tab_switched',

  // Crisis y SOS
  SOS_TRIGGERED: 'sos_triggered',
  SOS_OPTION_SELECTED: 'sos_option_selected',
  BREATHING_EXERCISE_STARTED: 'breathing_exercise_started',
  BREATHING_EXERCISE_COMPLETED: 'breathing_exercise_completed',
  ZEN_MODE_ENTERED: 'zen_mode_entered',

  // Meditaciones guiadas
  GUIDED_MEDITATION_STARTED: 'guided_meditation_started',
  GUIDED_MEDITATION_COMPLETED: 'guided_meditation_completed',

  // Frases diarias
  DAILY_PHRASE_VIEWED: 'daily_phrase_viewed',
  DAILY_PHRASE_FAVORITED: 'daily_phrase_favorited',

  // Contenido educativo
  CONTENT_LIST_VIEWED: 'content_list_viewed',
  CONTENT_VIEWED: 'content_viewed',
  CONTENT_FAVORITED: 'content_favorited',
  CONTENT_SEARCHED: 'content_searched',

  // Grupos de apoyo
  SUPPORT_GROUP_VIEWED: 'support_group_viewed',
  SUPPORT_GROUP_CONTACTED: 'support_group_contacted',

  // Contactos de emergencia
  EMERGENCY_CONTACTS_VIEWED: 'emergency_contacts_viewed',
  EMERGENCY_CONTACT_USED: 'emergency_contact_used',

  // Agenda
  AGENDA_VIEWED: 'agenda_viewed',
  AGENDA_EVENT_CREATED: 'agenda_event_created',

  // Mascota
  PET_VIEWED: 'pet_viewed',
  PET_EVOLVED: 'pet_evolved',

  // Checkin diario
  DAILY_CHECKIN_STARTED: 'daily_checkin_started',
  DAILY_CHECKIN_COMPLETED: 'daily_checkin_completed',

  // Niveles / 12 pasos
  LEVEL_STARTED: 'level_started',
  LEVEL_COMPLETED: 'level_completed',
  LEVEL_ABANDONED: 'level_abandoned',

  // Ahorro
  SAVINGS_VIEWED: 'savings_viewed',

  // Gratitud
  GRATITUDE_HISTORY_VIEWED: 'gratitude_history_viewed',

  // Analíticas personales
  PERSONAL_ANALYTICS_VIEWED: 'personal_analytics_viewed',

  // Retos
  CHALLENGE_VIEWED: 'challenge_viewed',
  CHALLENGE_JOINED: 'challenge_joined',
  CHALLENGE_COMPLETED: 'challenge_completed',
} as const;
```

### El archivo `session.ts` (manejo del session_id)

```typescript
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

let currentSessionId: string | null = null;
let lastActivityTimestamp: number = 0;

function generateUUID(): string {
  return 'sess_' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getSessionId(): string {
  const now = Date.now();

  // Si pasó mucho tiempo desde la última actividad, expira la sesión
  if (currentSessionId && now - lastActivityTimestamp > SESSION_TIMEOUT_MS) {
    currentSessionId = null;
  }

  if (!currentSessionId) {
    currentSessionId = generateUUID();
  }

  lastActivityTimestamp = now;
  return currentSessionId;
}

export function resetSession(): void {
  currentSessionId = null;
  lastActivityTimestamp = 0;
}
```

**Decisiones de diseño**:
- **In-memory**: el `session_id` vive solo en memoria (variable de módulo), no se persiste en AsyncStorage. Si el usuario cierra la app, la próxima sesión es nueva.
- **Timeout 30min**: si pasan más de 30 minutos sin actividad, la próxima llamada genera un nuevo `session_id`. Estándar de la industria (Google Analytics usa lo mismo).
- **Reset en logout**: `resetSession()` se llama explícitamente al hacer logout. Esto evita que eventos del usuario A se vinculen con sesión del usuario B en el mismo dispositivo.

### El archivo `analytics.ts` (función principal)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendEvent } from './api-client';
import { getSessionId } from './session';
import { EVENT_TYPES, EventType } from './event-types';

const APP_VERSION = '1.1.0'; // sincronizar con app.json

export const analytics = {
  async track(
    eventType: EventType,
    properties?: Record<string, unknown>
  ): Promise<void> {
    try {
      // 1. Verificar que el usuario está logueado
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        // Modo invitado: no trackeamos (privacidad por diseño)
        return;
      }

      // 2. Construir payload
      const payload = {
        event_type: eventType,
        session_id: getSessionId(),
        app_version: APP_VERSION,
        properties: properties ?? null,
      };

      // 3. Enviar (fire-and-forget, no bloquea UI)
      await sendEvent(payload, token);
    } catch (err) {
      // Solo log en desarrollo, no rompemos la app
      if (__DEV__) {
        console.warn('[analytics] Error tracking event:', err);
      }
    }
  },
};

export { EVENT_TYPES };
export type { EventType };
```

### Ejemplo de uso en una pantalla

```typescript
// En SOSScreen.tsx (al tocar "Ver contactos")
import { analytics, EVENT_TYPES, SOS_OPTIONS } from '../../../services/analytics';

const handleEmergencyContactsPress = () => {
  analytics.track(EVENT_TYPES.SOS_OPTION_SELECTED, {
    option: SOS_OPTIONS.EMERGENCY_CONTACTS,
  });
  navigation.navigate('EmergencyContacts', { source: 'sos' });
};
```

### Patrón fire-and-forget vs await crítico

La mayoría de eventos se trackean **sin esperar** (fire-and-forget):

```typescript
analytics.track(EVENT_TYPES.AGENDA_VIEWED); // no espera
```

Pero en casos donde el usuario puede salir de la app inmediatamente (llamada telefónica, abrir un enlace externo), se usa `await` para evitar race conditions:

```typescript
// En EmergencyContactsScreen, botón de llamada:
const callContact = async (phone: string) => {
  await analytics.track(EVENT_TYPES.EMERGENCY_CONTACT_USED, {
    contact_method: 'phone',
  });
  Linking.openURL(`tel:${phone}`); // saca al usuario de la app
};
```

---

## 9. Backend mobile-api: ingesta de eventos

### Arquitectura del módulo

```
backend/mobile-api/src/modules/analytics/
├── domain/
│   ├── entities/
│   │   └── analytics-event.entity.ts        # Modelo de dominio puro
│   ├── constants/
│   │   └── event-types.constant.ts          # Whitelist + mapa categorías
│   └── ports/
│       └── analytics-storage.port.ts        # Interfaz de persistencia
├── application/
│   └── use-cases/
│       └── track-event.use-case.ts          # Lógica de negocio
├── infrastructure/
│   ├── adapters/
│   │   └── analytics-roble.adapter.ts       # Implementa el port hacia ROBLE
│   └── services/
│       └── user-hash.service.ts             # SHA-256 + sal
└── presentation/
    ├── controllers/
    │   └── analytics.controller.ts          # POST /analytics/events
    └── dtos/
        └── track-event.dto.ts               # Validación de input
```

### El controller

```typescript
// presentation/controllers/analytics.controller.ts

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly trackEvent: TrackEventUseCase) {}

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Req() req: { user: { sub: string } },
    @Body() dto: TrackEventDto,
  ) {
    return this.trackEvent.execute({
      userId: req.user.sub, // del JWT
      eventType: dto.event_type,
      sessionId: dto.session_id,
      appVersion: dto.app_version,
      properties: dto.properties,
    });
  }
}
```

### El use case (núcleo del backend)

```typescript
// application/use-cases/track-event.use-case.ts

@Injectable()
export class TrackEventUseCase {
  constructor(
    @Inject(ANALYTICS_STORAGE_PORT)
    private readonly storage: IAnalyticsStoragePort,
    private readonly userHash: UserHashService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(input: TrackEventInput): Promise<{ event_id: string }> {
    // 1. Validar event_type contra whitelist (Set para O(1))
    if (!VALID_EVENT_TYPES.has(input.eventType)) {
      throw new BadRequestException(
        `Tipo de evento no permitido: "${input.eventType}"`,
      );
    }

    // 2. Hashear user_id con SHA-256 + sal
    let userIdHash: string;
    try {
      userIdHash = this.userHash.hashUserId(input.userId);
    } catch (err: any) {
      throw new BadRequestException('Configuración de analytics inválida');
    }

    // 3. Asignar categoría automáticamente
    const eventCategory = EVENT_TYPE_TO_CATEGORY[input.eventType];

    // 4. Construir entidad
    const event = new AnalyticsEvent({
      event_id: uuidv4(),
      event_type: input.eventType,
      event_category: eventCategory,
      user_id_hash: userIdHash,
      session_id: input.sessionId ?? null,
      app_version: input.appVersion ?? null,
      properties: input.properties ?? null,
      created_at: new Date().toISOString(),
    });

    // 5. Persistir con master token (no el del usuario)
    const masterToken = await this.systemAuth.getMasterToken();
    await this.storage.save(event, masterToken);

    return { event_id: event.event_id };
  }
}
```

### Por qué usamos master token para escribir

La tabla `analytics_events` en ROBLE no tiene Row-Level Security por usuario. La política de seguridad es:
- **Escritura**: solo el sistema (master token).
- **Lectura**: solo admins (validado en admin-api).
- **Los usuarios nunca leen esta tabla**.

Esto previene que un usuario malicioso intente leer eventos de otros usuarios.

### El adapter de ROBLE

```typescript
// infrastructure/adapters/analytics-roble.adapter.ts

@Injectable()
export class AnalyticsRobleAdapter implements IAnalyticsStoragePort {
  constructor(private readonly db: DatabaseService) {}

  async save(event: AnalyticsEvent, token: string): Promise<void> {
    await this.db.insert(
      'analytics_events',
      {
        event_id: event.event_id,
        event_type: event.event_type,
        event_category: event.event_category,
        user_id_hash: event.user_id_hash,
        session_id: event.session_id,
        app_version: event.app_version,
        properties: event.properties
          ? JSON.stringify(event.properties)
          : null,
        created_at: event.created_at,
      },
      token,
    );
  }
}
```

---

## 10. Backend admin-api: consultas y agregaciones

### Diferencia con mobile-api

| Aspecto | mobile-api | admin-api |
|---------|------------|-----------|
| **Propósito** | Ingerir eventos (escritura) | Consultar y agregar (lectura) |
| **Auth** | JWT de usuarios finales | JWT separado de admins |
| **Caché** | No (queremos inserción inmediata) | Sí, 5 minutos (queries pesadas) |
| **Puerto** | 5181 | 5180 |

### Los 9 endpoints

```
GET /analytics/overview               → KPIs principales (4 cards)
GET /analytics/dau-mau                → Usuarios activos diarios/mensuales
GET /analytics/funnel-sos             → Funnel completo del flujo SOS
GET /analytics/funnel-checkin         → Funnel del checkin diario
GET /analytics/top-content            → Top 10 contenido más visto
GET /analytics/search-queries         → Búsquedas (con detección de zeros)
GET /analytics/level-progress         → Avance del programa 12 pasos
GET /analytics/challenge-stats        → Estadísticas de retos por dificultad
GET /analytics/event-timeline         → Timeline de eventos en el tiempo
```

### Ejemplo: endpoint /overview

```typescript
// admin-api/src/modules/analytics/application/use-cases/get-overview.use-case.ts

@Injectable()
export class GetOverviewUseCase {
  constructor(
    private readonly db: DatabaseService,
    private readonly cache: AnalyticsCacheService,
  ) {}

  async execute(): Promise<OverviewDto> {
    const cached = this.cache.get('overview');
    if (cached) return cached;

    const events = await this.db.find('analytics_events', {});

    const totalEvents = events.length;
    const uniqueUsers = new Set(events.map(e => e.user_id_hash)).size;
    const uniqueSessions = new Set(events.map(e => e.session_id)).size;
    const sosCount = events.filter(e => e.event_type === 'sos_triggered').length;

    const result = {
      total_events: totalEvents,
      unique_users: uniqueUsers,
      unique_sessions: uniqueSessions,
      sos_count: sosCount,
      sos_rate: uniqueUsers > 0 ? (sosCount / uniqueUsers) : 0,
    };

    this.cache.set('overview', result, 5 * 60 * 1000); // 5min
    return result;
  }
}
```

### Sistema de caché en memoria

Como las queries son agregaciones pesadas sobre toda la tabla `analytics_events`, se implementó un caché simple en memoria:

```typescript
@Injectable()
export class AnalyticsCacheService {
  private cache = new Map<string, { value: any; expiresAt: number }>();

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: any, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) this.cache.delete(key);
    }
  }
}
```

**TTL de 5 minutos**: equilibra frescura de datos con performance. El admin no necesita datos en tiempo real; ver "qué pasó en los últimos 5 minutos" no aporta valor adicional a "qué pasó hoy".

---

## 11. Frontend admin web: dashboard de visualización

### Ruta y autenticación

El panel de analytics es accesible solo para usuarios con rol admin en `/analytics` del frontend admin web. La autenticación se valida con el JWT del admin en cookies HTTP-only.

### Estructura de componentes

```
frontend/web/app/analytics/
├── page.tsx                          # Página principal con tabs
├── components/
│   ├── OverviewCards.tsx             # 4 KPIs en cards
│   ├── DAUMAUChart.tsx               # Línea temporal
│   ├── SOSFunnelChart.tsx            # Funnel de barras
│   ├── CheckinFunnelChart.tsx        # Funnel de checkin
│   ├── TopContentTable.tsx           # Ranking de contenido
│   ├── SearchQueriesTable.tsx        # Búsquedas con badges
│   ├── LevelProgressChart.tsx        # Avance 12 pasos
│   ├── ChallengeStatsChart.tsx       # Retos por dificultad
│   └── EventTimelineChart.tsx        # Timeline general
├── hooks/
│   └── useAnalytics.ts               # Fetcher con SWR
└── lib/
    └── analyticsApi.ts               # Client HTTP
```

### Ejemplo de componente: SOSFunnelChart

```tsx
'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function SOSFunnelChart({ data }: { data: FunnelDataDto }) {
  const chartData = [
    { stage: 'SOS Activado', count: data.sos_triggered },
    { stage: 'Opción Elegida', count: data.option_selected },
    { stage: 'Ejercicio Iniciado', count: data.exercise_started },
    { stage: 'Ejercicio Completado', count: data.exercise_completed },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-bold mb-4">Funnel del SOS</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" />
          <YAxis type="category" dataKey="stage" width={150} />
          <Tooltip />
          <Bar dataKey="count" fill="#d4854a" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-500 mt-2">
        Tasa de completación: {((data.exercise_completed / data.sos_triggered) * 100).toFixed(1)}%
      </p>
    </div>
  );
}
```

### Cómo ven los admins el dashboard

El admin entra al panel y ve:

1. **Banner superior**: 4 cards con KPIs principales (total eventos, usuarios únicos, sesiones, tasa de SOS).
2. **Sección de actividad**: gráfico de DAU/MAU línea temporal.
3. **Sección de crisis**: funnel del SOS con tasas de conversión.
4. **Sección de progreso**: barras apiladas de avance por nivel del programa 12 pasos.
5. **Sección de contenido**: tabla con top 10 contenidos más vistos.
6. **Sección de búsquedas**: tabla con las búsquedas recientes, con badge rojo en las que devolvieron 0 resultados (insight para crear contenido faltante).
7. **Sección de retos**: barras agrupadas por dificultad (suave/moderada/intensa).

---

## 12. Catálogo completo de los 36 eventos

### Categoría 1: Sesión y autenticación (3 eventos)

#### `app_opened`
- **Categoría**: session
- **Cuándo**: Al cargar `App.tsx` por primera vez (apertura de la app).
- **Properties**: ninguna.
- **Útil para**: DAU (usuarios activos diarios), patrones de horario de uso.
- **Implementación**: `useEffect` en `App.tsx` al montar el componente raíz.

#### `user_logged_in`
- **Categoría**: session
- **Cuándo**: Después de una respuesta 200 de `/auth/login`.
- **Properties**: ninguna.
- **Útil para**: Conversión invitado → registrado, frecuencia de logins.
- **Implementación**: en el `useAuth` hook tras éxito de `loginUseCase`.

#### `user_logged_out`
- **Categoría**: session
- **Cuándo**: Al tocar "Cerrar sesión" en HomeScreen.
- **Properties**: ninguna.
- **Útil para**: Distinguir logout voluntario vs cierres abruptos.
- **Implementación**: `await analytics.track(...)` antes de borrar el token y llamar a `resetSession()`.

### Categoría 2: Navegación (1 evento)

#### `tab_switched`
- **Categoría**: navigation
- **Cuándo**: Al cambiar entre las 5 tabs principales (Home, Progreso, Motivación, Cuidado, Social). Solo si el tab destino es distinto al actual.
- **Properties**: `{ from_tab: "Home", to_tab: "Motivation" }`
- **Útil para**: Mapas de calor de navegación, flujos comunes entre módulos.
- **Implementación**: wrapper sobre `setActiveTab` en `MainScreen.tsx`.

> **Nota**: `screen_viewed` está en el catálogo del backend pero NO se implementó en el frontend por decisión de diseño (demasiado ruido para poca utilidad analítica).

### Categoría 3: Crisis y SOS (5 eventos)

#### `sos_triggered`
- **Categoría**: crisis
- **Cuándo**: Al tocar el botón rojo SOS en HomeScreen.
- **Properties**: `{ source: "home_button" }`
- **Útil para**: **KPI crítico** — frecuencia de momentos de crisis. Picos revelan situaciones colectivas (fechas especiales, fines de semana).

#### `sos_option_selected`
- **Categoría**: crisis
- **Cuándo**: Al elegir una opción del menú SOS (2 primarias + 3 sub-opciones).
- **Properties**: `{ option: "emergency_contacts" }`
- **Valores posibles**:
  - `emergency_contacts` (menú principal)
  - `crisis_mode` (menú principal)
  - `breathing` (sub-menú Modo Crisis)
  - `motivational_phrases` (sub-menú Modo Crisis)
  - `guided_meditation` (sub-menú Modo Crisis)
- **Útil para**: Funnel del SOS — ¿qué herramienta eligen en crisis?

#### `breathing_exercise_started`
- **Categoría**: crisis
- **Cuándo**: Al tocar el botón de play en BreathingScreen (transición pausado → activo).
- **Properties**: `{ sound_id: "uuid-del-sonido-elegido" }`
- **Útil para**: Sonidos preferidos para calmarse.

#### `breathing_exercise_completed`
- **Categoría**: crisis
- **Cuándo**: Al pausar/detener el ejercicio, **si duró al menos 1 ciclo completo** (13 segundos = inhala 4 + sostén 4 + exhala 5).
- **Properties**: `{ duration_seconds: 45, cycles_completed: 3 }`
- **Útil para**: Tasa de completación start → completed. Pruebas accidentales (<13s) se descartan intencionalmente.

#### `zen_mode_entered`
- **Categoría**: crisis
- **Cuándo**: Al montar BreathingScreen (el "modo zen").
- **Properties**: ninguna.
- **Útil para**: Diferenciar entradas por crisis vs curiosidad (cruzando con `sos_triggered` previo).

### Categoría 4: Meditaciones guiadas (2 eventos)

#### `guided_meditation_started`
- **Categoría**: content
- **Cuándo**: Al iniciar reproducción de una meditación en GuidedMeditationScreen.
- **Properties**: `{ meditation_id: "uuid", meditation_name: "Meditación de calma" }`
- **Útil para**: Ranking de meditaciones más populares.

#### `guided_meditation_completed`
- **Categoría**: content
- **Cuándo**: Cuando el progreso del audio llega al **95% o más**. Permite saltar los últimos segundos sin penalizar.
- **Properties**: `{ meditation_id: "uuid", duration_seconds: 590 }`
- **Útil para**: Calidad percibida de las meditaciones (mayor tasa de completación = mejor).

### Categoría 5: Frases motivacionales (2 eventos)

#### `daily_phrase_viewed`
- **Categoría**: content
- **Cuándo**: Cada vez que se carga la frase del día en alguna de las 3 pantallas que la muestran. **Sin dedup global** — cada visita cuenta.
- **Properties**: `{ phrase_id: "uuid", source: "motivation_tab" }`
- **Valores de `source`**:
  - `motivation_tab` (MotivationScreen, tab Motivación)
  - `daily_phrase_screen` (DailyPhraseScreen completa)
  - `motivational_phrases_screen` (historial — solo la frase de hoy)
- **Decisión de diseño**: NO dedupeamos porque si el usuario vuelve 5 veces a ver la frase, eso es engagement real y queremos medirlo honestamente.
- **Caso especial — Historial**: en MotivationalPhrasesScreen se muestra el histórico completo. Ahí solo se trackea la frase de hoy (índice 0), NO las frases viejas al scrollear (sería ruido excesivo).

#### `daily_phrase_favorited`
- **Categoría**: content
- **Cuándo**: Al marcar una frase como favorita. **Solo al AGREGAR**, no al quitar.
- **Properties**: `{ phrase_id: "uuid" }`
- **Útil para**: Identificar frases que más resuenan emocionalmente.

### Categoría 6: Contenido educativo (4 eventos)

#### `content_list_viewed`
- **Categoría**: content
- **Cuándo**: Al montar ContentScreen.
- **Properties**: ninguna.
- **Útil para**: Interés general en contenido educativo.

#### `content_viewed`
- **Categoría**: content
- **Cuándo**: Al abrir un artículo/video específico.
- **Properties**: `{ content_id: "uuid", content_type: "article", category: "ansiedad" }`
- **Útil para**: Ranking de contenidos más vistos por categoría.

#### `content_favorited`
- **Categoría**: content
- **Cuándo**: Al marcar contenido como favorito. Solo al agregar.
- **Properties**: `{ content_id: "uuid" }`
- **Útil para**: Contenido de alto valor (los que la gente quiere conservar).

#### `content_searched`
- **Categoría**: content
- **Cuándo**: **1.2 segundos** después de que el usuario deja de escribir en el buscador. No se trackea por cada tecla (debounce).
- **Properties**: `{ query_length: 8, results_count: 5, had_results: true }`
- **Privacy fix v1.1.0**: ANTES enviábamos el `query` completo (texto real). Por principio de minimización (Art. 4 Ley 1581), AHORA solo enviamos la longitud del término. Esto preserva el insight ("¿qué tan específicas son las búsquedas?") sin guardar texto que el usuario tipeó.
- **Útil para**: Detectar gaps de contenido (búsquedas con `had_results: false` indican qué buscan y no encuentran).

### Categoría 7: Cuidado (6 eventos)

#### `support_group_viewed`
- **Categoría**: care
- **Cuándo**: Al abrir el modal de enlaces de un grupo de apoyo.
- **Properties**: `{ group_id: "uuid" }`
- **Útil para**: Grupos más explorados.

#### `support_group_contacted`
- **Categoría**: care
- **Cuándo**: Al tocar un canal de contacto del grupo. Se trackea con `await` antes de `Linking.openURL`.
- **Properties**: `{ group_id: "uuid", contact_method: "whatsapp" }`
- **Valores de `contact_method`**: `phone`, `whatsapp`, `email`, `website`, `instagram`, `facebook`, `community`
- **Útil para**: Canales preferidos por los usuarios.

#### `emergency_contacts_viewed`
- **Categoría**: care
- **Cuándo**: Al montar EmergencyContactsScreen o ContactsScreen (la del tab Cuidado), **sin importar el origen**.
- **Properties**: `{ source: "sos" }`
- **Valores de `source`**:
  - `sos` (vino del flujo SOSScreen → "Ver contactos")
  - `quick_action` (vino del acceso rápido del tab Cuidado)
  - `unknown` (default si no se pasó source)
- **Útil para**: **Comparativa fundamental** — ¿los usan más en crisis o como rutina preventiva?

#### `emergency_contact_used`
- **Categoría**: care
- **Cuándo**: Al tocar el botón de llamar o SMS de un contacto. Con `await` antes de Linking.
- **Properties**: `{ contact_method: "phone" }`
- **Valores**: `phone`, `sms`
- **Útil para**: **KPI crítico** — momentos en que el usuario buscó ayuda humana directa.

#### `agenda_viewed`
- **Categoría**: care
- **Cuándo**: Al montar AgendaScreen.
- **Properties**: ninguna.
- **Útil para**: Consulta rutinaria de la agenda.

#### `agenda_event_created`
- **Categoría**: care
- **Cuándo**: Al crear (NO editar) un evento nuevo en la agenda.
- **Properties**: `{ category: "Reunion", has_reminder: true }`
- **Útil para**: Planificación activa de la recuperación.

### Categoría 8: Mascota y gamificación (5 eventos)

#### `pet_viewed`
- **Categoría**: gamification
- **Cuándo**: Al montar PetScreen.
- **Properties**: `{ pet_level: 3, pet_form: "sprout" }`
- **Útil para**: Engagement con la mecánica de gamificación.

#### `pet_evolved`
- **Categoría**: gamification
- **Cuándo**: Al montar PetEvolutionScreen (pantalla animada que aparece cuando la mascota cambia de forma).
- **Properties**: `{ new_form: "tree", xp_total: 1500 }`
- **Útil para**: Hitos significativos. Evento raro pero de alto valor emocional.

#### `challenge_viewed`
- **Categoría**: gamification
- **Cuándo**: Al entrar a ChallengeDetailScreen (1 vez por instancia).
- **Properties**: `{ challenge_id: "uuid", difficulty: "MODERADA" }`
- **Útil para**: Interés antes de comprometerse.

#### `challenge_joined`
- **Categoría**: gamification
- **Cuándo**: Tras unirse exitosamente a un reto disponible.
- **Properties**: `{ challenge_id: "uuid", difficulty: "SUAVE" }`
- **Útil para**: Tasa de conversión disponible → activo.

#### `challenge_completed`
- **Categoría**: gamification
- **Cuándo**: Cuando el usuario abre el detalle de un reto en estado COMPLETED.
- **Properties**: `{ challenge_id: "uuid", difficulty: "INTENSA" }`
- **Útil para**: Funnel completo joined → completed por dificultad.

### Categoría 9: Progreso (8 eventos)

#### `daily_checkin_started`
- **Categoría**: progress
- **Cuándo**: Al montar DailyCheckInScreen.
- **Properties**: ninguna.

#### `daily_checkin_completed`
- **Categoría**: progress
- **Cuándo**: Al completar los 3 pasos del checkin (respuesta 200 del backend).
- **Properties**: ninguna.
- **Útil para**: Adherencia diaria. Funnel started → completed revela qué paso abandonan.

#### `level_started`
- **Categoría**: progress
- **Cuándo**: Al montar NivelModulo (entrar a un módulo del programa 12 pasos).
- **Properties**: `{ level: 3, sublevel: 2 }`

#### `level_completed`
- **Categoría**: progress
- **Cuándo**: Al tocar "Completar módulo" y guardar exitosamente.
- **Properties**: `{ level: 3, sublevel: 2 }`
- **Útil para**: Avance real en el programa.

#### `level_abandoned`
- **Categoría**: progress
- **Cuándo**: Al desmontar NivelModulo SIN haber completado (back, navegar a otra pantalla).
- **Properties**: `{ level: 3, sublevel: 2 }`
- **Útil para**: **KPI crítico de retención** — ¿en qué módulos del programa se rinden? Indica dificultad o problemas de diseño.

#### `savings_viewed`
- **Categoría**: progress
- **Cuándo**: Al montar SavingsScreen.
- **Properties**: ninguna.
- **Útil para**: Motivación económica como driver de recuperación.

#### `gratitude_history_viewed`
- **Categoría**: progress
- **Cuándo**: Al montar GratitudeHistoryScreen.
- **Properties**: ninguna.

#### `personal_analytics_viewed`
- **Categoría**: progress
- **Cuándo**: Al montar AnalysisScreen (gráficos personales del usuario).
- **Properties**: `{ view_type: "chart" }`
- **Útil para**: Autoconciencia del usuario sobre su propio progreso.

---

## 13. Flujo de un evento end-to-end

Ejemplo completo: usuario toca el botón SOS.

```
[1] HomeScreen.tsx
    Usuario toca el botón rojo "SOS"
    └─> handleSOSPress()
         └─> analytics.track(EVENT_TYPES.SOS_TRIGGERED, { source: 'home_button' })

[2] analytics.ts (frontend)
    └─> Verifica AsyncStorage.getItem('accessToken')
         ├─ Si NO hay token → return (modo invitado, no trackeamos)
         └─ Si hay token → continúa
    └─> Construye payload:
         {
           event_type: 'sos_triggered',
           session_id: getSessionId(), // sess_abc-123 (in-memory)
           app_version: '1.1.0',
           properties: { source: 'home_button' }
         }
    └─> sendEvent(payload, token)
         └─> POST https://newlife-mobile-api.openlab.../analytics/events
             Authorization: Bearer <JWT>

[3] mobile-api / AnalyticsController
    └─> JwtAuthGuard valida el token y extrae user_id
    └─> @Body decora con TrackEventDto (class-validator valida)
    └─> Llama a TrackEventUseCase.execute({...})

[4] TrackEventUseCase
    └─> VALID_EVENT_TYPES.has('sos_triggered') → true ✓
    └─> userHash.hashUserId(user_id)
         └─> createHash('sha256').update(user_id + ANALYTICS_SALT).digest('hex')
         └─> Devuelve: "f7c3bc1d808e04732adf679965ccc34ca7ae3441..."
    └─> EVENT_TYPE_TO_CATEGORY['sos_triggered'] → 'crisis'
    └─> Crea AnalyticsEvent:
         {
           event_id: '550e8400-e29b-41d4-a716-446655440000',
           event_type: 'sos_triggered',
           event_category: 'crisis',
           user_id_hash: 'f7c3bc1d...',
           session_id: 'sess_abc-123',
           app_version: '1.1.0',
           properties: { source: 'home_button' },
           created_at: '2026-05-12T15:30:00.000Z'
         }
    └─> systemAuth.getMasterToken() → token de servicio
    └─> storage.save(event, masterToken)

[5] AnalyticsRobleAdapter
    └─> db.insert('analytics_events', {...}, masterToken)
         └─> POST a ROBLE
             https://roble-api.openlab.../database/.../insert
             Headers: Authorization, X-Project-Token
             Body: { tableName: 'analytics_events', records: [...] }

[6] ROBLE
    └─> Inserta fila en tabla analytics_events
    └─> Devuelve { ok: true }

[7] mobile-api responde
    └─> 201 Created
        Body: { event_id: '550e8400-...' }

[8] Frontend recibe respuesta
    └─> Fire-and-forget: ignora el resultado
    └─> El usuario ya está viendo SOSScreen (no se bloqueó nada)
```

### Tiempo total

Entre **80ms y 200ms** dependiendo de red. Pero como es fire-and-forget, el usuario no nota nada.

---

## 14. KPIs principales

Tabla de KPIs que se calculan en el dashboard admin web:

| KPI | Eventos involucrados | Cálculo | Pregunta que responde |
|-----|---------------------|---------|----------------------|
| **DAU** | `app_opened` | COUNT(DISTINCT user_id_hash) por día | ¿Cuántos usuarios distintos usan la app hoy? |
| **MAU** | `app_opened` | COUNT(DISTINCT user_id_hash) en últimos 30 días | ¿Cuántos usuarios activos al mes? |
| **Tasa de SOS** | `sos_triggered` / DAU | Eventos SOS / usuarios activos del día | ¿Qué % de usuarios entra en crisis hoy? |
| **Funnel SOS** | `sos_option_selected` por valor | Distribución de elecciones | ¿Qué herramienta de crisis usan más? |
| **Engagement breathing** | `breathing_*_started` → `_completed` | Ratio | ¿Qué % completa el ejercicio? |
| **Retención checkin** | `daily_checkin_started` → `_completed` | Ratio | ¿Qué % completa el checkin diario? |
| **Avance 12 pasos** | `level_started` → `_completed` vs `_abandoned` por nivel | 3 contadores por nivel | ¿En qué módulo abandonan más? |
| **Comparativa contactos** | `emergency_contacts_viewed` por `source` | Distribución sos vs quick_action | ¿Crisis o rutina preventiva? |
| **Top contenido** | `content_viewed` + `content_favorited` agrupado por `content_id` | Suma ponderada | ¿Qué temas resuenan más? |
| **Búsquedas sin resultados** | `content_searched` con `had_results: false` | Lista por query_length | ¿Qué tan específicas son las búsquedas que no devuelven nada? |
| **Engagement gamificación** | `challenge_joined` → `_completed` por dificultad | Ratios por dificultad | ¿Qué dificultad tiene mejor tasa de éxito? |
| **Vías de descubrimiento frases** | `daily_phrase_viewed` por `source` | Distribución | ¿Por qué pantalla descubren más las frases? |

---

## 15. Cumplimiento legal y privacidad

### Ley 1581 de 2012 (Colombia) — Datos personales sensibles

La Ley 1581 clasifica como **datos sensibles** la información relacionada con salud. NewLife trata datos de salud (consumo de sustancias, estado emocional, recaídas) que requieren:

1. **Consentimiento explícito** del titular ✅
2. **Finalidad específica** ✅
3. **Principio de minimización** ✅
4. **Confidencialidad** ✅
5. **Derecho de acceso, rectificación y supresión** ✅

### Cómo NewLife cumple cada principio

#### Consentimiento explícito
- El usuario acepta la política de privacidad durante el registro.
- Modo invitado NO se trackea (no aceptó la política aún).
- El usuario puede revocar el consentimiento eliminando su cuenta.

#### Finalidad específica
- Los datos se usan ÚNICAMENTE para mejorar la plataforma.
- No se comparten con terceros.
- No se usan para publicidad ni venta.

#### Minimización
- Solo se trackean eventos necesarios para métricas de uso.
- Datos sensibles (consumo, recaídas, estado emocional) NUNCA se incluyen en analytics.
- El `content_searched` se modificó en v1.1.0 para enviar solo `query_length` en vez del texto real.

#### Confidencialidad
- Hash SHA-256 + sal: matemáticamente irreversible.
- ROBLE: cifrado en tránsito (HTTPS/TLS) y en reposo.
- Acceso restringido por roles (solo admins ven el dashboard).

#### Derechos del titular
- **Acceso**: el usuario puede ver sus datos en su perfil.
- **Rectificación**: puede editar su información en cualquier momento.
- **Supresión**: eliminación de cuenta in-app o desde landing pública.
- Tras eliminación: soft delete + anonimización (`nombre = '[Cuenta eliminada]'`, `estado = 'ELIMINADO'`).

### Aprobación Google Play

La app está categorizada como **"Estilo de Vida / Bienestar y Crecimiento Personal"** (no Health App) para cumplir requisitos de cuentas personales de Google Play, manteniendo las protecciones de la Ley 1581 internas.

---

## 16. Decisiones de diseño importantes

### 16.1 Sin librerías externas de analytics

**Decisión**: No usar Google Analytics, Firebase, Mixpanel, Amplitude, ni Meta Pixel.

**Razón**:
- Conflicto con población vulnerable (jóvenes en rehabilitación).
- Imposible cumplir Ley 1581 estricta con SDKs que envían datos a servidores no controlados.
- Control total sobre qué se mide.

**Trade-off**:
- ❌ Más trabajo de desarrollo (construir todo desde cero).
- ✅ Privacidad real, no aparente.

### 16.2 Hash en backend, no en cliente

**Decisión**: El hash SHA-256 se calcula en el backend, no en el frontend.

**Razón**:
- La sal (`ANALYTICS_SALT`) NUNCA debe estar en el cliente. Si estuviera, alguien con un APK extraído podría obtenerla y revertir el proceso.
- Centraliza la lógica criptográfica en un solo lugar.

### 16.3 Whitelist de eventos en backend

**Decisión**: El backend rechaza cualquier `event_type` que no esté en la lista de 36 permitidos.

**Razón**:
- Previene inyección de eventos arbitrarios por bugs o ataques.
- Mantiene el catálogo bajo control versionado.
- Si frontend y backend se desincronizan, la app rompe de forma visible (400 Bad Request), no silenciosamente.

### 16.4 Categorías automáticas (no del cliente)

**Decisión**: El cliente solo envía `event_type`, el backend infiere la categoría.

**Razón**:
- No confiar en el cliente para datos críticos.
- Garantiza consistencia (el mismo evento siempre tiene la misma categoría).
- Si en el futuro recategorizamos un evento, solo cambia un mapa del backend.

### 16.5 Fire-and-forget vs await selectivo

**Decisión**: Por defecto fire-and-forget. Con `await` solo cuando el usuario puede salir de la app inmediatamente.

**Razón**:
- UI nunca se bloquea por analytics caído.
- Pero en casos críticos (llamada, SMS, abrir enlace externo), esperamos a que el track salga antes de que el SO mate la app.

### 16.6 Solo usuarios logueados

**Decisión**: Modo invitado NO se trackea.

**Razón**:
- Sin consentimiento informado, no podemos legalmente trackear.
- El registro implica aceptación de la política de privacidad.

### 16.7 SOS_OPTIONS y CONTACT_METHODS como constantes

**Decisión**: Crear constantes tipadas para valores de propiedades:

```typescript
export const SOS_OPTIONS = {
  EMERGENCY_CONTACTS: 'emergency_contacts',
  CRISIS_MODE: 'crisis_mode',
  BREATHING: 'breathing',
  MOTIVATIONAL_PHRASES: 'motivational_phrases',
  GUIDED_MEDITATION: 'guided_meditation',
} as const;
```

**Razón**:
- Autocomplete en el IDE.
- Previene typos (`"emergency_contact"` vs `"emergency_contacts"`).
- Documentación inline de valores permitidos.

### 16.8 Dedup selectivo en frases del día

**Decisión**: `daily_phrase_viewed` se dispara cada vez que el usuario ve la frase (sin dedup global). En el historial, solo se trackea la frase de hoy (no las viejas).

**Razón**:
- Engagement honesto: si vuelven 5 veces a la misma frase, eso es info valiosa.
- Pero scrollear el historial NO debería generar 30 eventos por frases viejas (sería ruido).

### 16.9 Caché en admin-api de 5 minutos

**Decisión**: Las consultas de agregación se cachean por 5 minutos.

**Razón**:
- Las queries son costosas (escaneo completo de la tabla).
- El admin no necesita datos al segundo; "qué pasó hoy" es suficiente.
- 5 minutos equilibra frescura con performance.

### 16.10 Eventos eliminados durante la limpieza

Durante el desarrollo, se eliminaron 2 eventos por ruido:

- **`pet_xp_claimed`**: redundante con `challenge_completed` (el usuario siempre reclama XP tras completar).
- **`agenda_event_completed`**: forzado. La app no tiene check de "evento completado", solo eliminar. Trackear "eliminado = completado" no reflejaba uso real.

---

## 17. Flujo de pruebas completo

Tiempo estimado: **25-35 minutos**. Diseñado para disparar los 36 eventos en una sola sesión.

### Preparación

1. Vaciar tabla `analytics_events` en ROBLE Data Visualizer.
2. Iniciar backend: `docker compose -f docker-compose.dev.yml up -d`.
3. Iniciar frontend móvil: `cd frontend/mobile && npx expo start --clear`.
4. Abrir Expo Go y escanear QR.

### Bloque 1 — Sesión inicial (3 eventos)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 1 | Cerrar app completamente | — |
| 2 | Abrir app desde ícono | `app_opened` |
| 3 | Login con usuario válido (NO invitado) | `user_logged_in` |

### Bloque 2 — Navegación entre tabs (1 evento)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 4 | Home → Progreso | `tab_switched` |
| 5 | Progreso → Motivación | `tab_switched` |
| 6 | Motivación → Motivación | **NO trackea** (mismo tab) |
| 7 | Motivación → Cuidado | `tab_switched` |
| 8 | Cuidado → Home | `tab_switched` |

### Bloque 3 — SOS desde Home + contactos vía SOS (4 eventos)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 9 | Tocar botón rojo SOS | `sos_triggered` |
| 10 | Tocar "Ver contactos" | `sos_option_selected` (emergency_contacts) |
| 11 | Llegar a EmergencyContactsScreen | `emergency_contacts_viewed` (source: sos) |
| 12 | Tocar botón de llamada | `emergency_contact_used` (phone) |
| 13 | Tocar botón de SMS | `emergency_contact_used` (sms) |

### Bloque 4 — Modo Crisis completo (8 eventos)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 14 | SOS → "Entrar al modo" | `sos_option_selected` (crisis_mode) |
| 15 | "Modo Zen" | `sos_option_selected` (breathing) + `zen_mode_entered` |
| 16 | Play, esperar 15+ segundos | `breathing_exercise_started` |
| 17 | Pausa | `breathing_exercise_completed` |
| 18 | Atrás → CrisisMode → "Frases motivacionales" | `sos_option_selected` (motivational_phrases) + `daily_phrase_viewed` (motivational_phrases_screen) |
| 19 | Marcar como favorita la frase de hoy | `daily_phrase_favorited` |
| 20 | Atrás → CrisisMode → "Práctica guiada" | `sos_option_selected` (guided_meditation) |
| 21 | Elegir meditación | `guided_meditation_started` |
| 22 | Arrastrar slider al 95%+ | `guided_meditation_completed` |

### Bloque 5 — Contactos vía acceso rápido (verifica el source)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 23 | Home → tab Cuidado | `tab_switched` |
| 24 | Acceso rápido "Emergencia" | `emergency_contacts_viewed` (source: **quick_action**) |

### Bloque 6 — Frases del día sin dedup (3 eventos)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 25 | Tab Motivación | `tab_switched` + `daily_phrase_viewed` (motivation_tab) |
| 26 | Toca card de frase del día | `daily_phrase_viewed` (daily_phrase_screen) |
| 27 | Atrás → otra vez la card | `daily_phrase_viewed` (daily_phrase_screen) |

### Bloque 7 — Contenido educativo (4 eventos)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 28 | Tab Cuidado → "Contenido" | `content_list_viewed` |
| 29 | Escribir "ansiedad" y esperar 1.5s | `content_searched` (query_length: 8, results_count: N) |
| 30 | Tocar un artículo/video | `content_viewed` |
| 31 | Tocar el corazón | `content_favorited` |

### Bloque 8 — Grupos de apoyo (3 eventos)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 32 | Tab Cuidado → "Grupos" | — (no hay evento al entrar a la lista) |
| 33 | En un grupo, "Enlaces" | `support_group_viewed` |
| 34 | Modal → Email | `support_group_contacted` (email) |
| 35 | Modal → WhatsApp | `support_group_contacted` (whatsapp) |

### Bloque 9 — Agenda (2 eventos)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 36 | Tab Cuidado → "Agenda" | `agenda_viewed` |
| 37 | "Nuevo evento", llenar y guardar | `agenda_event_created` |
| 38 | Eliminar el evento creado | **NO trackea** (correcto) |

### Bloque 10 — Mascota (1 evento)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 39 | Home → widget de la mascota | `pet_viewed` |

### Bloque 11 — Retos completo (4 eventos)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 40 | Tab Motivación → "Retos" → Disponibles | — |
| 41 | "Únete" en cualquier reto | `challenge_joined` |
| 42 | Activos → "Ver más" en el reto | `challenge_viewed` |
| 43 | Entrar a un reto COMPLETED | `challenge_viewed` + `challenge_completed` |
| 44 | "Reclamar +XP" | Si hay evolución: `pet_evolved` |

### Bloque 12 — Progreso (5 eventos)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 45 | Home → card de "Días limpios" (checkin) | `daily_checkin_started` |
| 46 | Completar los 3 pasos | `daily_checkin_completed` |
| 47 | Home → card de "Dinero ahorrado" | `savings_viewed` |
| 48 | SavingsScreen → "Ver detalle por día" | `personal_analytics_viewed` (view_type: chart) |
| 49 | Tab Progreso → "Historial de gratitud" | `gratitude_history_viewed` |

### Bloque 13 — Niveles (3 eventos)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 50 | Tab Progreso → Path → entrar a un nivel | `level_started` |
| 51 | Avanzar, tocar ← del header | `level_abandoned` |
| 52 | Volver al mismo módulo | `level_started` |
| 53 | Completar hasta "Completar módulo" | `level_completed` (sin `level_abandoned`) |

### Bloque 14 — Logout (1 evento)

| Paso | Acción | Evento esperado |
|------|--------|-----------------|
| 54 | Home → "Cerrar sesión" | `user_logged_out` |

### Verificación final

Después del flujo, en ROBLE debes ver los 36 tipos de eventos. Si entras de nuevo, el siguiente `user_logged_in` debe tener un `session_id` **distinto** al anterior (confirma que `resetSession()` funcionó).

---

## Apéndice: archivos clave del proyecto

### Frontend móvil
- `frontend/mobile/src/services/analytics/event-types.ts` (catálogo)
- `frontend/mobile/src/services/analytics/session.ts` (session_id)
- `frontend/mobile/src/services/analytics/analytics.ts` (track principal)
- `frontend/mobile/src/services/analytics/api-client.ts` (HTTP)

### Backend mobile-api
- `backend/mobile-api/src/modules/analytics/domain/constants/event-types.constant.ts` (whitelist)
- `backend/mobile-api/src/modules/analytics/application/use-cases/track-event.use-case.ts` (núcleo)
- `backend/mobile-api/src/modules/analytics/infrastructure/services/user-hash.service.ts` (hash)
- `backend/mobile-api/src/modules/analytics/presentation/controllers/analytics.controller.ts`

### Backend admin-api
- `backend/admin-api/src/modules/analytics/application/use-cases/get-overview.use-case.ts`
- `backend/admin-api/src/modules/analytics/application/use-cases/get-dau-mau.use-case.ts`
- `backend/admin-api/src/modules/analytics/application/use-cases/get-funnel-sos.use-case.ts`
- (... 6 use cases más, uno por endpoint)
- `backend/admin-api/src/modules/analytics/infrastructure/services/analytics-cache.service.ts`

### Frontend admin web
- `frontend/web/app/analytics/page.tsx` (dashboard principal)
- `frontend/web/app/analytics/components/*.tsx` (9 componentes de visualización)
- `frontend/web/app/analytics/hooks/useAnalytics.ts` (fetcher SWR)

---

## Apéndice: variables de entorno críticas

### Backend mobile-api
```bash
ANALYTICS_SALT=c90b7c3591065afcf49858926908b964389ccfc86e741ac8f8d9ccad50ea88af
ANALYTICS_ENABLED=true
ROBLE_BASE_URL=https://roble-api.openlab.uninorte.edu.co
ROBLE_PROJECT_TOKEN=new_life_v0_20d9e88b56
ROBLE_DB_NAME=New_Life_V0
ROBLE_SYSTEM_EMAIL=backendnewlife@gmail.com
ROBLE_SYSTEM_PASSWORD=<secret>
```

### Backend admin-api
```bash
# Misma sal que mobile-api (para que los hashes coincidan)
ANALYTICS_SALT=c90b7c3591065afcf49858926908b964389ccfc86e741ac8f8d9ccad50ea88af
# Acceso a ROBLE (mismas credenciales)
ROBLE_BASE_URL=https://roble-api.openlab.uninorte.edu.co
ROBLE_PROJECT_TOKEN=new_life_v0_20d9e88b56
```

> ⚠️ **Importante**: la `ANALYTICS_SALT` debe ser IDÉNTICA en mobile-api y admin-api. Si difiere, los hashes generados en escritura no coincidirán con los esperados en lectura, y los conteos de usuarios únicos serán incorrectos.


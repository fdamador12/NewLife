# GUEST MODE — Documentación Backend
## NewLife Mobile API — NestJS

> **⚠️ IMPORTANTE:** Existe un documento complementario para el frontend en:
> `frontend/mobile/src/GUEST_MODE_FRONTEND.md`
> Ese documento cubre toda la lógica del frontend, AsyncStorage, flujos de usuario y archivos modificados. **Debes leer ambos documentos.**

---

## Índice
1. [Resumen de cambios](#1-resumen-de-cambios)
2. [Problema que se resuelve](#2-problema-que-se-resuelve)
3. [Cambios por módulo](#3-cambios-por-módulo)
4. [Endpoint de migración](#4-endpoint-de-migración)
5. [Tablas de BD afectadas](#5-tablas-de-bd-afectadas)
6. [Deploy a producción — pasos exactos](#6-deploy-a-producción--pasos-exactos)
7. [Verificación post-deploy](#7-verificación-post-deploy)
8. [Consideraciones importantes](#8-consideraciones-importantes)

---

## 1. Resumen de cambios

Se modificaron 9 archivos del backend para soportar guest mode:

| Archivo | Cambio |
|---------|--------|
| `guided-meditation.controller.ts` | Quitar JwtAuthGuard, usar masterToken como fallback |
| `guided-meditation.module.ts` | Agregar SystemAuthService a providers |
| `motivation.controller.ts` | Quitar guard de frase-del-dia y frases, mantener en favoritos/retos |
| `get-frase-del-dia.use-case.ts` | Manejar null token y null usuarioId |
| `get-frases-por-fecha.use-case.ts` | Manejar null token y null usuarioId |
| `breathing-sounds.controller.ts` | Quitar JwtAuthGuard de GETs, usar masterToken como fallback |
| `sos.module.ts` | Agregar SystemAuthService a providers |
| `migrate-guest.use-case.ts` | Migrar 6 tablas con upsert en camino y mascota |
| `migrate-guest.dto.ts` | Agregar DTOs para checkins, progress y pet |

---

## 2. Problema que se resuelve

El guest mode necesita acceder a ciertos endpoints **sin token JWT**:
- `/guided-meditation` — audios de meditación
- `/motivation/frases` — frases motivacionales
- `/motivation/frase-del-dia` — frase del día
- `/sos/breathing-sounds` — sonidos de respiración

Estos endpoints usaban `@UseGuards(JwtAuthGuard)` que rechazaba las requests sin token con 401. La solución es que el controller detecte si hay token en el header y si no lo hay, use el `masterToken` del sistema para hacer las queries a Roble.

Para favoritos y acciones que requieren identidad del usuario (guardar frase, unirse a reto, etc.) se mantiene el `@UseGuards(JwtAuthGuard)`.

---

## 3. Cambios por módulo

### 3.1 Guided Meditation

**`src/modules/guided-meditation/infrastructure/controllers/guided-meditation.controller.ts`**

- Eliminado `@UseGuards(JwtAuthGuard)` del controller completo
- Inyectado `SystemAuthService`
- Método privado `resolveToken(req)`:
  ```typescript
  private async resolveToken(req: any): Promise<string> {
    const authHeader = req.headers.authorization;
    if (authHeader) return authHeader.split(' ')[1]; // usuario logueado
    return this.systemAuth.getMasterToken();          // guest
  }
  ```
- Todos los endpoints GET usan `resolveToken()` en lugar del token del header directamente

**`src/modules/guided-meditation/guided-meditation.module.ts`**

- Agregado `SystemAuthService` a `providers`
- Sin este cambio el controller no puede inyectar `SystemAuthService`

---

### 3.2 Motivation

**`src/modules/motivation/presentation/controllers/motivation.controller.ts`**

- Eliminado `@UseGuards(JwtAuthGuard)` del controller completo
- Agregado `@UseGuards(JwtAuthGuard)` **por endpoint** solo donde se necesita identidad:
  - `GET /motivation/frases-guardadas` — ✅ con guard
  - `POST /motivation/frases-guardadas` — ✅ con guard
  - `DELETE /motivation/frases-guardadas/:fraseId` — ✅ con guard
  - `GET /motivation/mis-retos` — ✅ con guard
  - `POST /motivation/retos/unirse` — ✅ con guard
  - `GET /motivation/mis-medallas` — ✅ con guard
  - `POST /motivation/retos/:userRetoId/reclamar-xp` — ✅ con guard
- Sin guard (accesibles para guest):
  - `GET /motivation/frase-del-dia` — ❌ sin guard
  - `GET /motivation/frases` — ❌ sin guard

Para los endpoints sin guard, el token se obtiene opcionalmente:
```typescript
const token = req.headers.authorization?.split(' ')[1] ?? null;
const uid = req.user?.uid ?? null;
```

**`src/modules/motivation/application/use-cases/get-frase-del-dia.use-case.ts`**

- Firma cambiada: `execute(usuarioId: string | null, userToken: string | null)`
- Si `usuarioId` y `userToken` son null (guest) → retorna `isGuardada: false`
- La frase se obtiene siempre con `masterToken` (ya era así)

**`src/modules/motivation/application/use-cases/get-frases-por-fecha.use-case.ts`**

- Firma cambiada: `execute(usuarioId: string | null, fecha: string, userToken: string | null)`
- Si `usuarioId` y `userToken` son null (guest) → `isFavorite: false` para todas las frases
- Las frases se obtienen siempre con `masterToken` (ya era así)

---

### 3.3 SOS — Breathing Sounds

**`src/modules/sos/infrastructure/controllers/breathing-sounds.controller.ts`**

- Eliminado `@UseGuards(JwtAuthGuard)` de los endpoints GET
- Mantenido `@UseGuards(JwtAuthGuard)` en `POST /sos/breathing-sounds/sync`
- Inyectado `SystemAuthService`
- Mismo patrón `resolveToken()` que guided-meditation:
  ```typescript
  private async resolveToken(req: any): Promise<string> {
    const authHeader = req.headers.authorization;
    if (authHeader) return authHeader.split(' ')[1];
    return this.systemAuth.getMasterToken();
  }
  ```

**`src/modules/sos/sos.module.ts`**

- Agregado `SystemAuthService` a `providers`

---

### 3.4 Auth — Migrate Guest

**`src/modules/auth/presentation/dtos/migrate-guest.dto.ts`**

Agregados nuevos DTOs:

```typescript
export class MigrateGuestCheckinDto {
  @IsString() fecha: string;
  @IsString() emocion: string;
  @IsBoolean() consumo: boolean;
  @IsString() gratitud: string;
  @IsOptional() @IsString() ubicacion?: string;
  @IsOptional() @IsString() social?: string;
  @IsOptional() @IsString() reflexion?: string;
}

export class MigrateGuestProgressDto {
  @IsNumber() nivel: number;
  @IsNumber() subnivel: number;
}

export class MigrateGuestPetDto {
  @IsNumber() xp: number;
  @IsString() selected_form: string;
  @IsArray() unlocked_forms: string[];
  @IsOptional() last_actions?: Record<string, string>;
}
```

`MigrateGuestDto` actualizado con campos opcionales:
```typescript
@IsOptional() @IsArray() @ValidateNested({ each: true })
@Type(() => MigrateGuestCheckinDto)
checkins?: MigrateGuestCheckinDto[];

@IsOptional() @ValidateNested()
@Type(() => MigrateGuestProgressDto)
progress?: MigrateGuestProgressDto;

@IsOptional() @ValidateNested()
@Type(() => MigrateGuestPetDto)
pet?: MigrateGuestPetDto;
```

**`src/modules/auth/application/use-cases/migrate-guest.use-case.ts`**

Migra 6 tablas en orden. Los errores por tabla son capturados individualmente — si una falla, las demás continúan:

1. **`informacion_personal`** — INSERT con apodo, pronombre, motivo_sobrio, gasto_semanal
2. **`sobriedad`** — INSERT con fecha_ultimo_consumo del guest
3. **`contactos`** — INSERT de todos los contactos (nuevo UUID por contacto con `uuidv4()`)
4. **`registro_diario`** — INSERT de todos los checkins con fecha, emocion, consumo, gratitud, etc.
5. **`camino`** — **UPSERT**: verifica si ya existe un registro. Si existe → UPDATE. Si no → INSERT. Esto es crítico porque `POST /progress/init` (llamado en `loginUser`) ya crea el camino en nivel 1, subnivel 1. El migrate lo actualiza con el progreso real del guest.
6. **`user_pet`** — **UPSERT**: mismo patrón que camino. Verifica si existe → update o insert.

El endpoint está protegido con `@UseGuards(JwtAuthGuard)` — solo usuarios logueados pueden migrar sus datos.

---

## 4. Endpoint de migración

### `POST /auth/migrate-guest`

**Headers requeridos:**
```
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "guestId": "uuid-del-guest",
  "profile": {
    "apodo": "string",
    "pronombre": "string",
    "ult_fecha_consumo": "string",
    "motivo_sobrio": "string",
    "gasto_semana": 0,
    "telefono": 0,
    "reg_lugar_riesgo": false,
    "comp_logros_comunid": false,
    "moment_motiv": "09:00:00",
    "nombre_contacto": "string (opcional)"
  },
  "sobriety": {
    "startDate": "2026-05-23T17:05:13.317Z"
  },
  "contacts": [
    { "id": "uuid", "nombre": "string", "telefono": "string" }
  ],
  "checkins": [
    {
      "fecha": "2026-05-23T16:36:20.163Z",
      "emocion": "Ansioso",
      "consumo": true,
      "gratitud": "texto",
      "ubicacion": "En un bar o disco",
      "social": "Solo",
      "reflexion": "texto"
    }
  ],
  "progress": {
    "nivel": 2,
    "subnivel": 3
  },
  "pet": {
    "xp": 180,
    "selected_form": "sprout",
    "unlocked_forms": ["seed", "sprout"],
    "last_actions": { "checkin": "2026-05-23" }
  }
}
```

**Respuesta exitosa:**
```json
{ "message": "Datos migrados correctamente" }
```

**Campos críticos:**
- `checkins`: NO incluir `id`, `dia`, `hora` — el DTO los rechaza
- `pet`: NO incluir `level`, `form` — el DTO los rechaza
- `reg_lugar_riesgo` y `comp_logros_comunid`: deben ser booleanos, no strings

---

## 5. Tablas de BD afectadas

### Tablas que se leen (sin modificación):
- `guided_audios` — sonidos de meditación
- `frases_dia` — frases motivacionales

### Tablas que se escriben en el migrate:

| Tabla | Operación | Campo clave |
|-------|-----------|-------------|
| `informacion_personal` | INSERT | `usuario_id` |
| `sobriedad` | INSERT | `usuario_id` |
| `contactos` | INSERT | `contacto_id` (nuevo UUID) |
| `registro_diario` | INSERT | `usuario_id` + `fecha` |
| `camino` | UPSERT | `usuario_id` |
| `user_pet` | UPSERT | `usuario_id` |

El `usuario_id` usado en todas las tablas es `req.user.uid` del JWT — el UID de la tabla de usuarios de la app (NO el UID de autenticación de Roble).

---

## 6. Deploy a producción — pasos exactos

> **⚠️ ESTOS CAMBIOS NO ESTÁN EN PRODUCCIÓN AÚN.** El servidor en `newlife-mobile-api.openlab.uninorte.edu.co` tiene el código antiguo. Sin este deploy, los audios, frases y el migrate fallarán para usuarios guest con error 401.

### Archivos a desplegar (9 archivos):

```
src/modules/guided-meditation/infrastructure/controllers/guided-meditation.controller.ts
src/modules/guided-meditation/guided-meditation.module.ts
src/modules/motivation/presentation/controllers/motivation.controller.ts
src/modules/motivation/application/use-cases/get-frase-del-dia.use-case.ts
src/modules/motivation/application/use-cases/get-frases-por-fecha.use-case.ts
src/modules/sos/infrastructure/controllers/breathing-sounds.controller.ts
src/modules/sos/sos.module.ts
src/modules/auth/application/use-cases/migrate-guest.use-case.ts
src/modules/auth/presentation/dtos/migrate-guest.dto.ts
```

### Pasos de deploy:
1. Hacer pull del branch con los cambios en el servidor de producción
2. Rebuild del contenedor del mobile-api
3. Verificar que el contenedor levantó correctamente
4. Ejecutar las verificaciones del siguiente punto

### Variables de entorno — sin cambios
No se requieren cambios en variables de entorno. Todos los cambios son de código únicamente.

---

## 7. Verificación post-deploy

### 7.1 Verificar endpoints públicos (sin token):

```bash
# Audios de meditación — debe retornar array de audios
curl https://newlife-mobile-api.openlab.uninorte.edu.co/guided-meditation

# Frases motivacionales — debe retornar array de frases
curl "https://newlife-mobile-api.openlab.uninorte.edu.co/motivation/frases?hasta=2026-05-23"

# Frase del día — debe retornar la frase de hoy
curl https://newlife-mobile-api.openlab.uninorte.edu.co/motivation/frase-del-dia

# Sonidos de respiración — debe retornar array de sonidos
curl https://newlife-mobile-api.openlab.uninorte.edu.co/sos/breathing-sounds
```

Todos deben retornar **200 OK** sin token. Si retornan 401, el deploy no aplicó correctamente.

### 7.2 Verificar que favoritos siguen protegidos:

```bash
# Debe retornar 401 sin token
curl https://newlife-mobile-api.openlab.uninorte.edu.co/motivation/frases-guardadas
```

### 7.3 Verificar migrate:
Hacer el flujo completo desde la app: guest mode → registrarse → verificar email → confirmar que los datos aparecen en las 6 tablas de Roble.

---

## 8. Consideraciones importantes

### masterToken como fallback
El `masterToken` se obtiene llamando a `SystemAuthService.getMasterToken()` que autentica con las credenciales del sistema configuradas en `.env`:
```
ROBLE_SYSTEM_EMAIL=backendnewlife@gmail.com
ROBLE_SYSTEM_PASSWORD=NL_Master_2026_Secure
```

Este token tiene acceso de lectura a todas las tablas públicas. No tiene acceso a datos de usuarios específicos, por lo que es seguro usarlo para contenido público.

### Favoritos para guest
Cuando un guest ve las frases motivacionales, `isFavorite` siempre es `false` y el botón de corazón está oculto en el frontend. Si un guest intenta llamar al endpoint de favoritos (no debería poder desde la UI), recibirá 401 porque ese endpoint sigue protegido.

### Upsert en camino y mascota
El motivo del upsert es que `loginUser()` en el frontend llama a `POST /progress/init` que crea un registro de camino en nivel 1, subnivel 1. Cuando llega el migrate, el registro ya existe y un INSERT fallaría. El upsert verifica si existe y hace UPDATE con el progreso real del guest.

### Idempotencia del migrate
El migrate puede ejecutarse múltiples veces sin problema:
- `informacion_personal` y `sobriedad` — si ya existen, el INSERT falla silenciosamente (skip)
- `contactos` — siempre inserta con nuevo UUID, pueden quedar duplicados si se migra dos veces
- `registro_diario` — siempre inserta, pueden quedar duplicados si se migra dos veces
- `camino` y `user_pet` — upsert, siempre actualiza al valor más reciente

### SystemAuthService en módulos
`SystemAuthService` está definido en `AuthModule`. Para usarlo en otros módulos hay dos opciones:
1. Importar `AuthModule` (ya se hace con `imports: [AuthModule]`)
2. Agregar `SystemAuthService` explícitamente a `providers`

Se usa la opción 2 para evitar dependencias circulares. Si ves errores de inyección, verificar que `SystemAuthService` esté en `providers` del módulo correspondiente.

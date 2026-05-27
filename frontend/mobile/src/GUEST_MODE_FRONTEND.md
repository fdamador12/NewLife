# GUEST MODE — Documentación Frontend
## NewLife Mobile App — React Native (Expo SDK 55)

> **⚠️ IMPORTANTE:** Existe un documento complementario para el backend en:
> `backend/mobile-api/src/GUEST_MODE_BACKEND.md`
> Ese documento cubre los endpoints, DTOs, use cases y cambios de backend necesarios para que el guest mode y la migración funcionen correctamente. **Debes leer ambos documentos.**

---

## Índice
1. [Qué es el Guest Mode](#1-qué-es-el-guest-mode)
2. [Arquitectura general](#2-arquitectura-general)
3. [Flujos completos](#3-flujos-completos)
4. [Archivos creados](#4-archivos-creados)
5. [Archivos modificados](#5-archivos-modificados)
6. [AsyncStorage — estructura de datos](#6-asyncstorage--estructura-de-datos)
7. [Sistema de XP local](#7-sistema-de-xp-local)
8. [Migración de datos](#8-migración-de-datos)
9. [Módulos bloqueados](#9-módulos-bloqueados)
10. [Pending migration](#10-pending-migration)
11. [Cambios a producción](#11-cambios-a-producción)
12. [Consideraciones importantes](#12-consideraciones-importantes)

---

## 1. Qué es el Guest Mode

El guest mode permite que un usuario use la app **sin registrarse**. Puede:
- Completar el onboarding (10 preguntas)
- Hacer registros diarios (checkins)
- Ver su progreso de sobriedad
- Ver su dinero ahorrado
- Avanzar en el camino de niveles
- Tener una mascota con XP
- Usar el SOS (contactos, modo zen, frases, audios)
- Ver su historial de gratitud y análisis

**NO puede:**
- Acceder a los módulos Care, Motivation ni Social
- Guardar frases como favoritas
- Acceder a funciones que requieren cuenta (retos, grupos, etc.)

Todo el progreso se guarda localmente en AsyncStorage. Al crear una cuenta, todos los datos se migran automáticamente al backend.

---

## 2. Arquitectura general

```
WelcomeScreen
    └── "Continuar como invitadx"
            └── initGuest() → crea guestId en AsyncStorage
            └── navega a Story (onboarding)

Onboarding (10 steps)
    └── Step10_Horario → si isGuest → saveGuestProfile() en AsyncStorage
    └── navega a Home

Home (guest)
    ├── Sobriedad → getGuestSobrietyTime() desde AsyncStorage
    ├── Ahorro → getGuestAhorro() calculado desde checkins
    ├── Mascota → petService con if(isGuest) → AsyncStorage
    └── SOS → funciona igual para guest y logueado

Progress (guest)
    ├── Registro diario → saveGuestCheckin() en AsyncStorage
    ├── Historial gratitud → getGuestCheckins() filtrado
    ├── Análisis → calculado localmente desde checkins
    ├── Calendario → processGuestDays() desde checkins
    └── Camino → getGuestProgress() / saveGuestProgress()

Settings (guest)
    ├── Perfil → editable → saveGuestProfile()
    ├── "Crear cuenta y guardar progreso" → Register
    └── "Borrar todos mis datos" → clearGuestData() con confirmación

Módulos bloqueados
    ├── Care → LockedForGuestScreen
    ├── Motivation → LockedForGuestScreen
    └── Social → LockedForGuestScreen

Migrate
    └── Register → VerifyEmail → loginUser → migrateGuestToUser → Home
```

---

## 3. Flujos completos

### 3.1 Entrada como guest
```
WelcomeScreen → toca "Continuar como invitadx"
    → initGuest() crea guestId + isGuest=true en AsyncStorage
    → navega a Story
    → completa 10 preguntas
    → Step10_Horario detecta isGuest → saveGuestProfile() en AsyncStorage
    → navega a Congratulations → Home
```

### 3.2 Registro diario como guest
```
CheckInStep3 → handleFinish()
    → detecta isGuest
    → saveGuestCheckin() → acumula en AsyncStorage (NO reemplaza)
    → si consumo === true → updateGuestSobrietyDate() → resetea timer
    → addXp('checkin') → petService detecta isGuest → calcula localmente
    → si !consumo → addXp('sober_day') → mismo flujo
```

### 3.3 Migrate al crear cuenta
```
Settings → "Crear cuenta y guardar progreso"
    → RegisterScreen → detecta isGuestMode() → fromGuest: true
    → registerUser() → crea cuenta en Roble
    → navega a VerifyEmail con fromGuest: true

VerifyEmail → verifyEmail() → loginUser()
    → fromGuest === true → migrateGuestToUser()
        → getGuestDataForMigration() → arma payload limpio
        → POST /auth/migrate-guest → backend migra 6 tablas
        → clearGuestData() → limpia AsyncStorage
        → navega a Home (sin las 10 preguntas)

Si migrate falla:
    → setPendingMigration() → guarda flag en AsyncStorage
    → showToast("Tus datos se sincronizarán cuando tengas conexión")
    → navega a Home igual
    → próxima vez que abra la app → LoaderScreen reintenta
    → Settings muestra "Sincronizar datos pendientes"
```

### 3.4 Módulos bloqueados
```
MainScreen → tab Care/Motivation/Social
    → isGuest === true → LockedForGuestScreen
    → muestra character5.png + mensaje + botón "Crear cuenta"
    → botón navega a RegisterScreen con goBack() de vuelta al Home
```

---

## 4. Archivos creados

### `frontend/mobile/src/modules/pet/config/xp-config.ts`
Copia del xp-config del backend para calcular XP localmente en guest mode.

Contiene:
- `XP_PER_ACTION` — XP por acción (checkin: 10, sober_day: 20, module_complete: 15)
- `FORM_THRESHOLDS` — umbrales de XP para cada forma de la mascota
- `calculateForm(xp)` — calcula la forma actual
- `calculateUnlocked(xp)` — calcula las formas desbloqueadas
- `calculateLevel(xp)` — calcula el nivel

---

## 5. Archivos modificados

### `frontend/mobile/src/services/guestService.ts`
Archivo central del guest mode. Maneja todo el AsyncStorage del guest.

**Funciones existentes (sin cambios):**
- `initGuest()` — crea guestId y marca isGuest=true
- `isGuestMode()` — retorna true si es guest
- `getGuestId()` — retorna el guestId
- `saveGuestProfile()` / `getGuestProfile()` — perfil del onboarding
- `saveGuestSobrietyStart()` / `getGuestSobrietyTime()` — sobriedad
- `getGuestContacts()` / `createGuestContact()` / `updateGuestContact()` / `deleteGuestContact()` — contactos
- `getGuestOnboardingStatus()` — estado del onboarding
- `isGuestTourCompleted()` / `markGuestTourCompleted()` — tour
- `clearGuestData()` — borra todo el AsyncStorage del guest
- `markGuestProfileCompleted()` / `hasGuestCompletedProfile()` — perfil completado

**Funciones nuevas agregadas:**
- `saveGuestCheckin(checkin)` — guarda un checkin en AsyncStorage. **IMPORTANTE:** acumula todos los checkins, NO reemplaza. Un usuario puede hacer múltiples checkins por día.
- `getGuestCheckins()` — retorna todos los checkins
- `getGuestTodayCheckin()` — retorna el checkin de hoy (el primero encontrado)
- `saveGuestProgress(nivel, subnivel)` — guarda el progreso del camino
- `getGuestProgress()` — retorna `{nivel, subnivel}`, default `{1, 1}`
- `saveGuestPet(pet)` — guarda el estado de la mascota
- `getGuestPet()` — retorna el estado de la mascota
- `getGuestAhorro()` — calcula el ahorro. **Lógica:** agrupa checkins por día. Si algún checkin del día tiene `consumo: true`, ese día es "malo" y no cuenta para el ahorro.
- `updateGuestSobrietyDate()` — actualiza la fecha de último consumo al momento actual (UTC-5). Se llama cuando el usuario hace un checkin con consumo.
- `setPendingMigration()` / `getPendingMigration()` / `clearPendingMigration()` — manejo del flag de migración pendiente
- `getGuestDataForMigration()` — retorna todos los datos del guest para migrar: profile, sobriety, contacts, checkins, progress, pet

---

### `frontend/mobile/src/modules/pet/services/petService.ts`
Agregado `if(isGuest)` en las 3 funciones principales:

- `getPet()` — si guest → `getGuestPet()` o DEFAULT_PET
- `addXp(action, nivel?, subnivel?)` — si guest → calcula localmente con `xp-config`. Usa `last_actions` para validar que no se gane XP dos veces el mismo día. La clave para `module_complete` es única por `nivel_subnivel`.
- `selectForm(form)` — si guest → actualiza `selected_form` en AsyncStorage

---

### `frontend/mobile/src/modules/progress/screens/checkin/components/CheckInStep3.tsx`
Agregado `if(isGuest)` en `handleFinish`:
- Guest → `saveGuestCheckin()` + si consumo → `updateGuestSobrietyDate()`
- Normal → `saveDailyCheckin()` al backend
- El XP lo maneja `petService.addXp()` internamente (ya detecta guest)

---

### `frontend/mobile/src/hooks/useLevelProgress.ts`
Agregado `if(isGuest)` en:
- `fetchProgress()` → guest lee de `getGuestProgress()`
- `advance()` → guest calcula siguiente nivel/subnivel localmente y guarda con `saveGuestProgress()`

Lógica de avance: subnivel++ hasta MAX_SUBNIVEL (3), luego nivel++ hasta MAX_NIVEL (12).

---

### `frontend/mobile/src/modules/progress/screens/analysis/hooks/useAnalysisData.ts`
Agregado `if(isGuest)`:
- Sin summary de IA
- `calcularRiskChartsDesdeCheckins()` — filtra solo checkins con consumo y agrupa por emoción, ubicación y social
- `calcularCalendarioDesdeCheckins()` — filtra por mes/año
- Today checkin — busca en checkins por `dia === hoy`

---

### `frontend/mobile/src/modules/progress/screens/analysis/hooks/useCalendarData.ts`
Agregado `if(isGuest)`:
- `calculateMinMaxFromAllRegistros()` — usa `getGuestCheckins()`
- `fetchCalendar()` — usa `processGuestDays()` que agrupa por día. **Lógica día malo:** si algún checkin del día tiene `consumo: true`, el día es `dificil` y se muestra el checkin de consumo.
- `processGuestDays()` — nueva función que maneja múltiples checkins por día

---

### `frontend/mobile/src/modules/progress/screens/analysis/hooks/useEmotionStats.ts`
Agregado `if(isGuest)` → lee de `getGuestCheckins()` en lugar del backend.

---

### `frontend/mobile/src/modules/progress/screens/analysis/hooks/useConsumptionByDay.ts`
Agregado `if(isGuest)` → filtra checkins con `consumo === true` desde AsyncStorage.

---

### `frontend/mobile/src/modules/progress/screens/GratitudeHistoryScreen.tsx`
- Fix de timing: espera `isGuestMode()` antes de fetchear
- `fetchGratitudeHistory(guest: boolean)` recibe el flag como parámetro
- Guest → filtra checkins con gratitud, formatea y ordena por `diaRaw` (fecha original) para evitar problemas con fechas formateadas

---

### `frontend/mobile/src/modules/progress/screens/ProgressScreen.tsx`
Agregado `if(isGuest)` en `fetchLatestGratitude()`:
- Guest → lee de `getGuestCheckins()`, filtra por gratitud, toma el más reciente
- Normal → llama al backend (comportamiento sin cambios)

---

### `frontend/mobile/src/modules/home/screens/HomeScreen.tsx`
- **Ahorro:** ahora visible para guest y normal. Guest → `getGuestAhorro()`
- **GuestBanner:** eliminado del home (las opciones están en Settings)
- **Sobriedad y ahorro:** recargan al recibir foco con `navigation.addListener('focus')`

---

### `frontend/mobile/src/modules/home/screens/SavingsScreen.tsx`
Agregado `if(isGuest)` → `getGuestAhorro()` en lugar del backend.

---

### `frontend/mobile/src/modules/home/screens/MainScreen.tsx`
- Agrega `LockedForGuestScreen` — pantalla bloqueada con `character5.png`
- Care, Motivation, Social muestran `LockedForGuestScreen` si `isGuest === true`
- `isGuest` se carga una vez al montar con `isGuestMode()`

---

### `frontend/mobile/src/modules/home/screens/crisis/MotivationalPhrasesScreen.tsx`
- Detecta `isGuest` con `isGuestMode()`
- Pasa `isGuest` prop a `MotivationalCard` para ocultar el corazón de favoritos

---

### `frontend/mobile/src/modules/care/screens/motivational/components/MotivationalCard.tsx`
- Nuevo prop opcional `isGuest?: boolean`
- Si `isGuest === true` → oculta el botón de corazón (favoritos)
- El botón de compartir sigue visible para todos

---

### `frontend/mobile/src/modules/config/screens/SettingsScreen.tsx`
- Detecta `isGuestMode()` al cargar
- Guest → carga perfil desde `getGuestProfile()`
- Normal → carga desde backend
- `readOnly={false}` — `InfoAccordion` maneja internamente si es guest
- Guest → muestra "Crear cuenta y guardar progreso" en lugar de cambiar contraseña/eliminar cuenta
- Guest → muestra "Borrar todos mis datos" con confirmación fuerte
- Usuario logueado con `pendingMigration` → muestra "Sincronizar datos pendientes"
- `handleRetryMigration()` → reintenta `migrateGuestToUser()`

---

### `frontend/mobile/src/modules/config/components/InfoAccordion.tsx`
- Nuevo prop `readOnly?: boolean` (ya no se usa para guest, se mantiene por compatibilidad)
- `handleSave()` detecta `isGuestMode()`:
  - Guest → `getGuestProfile()` + `saveGuestProfile()` preservando campos existentes
  - Normal → `updateProfile()` al backend

---

### `frontend/mobile/src/modules/auth/screens/VerifyEmailScreen.tsx`
- Recibe `fromGuest?: boolean` en `route.params`
- Después del login automático, si `fromGuest === true`:
  - Llama `migrateGuestToUser()`
  - Si falla → `setPendingMigration()` + toast informativo
  - Navega a Home (sin las 10 preguntas)
- Muestra estado "Sincronizando tus datos..." mientras migra

---

### `frontend/mobile/src/modules/auth/screens/RegisterScreen.tsx`
- Detecta `isGuestMode()` y `hasGuestCompletedProfile()`
- Pasa `fromGuest: wasGuest && guestCompletedProfile` a VerifyEmail
- Botón atrás usa `navigation.goBack()` en lugar de `navigation.replace('Welcome')`

---

### `frontend/mobile/src/services/authService.ts`
- `migrateGuestToUser()` — actualizado con payload limpio que el DTO del backend acepta:
  - Sin campos extra en checkins (sin `id`, `dia`, `hora`)
  - Sin campos extra en pet (sin `level`, `form`)
  - `reg_lugar_riesgo` y `comp_logros_comunid` como booleanos con default `false`
  - Si falla → llama `setPendingMigration()` antes de relanzar el error

---

### `frontend/mobile/src/navigation/LoaderScreen.tsx`
- Si hay tokens válidos (usuario logueado) → verifica `getPendingMigration()`
- Si hay migración pendiente → reintenta `migrateGuestToUser()` automáticamente
- Si falla de nuevo → continúa al Home normal (se reintentará la próxima vez)

---

## 6. AsyncStorage — estructura de datos

Todas las keys usan el `guestId` como sufijo para evitar colisiones entre usuarios:

```
guestId                          → string UUID del guest
isGuest                          → 'true'

guestProfile_{guestId}           → JSON con el perfil del onboarding
guestSobriety_{guestId}          → JSON { startDate: ISO string }
guestContacts_{guestId}          → JSON array de contactos
guestCheckins_{guestId}          → JSON array de checkins (acumulados)
guestProgress_{guestId}          → JSON { nivel: number, subnivel: number }
guestPet_{guestId}               → JSON con estado de la mascota + last_actions
guestProfileCompleted_{guestId}  → 'true' cuando completó el onboarding
tourCompleted_guest_{guestId}    → 'true' cuando completó el tour

pendingMigration                 → 'true' si hay migración pendiente (sin guestId, persiste tras logout)
```

**Estructura de un checkin:**
```json
{
  "id": "uuid",
  "fecha": "2026-05-23T16:36:20.163Z",
  "dia": "2026-05-23",
  "hora": "16:36",
  "emocion": "Ansioso",
  "consumo": true,
  "gratitud": "texto",
  "ubicacion": "En un bar o disco",
  "social": "Solo",
  "reflexion": "texto"
}
```

**Estructura de la mascota:**
```json
{
  "xp": 180,
  "level": 2,
  "form": "sprout",
  "selected_form": "sprout",
  "unlocked_forms": ["seed", "sprout"],
  "last_actions": {
    "checkin": "2026-05-23",
    "sober_day": "2026-05-22",
    "module_1_1": "2026-05-20"
  }
}
```

---

## 7. Sistema de XP local

El XP se calcula en el frontend usando `xp-config.ts` — copia exacta del backend:

| Acción | XP |
|--------|-----|
| checkin | 10 |
| sober_day | 20 |
| module_complete | 15 |

**Validación anti-abuso:** `last_actions` en la mascota guarda la fecha (UTC-5) de la última vez que se ganó XP por cada acción. Si el usuario ya ganó XP por `checkin` hoy, retorna `already_given: true`.

Para `module_complete` la clave es `module_{nivel}_{subnivel}` — nunca se puede repetir el mismo módulo.

**Formas de la mascota:**
| Forma | XP requerido |
|-------|-------------|
| seed | 0 |
| sprout | 100 |
| moss | 300 |
| flower_lavanda | 500 |
| flower_azucena | 700 |
| flower_baobab | 900 |
| flower_lirio | 1100 |
| flower_crisantemo | 1300 |

---

## 8. Migración de datos

### Payload enviado a `POST /auth/migrate-guest`

```typescript
{
  guestId: string,
  profile: {
    apodo, pronombre, ult_fecha_consumo, motivo_sobrio,
    gasto_semana, telefono, reg_lugar_riesgo, comp_logros_comunid,
    moment_motiv, nombre_contacto?
  },
  sobriety: { startDate: string } | null,
  contacts: [{ id, nombre, telefono }],
  checkins: [{
    fecha, emocion, consumo, gratitud,
    ubicacion?, social?, reflexion?
  }],
  progress: { nivel, subnivel } | undefined,
  pet: {
    xp, selected_form, unlocked_forms, last_actions
  } | undefined
}
```

### Tablas que se migran (en orden):
1. `informacion_personal` — INSERT
2. `sobriedad` — INSERT
3. `contactos` — INSERT (nuevo UUID por contacto)
4. `registro_diario` — INSERT (todos los checkins)
5. `camino` — UPSERT (update si ya existe, insert si no)
6. `user_pet` — UPSERT (update si ya existe, insert si no)

El camino y la mascota hacen upsert porque `POST /progress/init` (llamado en `loginUser`) ya crea un registro de camino en 1/1. El migrate lo actualiza con el progreso real del guest.

---

## 9. Módulos bloqueados

`LockedForGuestScreen` — componente dentro de `MainScreen.tsx`:
- Imagen: `assets/images/character5.png`
- Mensaje: "El módulo de {nombre} está disponible solo para usuarios registrados"
- Botón: "Crear cuenta" → `navigation.navigate('Register')`
- El botón de atrás en Register usa `goBack()` → vuelve al Home

Módulos bloqueados: Care, Motivation, Social

Módulos accesibles: Home, Progress (completos con todas sus funciones)

---

## 10. Pending migration

Si el migrate falla (por conexión o cualquier error):
1. `setPendingMigration()` → guarda `pendingMigration: 'true'` en AsyncStorage
2. Los datos del guest permanecen en AsyncStorage (NO se borran)
3. El usuario llega al Home normalmente
4. La próxima vez que abra la app → `LoaderScreen` reintenta automáticamente
5. En Settings → aparece botón "Sincronizar datos pendientes"
6. Si el retry tiene éxito → `clearGuestData()` + `clearPendingMigration()`

---

## 11. Cambios a producción

> **⚠️ CRÍTICO:** Los siguientes cambios de backend deben desplegarse a producción para que el guest mode funcione completamente. Sin esto, los audios, frases y el migrate fallarán para usuarios guest.

Ver documento detallado en: `backend/mobile-api/src/GUEST_MODE_BACKEND.md`

**Resumen de archivos de backend a desplegar:**
```
backend/mobile-api/src/modules/guided-meditation/infrastructure/controllers/guided-meditation.controller.ts
backend/mobile-api/src/modules/guided-meditation/guided-meditation.module.ts
backend/mobile-api/src/modules/motivation/presentation/controllers/motivation.controller.ts
backend/mobile-api/src/modules/motivation/application/use-cases/get-frase-del-dia.use-case.ts
backend/mobile-api/src/modules/motivation/application/use-cases/get-frases-por-fecha.use-case.ts
backend/mobile-api/src/modules/sos/infrastructure/controllers/breathing-sounds.controller.ts
backend/mobile-api/src/modules/sos/sos.module.ts
backend/mobile-api/src/modules/auth/application/use-cases/migrate-guest.use-case.ts
backend/mobile-api/src/modules/auth/presentation/dtos/migrate-guest.dto.ts
```

**Antes del commit — verificar en `api.ts`:**
```typescript
// ✅ DEBE apuntar a producción
const BASE_URL = 'https://newlife-mobile-api.openlab.uninorte.edu.co';
// ❌ NO dejar esto
const BASE_URL = 'http://10.0.2.2:5181';
```

---

## 12. Consideraciones importantes

### Timezone Colombia (UTC-5)
Todos los cálculos de fecha/hora usan UTC-5:
```typescript
const ahoraCol = new Date(Date.now() - 5 * 60 * 60 * 1000);
```
El emulador de Android Studio puede tener la hora en UTC, causando que el timer de sobriedad aparezca desfasado 5 horas. En un dispositivo real con zona horaria correcta funciona bien.

### Día malo con múltiples checkins
Un usuario puede hacer múltiples checkins en el mismo día. La lógica es:
- Si **alguno** del día tiene `consumo: true` → el día es **malo** (naranja en calendario, no cuenta para ahorro)
- Solo si **todos** son `consumo: false` → el día es **limpio**

Esta lógica aplica en: `getGuestAhorro()`, `processGuestDays()` en `useCalendarData`, `useAnalysisData`.

### XP por día
El XP se gana **una sola vez por día** por tipo de acción. Si el usuario hace 5 checkins en un día, solo gana XP por el primero. Esto se controla con `last_actions` en la mascota.

### clearGuestData solo después de migrate exitoso
`clearGuestData()` **solo** se llama si el migrate fue exitoso. Si falla, los datos permanecen en AsyncStorage y se puede reintentar.

### Múltiples guests simultáneos
No hay problema. Cada guest tiene su propio `guestId` UUID. Las keys en AsyncStorage incluyen el `guestId` como sufijo, por lo que nunca hay colisiones entre usuarios.

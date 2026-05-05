# Módulo Pet — Sistema de Mascota Evolutiva

## Resumen
Sistema de gamificación emocional para la app NewLife. El usuario tiene una mascota virtual que evoluciona según su progreso en sobriedad y actividades. No hay castigos — solo progreso positivo.

---

## Base de datos

### Tabla `user_pet`
```sql
_id            character varying  -- PK generada por Roble
usuario_id     uuid               -- FK al usuario, único por usuario
xp             bigint             -- XP acumulado total, nunca baja
selected_form  character varying  -- forma equipada actualmente
unlocked_forms jsonb              -- array de formas desbloqueadas
last_actions   jsonb              -- registro de acciones del día para evitar duplicados
updated_at     timestamp
```

### Ejemplo de fila
```json
{
  "_id": "abc123",
  "usuario_id": "4b1945e7-...",
  "xp": 175,
  "selected_form": "sprout",
  "unlocked_forms": ["seed", "sprout"],
  "last_actions": {
    "checkin": "2026-05-05",
    "sober_day": "2026-05-05",
    "module_9_2": "2026-05-05"
  },
  "updated_at": "2026-05-05T09:47:00"
}
```

**Nota:** El nivel nunca se guarda — siempre se calcula desde el XP en `xp-config.ts`.

---

## Backend — Estructura
src/modules/pet/
├── application/use-cases/
│   ├── init-pet.use-case.ts       ← crea registro inicial al registrar usuario
│   ├── get-pet.use-case.ts        ← obtiene estado actual calculando nivel y forma
│   ├── add-xp.use-case.ts         ← suma XP con validación de duplicados
│   └── select-form.use-case.ts    ← cambia la forma equipada
│
├── domain/
│   ├── config/xp-config.ts        ← umbrales XP, formas, fuentes de XP
│   ├── entities/pet.entity.ts     ← entidad PetEntity
│   └── ports/pet-provider.port.ts ← interfaz del repositorio
│
├── infrastructure/adapters/
│   └── roble-pet.adapter.ts       ← implementación BD Roble
│
└── presentation/
├── controllers/pet.controller.ts
└── dtos/
├── add-xp.dto.ts
└── select-form.dto.ts

---

## Backend — Endpoints

### `GET /pet`
Obtiene el estado actual de la mascota del usuario autenticado.

**Response:**
```json
{
  "xp": 175,
  "level": 2,
  "form": "sprout",
  "selected_form": "sprout",
  "unlocked_forms": ["seed", "sprout"]
}
```

### `POST /pet/add-xp`
Suma XP por una acción. Valida duplicados automáticamente.

**Body:**
```json
{
  "action": "checkin",
  "nivel": 1,
  "subnivel": 1
}
```

**Acciones disponibles:**
| Acción | XP | Validación |
|--------|----|-----------|
| `checkin` | +10 | Una vez por día via `last_actions` |
| `sober_day` | +20 | Una vez por día via `last_actions` |
| `module_complete` | +15 | Controlado desde frontend con `isCurrentModule` |

**Response:**
```json
{
  "xp": 190,
  "xp_gained": 15,
  "level": 2,
  "form": "sprout",
  "selected_form": "sprout",
  "unlocked_forms": ["seed", "sprout"],
  "new_unlocks": [],
  "evolved": false,
  "already_given": false
}
```

Si `already_given: true` significa que el XP ya fue otorgado y `xp_gained` será 0.

### `PATCH /pet/select-form`
Cambia la forma equipada. Solo acepta formas desbloqueadas.

**Body:**
```json
{ "form": "flower_azucena" }
```

---

## Backend — Lógica de XP

### Fuentes de XP (`xp-config.ts`)
```typescript
checkin: 10
sober_day: 20
module_complete: 15
```

### Umbrales de evolución (`xp-config.ts`)
```typescript
seed:              0 XP   → Nivel 1
sprout:          100 XP   → Nivel 2
moss:            300 XP   → Nivel 3 (umbral bajado intencionalmente)
flower_lavanda:  500 XP   → Nivel 4
flower_azucena:  700 XP   → Nivel 4
flower_baobab:   900 XP   → Nivel 4
flower_lirio:   1100 XP   → Nivel 4
flower_crisantemo: 1300 XP → Nivel 4
```

### Validación de duplicados
- `checkin` y `sober_day` — se verifica `last_actions[action] === hoy`. Si ya existe, `already_given: true`.
- `module_complete` — el frontend verifica `progress.nivel === level && progress.subnivel === sublevel` ANTES de llamar `advance()`. Si no coincide, no llama `addXp`.

### Auto-equipar formas
Cuando hay un nuevo desbloqueo y la forma actual NO es una flor, se auto-equipa la nueva forma. Si ya tiene una flor equipada, se respeta su elección.

### Init pet
Al registrar un nuevo usuario se emite el evento `user.registered`. El `InitPetUseCase` escucha ese evento y crea el registro inicial con XP 0 y forma `seed`.

---

## Frontend — Estructura
src/modules/pet/
├── components/
│   ├── PetAvatar.tsx       ← imagen de la mascota según forma
│   ├── PetWidget.tsx       ← widget del dashboard con mascota, burbuja y barra XP
│   └── XpBar.tsx           ← barra de progreso XP animada
│
├── context/
│   └── PetContext.tsx      ← estado global, fetchPet, addXp, selectForm
│
├── hooks/
│   └── usePet.ts           ← consume PetContext
│
├── screens/
│   ├── PetScreen.tsx           ← pantalla principal con fondo decorativo
│   ├── PetInfoScreen.tsx       ← ficha de mascota y árbol de evoluciones
│   ├── PetEvolutionScreen.tsx  ← animación al evolucionar
│   └── PetCollectionScreen/
│       └── index.tsx           ← grid completo de formas
│
├── services/
│   └── petService.ts       ← llamadas al backend
│
├── types/
│   └── pet.types.ts        ← PetForm, PetState, AddXpResponse, XpAction
│
└── utils/
└── petHelpers.ts       ← PET_IMAGES, PET_NAMES, PET_DESCRIPTIONS,
PET_MESSAGES, PET_BACKGROUNDS, XP_THRESHOLDS,
getPetMessage(), getXpProgress()

---

## Frontend — PetContext

Estado global compartido entre todas las pantallas. Vive en `AppNavigator` como `PetProvider`.

```typescript
interface PetContextType {
  pet: PetState;
  message: string;       // mensaje dinámico por forma equipada
  loading: boolean;
  error: string | null;
  fetchPet: () => Promise<void>;
  addXp: (action: XpAction, nivel?: number, subnivel?: number) => Promise<AddXpResponse | null>;
  selectForm: (form: PetForm) => Promise<void>;
}
```

**Optimistic update en `selectForm`:**
El estado local se actualiza inmediatamente antes de llamar al backend. Si el backend falla, se revierte y muestra `showToast` de error.

---

## Frontend — Assets
src/assets/images/pet/
├── seed.png
├── sprout.png
├── moss.png
├── flower_lavanda.png
├── flower_azucena.png
├── flower_baobab.png
├── flower_lirio.png
└── flower_crisantemo.png

PNGs sin fondo (transparentes). Las formas bloqueadas se oscurecen con un overlay `rgba(0,0,0,0.75)` en código — sin assets extra.

---

## Flujo completo — Registro diario
Usuario completa DailyCheckIn
→ CheckInStep3 llama saveDailyCheckin()
→ addXp('checkin')          → +10 XP si primera vez hoy
→ addXp('sober_day')        → +20 XP si no consumió y primera vez hoy
→ navega a CheckInSuccessScreen con { xp_gained, evolved, new_form, xp }
→ si evolved === true
→ botón "¡Ver evolución!" → PetEvolutionScreen → Home
→ si evolved === false
→ botón "Salir" → Home

---

## Flujo completo — Módulos 12 pasos
Usuario completa NivelModulo
→ isCurrentModule = progress.nivel === level && progress.subnivel === sublevel
→ advance(level, sublevel)   → avanza camino en BD
→ si isCurrentModule
→ addXp('module_complete', level, sublevel)  → +15 XP
→ si evolved === true
→ showToast + navega a PetEvolutionScreen con destination: 'Path'
→ si evolved === false
→ showToast '+15 XP ¡Módulo completado!' → navega a Path
→ si !isCurrentModule
→ showToast '¡Módulo completado!' → navega a Path (sin XP)

---

## Flujo completo — Selección de mascota
Usuario en PetCollectionScreen toca una forma desbloqueada
→ optimistic update: estado local cambia inmediatamente
→ petService.selectForm(form) llama PATCH /pet/select-form
→ si éxito: estado confirmado, PetWidget en home refleja cambio
→ si error: estado revierte, showToast de error

---

## Pantallas de pet

### PetScreen
Pantalla principal. Fondo decorativo con colores por nivel:
- Nivel 1 → marrón tierra
- Nivel 2 → verde claro
- Nivel 3 → verde oscuro
- Nivel 4 → morado

Botones en header:
- `?` → navega a `PetInfoScreen`
- libro → navega a `PetCollectionScreen`

### PetInfoScreen
Ficha de la mascota actual con nombre, tagline, descripción y árbol de evoluciones. Formas bloqueadas con overlay oscuro.

### PetCollectionScreen
Grid de 2 columnas con todas las formas. Desbloqueadas en color con tagline. Bloqueadas con silueta oscura y XP requerido. Al tocar una desbloqueada la equipa con optimistic update.

### PetEvolutionScreen
Animación spring al desbloquear una nueva forma. Recibe `newForm`, `xp` y `destination`. Al presionar "¡Genial!" navega al `destination`.

---

## Mensajes dinámicos

Cada forma tiene 3 mensajes únicos en `PET_MESSAGES` dentro de `petHelpers.ts`. El mensaje se selecciona aleatoriamente y se guarda en `PetContext`. Cambia cuando:
- Se carga la mascota por primera vez
- Se cambia la forma equipada
- Se suma XP y la forma cambia

---

## Para extender el sistema en el futuro

### Agregar nueva fuente de XP
1. Agregar en `xp-config.ts`: `nueva_accion: 25`
2. Agregar en `add-xp.dto.ts`: `@IsIn([..., 'nueva_accion'])`
3. Llamar `addXp('nueva_accion')` desde el frontend donde corresponda

### Cambiar umbrales de XP
Solo editar `FORM_THRESHOLDS` en `xp-config.ts` (backend) y `XP_THRESHOLDS` en `petHelpers.ts` (frontend). Los valores están en un solo lugar en cada capa.

### Agregar nueva forma/mascota
1. Agregar el PNG en `src/assets/images/pet/`
2. Agregar el tipo en `pet.types.ts`
3. Agregar en `petHelpers.ts`: imagen, nombre, descripción, mensajes, threshold
4. Agregar en `xp-config.ts`: threshold y forma

### Guardar respuestas de módulos en BD
En `NivelModulo.tsx` el estado `answers` tiene todas las respuestas del usuario. Actualmente se descartan al navegar. Para persistirlas, pasar `answers` junto con `nivel` y `subnivel` al backend en un nuevo endpoint.
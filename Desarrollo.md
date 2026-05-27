# Manual de Desarrollo — NewLife


## Tabla de Contenidos

- [1. Introducción](#1-introducción)
- [2. Descripción General Técnica del Proyecto](#2-descripción-general-técnica-del-proyecto)
- [3. Estructura del Repositorio](#3-estructura-del-repositorio)
- [4. Organización del Código](#4-organización-del-código)
- [5. Contenedores y Orquestación](#5-contenedores-y-orquestación)
- [6. Scripts y Automatizaciones](#6-scripts-y-automatizaciones)
- [7. Variables de Entorno](#7-variables-de-entorno)
- [8. Flujo de Trabajo de Desarrollo](#8-flujo-de-trabajo-de-desarrollo)
- [9. Dependencias y Servicios Externos](#9-dependencias-y-servicios-externos)
- [10. Convenciones del Proyecto](#10-convenciones-del-proyecto)
- [11. Problemas Frecuentes y Soluciones](#11-problemas-frecuentes-y-soluciones)
- [12. Decisiones Técnicas Importantes](#12-decisiones-técnicas-importantes)
- [13. Referencias Relacionadas](#13-referencias-relacionadas)

---

## 1. Introducción

Este manual es la referencia técnica interna para cualquier desarrollador que trabaje en **NewLife** — una plataforma digital de salud que apoya la recuperación post-rehabilitación de sustancias en jóvenes de 18–24 años en Barranquilla, Colombia.

**Audiencia objetivo**: Desarrolladores nuevos incorporándose al proyecto y desarrolladores existentes que necesiten consultar convenciones, estructura o decisiones técnicas. Si eres nuevo, te recomendamos leer este documento completo antes de escribir cualquier línea de código. Si eres un desarrollador existente, usa el índice para navegar a la sección relevante.

**Cómo usar este manual**: Está organizado del contexto general al específico. Las secciones 2–4 cubren la visión técnica y estructura. Las secciones 5–8 son guías operativas para el día a día. Las secciones 9–13 son referencias para situaciones específicas.

Este documento **no reemplaza** el `informe.md` (que cubre arquitectura y despliegue) ni el `instalacion.md` (guía de instalación paso a paso). Léelos en conjunto para una comprensión completa del sistema.

---

## 2. Descripción General Técnica del Proyecto

### 2.1 Resumen Técnico

NewLife es un **monorepo full-stack** que contiene cuatro aplicaciones TypeScript principales, orquestadas mediante Docker Compose. Está construido sobre el patrón **BFF (Backend For Frontend)**: hay un backend dedicado para la app móvil y otro para el panel web, optimizados cada uno para sus respectivos clientes.

La solución se divide en:
- **App móvil** (React Native/Expo) — punto de contacto con usuarios en recuperación
- **Panel web administrativo** (Next.js) — interfaz para profesionales de salud
- **Mobile API** (NestJS) — lógica de negocio para la app móvil
- **Admin API** (NestJS) — lógica de negocio para el panel web

Los datos de todos los componentes convergen en una base de datos PostgreSQL institucional (Roble UN) y los archivos multimedia en una instancia self-hosted de MinIO.

### 2.2 Tecnologías Principales

| Tecnología | Versión | Parte del proyecto | Razón de selección |
|---|---|---|---|
| **TypeScript** | 5.x | Todo el proyecto | Tipado estático; reduce errores en tiempo de desarrollo |
| **React Native** | 0.83.6 | `frontend/mobile` | Desarrollo Android/iOS con un solo codebase |
| **Expo** | ~55.0.24 | `frontend/mobile` | Simplifica builds, OTA updates y acceso a APIs nativas |
| **Zustand** | Latest | `frontend/mobile` | State management sin boilerplate; curva de aprendizaje mínima |
| **React Navigation** | Latest | `frontend/mobile` | Estándar de navegación en React Native |
| **Next.js** | 16.1.6 | `frontend/web` | SSR + App Router; ideal para dashboard con rutas públicas (privacidad) |
| **Tailwind CSS** | Latest | `frontend/web` | Prototipado UI rápido con consistencia |
| **Radix UI** | Latest | `frontend/web` | Componentes accesibles sin estilos impuestos |
| **NestJS** | 10.4 / 11.0 | `backend/*` | Framework estructurado; módulos, guards, pipes declarativos |
| **Socket.io** | Latest | `backend/mobile-api` | WebSockets con fallback automático; gestión de salas para chat |
| **class-validator** | Latest | `backend/*` | Validación declarativa de DTOs con decoradores |
| **JWT (Passport.js)** | Latest | `backend/*` | Autenticación stateless; tokens separados para móvil y admin |
| **PostgreSQL (Roble)** | Latest | `backend/*` | Base de datos institucional de la Universidad del Norte |
| **MinIO** | Latest | `backend/admin-api` | Almacenamiento S3-compatible self-hosted; sin costos de AWS |
| **Sharp** | Latest | `backend/admin-api` | Procesamiento de imágenes en el servidor (resize, compresión) |
| **Docker + Compose** | Latest | Infraestructura | Reproducibilidad del entorno; despliegue simplificado |
| **GitHub Actions** | N/A | CI/CD | Despliegue automático en push a `release` |

### 2.3 Componentes Principales

| Componente | Directorio | Función |
|---|---|---|
| App Móvil | `frontend/mobile/` | Aplicación Android/iOS para usuarios finales |
| Panel Web Admin | `frontend/web/` | Dashboard de gestión para administradores |
| Mobile API | `backend/mobile-api/` | REST API + WebSocket para la app móvil |
| Admin API | `backend/admin-api/` | REST API para el panel de administración |
| MinIO | Contenedor Docker | Almacenamiento de imágenes y audios |
| Roble DB | Servicio externo | Base de datos PostgreSQL institucional |

---

## 3. Estructura del Repositorio

### 3.1 Árbol General del Repositorio

```
NewLife/
├── frontend/
│   ├── mobile/                  # App React Native/Expo
│   │   ├── src/
│   │   │   ├── modules/         # Módulos de funcionalidad
│   │   │   ├── navigation/      # Configuración de navegación
│   │   │   ├── services/        # Servicios HTTP, caché, analytics
│   │   │   ├── context/         # Providers de React Context
│   │   │   ├── hooks/           # Custom hooks reutilizables
│   │   │   ├── feedback/        # Componentes de UI feedback
│   │   │   ├── constants/       # Tema y constantes globales
│   │   │   ├── store/           # Estado global (Zustand)
│   │   │   ├── utils/           # Utilidades generales
│   │   │   └── assets/          # Imágenes e iconos estáticos
│   │   ├── android/             # Proyecto Android nativo
│   │   ├── app.json             # Configuración Expo
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                     # Panel Next.js
│       ├── app/                 # App Router (páginas y layouts)
│       ├── components/          # Componentes React reutilizables
│       ├── context/             # State global (React Context)
│       ├── hooks/               # Custom hooks
│       ├── lib/                 # Utilidades y cliente HTTP
│       ├── public/              # Assets estáticos públicos
│       ├── styles/              # CSS global y variables Tailwind
│       ├── package.json
│       └── tsconfig.json
├── backend/
│   ├── mobile-api/              # NestJS API para app móvil
│   │   ├── src/
│   │   │   ├── modules/         # Módulos de negocio (auth, users, progress…)
│   │   │   ├── shared/          # Constantes y utilidades compartidas
│   │   │   └── zones/           # Lógica de zonas de riesgo
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── admin-api/               # NestJS API para panel admin
│       ├── src/
│       │   └── modules/         # Módulos admin (admin, media, care, motivation, analytics)
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
├── test/                        # Suite de pruebas automatizadas
│   ├── README.md                # Documentación de la suite de pruebas
│   ├── fixtures/                # Datos de prueba y mocks reutilizables
│   │   ├── mock-data.js         # Usuarios, check-ins, contenidos, etc.
│   │   ├── test-users.js        # Perfiles de usuario con helpers
│   │   └── test-database.js     # Simulación en memoria de Roble DB
│   ├── utils/                   # Utilidades y aserciones de prueba
│   │   ├── test-helpers.js      # Fábricas de objetos mock
│   │   ├── assertions.js        # Aserciones semánticas personalizadas
│   │   └── setup.js             # Configuración global de Jest
│   ├── unit/
│   │   ├── backend/             # Tests unitarios de servicios, DTOs, guards
│   │   └── frontend/            # Tests de lógica de servicios y hooks
│   └── integration/             # Tests de flujos completos y endpoints
├── diseno/                      # Documentación de diseño
│   └── docs/
│       ├── architecture/        # Decisiones arquitectónicas
│       ├── stack/               # Justificación del stack
│       ├── adr/                 # Architecture Decision Records
│       └── cronograma/          # Timeline del proyecto
├── media-data/                  # Volumen persistente MinIO (no subir a git)
├── .github/
│   └── workflows/
│       └── main.yml             # Pipeline CI/CD GitHub Actions
├── docker-compose.yml           # Orquestación producción
├── docker-compose.dev.yml       # Orquestación desarrollo
├── package.json                 # Scripts raíz del monorepo
├── .env                         # Variables de entorno locales (no subir a git)
└── .gitignore
```

### 3.2 Descripción Detallada de Directorios

#### `frontend/mobile/src/modules/`
Contiene un subdirectorio por cada dominio funcional de la app: `auth/`, `home/`, `progress/`, `motivation/`, `care/`, `social/`, `pet/`, `config/`, y `onboarding/`. Cada módulo tiene su propio conjunto de screens, componentes y lógica específica. Esta organización garantiza que un cambio en el módulo `pet/` no pueda romper accidentalmente el módulo `progress/`.

#### `frontend/mobile/src/services/`
Servicios singleton reutilizables a través de toda la app. `api.ts` configura el cliente Axios centralizado con interceptores de autenticación. `cacheService.ts` y `cacheKeys.ts` implementan la capa de caché local. Los demás servicios (`progressService.ts`, `motivationService.ts`, etc.) encapsulan las llamadas HTTP específicas de cada dominio.

#### `frontend/mobile/src/navigation/`
Define el árbol de navegación completo de la app mediante React Navigation. El `AppNavigator.tsx` es el punto de entrada que decide si mostrar el flujo de autenticación o el flujo principal según el estado de sesión.

#### `backend/mobile-api/src/modules/`
Cada directorio corresponde a un módulo NestJS completo con su `module.ts`, `controller.ts`, `service.ts`, y `dto/` correspondientes. Los módulos están organizados por dominio de negocio, siguiendo la misma taxonomía que los módulos del frontend móvil para facilitar la trazabilidad.

#### `backend/admin-api/src/modules/`
Similar al mobile-api pero con módulos orientados a administración: `admin/` (autenticación de admins), `media/` (gestión de archivos con MinIO), `care/`, `motivation/` y `analytics/`.

#### `diseno/docs/`
Documentación de contexto que no vive en el código: decisiones de arquitectura (ADRs), justificación del stack tecnológico, y cronograma del proyecto. Es la fuente de verdad del "por qué" detrás de las decisiones técnicas.

#### `media-data/`
Directorio montado como volumen en el contenedor MinIO. Contiene los objetos almacenados (imágenes, audios). **No debe ser eliminado** en producción sin hacer backup previo. Está excluido del repositorio git.

---

## 4. Organización del Código

### 4.1 Arquitectura por Capas o Módulos

El proyecto sigue arquitecturas diferenciadas por componente:

#### Backend (NestJS) — Arquitectura por Módulos + Capas Internas

Cada módulo NestJS sigue una estructura de capas interna:

```
modules/
└── progress/
    ├── progress.module.ts        # Registro de dependencias (IoC)
    ├── progress.controller.ts    # Capa de presentación (rutas HTTP)
    ├── progress.service.ts       # Capa de negocio (lógica)
    ├── dto/
    │   ├── create-checkin.dto.ts # Validación de entrada (class-validator)
    │   └── update-progress.dto.ts
    └── interfaces/
        └── progress.interface.ts # Contratos de tipo
```

- **Controller**: Solo maneja rutas HTTP, guards de autenticación y delegación al service. No contiene lógica de negocio.
- **Service**: Contiene toda la lógica. Interactúa con Roble DB. Es el único lugar donde residen los cálculos y validaciones de negocio.
- **DTO**: Define y valida la forma de los datos de entrada usando `class-validator`. Actúa como contrato entre el cliente y el servidor.

#### Frontend Móvil (React Native) — Arquitectura por Módulos + Servicios

```
modules/
└── progress/
    ├── screens/
    │   ├── DailyCheckInScreen.tsx
    │   ├── CheckInSuccessScreen.tsx
    │   └── PathScreen.tsx
    └── components/
        ├── ProgressBar.tsx
        └── LevelCard.tsx

services/
└── progressService.ts            # Todas las llamadas HTTP de progress
```

La separación entre `screens/` (lógica de UI) y `services/` (lógica de red) sigue el principio de separación de responsabilidades. Los screens consumen los servicios, que a su vez usan el cliente Axios centralizado en `api.ts`.

#### Frontend Web (Next.js) — App Router

```
app/
├── admin/                        # Rutas protegidas (requieren auth de admin)
│   ├── layout.tsx                # Layout con verificación de sesión
│   ├── page.tsx                  # Dashboard principal
│   └── content/
│       └── page.tsx              # Gestión de contenidos
├── privacidad/
│   └── page.tsx                  # Página pública (sin auth)
└── eliminar-cuenta/
    └── page.tsx                  # Página pública (sin auth)
```

### 4.2 Relación entre Componentes del Sistema y Código Fuente

| Funcionalidad | Frontend | Backend | Ruta en repositorio |
|---|---|---|---|
| Autenticación móvil | `mobile/src/modules/auth/` | `mobile-api/src/modules/auth/` | Ambas rutas |
| Programa 12 pasos | `mobile/src/modules/progress/` | `mobile-api/src/modules/progress/` | Ambas rutas |
| Herramientas SOS | `mobile/src/modules/home/` | `mobile-api/src/modules/sos/` | Ambas rutas |
| Chat en tiempo real | `mobile/src/modules/social/` | `mobile-api/src/modules/chat/` | Ambas rutas |
| Mascota virtual | `mobile/src/modules/pet/` | `mobile-api/src/modules/pet/` | Ambas rutas |
| Contenidos de cuidado | `mobile/src/modules/care/` | `mobile-api/src/modules/care/` | Ambas rutas |
| Gestión de contenidos (admin) | `web/app/admin/` | `admin-api/src/modules/care/` | Ambas rutas |
| Upload de medios | `web/components/admin/` | `admin-api/src/modules/media/` | Ambas rutas |
| Analíticas | `mobile/src/services/analytics/` | `mobile-api/src/modules/analytics/` | Ambas rutas |
| Zonas de riesgo | `mobile/src/modules/care/ZonesScreen` | `mobile-api/src/zones/` | Ambas rutas |

---

## 5. Contenedores y Orquestación

### 5.1 Contenedores Utilizados

| Contenedor | Imagen Base | Puerto(s) | Función |
|---|---|---|---|
| `admin-api` | `node:20-alpine` (multi-stage) | `5180` | API REST para el panel de administración |
| `api` | `node:20-alpine` (multi-stage) | `5181` | API REST + WebSocket para la app móvil |
| `frontend-web` | `node:20-alpine` (multi-stage) | `5182` | Servidor Next.js para el panel web |
| `minio` | `minio/minio` (oficial) | `5183`, `5184` | Almacenamiento S3 y consola de administración |
| `minio-init` | `minio/mc` (oficial) | — | Inicialización de buckets (efímero) |

**Volúmenes montados**:
- `minio`: `./media-data:/data` — Persistencia de objetos almacenados
- `api` (solo dev): código fuente para hot-reload
- `frontend-web` (solo dev): código fuente para hot-reload

### 5.2 Archivos de Contenedores

| Archivo | Propósito |
|---|---|
| `backend/mobile-api/Dockerfile` | Build multi-stage para la API móvil: instala dependencias, compila TypeScript, crea imagen de producción mínima |
| `backend/admin-api/Dockerfile` | Build multi-stage para la API admin: igual que anterior |
| `frontend/web/Dockerfile` | Build Next.js para producción: genera `.next/standalone` para imagen mínima |
| `docker-compose.yml` | Orquestación completa para producción: sin volúmenes de desarrollo, variables desde `.env` |
| `docker-compose.dev.yml` | Orquestación para desarrollo local: volúmenes de código fuente, variables explícitas |

### 5.3 Construcción y Ejecución

**Entorno de desarrollo** (con hot-reload):
```bash
# Construir imágenes
docker compose -f docker-compose.dev.yml build

# Iniciar todos los servicios en background
docker compose -f docker-compose.dev.yml up -d

# Ver logs en tiempo real
docker compose -f docker-compose.dev.yml logs -f

# Detener todo
docker compose -f docker-compose.dev.yml down
```

**Entorno de producción**:
```bash
# Construir imágenes optimizadas (con BuildKit)
COMPOSE_BAKE=true docker compose build

# Iniciar todos los servicios
docker compose up -d

# Ver logs de un servicio específico
docker compose logs -f api
```

### 5.4 Redes, Puertos y Volúmenes

**Red interna**: Docker Compose crea automáticamente una red bridge privada. Los servicios se comunican usando sus nombres de contenedor como hostname (ej: `http://minio:9000` desde dentro de la red).

**Puertos expuestos al host**:

| Servicio | Puerto host | Puerto contenedor | Protocolo |
|---|---|---|---|
| Admin API | 5180 | 3000 | HTTP |
| Mobile API | 5181 | 3000 | HTTP + WS |
| Frontend Web | 5182 | 3000 | HTTP |
| MinIO API | 5183 | 9000 | HTTP (S3) |
| MinIO Console | 5184 | 9001 | HTTP |

**Volúmenes**:
- `./media-data:/data` en MinIO — Persiste todos los objetos subidos. Su eliminación implica pérdida permanente de imágenes y audios.

### 5.5 Recomendaciones para Modificaciones

⚠️ **Al actualizar imágenes base**: Verificar compatibilidad de versiones de Node.js con las dependencias del proyecto antes de cambiar `node:20-alpine` a otra versión. Algunas dependencias nativas pueden requerir pasos de compilación adicionales.

⚠️ **Al modificar puertos**: Los puertos están hardcodeados en múltiples lugares: `docker-compose.yml`, variables de entorno `CORS_ORIGIN`, y configuración del cliente HTTP del frontend. Cambiar un puerto requiere actualización coordinada en todos estos lugares.

⚠️ **Al modificar `docker-compose.yml` en producción**: Siempre probar los cambios en `docker-compose.dev.yml` primero. Un error de sintaxis en el compose de producción impide el despliegue completamente.

⚠️ **Al agregar nuevos servicios**: Asegurarse de incluir el servicio en ambos archivos compose (dev y producción) y agregar las variables de entorno correspondientes en `.env` y `.env.example`.

---

## 6. Scripts y Automatizaciones

### 6.1 Scripts Principales

Los scripts se invocan desde la raíz del monorepo usando el `package.json` raíz, o desde cada subdirectorio de proyecto:

**Desde el directorio de cada proyecto**:

```bash
# --- App Móvil ---
cd frontend/mobile
npx expo start              # Inicia el servidor de desarrollo Expo
npx expo start --android    # Inicia directamente en emulador Android
npx expo build:android      # Genera APK para distribución

# --- Panel Web ---
cd frontend/web
npm run dev                 # Servidor Next.js en desarrollo (:3000)
npm run build               # Build de producción
npm run start               # Sirve el build de producción
npm run lint                # Verificación con ESLint

# --- Mobile API ---
cd backend/mobile-api
npm run start:dev           # NestJS con hot-reload (watch mode)
npm run build               # Compila TypeScript a dist/
npm run start:prod          # Ejecuta dist/main.js (producción)
npm run lint                # ESLint

# --- Admin API ---
cd backend/admin-api
npm run start:dev           # NestJS con hot-reload
npm run build               # Compila TypeScript a dist/
npm run start:prod          # Ejecuta dist/main.js (producción)
```

### 6.2 Scripts Auxiliares

El workflow de GitHub Actions en `.github/workflows/main.yml` automatiza el despliegue. Aunque no es un script local invocable directamente, su lógica puede ejecutarse manualmente en el servidor de producción si el pipeline falla:

```bash
# Script equivalente al workflow CI/CD (ejecutar en servidor de producción)
cd /home/proyecto/NewLife
git pull origin release
COMPOSE_BAKE=true docker compose build
docker compose down
docker compose up -d
```

### 6.3 Consideraciones para su Uso

**Dependencias necesarias**:
- Node.js 20+ y npm para los proyectos TypeScript/JavaScript
- Docker y Docker Compose para el entorno containerizado
- Git para gestión de versiones

**Variables de entorno requeridas**: Antes de ejecutar cualquier servicio localmente (sin Docker), asegurarse de que las variables de entorno estén configuradas (ver sección 7).

**Precauciones**:
- `npm run build` genera código en `dist/` que **no debe subirse a git** (está en `.gitignore`)
- `npx expo build:android` requiere una cuenta Expo configurada y puede tardar varios minutos
- Ejecutar `docker compose down -v` elimina los volúmenes incluido `media-data`; usar solo `docker compose down` para conservar datos

---

## 7. Variables de Entorno

### 7.1 Variables Requeridas

| Variable | Servicio | Descripción |
|---|---|---|
| `ROBLE_BASE_URL` | mobile-api, admin-api | URL base de la API de Roble (ej: `https://roble-api.openlab.uninorte.edu.co`) |
| `ROBLE_PROJECT_TOKEN` | mobile-api, admin-api | Token del proyecto NewLife en Roble |
| `ROBLE_DB_NAME` | mobile-api, admin-api | Nombre de la base de datos (ej: `New_Life_V0`) |
| `ROBLE_SYSTEM_EMAIL` | mobile-api, admin-api | Email de la cuenta de sistema en Roble |
| `ROBLE_SYSTEM_PASSWORD` | mobile-api, admin-api | Contraseña de la cuenta de sistema en Roble |
| `ADMIN_JWT_SECRET` | admin-api | Secreto para firmar JWT de administradores (mínimo 32 caracteres) |
| `ADMIN_JWT_EXPIRES_IN` | admin-api | Duración del token admin (ej: `8h`) |
| `CORS_ORIGIN` | admin-api | Origen permitido para CORS (URL del frontend web) |
| `MINIO_ENDPOINT` | admin-api | URL interna de MinIO (ej: `http://minio:9000`) |
| `MINIO_PUBLIC_ENDPOINT` | admin-api | URL pública de MinIO para URLs de objetos |
| `MINIO_ROOT_USER` | minio, admin-api | Usuario raíz de MinIO |
| `MINIO_ROOT_PASSWORD` | minio, admin-api | Contraseña raíz de MinIO |
| `MINIO_ACCESS_KEY` | admin-api | Access key para operaciones programáticas |
| `MINIO_SECRET_KEY` | admin-api | Secret key para operaciones programáticas |
| `ANALYTICS_SALT` | mobile-api | Salt para anonimizar identificadores en analíticas |
| `ANALYTICS_ENABLED` | mobile-api | Flag para activar/desactivar analíticas (`true`/`false`) |

### 7.2 Variables por Ambiente

| Variable | Desarrollo | Producción |
|---|---|---|
| `ROBLE_BASE_URL` | `https://roble-api.openlab.uninorte.edu.co` | Igual |
| `MINIO_ENDPOINT` | `http://localhost:5183` | `http://minio:9000` |
| `MINIO_PUBLIC_ENDPOINT` | `http://localhost:5183` | URL pública del servidor |
| `CORS_ORIGIN` | `http://localhost:5182` | `https://newlife.openlab.uninorte.edu.co` |
| `ADMIN_JWT_SECRET` | Cualquier valor de prueba | Secreto aleatorio seguro (64+ chars) |
| `ANALYTICS_ENABLED` | `false` (recomendado) | `true` |

### 7.3 Archivos de Configuración

El archivo `.env` en la raíz del repositorio contiene todas las variables de entorno. Es cargado automáticamente por Docker Compose. **No se sube al repositorio** (listado en `.gitignore`).

Para crear tu entorno local:
```bash
# Copiar la plantilla (si existe)
cp .env.example .env

# Editar con tus valores locales
# En Windows: notepad .env
# En Linux/Mac: nano .env o code .env
```

Para los backends NestJS ejecutados sin Docker, las variables deben estar disponibles en el shell o en un archivo `.env` dentro del directorio de cada backend (`backend/mobile-api/.env`, `backend/admin-api/.env`).

### 7.4 Manejo Seguro de Secretos

🔴 **Variables sensibles** — nunca subir a git, logs ni dashboards públicos:
- `ROBLE_SYSTEM_PASSWORD`
- `ADMIN_JWT_SECRET`
- `MINIO_ROOT_PASSWORD`
- `MINIO_SECRET_KEY`

**En producción**: Almacenar el archivo `.env` con permisos restrictivos en el servidor (`chmod 600 .env`). Considerar el uso de secretos gestionados (Docker Secrets, Vault, o variables de entorno del servidor) en lugar de un archivo de texto plano.

**En CI/CD**: Las variables sensibles deben configurarse como GitHub Secrets y referenciarse desde el workflow con `${{ secrets.VARIABLE_NAME }}`, nunca hardcodeadas en el archivo YAML.

---

## 8. Flujo de Trabajo de Desarrollo

### 8.1 Preparación del Entorno

Pasos para un desarrollador nuevo incorporándose al proyecto:

```bash
# 1. Clonar el repositorio
git clone https://github.com/openlabun/NewLife.git NewLife
cd NewLife

# 2. Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con los valores correctos (solicitar al equipo los valores de Roble)

# 3. Instalar dependencias de cada proyecto
cd frontend/mobile && npm install && cd ../..
cd frontend/web && npm install && cd ../..
cd backend/mobile-api && npm install && cd ../..
cd backend/admin-api && npm install && cd ../..

# 4. Opción A: Levantar todo con Docker (recomendado para primeros pasos)
docker compose -f docker-compose.dev.yml up -d

# 4. Opción B: Levantar servicios individualmente
# Terminal 1: Mobile API
cd backend/mobile-api && npm run start:dev
# Terminal 2: Admin API
cd backend/admin-api && npm run start:dev
# Terminal 3: Frontend Web
cd frontend/web && npm run dev
# Terminal 4: App Móvil
cd frontend/mobile && npx expo start
```

Verificar que todo funciona:
- Mobile API: `http://localhost:5181/api/docs/mobile`
- Admin API: `http://localhost:5180/api/docs/web`
- Panel Web: `http://localhost:5182`
- MinIO Console: `http://localhost:5184`

### 8.2 Desarrollo de Nuevas Funcionalidades

```bash
# 1. Crear rama desde main o la rama base acordada
git checkout -b feature/nombre-de-la-funcionalidad

# 2. Implementar los cambios siguiendo las convenciones (sección 10)

# 3. Hacer commits atómicos con mensajes descriptivos
git add [archivos específicos]
git commit -m "feat(progress): agregar check-in semanal con análisis de tendencia"

# 4. Push de la rama
git push origin feature/nombre-de-la-funcionalidad
```

**Convención de nombres de features**: `feature/[módulo]-[descripción-corta]`
Ejemplos: `feature/auth-refresh-token`, `feature/pet-new-evolution`, `fix/checkin-duplicated`

### 8.3 Ejecución de Pruebas y Validaciones

Antes de abrir un Pull Request, verificar:

```bash
# Verificar compilación TypeScript (backend)
cd backend/mobile-api && npm run build
cd backend/admin-api && npm run build

# Verificar tipos y linting (frontend web)
cd frontend/web && npm run lint && npm run build

# Verificar tipos (frontend móvil)
cd frontend/mobile && npx tsc --noEmit

# Verificar que los endpoints clave responden correctamente
curl http://localhost:5181/api/docs/mobile    # Swagger disponible
curl http://localhost:5180/api/docs/web    # Swagger disponible
```

El proyecto cuenta con una suite de 406 tests automatizados (Jest 29). Ejecutar antes de abrir un PR:

```bash
# Ejecutar toda la suite (desde la raíz del repositorio)
npm test

# Con reporte de cobertura
npm run test:coverage

# Con salida detallada por test
npm run test:verbose
```

Ver [`test/README.md`](../test/README.md) para la documentación completa de la suite.

### 8.4 Integración de Cambios

**Estrategia de ramas**:

```
main        ──────────────────────────────────────── (rama estable, producción)
                │                        │
release     ────┼────────────────────────┼──────────── (disparador CI/CD)
                │                        │
feature/*   ────┘                        └──────────── (ramas de trabajo)
```

**Proceso de Pull Request**:
1. Abrir PR desde la rama feature hacia `main` (o según acuerdo del equipo)
2. Completar la descripción del PR con: qué cambió, por qué, cómo probarlo
3. Revisión por al menos 1 miembro del equipo
4. Resolver todos los comentarios antes del merge
5. Merge con **Squash and Merge** para mantener historial limpio (recomendado)
6. Una vez en `main`, hacer merge a `release` para disparar el despliegue

**Criterios mínimos para merge**:
- El código compila sin errores TypeScript
- El linting no reporta errores bloqueantes
- Todos los tests automatizados pasan (`npm test` desde la raíz)
- El revisor ha verificado la lógica de negocio en las funcionalidades críticas (SOS, check-ins)

---

## 9. Dependencias y Servicios Externos

### 9.1 Servicios Externos Integrados

| Servicio | Propósito | Tipo | Proveedor |
|---|---|---|---|
| **Roble UN** | Base de datos PostgreSQL | Institucional | Universidad del Norte |
| **MinIO** | Almacenamiento de objetos | Self-hosted | Equipo del proyecto |
| **Expo** | Build de app móvil y distribución | Cloud (gratuito/pago) | Expo (by Meta) |
| **GitHub Actions** | CI/CD y despliegue automático | Cloud (gratuito/pago) | GitHub |

### 9.2 Requisitos de Acceso

Para trabajar con el proyecto, un equipo nuevo necesita:

| Acceso | Cómo obtenerlo |
|---|---|
| **Credenciales Roble** (`ROBLE_PROJECT_TOKEN`, email/password del sistema) | Solicitar al coordinador de Roble UN o al asesor del proyecto |
| **Variables `.env` de producción** | Solicitar a algún miembro actual del equipo |
| **Acceso al repositorio GitHub** | Solicitar acceso al repositorio al owner |
| **Credenciales MinIO de producción** | Están en el `.env` del servidor de producción |
| **Cuenta Expo** (para builds) | Crear cuenta gratuita en expo.dev o usar la del equipo |
| **Acceso SSH al servidor de producción** | Solicitar al encargado de infraestructura |

### 9.3 Desarrollo y Testing

**Roble DB**: No existe un ambiente sandbox oficial de Roble. En desarrollo se usa la misma base de datos de `New_Life_V0`. Se recomienda usar datos de prueba con prefijos identificables (ej: usuarios con email `test_*@test.com`) para facilitar su limpieza posterior.

**MinIO**: El contenedor MinIO de desarrollo es completamente independiente del de producción. Subir archivos en desarrollo no afecta producción y viceversa.

**App Móvil**: Para probar en dispositivo físico sin build, usar Expo Go. Para comportamiento idéntico a producción, usar un build de desarrollo (`npx expo run:android`).

---

## 10. Convenciones del Proyecto

### 10.1 Convenciones de Código

**Nomenclatura TypeScript**:

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y funciones | camelCase | `getUserProgress`, `isLoading` |
| Clases y componentes | PascalCase | `ProgressService`, `DailyCheckInScreen` |
| Interfaces | PascalCase (sin prefijo I) | `UserProfile`, `CheckInData` |
| Constantes globales | SCREAMING_SNAKE_CASE | `MAX_IMAGE_SIZE`, `API_BASE_URL` |
| Archivos de módulo | kebab-case | `progress.service.ts`, `daily-checkin.dto.ts` |
| Directorios | kebab-case | `guided-meditation/`, `mobile-api/` |
| Branches de Git | kebab-case con prefijo | `feature/pet-evolution`, `fix/auth-token` |

**Estructura de archivos NestJS** (obligatoria para módulos nuevos):
```
[nombre]/
├── [nombre].module.ts
├── [nombre].controller.ts
├── [nombre].service.ts
└── dto/
    ├── create-[nombre].dto.ts
    └── update-[nombre].dto.ts
```

**Herramientas de validación**: ESLint + Prettier están configurados en cada proyecto. Ejecutar `npm run lint` antes de cualquier commit. Configurar el editor para formatear al guardar (`.editorconfig` disponible si existe).

**Tamaño de funciones**: Una función no debería superar 50 líneas. Si lo hace, es señal de que necesita descomponerse.

### 10.2 Convenciones de Repositorio

**Formato de commits** (Conventional Commits):
```
<tipo>(<módulo>): <descripción corta en imperativo>

Ejemplos:
feat(progress): implementar análisis semanal de check-ins
fix(auth): corregir expiración de token en dispositivos con zona horaria diferente
refactor(pet): extraer lógica de evolución a servicio dedicado
docs(readme): actualizar instrucciones de instalación con Docker
chore(deps): actualizar NestJS a 10.4.22
```

**Tipos de commit**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`

**Nombres de ramas**:
- Features nuevas: `feature/[descripción]`
- Corrección de bugs: `fix/[descripción]`
- Refactoring: `refactor/[descripción]`
- Releases: `release` (rama protegida, disparador del CI/CD)

**Pull Requests**: Deben incluir descripción de qué cambia, por qué y cómo probarlo manualmente.

### 10.3 Convenciones de Documentación

**Dónde vive cada tipo de documentación**:

| Tipo | Ubicación |
|---|---|
| Decisiones arquitectónicas | `diseno/docs/adr/` (ADR format) |
| Documentación de API | Swagger (generada automáticamente desde decoradores NestJS) |
| Guía de instalación | `output/instalacion.md` |
| Manual de desarrollo | `output/desarrollo.md` (este archivo) |
| Informe técnico | `output/informe.md` |
| Suite de pruebas | `test/README.md` |
| README del repositorio | `README.md` (visión general y links) |

**Actualización de documentación**: Cualquier cambio que afecte la arquitectura, el stack tecnológico, la estructura de directorios, las variables de entorno o los procesos de despliegue debe reflejarse en los documentos correspondientes en el mismo PR que introduce el cambio.

---

## 11. Problemas Frecuentes y Soluciones

### 11.1 Problemas Frecuentes

**Problema: `Cannot find module` al iniciar NestJS en desarrollo**
```
Error: Cannot find module '../dist/...'
```
*Causa*: No se ha compilado el proyecto TypeScript antes de intentar ejecutar.
*Solución*: `npm run build` primero, luego `npm run start:dev` o usar directamente `npm run start:dev` que usa `ts-node` para desarrollo.

---

**Problema: CORS error en el panel web al llamar al Admin API**
```
Access to XMLHttpRequest at 'http://localhost:5180/...' blocked by CORS policy
```
*Causa*: La variable `CORS_ORIGIN` del Admin API no coincide con el origen del panel web.
*Solución*: Verificar que `CORS_ORIGIN=http://localhost:5182` en el `.env`. Reiniciar el contenedor admin-api.

---

**Problema: MinIO devuelve error 403 al acceder a objetos**
```
AccessDenied: Access Denied
```
*Causa*: El bucket no tiene política de acceso público o fue recreado sin la política anónima.
*Solución*: Verificar que el servicio `minio-init` se ejecutó correctamente. Si no, ejecutar manualmente:
```bash
docker compose exec minio-init mc anonymous set download local/newlife-public
```

---

**Problema: App móvil no conecta con la API en emulador Android**
```
Network request failed
```
*Causa*: El emulador Android accede al host mediante `10.0.2.2`, no `localhost`.
*Solución*: Verificar que la URL de la API en `services/api.ts` esté configurada correctamente para el emulador, o usar la IP de la máquina en la red local.

---

**Problema: `docker compose up` falla con error de permiso en `media-data/`**
```
ERROR: cannot create directory './media-data': Permission denied
```
*Causa*: El directorio `media-data/` no existe o tiene permisos incorrectos.
*Solución*:
```bash
mkdir -p media-data
chmod 755 media-data  # Linux/Mac
```

---

**Problema: WebSocket se desconecta frecuentemente en desarrollo**
*Causa*: El hot-reload de NestJS reinicia el servidor, terminando todas las conexiones WebSocket activas.
*Solución*: Comportamiento esperado en desarrollo. En producción no ocurre porque el servidor no hace hot-reload.

---

### 11.2 Deuda Técnica Conocida

| Componente | Deuda | Impacto | Prioridad sugerida |
|---|---|---|---|
| **Testing E2E** | No hay tests end-to-end contra el servidor real (los tests actuales son unitarios e de integración con mocks) | Medio — los tests con mocks no detectan problemas de contrato con Roble o MinIO | Media |
| **Rollback automático** | El CI/CD no tiene rollback automático ante fallos | Medio — los fallos de despliegue requieren intervención manual | Media |
| **Health checks** | Las APIs no tienen endpoint `/health` configurado en Docker Compose | Bajo — dificulta detección automática de servicios caídos | Media |
| **Refresh token** | No está claro si hay implementación de refresh token para la app móvil | Medio — sesiones con JWT de larga duración son menos seguras | Media |
| **Ambient offline** | Solo algunas funcionalidades SOS funcionan offline; el resto requiere red | Medio — la población objetivo puede tener conectividad intermitente | Alta |
| **Roble abstraction** | El acceso a Roble está acoplado a su API REST específica | Alto — cambiar de proveedor de DB requeriría refactorizar los módulos de datos | Alta |
| **Environment variables validación** | No hay validación de variables de entorno al iniciar las APIs | Bajo — errores de configuración fallan tarde en runtime, no al arrancar | Baja |

### 11.3 Recomendaciones para Continuidad

Para que un equipo futuro pueda continuar el proyecto eficientemente:

1. **Mantener y ampliar la suite de tests**: El proyecto cuenta con 406 tests automatizados. Al agregar nuevas features, incluir los tests correspondientes en el mismo PR. El objetivo es mantener el 100% de tests pasando en todo momento (`npm test`).

2. **Abstraer el acceso a Roble**: Crear un repositorio genérico (`IProgressRepository`) con una implementación para Roble. Esto facilitará futura migración a otra base de datos sin cambiar la lógica de negocio.

3. **Configurar monitoreo básico**: Agregar UptimeRobot o similar para recibir alertas cuando los servicios estén caídos. No requiere infraestructura adicional.

4. **Documentar el esquema de Roble**: Crear y mantener actualizado un diagrama del esquema de base de datos. Sin él, cada desarrollador nuevo tiene que inferir el modelo de datos leyendo el código.

5. **Versionar la API**: Agregar prefijos de versión (`/v1/`) a los endpoints del Mobile API para poder evolucionar contratos sin romper versiones antiguas de la app en dispositivos de usuarios.

---

## 12. Decisiones Técnicas Importantes

### Decisión 1: Dos backends separados (BFF Pattern)

**Decisión**: Tener `mobile-api` y `admin-api` como dos aplicaciones NestJS independientes en lugar de una sola API con roles.

**Razón**: Los contratos de API para la app móvil y el panel admin son fundamentalmente diferentes — la app móvil necesita endpoints optimizados para performance con dispositivos móviles, mientras que el admin necesita endpoints de CRUD general. Una única API haría los módulos más complejos y el riesgo de que un cambio administrativo afecte la app móvil sería mayor.

**Alternativas consideradas**: Una API unificada con guards de roles. Se descartó porque aumentaría el acoplamiento y la complejidad de los guards de autorización.

**Impacto**: Duplicación mínima de código (algunos DTOs similares), pero mayor independencia de despliegue y clara separación de responsabilidades.

---

### Decisión 2: Zustand para estado global en la app móvil

**Decisión**: Usar Zustand en lugar de Redux o Context API para el estado global de la app móvil.

**Razón**: El equipo es pequeño (3 desarrolladores). Zustand requiere significativamente menos boilerplate que Redux y es más predecible que Context API para estados que cambian frecuentemente. La curva de aprendizaje es mínima.

**Alternativas consideradas**: Redux Toolkit (descartado por verbosidad), Context API pura (descartado por problemas de performance con re-renders en estados anidados).

---

### Decisión 3: MinIO self-hosted en lugar de AWS S3

**Decisión**: Usar MinIO en Docker en lugar de AWS S3 u otro servicio cloud de almacenamiento.

**Razón**: Cero costos adicionales de infraestructura. La API de MinIO es compatible con la SDK de AWS S3, lo que facilita una migración futura si se necesita escalar. El volumen de archivos del proyecto no justifica el costo de S3.

**Impacto**: La disponibilidad del almacenamiento depende del mismo servidor que las APIs. En producción con alta disponibilidad, MinIO debería moverse a un servidor dedicado o reemplazarse por S3.

---

### Decisión 4: Acceso a base de datos vía API de Roble (no conexión directa)

**Decisión**: Usar la API REST de Roble UN en lugar de conectar directamente a PostgreSQL.

**Razón**: Restricción del contexto institucional. Roble no expone conexiones directas de PostgreSQL; solo su API REST es accesible externamente.

**Impacto**: Latencia adicional en todas las consultas de base de datos respecto a una conexión directa. Este es el principal cuello de botella de performance del sistema y requiere ser mitigado con caché agresiva.

---

## 13. Referencias Relacionadas

**Documentación oficial de tecnologías clave**:
- [NestJS Documentation](https://docs.nestjs.com) — Referencia completa del framework backend
- [Expo Documentation](https://docs.expo.dev) — Guías para React Native con Expo
- [React Navigation](https://reactnavigation.org/docs/getting-started) — Navegación en React Native
- [Next.js App Router](https://nextjs.org/docs/app) — Documentación del App Router de Next.js
- [MinIO JavaScript SDK](https://min.io/docs/minio/linux/developers/javascript/API.html) — SDK de MinIO para Node.js
- [Zustand](https://zustand-demo.pmnd.rs/) — State management para React
- [class-validator](https://github.com/typestack/class-validator) — Validación declarativa para NestJS

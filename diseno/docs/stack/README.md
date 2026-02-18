# Stack Tecnológico - NewLife 

Este documento detalla las tecnologías, frameworks y herramientas que conforman la base técnica del ecosistema **NewLife**.

---

## 1. Frontend (Mobile)
* **Framework:** `React Native`
    * Desarrollo multiplataforma (iOS/Android) con rendimiento nativo.
* **Lenguaje:** `TypeScript`
    * Implementado para garantizar tipado fuerte, reduciendo errores en tiempo de ejecución y facilitando el mantenimiento.

---

## 2. Backend (API REST)
* **Entorno de Ejecución:** `Node.js` (LTS)
* **Framework:** `NestJS`
    * Seleccionado por su arquitectura modular *out-of-the-box*, lo que facilita la escalabilidad y la inyección de dependencias.
* **Protocolo de Comunicación:** `REST API` con intercambio de datos en formato **JSON**.

---

## 3. Infraestructura y Persistencia
* **Motor de Base de Datos:** `PostgreSQL`
    * Base de datos relacional robusta para garantizar la integridad de los datos de usuarios e instituciones.
* **Proveedor de Servicios:** `Roble UN`
    * Plataforma institucional para el despliegue del servicio administrado de base de datos y gestión de autenticación centralizada.

---

## 4. Herramientas de Desarrollo y Control
* **Control de Versiones:** `Git` (Flujo de trabajo basado en ramas).
* **Alojamiento de Código:** `GitHub`
    * Utilizado para la gestión del repositorio, revisión de código (Pull Requests) y documentación técnica.
* **Entorno de Desarrollo:** `Visual Studio Code` con extensiones de linting (ESLint/Prettier) para estandarización de código.
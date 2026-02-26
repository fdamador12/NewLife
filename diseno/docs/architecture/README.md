# Arquitectura del Proyecto - NewLife

Este documento describe la estructura general del sistema y el modelo arquitectónico adoptado para el desarrollo del proyecto **NewLife**.

---

## 1. Tipo de Arquitectura: Monolito Modular

El proyecto adopta una arquitectura de tipo **Monolito Modular**.

Bajo este enfoque, el sistema se desarrolla como una única aplicación backend, organizada internamente en módulos funcionales independientes.

Cada módulo representa un dominio específico del sistema:

- usuarios
- autenticación
- institución
- contenido
- administración

Esto permite una separación lógica clara sin la complejidad de una infraestructura distribuida.

---

## 2. Estructura General del Sistema

El sistema está compuesto por cuatro componentes principales.

---

### 2.1 Aplicación Móvil

Interfaz de usuario desarrollada en React Native destinada a los usuarios finales.

Permite:

- Registro e inicio de sesión
- Check-ins diarios
- Seguimiento de progreso
- Contenido motivacional
- Herramientas de crisis
- Red social de apoyo entre usuarios

---

### 2.2 Aplicación Web Administrativa

Interfaz web destinada exclusivamente a administradores del sistema.

El acceso estará restringido mediante autenticación segura y control de acceso basado en roles, permitiendo únicamente el ingreso de usuarios con rol de administrador.

Permite:

- Administración de usuarios
- Gestión de contenido motivacional
- Moderación de la red social
- Supervisión básica del sistema

La aplicación web consumirá la misma API REST utilizada por la aplicación móvil.

---

### 2.3 Backend API REST

Backend desarrollado en NestJS.

Responsabilidades:

- Autenticación
- Autorización
- Validaciones
- Lógica de negocio
- Gestión de contenido
- Comunicación con base de datos

El backend será una única unidad de despliegue.

---

### 2.4 Base de Datos

Base de datos PostgreSQL administrada mediante Roble UN.

Se almacenarán:

- Usuarios
- Progreso
- Instituciones
- Contenido
- Registros

---

## 3. Flujo de Comunicación

La aplicación móvil y la aplicación web administrativa se comunican con el backend mediante HTTP.

El backend procesa las solicitudes y accede a la base de datos.

App Movil → Backend → DB
Web Admin → Backend → DB

---

## 4. Justificación

Se seleccionó Monolito Modular debido a:

- Menor complejidad
- Fácil despliegue
- Código organizado
- Adaptación académica
- Escalabilidad futura

---

## 5. Alcance

**NewLife** es una solución digital para jóvenes (18-24 años) en proceso de recuperación del alcoholismo en la ciudad de **Barranquilla**.

---

### 5.1 Aplicación Móvil

Incluye:

- Registro
- Login
- Perfil
- Progreso
- Check-ins
- Motivación
- Crisis
- Red social de apoyo

---

### 5.2 Aplicación Web Administrativa

Incluye:

- Gestión de usuarios
- Gestión de contenido
- Control de accesos

---

## 6. Limitaciones

* **Geográfico:** Exclusivo para la ciudad de Barranquilla.
* **Funcional:** Servicios digitales de apoyo y conexión. 
* **Exclusiones:** No incluye atención médica directa, integración con sistemas clínicos externos (EHR/HIS) ni expansión a otras ciudades en esta fase inicial.
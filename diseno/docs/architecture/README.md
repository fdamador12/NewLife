# Arquitectura del Proyecto - NewLife 

Este documento describe la estructura general del sistema y el modelo arquitectónico adoptado para el desarrollo del proyecto **NewLife**.

---

## 1. Tipo de Arquitectura: Monolito Modular
El proyecto adopta una arquitectura de tipo **Monolito Modular**. 

Bajo este enfoque, el sistema se desarrolla como una única aplicación backend, organizada internamente en módulos funcionales independientes. Cada módulo representa un dominio específico del sistema (ej. `usuarios`, `instituciones`, `autenticación`), permitiendo una separación lógica clara sin la complejidad de una infraestructura distribuida.

---

## 2. Estructura General del Sistema
El sistema está compuesto por tres componentes principales:

1.  **Aplicación Móvil (Cliente):** Interfaz de usuario desarrollada en React Native.
2.  **Backend Centralizado (API REST):** Lógica de negocio desarrollada en NestJS.
3.  **Servicio de Base de Datos (ROBLE):** Persistencia de datos administrada institucionalmente.

> **Flujo de comunicación:** La aplicación móvil se comunica con el backend mediante solicitudes **HTTP**. El backend procesa la lógica de negocio, validaciones y realiza operaciones de persistencia a través del servicio de base de datos proporcionado por **ROBLE**.

---

## 3. Justificación del Modelo
La arquitectura **Monolito Modular** fue seleccionada debido a:

* **Menor complejidad inicial:** Facilita el desarrollo y el despliegue en entornos académicos.
* **Organización estructurada:** El código se mantiene limpio y segmentado por dominios.
* **Escalabilidad:** Permite evolucionar hacia microservicios si el crecimiento del sistema en Barranquilla lo requiere.

---

## 4. Alcance del Proyecto
**NewLife** es una solución digital para jóvenes (18-24 años) en proceso de recuperación del alcoholismo en la ciudad de **Barranquilla**.

### Funcionalidades Incluidas:
* Registro y autenticación de usuarios.
* Gestión de perfiles básicos.
* Consulta de información sobre grupos e instituciones de apoyo locales.
* Interacción comunitaria y vinculación controlada usuario-institución.

### Limitaciones del Alcance:
* **Geográfico:** Exclusivo para la ciudad de Barranquilla.
* **Funcional:** Servicios digitales de apoyo y conexión. 
* **Exclusiones:** No incluye atención médica directa, integración con sistemas clínicos externos (EHR/HIS) ni expansión a otras ciudades en esta fase inicial.
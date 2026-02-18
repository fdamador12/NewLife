# ADR 001: Adopción de Arquitectura Monolito Modular - NewLife 

## 1. Estado
**Aceptado** (17/02/2026)

---

## 2. Contexto
El proyecto **NewLife** requiere una infraestructura que soporte una aplicación móvil (`React Native`) y un backend robusto (`NestJS`). Dado que el alcance inicial se centra en Barranquilla con un grupo demográfico específico, se evaluó la necesidad de escalabilidad frente a la velocidad de entrega y la simplicidad operativa en el servidor institucional (**Roble UN**).

---

## 3. Decisión
Hemos decidido implementar una **Arquitectura de Monolito Modular**. 

A diferencia de un monolito tradicional, este enfoque organiza el backend en módulos independientes basados en dominios lógicos (Usuarios, Instituciones, Autenticación, etc.), compartiendo una única unidad de despliegue y base de datos (`Roble`).



---

## 4. Justificación
* **Eficiencia en el Despliegue:** Facilita la integración y entrega continua (CI/CD) al gestionar un solo artefacto de software.
* **Separación de Responsabilidades:** Cada módulo de `NestJS` encapsula su propia lógica de negocio, lo que permite un desarrollo paralelo más limpio.
* **Preparación para el Futuro:** Si el sistema crece, la independencia de los módulos permite una migración sencilla hacia microservicios con un refactor mínimo.
* **Optimización de Recursos:** Menor latencia de red en comunicaciones internas comparado con una arquitectura distribuida.

---

## 5. Consecuencias y Riesgos
* **Positivas:** * Estructura de código altamente organizada y fácil de testear.
    * Curva de aprendizaje moderada para el equipo de desarrollo.
* **Riesgos y Mitigación:** * **Riesgo:** Posible acoplamiento excesivo entre módulos si no se respetan las interfaces de servicio. 
    * **Mitigación:** Se aplicarán principios de **Inyección de Dependencias** y se prohibirá el acceso directo a repositorios de otros módulos.

---

## 6. Alcance Técnico Relacionado
* **Frontend:** React Native (Consumo de API REST).
* **Backend:** NestJS sobre Node.js.
* **DB:** Roble.
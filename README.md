# NewLife  
## Diseño, desarrollo y despliegue de una aplicación móvil de apoyo post-rehabilitación para jóvenes barranquilleros con adicción al alcohol

---

## 1. Introducción

La adicción al alcohol en jóvenes representa un problema de salud pública con alto impacto social, psicológico y familiar. Aunque los procesos de rehabilitación ofrecen apoyo clínico y terapéutico, muchos jóvenes enfrentan dificultades significativas una vez finaliza el tratamiento formal, especialmente en la etapa de reintegración a su entorno cotidiano. La falta de acompañamiento continuo aumenta el riesgo de recaídas.

El proyecto **NewLife** surge como una solución tecnológica orientada al acompañamiento post-rehabilitación de jóvenes entre 18 y 24 años en la ciudad de Barranquilla, tomando como caso de estudio la Fundación Terapéutica Shalom. A partir de un prototipo UX/UI previamente validado por profesionales y usuarios, se diseñará, desarrollará y desplegará una aplicación móvil funcional que brinde herramientas de seguimiento, motivación y apoyo emocional continuo.

El proyecto se enmarca dentro de la Ingeniería de Software con enfoque en Arquitectura de Software y mHealth (Mobile Health), incorporando principios de seguridad, escalabilidad y buenas prácticas de ingeniería alineadas con estándares académicos y lineamientos ABET.

---

## 2. Planteamiento del problema

Uno de los mayores desafíos en los procesos de rehabilitación por adicción al alcohol no es únicamente lograr la desintoxicación inicial, sino mantener la estabilidad emocional y conductual del paciente una vez regresa a su entorno social habitual.

Actualmente:

- El acompañamiento post-rehabilitación es limitado o inexistente.
- No existen herramientas digitales especializadas adaptadas al contexto local.
- Los jóvenes carecen de mecanismos tecnológicos estructurados para monitorear su progreso.
- La detección temprana de recaídas depende exclusivamente del entorno familiar o terapéutico.
- No se aprovechan plenamente estrategias digitales como gamificación, seguimiento personalizado y apoyo inmediato en crisis.

La ausencia de una herramienta tecnológica segura, accesible y adaptada a este contexto incrementa la probabilidad de recaídas y dificulta el seguimiento del proceso de recuperación.

Por lo tanto, se plantea la siguiente pregunta:

> **¿Cómo diseñar y desarrollar una aplicación móvil segura, funcional y escalable que apoye el proceso post-rehabilitación de jóvenes con adicción al alcohol, brindando seguimiento continuo, herramientas de prevención de recaídas y apoyo en momentos de crisis?**

---

## 3. Restricciones y supuestos de diseño

### 3.1 Restricciones

El desarrollo del proyecto está condicionado por las siguientes restricciones:

- Tiempo académico limitado, correspondiente al periodo de ejecución del Proyecto Final.
- Recursos humanos reducidos, con un equipo de tres estudiantes.
- Datos sensibles de salud mental, que exigen medidas estrictas de seguridad y confidencialidad.
- Infraestructura limitada, sujeta a presupuesto académico.
- No se contempla certificación clínica ni validación médica oficial.

### 3.2 Supuestos de diseño

Se asume que:

- El prototipo UX/UI previamente validado es funcionalmente coherente y puede traducirse a requerimientos técnicos.
- Los usuarios finales cuentan con acceso a smartphones Android o iOS.
- La Fundación Terapéutica Shalom facilitará información contextual necesaria para modelar los requerimientos.
- El uso de la aplicación será complementario al acompañamiento terapéutico, no sustitutivo.
- Se implementarán buenas prácticas de autenticación, control de acceso y cifrado de datos.

---

## 4. Alcance

El proyecto contempla la transformación de un prototipo validado en una solución tecnológica funcional mediante las siguientes fases:

### 4.1 Análisis y levantamiento de requerimientos

- Revisión detallada del prototipo en Figma.
- Identificación de requerimientos funcionales y no funcionales.
- Definición de un MVP técnicamente viable.

### 4.2 Diseño de arquitectura de software

- Definición de arquitectura cliente-servidor.
- Diseño de backend, API y base de datos.
- Modelado de módulos principales:
  - Registro e inicio de sesión
  - Seguimiento de progreso
  - Check-ins diarios
  - Contenido motivacional
  - Herramientas de apoyo en crisis
  - Red social

### 4.3 Desarrollo de la aplicación móvil

- Implementación del frontend móvil.
- Integración con backend.
- Aplicación de principios de usabilidad y accesibilidad.

### 4.4 Desarrollo del backend y persistencia

- Construcción de API segura.
- Implementación de base de datos.
- Gestión de usuarios, progreso y contenido dinámico.

### 4.5 Seguridad y privacidad

- Autenticación segura.
- Control de acceso basado en roles.
- Protección de datos sensibles.
- Buenas prácticas de manejo de información en salud.

### 4.6 Despliegue e infraestructura

- Configuración de entorno de producción.
- Implementación en servidor real o servicio cloud.
- Configuración de monitoreo básico.

### 4.7 Pruebas y validación técnica

- Pruebas unitarias.
- Pruebas de integración.
- Validación funcional del sistema.

---

## Fuera de alcance

- Certificación médica o validación clínica oficial.
- Implementación de inteligencia artificial avanzada.
# ADR 001: Arquitectura Monolito Modular

## 1. Estado

Aceptado

Fecha:

17/02/2026

---

## 2. Contexto

El proyecto NewLife requiere una infraestructura que soporte:

- Aplicación móvil React Native
- Aplicación web administrativa
- Backend NestJS

El alcance inicial está limitado a Barranquilla.

Se busca:

- Simplicidad
- Escalabilidad
- Facilidad de despliegue

---

## 3. Decisión

Se adopta arquitectura Monolito Modular.

El backend estará organizado en módulos:

- Usuarios
- Autenticación
- Contenido
- Administración

Todos compartirán:

- Base de datos única
- Backend único
- Despliegue único

---

## 4. Justificación

### Ventajas

- Despliegue simple
- Menor complejidad
- Código organizado
- Fácil testing

### Escalabilidad

Permite migración futura a microservicios.

### Rendimiento

Menor latencia interna.

---

## 5. Riesgos

### Riesgo

Acoplamiento entre módulos.

### Mitigación

- Interfaces claras
- Inyección de dependencias
- Separación modular

---

## 6. Stack Técnico

Frontend móvil:

React Native

Frontend web:

React o Next.js

Backend:

NestJS

Base de datos:

ROBLE (PostgreSQL)
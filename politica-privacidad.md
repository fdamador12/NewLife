# Política de Privacidad y Manejo de Datos — NewLife

**Aplicación móvil Android y Panel Web de Administración**
**Versión 1.0 — 2026**
**Barranquilla, Colombia**

---

> **Esta política aplica a la aplicación móvil NewLife (Android) y al panel web de administración.** Cumple con la Ley Estatutaria 1581 de 2012 y sus decretos reglamentarios vigentes en la República de Colombia. Adicionalmente, esta política está alineada con los requisitos de la Política de Datos del Usuario y la Política de Aplicaciones de Salud de Google Play.

| Campo | Detalle |
|---|---|
| **Responsable** | Equipo NewLife — Universidad del Norte |
| **Plataformas** | Aplicación móvil Android · Panel web de administración · Landing page |
| **Categoría Google Play** | Salud y Bienestar (Mental Health / Addiction Recovery) |
| **Tecnología y servicios** | ROBLE / OPENLAB (autenticación y base de datos), MinIO (almacenamiento de archivos del sistema), Freesound API (audios de meditación) |
| **Ley aplicable** | Ley 1581 de 2012, Colombia |
| **Contacto** | proyecto.newlife.2026@gmail.com |

> **Nota para el usuario**: Esta política está escrita en lenguaje claro para que cualquier persona pueda entenderla. Al final del documento encontrará un [Glosario](#19-glosario) con los términos técnicos utilizados.

---

## Tabla de contenidos

1. [Identificación del Responsable](#1-identificación-del-responsable-del-tratamiento)
2. [Declaración de Aplicación de Salud](#2-declaración-de-aplicación-de-salud-health-app-declaration)
3. [Ámbito de Aplicación](#3-ámbito-de-aplicación)
4. [Infraestructura Tecnológica](#4-infraestructura-tecnológica-y-acceso-a-datos)
5. [Datos Personales que Recopilamos (Tabla Data Safety)](#5-datos-personales-que-recopilamos)
6. [Datos Sensibles de Salud](#6-datos-sensibles-de-salud)
7. [Sistema de Analytics Anónimo](#7-sistema-de-analytics-anónimo)
8. [Finalidad del Tratamiento](#8-finalidad-del-tratamiento-de-datos)
9. [Restricciones de Uso](#9-restricciones-explícitas-de-uso-de-datos)
10. [Base Legal](#10-base-legal-del-tratamiento)
11. [Roles de Administración](#11-roles-de-administración-y-acceso)
12. [Seguridad](#12-almacenamiento-y-seguridad-de-los-datos)
13. [Compartición con Terceros](#13-compartición-de-datos-con-terceros)
14. [Derechos del Usuario y Eliminación de Cuenta](#14-derechos-del-titular-de-los-datos-y-eliminación-de-cuenta)
15. [Menores de Edad](#15-menores-de-edad-y-verificación)
16. [Retención](#16-retención-de-datos)
17. [Tecnologías de Seguimiento](#17-tecnologías-de-seguimiento)
18. [Consentimiento y Cambios](#18-consentimiento-y-cambios-a-esta-política)
19. [Glosario](#19-glosario)

---

## 1. Identificación del Responsable del Tratamiento

En cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013, se informa que el responsable del tratamiento de datos personales es:

- **Nombre del proyecto**: NewLife
- **Entidad legal responsable**: Universidad del Norte
- **Ciudad**: Barranquilla, Atlántico, Colombia
- **Correo de contacto**: proyecto.newlife.2026@gmail.com

NewLife es una aplicación móvil de acompañamiento dirigida a jóvenes entre 18 y 24 años en proceso de rehabilitación y post-rehabilitación por consumo problemático de sustancias psicoactivas, desarrollada como proyecto de grado en la Universidad del Norte.

---

## 2. Declaración de Aplicación de Salud (Health App Declaration)

> **NewLife es una aplicación de salud mental y de apoyo en recuperación de adicciones.** Maneja datos sensibles relacionados con consumo de sustancias psicoactivas, estados emocionales y proceso de rehabilitación. Por lo anterior, cumple con la Política de Aplicaciones de Salud de Google Play y aplica los siguientes principios:

### 2.1 Conexión con la funcionalidad principal

Los datos de salud que recolectamos están directa e inseparablemente conectados con la funcionalidad de la app: acompañamiento en el proceso de recuperación. No recolectamos datos de salud para funciones secundarias o no declaradas.

### 2.2 Restricciones explícitas de uso (alineadas con Google Play Policy 2026)

NewLife **NUNCA** utilizará los datos de salud sensibles para:

- Determinar elegibilidad para empleo
- Determinar elegibilidad para seguros médicos o de vida
- Compartir información en redes sociales sin autorización explícita del usuario
- Discriminación de ningún tipo
- Entrenamiento de modelos de inteligencia artificial sin consentimiento explícito separado
- Cualquier finalidad comercial

### 2.3 Disclaimer médico

NewLife **NO es un tratamiento médico** ni un sustituto de atención profesional de salud mental o adicciones. Es una herramienta de acompañamiento complementaria. Recomendamos siempre buscar atención profesional especializada para procesos de rehabilitación.

---

## 3. Ámbito de Aplicación

La presente Política de Privacidad aplica a:

- La aplicación móvil **NewLife**, disponible para dispositivos Android.
- El **panel web de administración**, utilizado por el equipo NewLife y administradores autorizados para gestionar contenidos y métricas de uso.
- La **landing page** informativa del proyecto, disponible en [newlife.openlab.uninorte.edu.co](https://newlife.openlab.uninorte.edu.co).

Esta política **no aplica** a sitios web o servicios de terceros que puedan estar enlazados desde nuestra plataforma.

---

## 4. Infraestructura Tecnológica y Acceso a Datos

NewLife utiliza **ROBLE** como plataforma tecnológica principal para la autenticación de usuarios y el almacenamiento de datos. ROBLE es una plataforma de código abierto desarrollada por **OPENLAB**, el laboratorio de innovación de la Universidad del Norte. Adicionalmente, NewLife integra otros servicios de apoyo que se describen en esta sección.

### 4.1 Autenticación

El sistema de autenticación es gestionado íntegramente por ROBLE mediante estándares modernos como JWT (JSON Web Tokens) y manejo de sesiones por tokens de acceso y renovación. Como consecuencia de este diseño:

- El equipo de NewLife **no tiene acceso a las contraseñas** de los usuarios en ningún momento.
- Las contraseñas son gestionadas, cifradas y almacenadas exclusivamente por ROBLE.
- NewLife únicamente tiene acceso al **correo electrónico** e identificador interno generado por ROBLE, como referencia de cada cuenta.

### 4.2 Base de Datos

Los datos de perfil y actividad de los usuarios se almacenan en el servicio de base de datos administrado por ROBLE, bajo la infraestructura de OPENLAB. Los datos están cifrados tanto en tránsito (HTTPS/TLS) como en reposo dentro de la infraestructura de ROBLE.

### 4.3 Almacenamiento de archivos (MinIO)

NewLife utiliza **MinIO** como sistema de almacenamiento de archivos del sistema. **MinIO NO almacena datos personales de los usuarios.** Únicamente almacena:

- Fotos de perfil de los autores de los contenidos educativos (no son fotos de usuarios)
- Banners y miniaturas de los contenidos educativos (artículos y enlaces a videos de YouTube)
- Logos de los grupos de apoyo que se muestran en la aplicación

### 4.4 Audios de meditación (Freesound API)

NewLife utiliza la **API pública de Freesound** ([freesound.org](https://freesound.org)) para acceder a audios de meditación dentro de la aplicación. Esta integración:

- **Solo descarga audios públicos** de Freesound; no envía datos del usuario a su API
- No comparte información personal ni de uso con Freesound
- Los audios se reproducen localmente en la app

### 4.5 Métricas del Panel Web

El panel web incluye un módulo de métricas de uso de la aplicación. En este módulo los usuarios se presentan de forma **completamente anonimizada**: los administradores acceden a estadísticas agregadas, pero nunca pueden identificar a un usuario individual a partir de dicha información. Ver [Sección 7](#7-sistema-de-analytics-anónimo) para detalles técnicos del sistema de analytics.

---

## 5. Datos Personales que Recopilamos

> Esta sección está alineada con el formulario **Data Safety** de Google Play. La tabla a continuación es la divulgación completa de qué datos recolectamos, para qué, si son obligatorios y si son compartidos.

### 5.1 Tabla resumen Data Safety

| Tipo de dato | Categoría Google | Propósito | Obligatorio | Compartido con terceros |
|---|---|---|---|---|
| Correo electrónico | Personal info | Identificación de cuenta, autenticación | Sí (registro) | No (solo ROBLE) |
| Contraseña | Auth info | Autenticación | Sí (registro) | No (solo ROBLE) |
| Nombre completo | Personal info | Identificación inicial | Sí (registro) | No |
| Apodo | Personal info | Visualización en la app | Sí (perfil) | No |
| Pronombre preferido | Personal info | Personalización | Sí (perfil) | No |
| Fecha del último consumo | **Health info (sensitive)** | Cálculo de tiempo en sobriedad | Sí (perfil) | No |
| Número de teléfono de contacto de emergencia | Personal info | Acceso rápido a persona de confianza en momentos de crisis | Sí (perfil) | No |
| Motivo de sobriedad | **Health info (sensitive)** | Refuerzo motivacional | Sí (perfil) | No |
| Gasto semanal estimado | Financial info | Cálculo de ahorro acumulado | Sí (perfil) | No |
| Estado emocional diario (categoría seleccionada de un conjunto predefinido) | **Health info (sensitive)** | Seguimiento personal | Solo si el usuario hace check-in | No |
| Registro de consumo (sí/no) | **Health info (sensitive)** | Seguimiento personal | Solo si el usuario hace check-in | No |
| Nota de gratitud (texto libre escrito por el usuario) | App activity | Diario personal de gratitud | Solo si el usuario hace check-in | No |
| Ubicación del episodio de consumo (categoría seleccionada de un conjunto predefinido sin geolocalización ni GPS) | App activity | Apoyar la introspección del usuario al identificar contextos asociados al consumo | Solo si el usuario reporta consumo en el check-in | No |
| Contexto social del episodio de consumo (categoría seleccionada de un conjunto predefinido) | App activity | Apoyar la introspección del usuario al identificar contextos asociados al consumo | Solo si el usuario reporta consumo en el check-in | No |
| Reflexión personal del episodio de consumo (texto libre escrito por el usuario) | **Health info (sensitive)** | Permitir al usuario hacer una introspección abierta sobre su recaída | Solo si el usuario reporta consumo en el check-in | No |
| Eventos de agenda personal | App activity | Funcionalidad de agenda | No (opcional) | No |
| Contactos de apoyo adicionales (registrados manualmente desde la sección de contactos) | Contacts | Acceso rápido en crisis | No (opcional) | No |
| Métricas anónimas de uso (solo usuarios logueados, no invitados) | App interactions | Mejora del producto | Sí (al usar la app) | No (anonimizado con SHA-256) |

### 5.2 Modo Invitado (sin registro)

Los usuarios que accedan como invitados **no proporcionan datos personales identificables** al equipo NewLife. Toda la información generada en este modo se almacena únicamente en el dispositivo del usuario (almacenamiento local) y no se transmite a ningún servidor externo.

> Si el usuario decide crear una cuenta posteriormente, puede **migrar voluntariamente** la información del modo invitado a su perfil registrado. Esta migración requiere consentimiento explícito y no es obligatoria.

### 5.3 Registro de Cuenta

El proceso de registro recopila los siguientes datos:

**Credenciales gestionadas por ROBLE** (sistema de autenticación):

- **Correo electrónico**: usado como identificador principal de la cuenta.
- **Contraseña**: gestionada y cifrada íntegramente por ROBLE. El equipo NewLife 
  no tiene acceso a las contraseñas en ningún momento.
- **Identificador interno** generado automáticamente por ROBLE al crear la 
  cuenta. NewLife usa este identificador para asociar la información del 
  usuario sin necesidad de exponer datos personales.

**Datos adicionales recopilados por NewLife en la misma pantalla de registro**:

- **Nombre completo**: solicitado por NewLife para identificación inicial de la 
  cuenta. Se almacena en el perfil del usuario dentro de la base de datos de 
  NewLife, separada del sistema de autenticación de ROBLE.

### 5.4 Configuración Inicial del Perfil

Tras el registro, el usuario completa su perfil con la siguiente información:

- **Apodo**: nombre que el usuario elige mostrar dentro de la aplicación
- **Pronombre preferido**
- **Fecha y hora del último consumo** de sustancias psicoactivas
- **Motivo de sobriedad**: texto personal con la razón del usuario para mantenerse en recuperación
- **Gasto semanal estimado**: monto aproximado destinado al consumo de sustancias
- **Número de teléfono de contacto de emergencia**: persona de confianza a la que el usuario puede acudir en momentos de crisis
- **Momento motivacional**: hora preferida para recibir notificaciones push de recordatorios (solo si el usuario acepta recibir notificaciones)

### 5.5 Actualizaciones de Perfil

El usuario puede actualizar en cualquier momento su apodo, pronombre, contraseña, motivo de sobriedad y gasto semanal estimado desde la sección de perfil de la aplicación.

### 5.6 Registro Diario (Check-in)

La aplicación permite registros diarios **voluntarios** que incluyen:

- **Emoción del día**: estado emocional reportado por el usuario.
- **Registro de consumo**: el usuario indica si hubo o no consumo de sustancias 
  ese día.
- **Nota de gratitud**: texto libre donde el usuario expresa algo por lo que se 
  siente agradecido ese día.

**Si el usuario SÍ reporta consumo:**
- **Ubicación del episodio**: el usuario selecciona el tipo de lugar donde 
  ocurrió desde un conjunto de opciones predefinidas. NewLife **no accede al GPS ni a la geolocalización** del dispositivo.
- **Contexto social**: el usuario selecciona desde un conjunto de opciones predefinidas con quién se encontraba.
- **Reflexión personal**: texto libre donde el usuario puede analizar la experiencia, sus emociones y el contexto de la recaída.

### 5.7 Agenda Personal

El usuario puede crear eventos en su agenda personal con: título, fecha, hora de inicio y fin, categoría (reunión, grupo de apoyo, fundación, lectura u otro), configuración de repetición y recordatorio.

### 5.8 Contactos de Apoyo

El usuario puede agregar contactos de confianza con: nombre y número de teléfono. Estos contactos **NO se sincronizan automáticamente** desde la lista de contactos del dispositivo; el usuario los ingresa manualmente.

### 5.9 Interacción con Contenidos y Retos

- Frases motivacionales del día marcadas como favoritas por el usuario
- Retos de recuperación a los que el usuario se une
- Contenido educativo marcado como favorito

---

## 6. Datos Sensibles de Salud

> **NewLife maneja información directamente relacionada con la salud y el proceso de recuperación de sus usuarios. Estos datos reciben el nivel más alto de protección conforme al Artículo 6 de la Ley 1581 de 2012 y la Política de Aplicaciones de Salud de Google Play.**

Los siguientes datos son considerados **datos sensibles de salud**:

- Fecha y hora del último consumo de sustancias psicoactivas
- Registro diario de emociones
- Registro de consumo (si hubo o no consumo en un día determinado)
- Ubicación, contexto social y reflexiones asociadas a episodios de consumo
- Motivo personal de sobriedad
- Gasto semanal estimado en sustancias
- Notas de gratitud y contenido del diario personal

Para estos datos se adoptan las siguientes medidas especiales:

- Su recolección requiere **autorización explícita, libre, previa e informada** del usuario, solicitada antes de registrarse en la aplicación.
- **No serán compartidos con terceros** bajo ningún concepto, salvo obligación legal expresa de autoridad competente.
- Solo el **propio usuario** puede acceder a su historial de emociones, registro de consumo y reflexiones personales.
- Los administradores **no tienen acceso** a los datos de salud individuales de ningún usuario.
- El registro de todos estos datos es **completamente voluntario**. El usuario puede utilizar las funciones principales de la aplicación sin completar el registro diario.
- **No se utilizarán** para decisiones de empleo, elegibilidad de seguros, ni discriminación de ningún tipo.
- **No se utilizarán** para entrenar modelos de inteligencia artificial o aprendizaje automático sin consentimiento explícito y separado del usuario.

---

## 7. Sistema de Analytics Anónimo

NewLife utiliza un sistema interno de analytics para mejorar la aplicación. Es importante que el usuario entienda exactamente cómo funciona:

### 7.1 Qué se recolecta

Únicamente se recolectan **eventos de uso** (acciones de navegación e interacción con funcionalidades), no contenido personal. Ejemplos de eventos:

- "Se abrió la aplicación"
- "Se inició un ejercicio de respiración"
- "Se completó el check-in diario"
- "Se navegó a la pestaña de Cuidado"

### 7.2 Qué NO se recolecta

- Contenido escrito por el usuario (notas, reflexiones, mensajes)
- Datos de salud específicos (emociones registradas, días con consumo, etc.)
- Información personal identificable (PII)

### 7.3 Cómo se anonimiza

El identificador del usuario se transforma mediante **hash criptográfico SHA-256 con sal secreta** antes de almacenarse. Este proceso es irreversible: nadie, ni siquiera el equipo NewLife, puede convertir el hash de vuelta al identificador original sin la sal, que se almacena por separado y nunca se expone.

### 7.4 Para qué se usa

- Calcular usuarios activos diarios (DAU) y mensuales (MAU)
- Identificar funcionalidades más usadas para priorizar mejoras
- Detectar puntos de abandono en flujos críticos (ej. checkin diario)
- Medir la efectividad de herramientas de crisis (ej. ejercicios de respiración)

### 7.5 Quién puede ver estos datos

Solo los administradores del panel web pueden ver las métricas agregadas. **Nunca pueden ver eventos individuales atribuibles a un usuario específico.**

---

## 8. Finalidad del Tratamiento de Datos

Los datos recopilados son utilizados **exclusivamente** para las siguientes finalidades:

- Proveer el servicio de acompañamiento personalizado dentro de la aplicación
- Permitir al usuario hacer seguimiento de su proceso de recuperación
- Sincronizar el progreso del usuario entre sesiones
- Enviar **notificaciones push de recordatorios** en el horario elegido por el usuario (solo si el usuario aceptó recibir notificaciones)
- Generar métricas de uso **completamente anonimizadas** para la mejora de la aplicación

> **Importante**: NewLife **NO envía mensajes SMS** a los usuarios. Las únicas notificaciones que la aplicación genera son **notificaciones push** dentro del propio dispositivo, en el horario que el usuario haya configurado y siempre que haya aceptado recibirlas.

---

## 9. Restricciones Explícitas de Uso de Datos

Los datos **NO serán utilizados** para:

- Publicidad de ningún tipo
- Venta a terceros
- Perfilamiento comercial
- Investigación académica sin consentimiento adicional expreso
- Decisiones sobre empleo de los usuarios
- Decisiones sobre elegibilidad para seguros médicos, de vida u otros
- Discriminación de ningún tipo
- Entrenamiento de modelos de inteligencia artificial sin consentimiento separado
- Compartir en redes sociales sin autorización
- Envío de mensajes SMS
- Cualquier finalidad distinta a las explícitamente listadas en la sección 8

---

## 10. Base Legal del Tratamiento

El tratamiento de datos personales en NewLife se realiza bajo las siguientes bases legales:

- **Consentimiento libre, previo, explícito e informado** del usuario (Art. 9, Ley 1581/2012), solicitado en el momento del registro.
- **Ejecución del servicio** solicitado por el propio usuario.
- **Cumplimiento de obligaciones legales** aplicables en Colombia.

El usuario puede **revocar su consentimiento** en cualquier momento, lo que conlleva la eliminación de su cuenta y datos asociados, conforme a lo descrito en la [Sección 14](#14-derechos-del-titular-de-los-datos-y-eliminación-de-cuenta).

---

## 11. Roles de Administración y Acceso

El panel web de administración maneja los siguientes roles con acceso estrictamente delimitado:

### 11.1 Super Administrador

Es el único rol con capacidad de **crear nuevos administradores**. Los super administradores son designados por el equipo NewLife y no pueden ser creados por usuarios regulares. Sus datos registrados son: nombre, correo electrónico y contraseña (gestionada por ROBLE).

### 11.2 Administrador

Creados exclusivamente por super administradores. Gestionan contenidos educativos, retos, frases motivacionales y grupos de apoyo. Pueden ver métricas de uso anonimizadas. **No tienen acceso a datos personales o de salud** de los usuarios.

---

## 12. Almacenamiento y Seguridad de los Datos

NewLife utiliza ROBLE (plataforma de OPENLAB, Universidad del Norte) como infraestructura de autenticación y base de datos. Las medidas de seguridad incluyen:

### 12.1 Datos en tránsito

- Comunicaciones cifradas mediante **HTTPS/TLS 1.2+** entre la aplicación y los servidores de ROBLE.
- Certificados SSL válidos.

### 12.2 Datos en reposo

- Los datos almacenados en ROBLE están cifrados en reposo según los estándares de la infraestructura.
- Las contraseñas **nunca se almacenan en texto plano**; son hasheadas con algoritmos modernos (bcrypt o equivalente) gestionados íntegramente por ROBLE.

### 12.3 Autenticación

- Autenticación gestionada con **JWT**, con tokens de acceso de corta duración y tokens de renovación.
- Renovación automática de tokens sin que el usuario deba reingresar credenciales.

### 12.4 Modo Invitado

- Los datos del **modo invitado** se almacenan exclusivamente en el dispositivo del usuario (AsyncStorage cifrado a nivel del sistema operativo Android) y no son accesibles por NewLife ni por terceros.

### 12.5 Anonimización del sistema de analytics

- Identificadores hasheados con **SHA-256 + sal secreta** (irreversible).
- Sal almacenada por separado de los datos.

### 12.6 Notificación de vulneraciones

En caso de una vulneración de seguridad que afecte datos personales, notificaremos a los usuarios afectados y a la Superintendencia de Industria y Comercio (SIC) en los plazos establecidos por la normativa vigente (Decreto 1377 de 2013).

---

## 13. Compartición de Datos con Terceros

NewLife **no vende, arrienda ni comparte** datos personales con terceros con fines comerciales. Los datos podrían ser compartidos únicamente en los siguientes casos estrictamente limitados:

- **ROBLE / OPENLAB**, como proveedor de la infraestructura tecnológica, bajo los términos de su propia política de privacidad.
- **MinIO**, exclusivamente para el almacenamiento de archivos del sistema (no contiene datos personales del usuario).
- **Freesound API**, exclusivamente para descargar audios públicos de meditación. **No se envían datos del usuario a Freesound.**
- **Autoridades competentes colombianas**, cuando exista una obligación legal explícita y formal.
- Con el **consentimiento explícito y expreso** del usuario para un propósito específico.

En ningún caso los datos de salud o de progreso personal se compartirán con terceros, incluyendo la institución universitaria, fundaciones aliadas u otros usuarios de la plataforma. Lo único a lo que tienen acceso los usuarios administradores (previamente autorizados por el equipo NewLife) son las métricas que ya están hasheadas y anonimizadas.

> **NewLife no integra SDKs de analítica de terceros** (Google Analytics, Facebook SDK, Firebase Analytics, etc.) ni redes publicitarias.

---

## 14. Derechos del Titular de los Datos y Eliminación de Cuenta

### 14.1 Derechos ARCO

Conforme a los Artículos 8 y 21 de la Ley 1581 de 2012, los usuarios tienen derecho a:

- **Acceso**: conocer qué datos suyos están almacenados y cómo son utilizados.
- **Rectificación**: corregir datos inexactos o incompletos directamente desde la sección de perfil de la aplicación (apodo, pronombre, motivo de sobriedad, gasto semanal) o solicitándolo por correo.
- **Cancelación / Supresión**: solicitar la eliminación de su cuenta y todos los datos asociados.
- **Oposición**: oponerse al uso de sus datos para finalidades específicas (por ejemplo, recordatorios push).
- **Portabilidad**: solicitar una copia de sus datos en formato legible.
- **Revocación del consentimiento**: retirar el consentimiento en cualquier momento sin consecuencias negativas para el usuario.

### 14.2 Cómo eliminar tu cuenta y datos

> **Conforme a la Política de Eliminación de Cuenta de Google Play, ofrecemos múltiples mecanismos para que el usuario pueda eliminar su cuenta y datos asociados:**

#### Opción 1 — Dentro de la app móvil (recomendado)

1. Abre la aplicación NewLife
2. Ve a **Inicio → Configuración → Eliminar mi cuenta**
3. Confirma la acción con tu contraseña
4. La eliminación es inmediata y los datos se purgan en un plazo máximo de 30 días

#### Opción 2 — A través de la landing page del proyecto

Si ya desinstalaste la aplicación, puedes solicitar la eliminación de tu cuenta a través del formulario de solicitud disponible en la landing page del proyecto:

**[https://newlife.openlab.uninorte.edu.co/eliminar-cuenta](https://newlife.openlab.uninorte.edu.co/eliminar-cuenta)**

El formulario te pedirá el correo electrónico con el que te registraste y procesará tu solicitud en un plazo máximo de **15 días hábiles**.

#### Opción 3 — Por correo electrónico

Envía un correo a **proyecto.newlife.2026@gmail.com** solicitando la eliminación de tu cuenta. Te responderemos en un plazo máximo de **15 días hábiles**.

### 14.3 Qué se elimina

Al solicitar la eliminación de tu cuenta, se eliminan:

- Tu perfil completo (apodo, pronombre, motivo de sobriedad, etc.)
- Todos los datos de salud asociados (registros diarios, emociones, episodios de consumo)
- Tu agenda personal y contactos de apoyo
- Frases motivacionales favoritas y contenidos educativos favoritos
- Tu progreso en retos y niveles del programa de los 12 pasos
- Tu historial de uso de la aplicación

### 14.4 Qué podría retenerse (y por qué)

En casos excepcionales podrían retenerse:

- **Credenciales mínimas en ROBLE** (correo, identificador interno y contraseña hasheada): permanecen dentro del sistema de autenticación de ROBLE conforme a las políticas de esa plataforma.
- **Registros operacionales mínimos** (logs de seguridad) por el tiempo que exija la normativa colombiana, anonimizados.
- **Métricas anónimas agregadas** ya generadas (no atribuibles a tu cuenta) podrán conservarse indefinidamente, al no ser información personal.

### 14.5 Plazos

- **Eliminación dentro de la app**: inmediata, con purga total en máximo **30 días calendario**.
- **Solicitudes por formulario web o correo**: respondidas en máximo **15 días hábiles** conforme a la Ley 1581/2012.

---

## 15. Menores de Edad y Verificación

NewLife está dirigida exclusivamente a personas **mayores de 18 años**.

### 15.1 Verificación de edad

Al registrarse, el usuario debe **confirmar explícitamente** su fecha de nacimiento mediante un selector de fecha. El sistema calcula la edad y **bloquea automáticamente el registro** si el usuario es menor de 18 años. Esta verificación se registra como parte del consentimiento informado. La fecha de nacimiento ingresada se utiliza únicamente para validar la edad y **no se almacena en los servidores de NewLife**.

### 15.2 Si detectamos un menor de edad

Si detectamos que un usuario registrado es menor de edad, procederemos a:

1. Suspensión inmediata de la cuenta
2. Eliminación de todos los datos asociados en un plazo máximo de 30 días
3. Notificación al usuario a través del correo electrónico de la cuenta

### 15.3 Para padres y tutores

Si usted es padre, madre o tutor y cree que su hijo menor de edad ha proporcionado datos a través de NewLife, contáctenos a **proyecto.newlife.2026@gmail.com** de manera inmediata para proceder con la eliminación.

---

## 16. Retención de Datos

Los datos personales se conservarán durante el tiempo en que el usuario mantenga su cuenta activa. Una vez que el usuario solicite la eliminación de su cuenta:

- Los datos personales identificables serán eliminados en un plazo máximo de **30 días calendario**
- Los datos anónimos y agregados de métricas de uso podrán conservarse indefinidamente, al no ser atribuibles a ningún usuario específico
- Los registros de operaciones podrán conservarse por el tiempo que exija la normativa legal colombiana aplicable

> **Sobre el fin del proyecto académico**: En caso de que el proyecto NewLife concluya como iniciativa académica, el equipo se compromete a notificar a los usuarios registrados con al menos **30 días de anticipación** y a proceder con la eliminación completa de todos los datos personales almacenados, salvo que exista un sucesor responsable que asuma formalmente esta política.

---

## 17. Tecnologías de Seguimiento

La aplicación móvil **no utiliza cookies**. Utiliza tokens JWT estrictamente necesarios para el funcionamiento del servicio de autenticación de ROBLE. Estos tokens:

- Son de corta duración y se renuevan automáticamente
- No se utilizan para rastreo publicitario ni análisis de comportamiento individual
- Se eliminan al cerrar sesión

**No se utilizan tecnologías de rastreo de terceros** (Google Analytics, Meta Pixel, Firebase Analytics, etc.) en ninguna de las plataformas de NewLife.

El único sistema de seguimiento es el de **analytics anónimo interno** descrito en la [Sección 7](#7-sistema-de-analytics-anónimo).

---

## 18. Consentimiento y Cambios a esta Política

### 18.1 Cuándo se solicita consentimiento

NewLife solicita el consentimiento del usuario en los siguientes momentos del flujo de la aplicación:

1. **Durante el registro**: el usuario debe aceptar explícitamente esta Política de Privacidad antes de crear su cuenta. Se solicita verificación de mayoría de edad (18+) mediante fecha de nacimiento.
2. **Migración del modo invitado**: al migrar datos locales a una cuenta registrada, el usuario confirma explícitamente qué información desea transferir.
3. **Notificaciones push**: el usuario debe aceptar específicamente el envío de notificaciones push de recordatorios; este permiso es revocable en cualquier momento desde la configuración del dispositivo o de la aplicación.

El usuario puede consultar y revocar sus consentimientos en cualquier momento desde la configuración de la aplicación.

### 18.2 Cambios a esta política

NewLife se reserva el derecho de actualizar esta política. Cuando se realicen cambios sustanciales:

- Se notificará a los usuarios registrados mediante un aviso dentro de la aplicación
- La fecha de la última actualización será visible en esta política y en la landing page
- El uso continuado de la aplicación tras la notificación constituirá aceptación de los cambios
- Para cambios sensibles (nuevos tipos de datos recolectados, nuevas finalidades) se solicitará re-consentimiento explícito

Para cambios menores (correcciones de redacción, actualización de datos de contacto), la notificación podrá realizarse únicamente actualizando el documento.

### 18.3 Contacto y reclamaciones

Para cualquier consulta, solicitud o reclamación relacionada con el tratamiento de datos personales:

- **Correo electrónico**: proyecto.newlife.2026@gmail.com
- **Landing page**: [newlife.openlab.uninorte.edu.co](https://newlife.openlab.uninorte.edu.co)
- **Institución**: Universidad del Norte, Barranquilla, Colombia

Si considera que su solicitud no ha sido atendida satisfactoriamente, tiene derecho a presentar una queja ante la **Superintendencia de Industria y Comercio (SIC)** de Colombia, autoridad nacional de protección de datos personales.

- Sitio web SIC: [https://www.sic.gov.co](https://www.sic.gov.co)

### 18.4 Marco normativo aplicable

Esta política se rige por la siguiente normativa colombiana y políticas internacionales:

- **Ley Estatutaria 1581 de 2012**: Protección de Datos Personales (Colombia)
- **Decreto 1377 de 2013**: Reglamentación parcial de la Ley 1581
- **Decreto 1074 de 2015**: Decreto Único Reglamentario del Sector Comercio
- **Circular Externa 002 de 2015 de la SIC**: Instrucciones sobre protección de datos
- **Google Play User Data Policy**: Políticas de datos de usuario de Google Play
- **Google Play Health Apps Policy**: Políticas para aplicaciones de salud de Google Play

---

## 19. Glosario

| Término | Definición |
|---|---|
| **ROBLE** | Plataforma tecnológica de OPENLAB (Universidad del Norte) que provee los servicios de autenticación y base de datos utilizados por NewLife |
| **OPENLAB** | Laboratorio de innovación de código abierto de la Universidad del Norte |
| **MinIO** | Sistema de almacenamiento de archivos compatible con S3 que NewLife usa para guardar archivos del sistema (no datos personales del usuario) |
| **Freesound** | Plataforma pública de audios bajo licencias libres. NewLife usa su API para acceder a audios de meditación |
| **JWT** | *JSON Web Token*. Estándar de seguridad para gestionar sesiones de usuario de forma cifrada y sin almacenar contraseñas en el servidor de la aplicación |
| **Token de acceso** | Credencial temporal que identifica al usuario en cada solicitud a la aplicación. Tiene una duración corta por seguridad |
| **Token de renovación** | Credencial de mayor duración que permite obtener un nuevo token de acceso sin que el usuario deba iniciar sesión de nuevo |
| **Datos sensibles** | Categoría especial de datos personales que incluye información sobre salud, vida sexual, origen racial, opiniones políticas y creencias religiosas, protegida con requisitos más estrictos por la Ley 1581 |
| **Derechos ARCO** | Derechos de Acceso, Rectificación, Cancelación y Oposición que la ley colombiana reconoce a todo titular de datos personales |
| **Anonimización** | Proceso por el cual los datos se transforman de forma que no es posible identificar a la persona a la que pertenecen, ni directa ni indirectamente |
| **SHA-256** | Algoritmo criptográfico de hash que transforma datos de entrada en una cadena de 256 bits irreversible. Usado por NewLife para anonimizar identificadores en el sistema de analytics |
| **Sal criptográfica (salt)** | Cadena secreta agregada antes de aplicar el hash, que hace imposible revertir el proceso aún con tablas precomputadas |
| **Notificación push** | Mensaje breve que la aplicación envía al dispositivo del usuario, mostrándose como alerta del sistema operativo. Requiere autorización explícita del usuario para ser enviada |
| **SIC** | Superintendencia de Industria y Comercio. Entidad del gobierno colombiano responsable de la protección de datos personales |
| **Modo invitado** | Forma de acceso a NewLife sin crear una cuenta. La información se guarda solo en el dispositivo y no llega a los servidores de NewLife |
| **PII** | *Personally Identifiable Information*. Información que permite identificar a una persona específica (nombre, correo, teléfono, etc.) |
| **Data Safety Form** | Formulario de Google Play donde los desarrolladores deben declarar los datos que su app recolecta y comparte |
| **Health App** | Categoría de Google Play para aplicaciones que manejan datos de salud, sujeta a políticas más estrictas |

---

> **Al registrarse en NewLife, el usuario declara haber leído, entendido y aceptado esta Política de Privacidad y Manejo de Datos en su totalidad, y otorga su consentimiento libre, previo, explícito e informado para el tratamiento de sus datos personales conforme a lo aquí descrito.**

---

*Versión 1.0 — 2026*
*NewLife, Universidad del Norte, Barranquilla, Colombia*
*© 2026 NewLife — Todos los derechos reservados*

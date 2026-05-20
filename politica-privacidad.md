# Política de Privacidad y Manejo de Datos — NewLife

**Aplicación móvil Android y Panel Web de Administración**
**Versión 1.1.0 — Mayo 2026**
**Barranquilla, Colombia**

---

> **Esta política aplica a la aplicación móvil NewLife (Android) y al panel web de administración.** Cumple con la Ley Estatutaria 1581 de 2012 y sus decretos reglamentarios vigentes en la República de Colombia. Adicionalmente, esta política está plenamente alineada con los requisitos vigentes de la Política de Datos del Usuario y la Política de Eliminación de Cuenta de Google Play para cuentas de desarrolladores personales.

| Campo | Detalle |
|---|---|
| **Responsable** | Equipo NewLife — Universidad del Norte |
| **Plataformas** | Aplicación móvil Android · Panel web de administración · Landing page |
| **Categoría Google Play** | Estilo de Vida / Bienestar y Crecimiento Personal |
| **Tecnología y servicios** | ROBLE / OPENLAB (autenticación y base de datos), MinIO (almacenamiento de archivos del sistema), Freesound API (audios de meditación) |
| **Ley aplicable** | Ley 1581 de 2012, Colombia |
| **Contacto** | proyecto.newlife.2026@gmail.com |

> **Nota para el usuario**: Esta política está escrita en lenguaje claro para que cualquier persona pueda entenderla. Al final del documento encontrará un [Glosario](#19-glosario) con los términos técnicos utilizados.

---

## Tabla de contenidos

1. [Identificación del Responsable](#1-identificación-del-responsable-del-tratamiento)
2. [Naturaleza del Servicio y Deslinde de Responsabilidad Médica](#2-naturaleza-del-servicio-y-deslinde-de-responsabilidad-médica)
3. [Ámbito de Aplicación](#3-ámbito-de-aplicación)
4. [Infraestructura Tecnológica](#4-infraestructura-tecnológica-y-acceso-a-datos)
5. [Datos de Personalización y Hábitos que Recopilamos (Data Safety)](#5-datos-de-personalización-y-hábitos-que-recopilamos)
6. [Protección Especial de Datos de Introspección y Progreso Diario](#6-protección-especial-de-datos-de-introspección-y-progreso-diario)
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
- **Entidad institucional de respaldo**: Universidad del Norte
- **Ciudad**: Barranquilla, Atlántico, Colombia
- **Correo de contacto**: proyecto.newlife.2026@gmail.com

NewLife es una herramienta digital de organización personal y soporte motivacional dirigida a jóvenes entre 18 y 24 años. La aplicación está enfocada en el fortalecimiento del autocontrol, el registro diario de hábitos, la fijación de metas de bienestar y el seguimiento adaptativo del progreso del usuario, desarrollada como proyecto de grado en la Universidad del Norte.

---

## 2. Naturaleza del Servicio y Deslinde de Responsabilidad Médica

NewLife funciona exclusivamente como una bitácora de crecimiento personal, estilo de vida y apoyo motivacional autónomo.

### 2.1 Exclusión de funciones de salud (Health App Disclaimer)

La aplicación **no realiza diagnósticos, no receta tratamientos, no interviene en crisis clínicas ni recopila datos biometrológicos o médicos**. En cumplimiento estricto con las directrices de Google Play vigentes, se declara expresamente que NewLife **NO es una aplicación de salud ("Health App")** ni un servicio clínico.

### 2.2 Deslinde Profesional

NewLife **NO sustituye** bajo ninguna circunstancia el tratamiento médico, la terapia psicológica profesional ni la asistencia especializada en centros de rehabilitación de adicciones. Es una herramienta estrictamente complementaria para la autogestión de rutinas saludables y la motivación individual. Se insta a los usuarios a buscar ayuda profesional certificada para abordar problemáticas de dependencia de sustancias de manera médica.

### 2.3 Restricciones explícitas de uso (alineadas con Google Play Policy 2026)

NewLife **NUNCA** utilizará los datos del usuario para:

- Determinar elegibilidad para empleo
- Determinar elegibilidad para seguros médicos o de vida
- Compartir información en redes sociales sin autorización explícita del usuario
- Discriminación de ningún tipo
- Entrenamiento de modelos de inteligencia artificial sin consentimiento explícito separado
- Cualquier finalidad comercial

---

## 3. Ámbito de Aplicación

La presente Política de Privacidad aplica a:

- La aplicación móvil **NewLife**, disponible para dispositivos Android.
- El **panel web de administración**, utilizado por el equipo NewLife y administradores autorizados para gestionar contenidos educativos y métricas generales de uso.
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

Los datos de perfil y actividad de los usuarios se almacenan en el servicio de base de datos administrado por ROBLE, bajo la infraestructura de OPENLAB. La comunicación entre la aplicación y ROBLE viaja cifrada en tránsito mediante HTTPS/TLS 1.2 o superior, lo cual es verificable mediante los certificados SSL del dominio. El cifrado en reposo de los datos almacenados es responsabilidad de OPENLAB como proveedor de la infraestructura, conforme a las políticas internas de seguridad de la Universidad del Norte.

### 4.3 Almacenamiento de archivos (MinIO)

NewLife utiliza **MinIO** como sistema de almacenamiento de archivos del sistema. **MinIO NO almacena datos personales de los usuarios.** Únicamente almacena:

- Fotos de perfil de los autores de los contenidos educativos (no son fotos de usuarios)
- Banners y miniaturas de los contenidos educativos (artículos y enlaces a videos de YouTube)
- Logos de los grupos de apoyo que se muestran en la aplicación

### 4.4 Audios de meditación (Freesound API)

NewLife utiliza la **API pública de Freesound** ([freesound.org](https://freesound.org)) para acceder a audios de meditación dentro de la aplicación. Esta integración:

- Es de **solo lectura**: no enviamos datos del usuario a Freesound
- Los audios son descargados o reproducidos sin asociación al usuario
- No se comparten cookies, metadatos privados ni información de perfil con Freesound

---

## 5. Datos de Personalización y Hábitos que Recopilamos

En cumplimiento con el formulario de **Seguridad de los Datos (Data Safety)** de Google Play, declaramos con total transparencia los datos recopilados, los cuales se procesan como información de actividad de la aplicación y preferencias de estilo de vida, nunca con fines médicos.

### 5.1 Tabla resumen Data Safety

| Tipo de dato | Categoría en Google Play | Propósito Principal | Obligatorio | Compartido con terceros |
|---|---|---|---|---|
| Correo electrónico | Información personal | Creación y autenticación de la cuenta | Sí | No (Solo ROBLE) |
| Contraseña | Información de autenticación | Validación segura de acceso | Sí | No (Solo ROBLE) |
| Nombre completo | Información personal | Registro e identificación inicial | Sí | No |
| Apodo (Nickname) | Información personal | Visualización personalizada dentro de la app | Sí | No |
| Pronombre preferido | Información personal | Ajuste del lenguaje de la interfaz | Sí | No |
| Fecha/Hora de inicio del contador | Actividad de la aplicación | Cálculo dinámico del tiempo transcurrido en sobriedad/metas | Sí | No |
| Teléfono de contacto de confianza | Información personal | Enlace de marcado rápido en el dispositivo para uso autónomo en crisis | Sí | No |
| Motivo personal de sobriedad | Actividad de la aplicación | Despliegue de recordatorios motivacionales autónomos | Sí | No |
| Gasto financiero previo estimado | Información financiera | Cálculo estadístico del ahorro económico acumulado por metas | Sí | No |
| Estado de ánimo seleccionado | Actividad de la aplicación | Bitácora de autoevaluación diaria de bienestar emocional | Opcional | No |
| Reporte de cumplimiento de meta (Sí/No) | Actividad de la aplicación | Actualización del historial y las rachas del contador personal | Opcional | No |
| Notas de agradecimiento (Texto libre) | Actividad de la aplicación | Sección de diario personal y refuerzo de pensamientos positivos | Opcional | No |
| Contexto del entorno del hábito | Actividad de la aplicación | Identificación reflexiva de entornos que dificultan la meta (sin GPS) | Opcional | No |
| Contexto de interacción social | Actividad de la aplicación | Identificación reflexiva de compañías asociadas a la rutina diaria | Opcional | No |
| Reflexión de autoevaluación (Texto libre) | Actividad de la aplicación | Registro de diario personal ante rupturas de la racha de hábitos | Opcional | No |
| Eventos de agenda de actividades | Actividad de la aplicación | Calendario de recordatorios de grupos de apoyo o lecturas | Opcional | No |
| Contactos de apoyo añadidos manualmente | Información de contactos | Lista personalizada de contactos de emergencia (no lee la agenda del celular) | Opcional | No |
| Métricas de navegación interna | Interacciones con la app | Estadísticas técnicas de optimización del rendimiento | Sí (Logueados) | No (Anonimizado con SHA-256) |

### 5.2 Funcionamiento en Modo Invitado (Sin Registro)

Los usuarios que decidan utilizar la aplicación de forma anónima en Modo Invitado **no transmiten ningún dato personal identificable a los servidores**. Toda la información de sus metas, contadores y bitácoras diarias se almacena de forma local y exclusiva dentro de la memoria privada del dispositivo (AsyncStorage). El usuario puede migrar estos datos voluntariamente en caso de registrar una cuenta en el futuro.

---

## 6. Protección Especial de Datos de Introspección y Progreso Diario

Aunque los datos recopilados por NewLife se enmarcan estrictamente en el ámbito del **Estilo de Vida y la Productividad**, el equipo reconoce que la información sobre el control de hábitos, rutinas de sobriedad y registros emocionales pertenece a la esfera más íntima del usuario. Por lo tanto, en concordancia con el Artículo 6 de la Ley 1581 de 2012 de Colombia, se implementan las siguientes medidas estrictas:

- **Restricción absoluta de acceso**: Los administradores, **NO tienen acceso a los diarios, reflexiones, ni registros individuales** de ningún usuario.
- **Sin fines externos**: Estos datos jamás serán compartidos, vendidos, cedidos, ni utilizados para fines comerciales, publicitarios, entrenamiento de modelos de Inteligencia Artificial o perfilamientos predictivos por parte de terceros o instituciones aliadas.
- **Voluntariedad**: El registro diario de check-in y la escritura en la bitácora son 100% opcionales. El usuario puede seguir usando el contador de tiempo principal sin necesidad de rellenar los diarios de texto.
- **Geolocalización Desactivada**: La app no solicita permisos de GPS. Cuando el usuario registra un entorno en sus hábitos, selecciona una opción de texto predefinida (ej. "Lugar público"), garantizando su anonimato espacial.

---

## 7. Sistema de Analytics Anónimo

Para la optimización de los flujos del sistema y estabilidad técnica de la app, se procesan logs técnicos agregados, **completamente anonimizados** mediante criptografía irreversible.

### 7.1 Criptografía irreversible (SHA-256 + sal secreta)

Para asegurar el anonimato total, los identificadores únicos de usuario son codificados con un **hash criptográfico SHA-256 enriquecido con una sal secreta** antes de guardarse en el módulo estadístico. Esto impide de forma definitiva que los administradores web o atacantes externos puedan asociar un patrón de clics con el correo de un usuario real.

La sal criptográfica se almacena **por separado** de los datos hasheados, en una variable de entorno protegida que no es accesible desde el sistema de analytics.

### 7.2 Datos de evento agregados

Solo se registran métricas procedimentales agregadas (ej. "Interacción con audio de relajación", "Navegación al módulo de diario", "Usuario activo"). **Jamás se capturan** los textos escritos en las notas de gratitud, reflexiones, detalles confidenciales del usuario, ni los términos ingresados en barras de búsqueda.

---

## 8. Finalidad del Tratamiento de Datos

Los datos recopilados son utilizados **exclusivamente** para las siguientes finalidades:

- Proveer el servicio de acompañamiento personalizado dentro de la aplicación
- Permitir al usuario hacer seguimiento de su proceso de autocontrol y crecimiento personal
- Sincronizar el progreso del usuario entre sesiones y dispositivos
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

### 11.2 Administrador (Moderador de Contenidos)

Creados exclusivamente por super administradores. Gestionan contenidos educativos, retos, frases motivacionales y grupos de apoyo. Pueden ver métricas de uso anonimizadas. **No tienen acceso a datos personales o de hábitos individuales** de los usuarios.

### 11.3 Protección de cuentas administrativas

Las cuentas con rol de Administrador o Super Administrador **no pueden ser eliminadas desde el formulario público de eliminación de cuenta**. Esto previene que el sistema quede sin administradores por accidente o por credenciales comprometidas. Los administradores que deseen eliminar su cuenta deben contactar al equipo de NewLife mediante el correo **proyecto.newlife.2026@gmail.com**.

---

## 12. Almacenamiento y Seguridad de los Datos

NewLife utiliza ROBLE (plataforma de OPENLAB, Universidad del Norte) como infraestructura de autenticación y base de datos. Las medidas de seguridad incluyen:

### 12.1 Datos en tránsito

- Comunicaciones cifradas mediante **HTTPS/TLS 1.2+** entre la aplicación y los servidores de ROBLE.
- Certificados SSL válidos verificables públicamente en el dominio.

### 12.2 Datos en reposo

- El **cifrado en reposo** de los datos almacenados en ROBLE es gestionado por **OPENLAB** (Universidad del Norte) como proveedor de la infraestructura, conforme a sus políticas internas de seguridad institucional.
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
- **Autoridades competentes colombianas**, cuando exista una obligación legal explícita y formal (órdenes judiciales motivadas emitidas por jueces competentes).
- Con el **consentimiento explícito y expreso** del usuario para un propósito específico.

En ningún caso los datos de hábitos personales o de progreso individual se compartirán con terceros, incluyendo la institución universitaria, fundaciones aliadas u otros usuarios de la plataforma. Lo único a lo que tienen acceso los usuarios administradores (previamente autorizados por el equipo NewLife) son las métricas que ya están hasheadas y anonimizadas.

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
4. La eliminación es **inmediata** y los datos personales se borran al instante de las tablas relacionadas

#### Opción 2 — A través de la landing page del proyecto

Si ya desinstalaste la aplicación, puedes solicitar la eliminación de tu cuenta a través del formulario disponible en la landing page:

**[https://newlife.openlab.uninorte.edu.co/eliminar-cuenta](https://newlife.openlab.uninorte.edu.co/eliminar-cuenta)**

El formulario te pedirá:

- **Correo electrónico** de tu cuenta
- **Contraseña actual** (para verificar tu identidad)
- **Motivo opcional** de eliminación (para retroalimentación del producto)

La eliminación es **inmediata** una vez verificadas las credenciales. No requiere aprobación adicional ni espera de días.

### 14.3 Qué se elimina

Al solicitar la eliminación de tu cuenta, se eliminan **inmediata e irreversiblemente**:

- Tu perfil completo (apodo, pronombre, motivo de sobriedad, gasto semanal, etc.)
- Todos los registros diarios de hábitos, emociones y autoevaluaciones
- Tu agenda personal y contactos de apoyo añadidos manualmente
- Frases motivacionales favoritas y contenidos educativos guardados
- Tu progreso en retos y niveles del programa de los 12 pasos
- Tu mascota virtual y todo el XP acumulado

Adicionalmente, tu registro principal queda marcado con estado **"ELIMINADO"** y tu nombre se anonimiza con un placeholder (`[Cuenta eliminada]`) para evitar que tus datos personales identificables permanezcan visibles en cualquier referencia residual.

### 14.4 Qué podría retenerse y por qué

Por limitaciones técnicas y obligaciones legales, los siguientes elementos podrían retenerse:

- **Credenciales mínimas en ROBLE** (correo, identificador interno y contraseña hasheada): permanecen dentro del sistema de autenticación de ROBLE, dado que la plataforma de ROBLE no permite la eliminación programática de cuentas de autenticación (esta operación requiere acción manual del equipo administrativo). En NUESTRO sistema, la cuenta queda bloqueada y no puede acceder.
- **Registro principal anonimizado** en nuestra tabla de usuarios: queda únicamente con el correo, el estado `ELIMINADO`, la fecha de eliminación y un motivo opcional. Esto es necesario para impedir la reactivación accidental de la cuenta mediante re-login.
- **Registros operacionales mínimos** (logs de seguridad) por el tiempo que exija la normativa colombiana, anonimizados.
- **Métricas anónimas agregadas** ya generadas (no atribuibles a tu cuenta) podrán conservarse indefinidamente, al no constituir información personal identificable.

### 14.5 Reutilización del correo electrónico

> **Importante**: Una vez eliminada una cuenta, el correo electrónico asociado **no podrá ser reutilizado** para crear una nueva cuenta en NewLife. Esto se debe a que la cuenta en el sistema de autenticación (ROBLE) permanece registrada, y nuestra política de eliminación es irreversible para garantizar que la decisión del usuario sea respetada de forma permanente.

Si deseas volver a usar NewLife después de eliminar tu cuenta, deberás registrarte con un correo electrónico distinto.

### 14.6 Restricción para cuentas administrativas

Las cuentas con rol de **Administrador** o **Super Administrador** **no pueden eliminarse desde el formulario público** de la landing page. Esto previene que el sistema quede sin administradores por accidente o por credenciales comprometidas.

Los administradores que deseen eliminar su cuenta deben **contactar al equipo de NewLife** mediante el correo **proyecto.newlife.2026@gmail.com** desde la dirección registrada de su cuenta, indicando el motivo. El equipo procesará la solicitud manualmente tras verificar la identidad.

### 14.7 Plazos

| Vía de eliminación | Plazo de ejecución |
|---|---|
| Eliminación desde la app móvil | **Inmediata** (instantánea) |
| Eliminación desde landing page | **Inmediata** (instantánea, tras verificación de credenciales) |
| Eliminación de cuentas administrativas | Máximo **15 días hábiles** (procesamiento manual del equipo) |

---

## 15. Menores de Edad y Verificación

NewLife está dirigida exclusivamente a personas **mayores de 18 años**.

### 15.1 Verificación de edad

Al registrarse, el usuario debe **confirmar explícitamente** su fecha de nacimiento mediante un selector de fecha. El sistema calcula la edad y **bloquea automáticamente el registro** si el usuario es menor de 18 años. Esta verificación se registra como parte del consentimiento informado. La fecha de nacimiento ingresada se utiliza únicamente para validar la edad y **no se almacena en los servidores de NewLife**.

### 15.2 Si detectamos un menor de edad

Si detectamos que un usuario registrado es menor de edad, procederemos a:

1. Suspensión inmediata de la cuenta
2. Eliminación de todos los datos asociados en un plazo máximo de 48 horas
3. Notificación al usuario a través del correo electrónico de la cuenta

### 15.3 Para padres y tutores

Si usted es padre, madre o tutor y cree que su hijo menor de edad ha proporcionado datos a través de NewLife, contáctenos a **proyecto.newlife.2026@gmail.com** de manera inmediata para proceder con la eliminación.

---

## 16. Retención de Datos

Los datos personales se conservarán durante el tiempo en que el usuario mantenga su cuenta activa. Una vez que el usuario solicite la eliminación de su cuenta:

- Los datos personales identificables son eliminados **inmediatamente** al procesarse la solicitud
- El registro principal queda anonimizado y marcado como `ELIMINADO` para prevenir reactivación
- Los datos anónimos y agregados de métricas de uso podrán conservarse indefinidamente, al no ser atribuibles a ningún usuario específico

### 16.1 Fin del proyecto académico

En caso de que el proyecto NewLife concluya como iniciativa académica, el equipo se compromete a notificar a los usuarios registrados con al menos **30 días de anticipación** y a proceder con la eliminación completa de todos los datos personales almacenados, salvo que exista un sucesor responsable que asuma formalmente esta política.

---

## 17. Tecnologías de Seguimiento

La aplicación móvil **no utiliza cookies de rastreo comercial**. Utiliza tokens JWT estrictamente necesarios para el funcionamiento del servicio de autenticación de ROBLE. Estos tokens:

- Son de corta duración y se renuevan automáticamente
- No se utilizan para rastreo publicitario ni análisis de comportamiento individual
- Se eliminan al cerrar sesión

**No se utilizan tecnologías de rastreo de terceros** (Google Analytics, Meta Pixel, Firebase Analytics, Flurry, etc.) en ninguna de las plataformas de NewLife.

El único sistema de seguimiento es el de **analytics anónimo interno** descrito en la [Sección 7](#7-sistema-de-analytics-anónimo).

---

## 18. Consentimiento y Cambios a esta Política

### 18.1 Cuándo se solicita consentimiento

NewLife solicita el consentimiento del usuario en los siguientes momentos del flujo de la aplicación:

1. **Durante el registro**: el usuario debe aceptar explícitamente esta Política de Privacidad antes de crear su cuenta. Se solicita verificación de mayoría de edad (18+) mediante fecha de nacimiento.
2. **Migración del modo invitado**: al migrar datos locales a una cuenta registrada, el usuario confirma explícitamente qué información desea transferir.
3. **Notificaciones push**: el usuario debe aceptar específicamente el envío de notificaciones push de recordatorios; este permiso es revocable en cualquier momento desde la configuración del dispositivo o de la aplicación.
4. **Eliminación de cuenta**: el usuario debe confirmar explícitamente su decisión de eliminar la cuenta mediante un diálogo de confirmación.
   - **Desde la app móvil**: confirmación mediante modal de advertencia. La autenticación ya está verificada por la sesión activa.
   - **Desde la landing pública**: ingreso obligatorio de contraseña + checkbox de confirmación, dado que no hay sesión activa.
   
   En ambos canales el proceso es inmediato e irreversible.

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
- **Google Play Account Deletion Policy**: Políticas de eliminación de cuenta de Google Play

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
| **Datos sensibles** | Categoría especial de datos personales protegida con requisitos más estrictos por la Ley 1581 |
| **Derechos ARCO** | Derechos de Acceso, Rectificación, Cancelación y Oposición que la ley colombiana reconoce a todo titular de datos personales |
| **Anonimización** | Proceso por el cual los datos se transforman de forma que no es posible identificar a la persona a la que pertenecen, ni directa ni indirectamente |
| **SHA-256** | Algoritmo criptográfico de hash que transforma datos de entrada en una cadena de 256 bits irreversible. Usado por NewLife para anonimizar identificadores en el sistema de analytics |
| **Sal criptográfica (salt)** | Cadena secreta agregada antes de aplicar el hash, que hace imposible revertir el proceso aún con tablas precomputadas |
| **Notificación push** | Mensaje breve que la aplicación envía al dispositivo del usuario, mostrándose como alerta del sistema operativo. Requiere autorización explícita del usuario para ser enviada |
| **SIC** | Superintendencia de Industria y Comercio. Entidad del gobierno colombiano responsable de la protección de datos personales |
| **Modo invitado** | Forma de acceso a NewLife sin crear una cuenta. La información se guarda solo en el dispositivo y no llega a los servidores de NewLife |
| **PII** | *Personally Identifiable Information*. Información que permite identificar a una persona específica (nombre, correo, teléfono, etc.) |
| **Data Safety Form** | Formulario de Google Play donde los desarrolladores deben declarar los datos que su app recolecta y comparte |
| **Soft Delete** | Técnica que marca un registro como eliminado sin borrarlo físicamente, permitiendo prevenir reactivaciones accidentales y mantener integridad referencial |
| **Bitácora / Diario Personal** | Espacio libre en texto dentro de la app diseñado para la introspección autónoma del usuario en la consecución de sus metas personales de cambio de hábitos |

---

> **Al registrarse en NewLife, el usuario declara haber leído, entendido y aceptado esta Política de Privacidad y Manejo de Datos en su totalidad, y otorga su consentimiento libre, previo, explícito e informado para el tratamiento de sus datos personales conforme a lo aquí descrito.**

---

*Versión 1.1.0 — Mayo 2026*
*NewLife, Universidad del Norte, Barranquilla, Colombia*
*© 2026 NewLife — Todos los derechos reservados*
<div align="center">

# NewLife

[![Node.js](https://img.shields.io/badge/Node.js-%23339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Roble](https://img.shields.io/badge/Roble-%23D71920.svg?style=for-the-badge&logo=cloud&logoColor=white)](https://roble.uninorte.edu.co/)
[![Next.js](https://img.shields.io/badge/Next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Android Studio](https://img.shields.io/badge/Android%20Studio-3DDC84?style=for-the-badge&logo=androidstudio&logoColor=white)](https://developer.android.com/studio)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%2306B6D4.svg?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Docker](https://img.shields.io/badge/Docker-%232496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Diseño en Figma](https://www.figma.com/design/tmy3p6WL45FEvoEQAmLWF2/New-life-Ver.2)

[Prototipo en Figma](https://www.figma.com/proto/tmy3p6WL45FEvoEQAmLWF2/New-life-Ver.2)

Aplicación móvil de acompañamiento para jóvenes en proceso de rehabilitación y post-rehabilitación por adicciones.

[Introducción](#1-introducción) •
[Marco conceptual](#2-marco-conceptual) •
[Planteamiento del problema](#3-planteamiento-del-problema) •
[Objetivos](#4-objetivos) •
[Estado del arte](#5-estado-del-arte--soluciones-relacionadas) •
[Requerimientos](#6-requerimientos)

</div>

## 1. Introducción

Las **adicciones en jóvenes colombianos** representan una de las principales preocupaciones de salud pública del país. En Barranquilla, ciudad donde la cultura del consumo está profundamente arraigada en la vida social y festiva, esta situación adquiere una dimensión crítica: estudios locales indican que el **74,1 % de los jóvenes ha consumido alcohol antes de los 18 años**, con edad promedio de inicio alrededor de los 12 años *(Fundación Simón Bolívar, 2019)*. Adicionalmente, el consumo de otras sustancias psicoactivas y comportamientos adictivos como el uso problemático de tecnología, juego y apuestas presenta prevalencias alarmantes en población universitaria.

A nivel nacional, la *Encuesta Nacional de Salud Mental* reporta que los adultos entre 18 y 44 años presentan las proporciones más altas de trastornos por consumo de sustancias en Colombia *(Ministerio de Salud y Protección Social, 2015)*, lo que evidencia la urgencia de desarrollar **herramientas de acompañamiento accesibles, sostenidas y culturalmente pertinentes** que aborden el espectro completo de las adicciones, tanto a sustancias como comportamentales.

A pesar de los esfuerzos institucionales, el acceso a servicios especializados de rehabilitación continúa siendo limitado y, en muchos casos, estigmatizado. Colombia cuenta con entre **1,6 y 3 psiquiatras por cada 100.000 habitantes** *(El País, 2022)*, y entre el **84 % y el 92 % de las personas con trastornos mentales no reciben atención adecuada** *(Ministerio de Salud, 2015)*. En este contexto, las tecnologías móviles emergen como una oportunidad estratégica. El concepto de *mHealth (mobile health)* ha demostrado ser eficaz como complemento a procesos terapéuticos, al facilitar el registro de hábitos, el seguimiento emocional y el acceso a redes de apoyo *(WHO, 2021)*. 

Sin embargo, la mayoría de las aplicaciones disponibles en el mercado —como *I Am Sober*, *Sober Grid* o *Reframe*— presentan limitaciones en la forma en que abordan el proceso de recuperación. En muchos casos, estas herramientas se centran principalmente en adicciones específicas (típicamente alcohol) o en funciones básicas como contadores de sobriedad o espacios de interacción abierta entre usuarios, dejando en segundo plano elementos como el **acompañamiento estructurado**, el **seguimiento del progreso personal** o la existencia de **entornos moderados** que brinden mayor seguridad durante las primeras etapas de recuperación *(Nahum-Shani et al., 2018)*.

El presente proyecto de grado parte del trabajo desarrollado en el semestre anterior por **Andrea Díaz De La Hoz**, cuyo resultado fue el diseño **UX/UI de alta fidelidad** de la aplicación *NewLife*: un sistema de acompañamiento para jóvenes barranquilleros entre 18 y 24 años en proceso de rehabilitación y post-rehabilitación por adicciones, tomando como caso de estudio la **Fundación Terapéutica Shalom de Puerto Colombia, Atlántico**. Dicho trabajo produjo un prototipo interactivo validado en *Figma*, una identidad gráfica unificada y material de comunicación visual.

Este proyecto asume la continuación natural de ese proceso: la **implementación técnica completa del sistema**, con el objetivo de transformar un diseño validado en un producto funcional y desplegado en producción.

La solución contempla **tres niveles de acceso**: un modo invitado con almacenamiento local, un usuario registrado con sincronización en la nube y un usuario con acceso a comunidades por invitación, administradas a través del panel web por líderes de fundaciones o grupos de apoyo como *Alcohólicos Anónimos*, *Narcóticos Anónimos* y otras organizaciones especializadas en rehabilitación. Funcionalmente, la aplicación se organiza en **seis módulos principales** que abarcan acompañamiento emocional, seguimiento del progreso, contenido educativo, motivación y espacios comunitarios seguros, además de un panel de administración web para la gestión de comunidades y contenidos, y una *landing page* informativa.

El presente documento recoge la **formulación técnica integral del proyecto**. Se desarrolla a través del marco conceptual, el planteamiento del problema, las restricciones y supuestos de diseño, el alcance definido para el semestre, los objetivos general y específicos, el estado del arte, y los requerimientos del sistema. De esta manera, *NewLife* no solo representa la implementación técnica de un diseño previamente validado, sino la materialización de una **herramienta tecnológica con potencial impacto social en el contexto local**.

## 2. Marco conceptual

Esta sección presenta los conceptos, métodos, técnicas y términos fundamentales necesarios para comprender adecuadamente el problema, la solución propuesta y las decisiones técnicas del proyecto *NewLife*.

### 2.1 Adicciones y trastornos por consumo de sustancias

Una **adicción** es un trastorno crónico y recurrente caracterizado por la búsqueda y el consumo compulsivo de una sustancia o la realización de una conducta, a pesar de las consecuencias adversas. Desde una perspectiva clínica, los trastornos por consumo de sustancias se definen según criterios del *Manual Diagnóstico y Estadístico de los Trastornos Mentales* (DSM-5), que incluyen pérdida de control, deterioro funcional, uso riesgoso y síntomas fisiológicos como tolerancia y abstinencia.

Las adicciones se clasifican en dos grandes categorías:

**Adicciones a sustancias:** Incluyen el consumo problemático de alcohol, tabaco, cannabis, cocaína, heroína, anfetaminas y otras drogas psicoactivas. Cada sustancia tiene perfiles farmacológicos distintos que generan diferentes patrones de dependencia y síntomas de abstinencia.

**Adicciones comportamentales:** Comprenden conductas compulsivas como el juego patológico, el uso problemático de internet y videojuegos, la adicción a las compras, a la comida, al sexo y otras conductas que, aunque no involucran sustancias químicas, activan los mismos circuitos neuronales de recompensa y generan patrones de dependencia similares.

En ambos casos, el proceso de **rehabilitación** requiere intervención multidisciplinaria que puede incluir desintoxicación médica, psicoterapia individual y grupal, medicación de apoyo y reinserción social. La **post-rehabilitación** es el periodo posterior al tratamiento intensivo, donde el principal desafío es mantener la abstinencia y prevenir recaídas mediante estrategias de afrontamiento, redes de apoyo y seguimiento continuado.

### 2.2 El modelo de los 12 pasos

El programa de **12 pasos** es un método de recuperación desarrollado por Alcohólicos Anónimos en la década de 1930 y adoptado posteriormente por múltiples organizaciones de ayuda mutua, incluyendo Narcóticos Anónimos, Jugadores Anónimos y otras. El programa estructura el proceso de recuperación en doce etapas progresivas que van desde el reconocimiento de la impotencia ante la adicción hasta la transmisión del mensaje de recuperación a otras personas.

Aunque el programa tiene un componente espiritual, su estructura se ha demostrado efectiva en diversos contextos culturales y religiosos. Los 12 pasos proveen un marco de referencia común que facilita el trabajo terapéutico en grupo, la mentoría entre pares (apadrinamiento) y el seguimiento estructurado del progreso personal. En *NewLife*, el avance en los 12 pasos se integra como eje del módulo *Mi Progreso*, permitiendo al usuario registrar su avance, tomar notas reflexivas y visualizar su recorrido.

### 2.3 Factores de riesgo y protección

Los **factores de riesgo** son condiciones biológicas, psicológicas o sociales que aumentan la probabilidad de desarrollar una adicción o de sufrir una recaída durante el proceso de recuperación. Entre los más relevantes en el contexto de jóvenes barranquilleros están:

- **Presión social y normalización cultural del consumo**, particularmente en eventos festivos como el Carnaval de Barranquilla.
- **Disponibilidad y accesibilidad de sustancias**, reflejada en la alta densidad de puntos de venta de alcohol y la facilidad de acceso a otras drogas.
- **Antecedentes familiares de adicción**, que incrementan la vulnerabilidad genética.
- **Comorbilidades psiquiátricas**, como trastornos de ansiedad, depresión o TDAH, que pueden llevar al consumo como forma de automedicación.
- **Eventos estresantes** como rupturas, pérdidas, problemas académicos o laborales.

Los **factores de protección** son condiciones que disminuyen la probabilidad de consumo y facilitan la recuperación sostenida:

- **Redes de apoyo** familiares y sociales sólidas.
- **Participación en grupos de ayuda mutua** como AA o NA.
- **Habilidades de afrontamiento** ante situaciones de riesgo (técnicas de manejo de ansiedad, comunicación asertiva, resolución de problemas).
- **Seguimiento terapéutico continuado** con profesionales de la salud mental.
- **Motivación intrínseca para el cambio**, reforzada mediante técnicas como la entrevista motivacional.

*NewLife* busca fortalecer los factores de protección mediante el seguimiento emocional diario, el acceso a contenido educativo sobre estrategias de afrontamiento, el sistema de logros y retos que refuerzan la motivación intrínseca, y la conexión con comunidades de apoyo moderadas.

### 2.4 Recaída y prevención de recaídas

La **recaída** se define como el retorno al consumo de sustancias o la conducta adictiva después de un periodo de abstinencia. Estudios en América Latina indican que una proporción considerable de egresados de tratamiento recae en el primer año, siendo los primeros tres meses el periodo más crítico *(Mazariegos, 2021)*. La recaída no debe interpretarse como un fracaso, sino como parte del proceso de recuperación que requiere ajuste en las estrategias de afrontamiento y refuerzo del apoyo social.

El **modelo de prevención de recaídas** de Marlatt y Gordon identifica tres componentes críticos:

1. **Identificación de situaciones de alto riesgo**: Personas, lugares, emociones o eventos que históricamente han desencadenado el consumo.
2. **Desarrollo de estrategias de afrontamiento**: Habilidades conductuales y cognitivas para manejar situaciones de riesgo sin recurrir al consumo.
3. **Manejo de la recaída temprana**: Si ocurre un episodio de consumo aislado (*lapse*), evitar que se convierta en una recaída completa mediante intervención inmediata.

En *NewLife*, la prevención de recaídas se aborda mediante:
- El **check-in diario** que permite identificar patrones emocionales de riesgo.
- El **botón SOS** que activa un protocolo de crisis con ejercicios de respiración, distracción y acceso a contactos de emergencia.
- Las **notificaciones preventivas** en fechas de riesgo configuradas por el usuario.
- El **registro de lugares de riesgo** en el módulo *Cuidado*, con alertas georreferenciadas (feature planificada para versiones futuras).

### 2.5 mHealth y salud digital

El término **mHealth** (*mobile health*) se refiere al uso de dispositivos móviles —smartphones, tablets, wearables— para la prestación de servicios de salud, la recopilación de datos clínicos y la promoción de comportamientos saludables. La Organización Mundial de la Salud reconoce el *mHealth* como una estrategia efectiva para mejorar el acceso a servicios de salud en contextos de recursos limitados *(WHO, 2021)*.

En el contexto de las adicciones, las aplicaciones *mHealth* han demostrado ser efectivas en:
- **Monitoreo en tiempo real** del estado emocional y situaciones de riesgo.
- **Intervenciones just-in-time**: Mensajes o ejercicios activados en momentos de alta vulnerabilidad.
- **Refuerzo de la adherencia terapéutica** mediante recordatorios de medicación, citas o actividades de autocuidado.
- **Conexión con redes de apoyo** sin necesidad de desplazamiento físico.

*NewLife* se inscribe en el paradigma *mHealth* al ofrecer acompañamiento continuado accesible desde el dispositivo móvil del usuario, con funcionalidades que operan tanto en línea (sincronización en la nube, comunidades) como fuera de línea (modo invitado con almacenamiento local).

### 2.6 Gamificación en salud

La **gamificación** es la aplicación de elementos de diseño de juegos —puntos, niveles, logros, narrativa de progreso— en contextos no lúdicos para aumentar la motivación y el compromiso del usuario. En aplicaciones de salud, la gamificación ha demostrado mejorar la adherencia a comportamientos saludables, especialmente en poblaciones jóvenes *(Cugelman, 2013)*.

Sin embargo, la gamificación en contextos de rehabilitación debe diseñarse con cautela para evitar efectos contraproducentes:
- **Evitar competición externa**: Comparar públicamente el progreso entre usuarios puede generar desmotivación o presión social inadecuada.
- **Alinear recompensas con metas intrínsecas**: Los logros deben reforzar el valor interno de la sobriedad (bienestar, autoeficacia) y no solo el reconocimiento externo.
- **No penalizar recaídas**: Los sistemas de puntos o rachas no deben castigar al usuario por episodios de consumo, sino ofrecer oportunidades de reinicio sin pérdida de logros previos.

En *NewLife*, la gamificación se implementa mediante:
- Una **mascota evolutiva** cuya apariencia cambia con el tiempo de sobriedad, personalizando el progreso del usuario.
- **Logros e insignias** desbloqueables por hitos de sobriedad, completación de retos y participación en la comunidad.
- **Retos individuales** que proponen actividades de autocuidado sin competición entre usuarios.

### 2.7 Diseño centrado en el usuario

El **diseño centrado en el usuario** (DCU) es un enfoque iterativo de desarrollo de productos que coloca las necesidades, limitaciones y preferencias del usuario final en el centro de todas las decisiones de diseño. El proceso típico incluye investigación contextual (entrevistas, observación), definición de personas y escenarios, prototipado rápido, pruebas de usabilidad y refinamiento iterativo.

En el contexto de aplicaciones de salud mental, el DCU adquiere dimensiones adicionales:
- **Diseño no estigmatizante**: Lenguaje e imágenes que evitan juicios morales sobre la adicción y refuerzan la dignidad del usuario.
- **Accesibilidad emocional**: Interfaz que transmite calidez, acompañamiento y esperanza sin caer en el paternalismo.
- **Privacidad como valor de diseño**: Garantizar que datos sensibles (progreso terapéutico, estado emocional) nunca se comparten sin consentimiento explícito.

El proyecto precedente de *NewLife* aplicó **Design Thinking** en cinco etapas: empatizar (trabajo de campo con la Fundación Shalom), definir (síntesis de necesidades), idear (generación de soluciones), prototipar (prototipo en Figma) y testear (pruebas de usabilidad con usuarios reales y expertos). El presente proyecto hereda esta base validada y la extiende con dos rondas adicionales de pruebas de usabilidad durante el desarrollo.

### 2.8 Arquitectura de software

La **arquitectura de software** define la estructura fundamental de un sistema, sus componentes, las relaciones entre ellos y los principios que gobiernan su diseño y evolución. En *NewLife*, se adopta un patrón de **monolito modular**: una aplicación backend única dividida en módulos independientes por dominio de negocio (autenticación, usuarios, progreso, cuidado, motivación, comunidad), donde cada módulo tiene responsabilidades claramente delimitadas pero comparte la misma base de código y proceso de despliegue.

Esta arquitectura se distingue de los **microservicios** (múltiples servicios independientes con despliegue separado) y del **monolito tradicional** (código sin separación modular clara). El monolito modular ofrece un equilibrio entre **simplicidad operativa** —un solo repositorio, un solo despliegue— y **mantenibilidad** —cambios en un módulo no afectan a otros si la interfaz pública se mantiene estable.

El patrón se implementa en *NewLife* mediante dos backends independientes en NestJS:
- **Backend móvil** (`newlife-api`): Atiende las peticiones de la app móvil.
- **Backend admin** (`admin-api`): Atiende el panel de administración web.

Esta separación garantiza que los endpoints administrativos (gestión de usuarios, moderación, aprobación de baneos) nunca estén expuestos a usuarios móviles, reduciendo la superficie de ataque.

### 2.9 Integración con servicios institucionales

El proyecto integra la **API Roble** de la Universidad del Norte, una plataforma Backend-as-a-Service (BaaS) que provee autenticación de usuarios y almacenamiento de datos estructurados mediante una API REST. La integración con Roble es una restricción institucional del proyecto y permite eliminar la necesidad de gestionar infraestructura propia de base de datos, al costo de limitaciones en las capacidades de consulta (filtros solo por igualdad exacta, timestamps como `varchar`).

La autenticación de usuarios se realiza exclusivamente a través de Roble, lo que garantiza que las credenciales se gestionan bajo estándares institucionales y que el sistema no almacena contraseñas en texto plano. El backend actúa como intermediario entre el cliente y Roble, emitiendo tokens JWT propios que contienen el token de Roble embebido, de forma que el frontend nunca interactúa directamente con la API institucional.

### 2.10 Comunidades terapéuticas y grupos de ayuda mutua

Las **comunidades terapéuticas** son entornos estructurados de convivencia donde personas en proceso de rehabilitación participan en actividades grupales, terapias individuales y programas educativos bajo la supervisión de profesionales de la salud. Los **grupos de ayuda mutua** como Alcohólicos Anónimos y Narcóticos Anónimos operan bajo el principio de apoyo entre pares, donde personas en recuperación comparten experiencias, fortaleza y esperanza sin intervención de profesionales.

*NewLife* incorpora el concepto de **comunidades cerradas por invitación** que pueden ser gestionadas tanto por fundaciones terapéuticas como por grupos de ayuda mutua. Cada comunidad tiene un administrador responsable de:
- Generar invitaciones para nuevos miembros.
- Asignar tipos de acceso diferenciados (solo ver, postear y comentar, acceso completo con chat).
- Designar moderadores que puedan eliminar contenido inapropiado, suspender miembros y enviar solicitudes de baneo al administrador principal.

Este modelo garantiza que las comunidades digitales operen con el mismo nivel de control y seguridad que las comunidades presenciales, evitando la exposición de usuarios en etapas tempranas de recuperación a contenido potencialmente dañino o desencadenante.

## 3. Planteamiento del problema

### 3.1 Descripción del problema

El **consumo problemático de sustancias y las adicciones comportamentales en jóvenes universitarios de Barranquilla** constituyen un fenómeno de alta prevalencia con consecuencias graves en la salud mental, el desempeño académico y la cohesión social. El 26,48 % de los estudiantes de la Universidad Simón Bolívar presentan riesgo de consumo de alcohol (2019), y la *Encuesta Nacional de Salud Mental* reporta que los adultos entre 18 y 44 años concentran las proporciones más altas de trastornos por consumo de sustancias en Colombia *(Ministerio de Salud, 2015)*. 

En Barranquilla, la normalización cultural del consumo de alcohol y otras sustancias —acentuada por eventos como el Carnaval, con incrementos de ventas de hasta el 48,4 % en establecimientos de bebidas— genera un entorno de alta exposición que dificulta la abstinencia incluso en personas con voluntad de recuperarse. Adicionalmente, el consumo de otras sustancias psicoactivas (cannabis, cocaína, drogas de síntesis) y el desarrollo de adicciones comportamentales (juego, uso problemático de internet, compras compulsivas) presenta prevalencias crecientes en población joven urbana.

Una vez finalizado un programa de rehabilitación, el **riesgo de recaída se mantiene elevado**: estudios en América Latina señalan que una proporción considerable de egresados de tratamiento recae en el primer año, siendo los primeros tres meses el periodo más crítico *(Mazariegos, 2021)*. Los principales factores detonantes son la presión social, la disponibilidad de sustancias, el manejo inadecuado de emociones negativas y, de forma determinante, la **ausencia de acompañamiento continuo** tras la fase residencial. Esta brecha en el seguimiento post-tratamiento constituye el núcleo del problema que el presente proyecto busca atender.

El sistema de salud colombiano agrava esta situación: el país cuenta con entre 1,6 y 3 psiquiatras por cada 100.000 habitantes *(El País, 2022)*, y entre el 84 % y el 92 % de las personas con trastornos mentales no reciben atención adecuada *(Ministerio de Salud, 2015)*. Las consultas breves en EPS, los altos costos de atención privada y el estigma social asociado a las adicciones reducen la adherencia a tratamientos y la búsqueda de ayuda. Frente a este panorama, las aplicaciones móviles de salud (*mHealth*) emergen como una **alternativa viable, escalable y de bajo costo** para complementar los procesos terapéuticos existentes.

Si bien existen aplicaciones internacionales orientadas a la sobriedad —como *I Am Sober*, *Sober Grid* o *Sunflower Sober*—, estas se centran en funciones generales como contadores de sobriedad o comunidades abiertas, sin integrar acompañamiento estructurado, seguimiento del progreso personal ni mecanismos de control comunitario adaptados a la dinámica de fundaciones y grupos de apoyo locales como *Alcohólicos Anónimos* o *Narcóticos Anónimos*. Adicionalmente, la mayoría están diseñadas exclusivamente para adicción a alcohol, sin considerar el espectro completo de adicciones a sustancias y comportamentales. Tampoco ofrecen **modos de acceso diferenciado** que permitan explorar la herramienta de forma anónima antes del registro, una barrera relevante para poblaciones altamente estigmatizadas.

#### Pregunta problema

**¿Cómo puede el desarrollo de una aplicación móvil, construida sobre un diseño UX/UI validado y apoyada por un sistema de administración web, ofrecer acompañamiento continuo y personalizado a jóvenes barranquilleros entre 18 y 24 años en proceso de rehabilitación y post-rehabilitación por adicciones, integrando funcionalidades de seguimiento del progreso, motivación, cuidado y comunidad controlada, y asegurando su viabilidad técnica mediante una arquitectura modular escalable?**

### 3.2 Restricciones y supuestos de diseño

#### Restricciones

Las restricciones delimitan el espacio de solución técnica y organizativa dentro del cual opera el equipo. Se clasifican en cuatro categorías:

**De alcance:** La aplicación está dirigida al acompañamiento en rehabilitación y post-rehabilitación por adicciones a sustancias (alcohol, drogas ilícitas, tabaco) y adicciones comportamentales (juego, tecnología); el contenido educativo y los recursos de apoyo se estructuran de forma transversal aplicable a múltiples tipos de adicción. El módulo Social no es de acceso público: los usuarios solo pueden acceder a una comunidad mediante invitación gestionada por un administrador. La aplicación no reemplaza la atención psicológica o médica profesional —su rol es complementario—, y no implementará videollamadas, mensajería externa ni geolocalización en tiempo real en la versión inicial.

**Tecnológicas:** El frontend móvil debe desarrollarse en React Native (Android), siguiendo el diseño de alta fidelidad entregado en Figma. El backend debe implementarse con NestJS bajo arquitectura de monolito modular. El panel de administración web y la landing page deben desarrollarse en Next.js. La autenticación debe integrarse obligatoriamente con la API institucional Roble de la Universidad del Norte; no se implementará un sistema de autenticación propio. La infraestructura de despliegue debe ser compatible con los recursos disponibles en el marco académico del proyecto.

**Institucionales:** El proyecto debe cumplir con el cronograma del proyecto de grado de la Universidad del Norte, con entrega final al cierre del semestre en curso. El equipo está conformado por tres personas, lo que exige una distribución eficiente de responsabilidades. El tratamiento de datos personales de usuarios en situación de rehabilitación debe enmarcarse en la Ley 1581 de 2012 (Ley de Protección de Datos Personales de Colombia).

#### Supuestos de diseño

Los supuestos son condiciones que el equipo asume como verdaderas para el diseño y desarrollo del sistema. Si alguno resultara falso, podría requerirse una revisión del alcance o la solución técnica:

- La API Roble de la Universidad del Norte estará disponible y operativa durante el periodo de desarrollo e integración.
- El prototipo de alta fidelidad en Figma constituye la especificación visual y funcional de referencia y no sufrirá modificaciones estructurales significativas durante el desarrollo.
- Los usuarios objetivo cuentan con dispositivo móvil (Android) con acceso a internet para funciones en la nube, y con almacenamiento local suficiente para el modo invitado.
- Cada comunidad contará con al menos un administrador activo responsable de la moderación de contenido y la gestión de invitaciones.
- Las pruebas de usabilidad con usuarios reales podrán realizarse con la participación de al menos cinco personas en proceso de rehabilitación o post-rehabilitación, en coordinación con una fundación o grupo de apoyo local.
- El contenido educativo inicial (artículos, reflexiones, recursos sobre los 12 pasos y estrategias de afrontamiento aplicables a diversas adicciones) podrá ser cargado y administrado directamente desde el panel web por los administradores, sin intervención del equipo de desarrollo.
- Los activos gráficos del diseño (ilustraciones, iconos, paleta de colores, mascota evolutiva) están disponibles en formatos exportables desde Figma para su uso directo en el desarrollo.

### 3.3 Alcance

#### Descripción general

*NewLife* comprende el diseño de arquitectura, desarrollo, integración y despliegue en producción de un sistema de acompañamiento digital para jóvenes en proceso de rehabilitación y post-rehabilitación por adicciones. El sistema se compone de tres elementos: una **aplicación móvil** para  Android, un **panel de administración web** y una **landing page** informativa. El desarrollo parte del prototipo de alta fidelidad validado en Figma, adoptándolo como especificación funcional y visual de referencia.

#### Dentro del alcance

**Aplicación móvil (React Native):** Pantalla de bienvenida e historieta interactiva de onboarding con mascota evolutiva. Módulo de Registro y Login con tres modos de acceso: invitado (local), registrado (nube) y con comunidad (invitación), con integración a la API Roble. Módulo Inicio con dashboard de tiempo de abstinencia, dinero ahorrado, estado de la mascota y Botón SOS. Módulo Mi Progreso con check-in diario, registro emocional, calendario de abstinencia y avance en los 12 pasos. Módulo Cuidado con contenido educativo sobre manejo de diversas adicciones, recordatorios, directorio de profesionales y mapa referencial. Módulo Motivación con retos, sistema de logros y mascota animada. Módulo Social con comunidades cerradas por invitación, publicaciones, foros de reflexión, chats grupales y moderación de contenido.

**Panel de administración web y landing page (Next.js):** Gestión de comunidades (creación, edición, eliminación, invitaciones). Administración de usuarios por comunidad: roles, moderación y gestión de miembros. Gestión de contenido educativo para el módulo Cuidado con etiquetado por tipo de adicción. Panel de métricas agregadas de uso por comunidad. Landing page informativa con acceso a descarga de la app.

**Backend y servicios (NestJS — monolito modular):** API REST con módulos independientes por dominio: autenticación, usuarios, progreso, cuidado, motivación, comunidad y administración. Integración con API Roble. Soporte para los tres modos de acceso. Notificaciones push para recordatorios y alertas. Almacenamiento local para modo invitado con migración automática al registrarse.

**Calidad y despliegue:** Pruebas unitarias por módulo y pruebas de integración end-to-end. Dos rondas de pruebas de usabilidad con usuarios reales (n ≥ 5 por ronda). Despliegue de la app en Google Play y del backend, panel web y landing page en infraestructura de producción. Monitoreo post-lanzamiento y corrección de errores críticos.

#### Fuera del alcance

Atención clínica, psicológica o médica de cualquier tipo. Diagnóstico diferencial entre tipos de adicción o recomendaciones de tratamiento específicas por sustancia. Integración con plataformas de mensajería externas (WhatsApp, Telegram). Videollamadas o funciones de audio/video en tiempo real. Geolocalización en tiempo real. Sistema de pagos o cualquier modelo de monetización. Internacionalización o adaptación a contextos fuera de Barranquilla. Integración con sistemas de historia clínica electrónica. Versión web de la aplicación móvil.

#### Entregables principales

| Entregable | Tecnología | Estado esperado |
|---|---|---|
| Aplicación móvil *NewLife* (6 módulos) | React Native | Desplegada en Google Play |
| Panel de administración web | Next.js | Desplegado en producción |
| Landing page informativa | Next.js | Desplegada en producción |
| API REST backend | NestJS | Desplegada en producción |
| Base de datos | Roble (PostgreSQL) | Configurada en producción |
| Integración con API Roble | Backend | Funcional y validada |
| Pruebas unitarias e integración | Backend + Frontend | Ejecutadas y documentadas |
| Pruebas de usabilidad (2 rondas) | n ≥ 5 usuarios | Documentadas con resultados |
| Documento técnico del proyecto | Informe de grado | Entregado y sustentado |

## 4. Objetivos

### 4.1 Objetivo General

**Desarrollar e implementar la aplicación móvil *NewLife*, junto con su panel de administración web y landing page, como un sistema funcional y desplegado en producción que brinde acompañamiento continuo a jóvenes de Barranquilla entre 18 y 24 años en proceso de rehabilitación y post-rehabilitación por adicciones**, partiendo del diseño validado en Figma e implementando una **arquitectura de monolito modular**.

### 4.2 Objetivos Específicos

- **OE1.** Diseñar e implementar la **arquitectura técnica del sistema** bajo el patrón de monolito modular, definiendo los módulos de dominio (autenticación, usuarios, progreso, cuidado, motivación, comunidad y administración), y el esquema de base de datos relacional para los **tres modos de acceso**.

- **OE2.** Desarrollar los módulos frontend de la aplicación móvil (Bienvenida y Onboarding, Registro y Login, Inicio, Mi Progreso, Cuidado, Motivación y Social) siguiendo el **prototipo de alta fidelidad en Figma**, garantizando coherencia visual con la identidad gráfica de *NewLife* y una **experiencia fluida en Android**.

- **OE3.** Implementar el módulo Social con un sistema de **comunidades cerradas por invitación**, incluyendo el panel de administración web en Next.js que permita a gestores de fundaciones y grupos de apoyo crear comunidades, gestionar miembros, moderar contenido y administrar recursos educativos aplicables a diversas adicciones, sin requerir intervención técnica del equipo de desarrollo.

- **OE4.** Ejecutar un proceso de **aseguramiento de calidad** con pruebas unitarias por módulo, pruebas de integración end-to-end y **dos rondas de pruebas de usabilidad con usuarios reales** en coordinación con una fundación local, documentando los hallazgos e incorporando iteraciones antes del despliegue en producción.

- **OE5.** Desplegar todos los componentes del sistema en producción (aplicación móvil en Google Play, backend en servidor, panel web y landing page en entorno web) y realizar el **monitoreo post-lanzamiento** para corregir errores críticos y asegurar la estabilidad del sistema al cierre del semestre.

## 5. Estado del arte / Soluciones relacionadas

El presente capítulo revisa el **estado del arte en tres dimensiones**: aplicaciones móviles de apoyo a la rehabilitación por adicciones, arquitecturas de software en sistemas de salud digital móvil, y enfoques de diseño centrado en el usuario para poblaciones vulnerables. Esta revisión identifica **brechas que *NewLife* busca cubrir** y justifica las decisiones técnicas adoptadas.

### 5.1 Aplicaciones móviles de apoyo a la sobriedad y recuperación

En los últimos años ha crecido el número de aplicaciones móviles orientadas a apoyar procesos de rehabilitación por adicciones. Las más representativas son *I Am Sober*, *Sober Grid* y *Reframe*, cada una con enfoques distintos que permiten establecer comparaciones con *NewLife*.

#### 🔸 *I Am Sober*

*I Am Sober* es una de las aplicaciones más descargadas, con más de **cinco millones de usuarios**. Ofrece contador de sobriedad, afirmaciones diarias y comunidad pública. Sin embargo, está diseñada principalmente para adicción a alcohol y tabaco, sin adaptación para otras sustancias o adicciones comportamentales. Carece de **contenido educativo estructurado**, no integra los **12 pasos como eje de progreso**, no ofrece **modos de acceso diferenciado** y su comunidad abierta puede ser un riesgo para usuarios en etapas tempranas que requieren entornos controlados *(I Am Sober, 2023)*.

#### 🔸 *Sober Grid*

*Sober Grid* enfatiza el componente social con una red de pares en recuperación y un mecanismo de apoyo de emergencia (*Cravings SOS*), similar al **Botón SOS de *NewLife***. Su comunidad abierta expone al usuario a interacciones no moderadas, no cuenta con **seguimiento de progreso terapéutico** ni integración con programas estructurados, y su mantenimiento ha sido discontinuo en los últimos años *(Sober Grid, 2022)*.

#### 🔸 *Reframe*

*Reframe* es una aplicación premium orientada a la reducción del consumo de alcohol más que a la abstinencia total. Ofrece contenido basado en **neurociencia y mindfulness**. Su modelo de pago limita el acceso a poblaciones de bajos recursos, no contempla **comunidades moderadas** ni integración con los **12 pasos**, y carece de adaptación al contexto latinoamericano. No aborda adicciones más allá del alcohol *(Reframe App, 2023)*.

#### 🔸 Aplicaciones en contexto hispanohablante

La revisión de aplicaciones en español en Google Play y App Store revela una **escasa oferta especializada**. Aplicaciones como *Sin Alcohol* o *Contador de Sobriedad* se limitan a contadores de tiempo y frases motivacionales, sin comunidad moderada ni contenido educativo estructurado. Ninguna integra **sistemas institucionales universitarios**, modos de acceso diferenciado, ni adaptación al contexto cultural de ciudades colombianas como Barranquilla. Además, la mayoría se enfoca exclusivamente en alcohol sin considerar el espectro completo de adicciones.

En síntesis, el panorama actual evidencia **cuatro brechas que *NewLife* busca cubrir**:  
(1) **ausencia de comunidades moderadas con acceso controlado**,  
(2) **falta de adaptación cultural al contexto barranquillero**,  
(3) **carencia de modos de acceso diferenciado que reduzcan la barrera de entrada para usuarios estigmatizados**, y  
(4) **enfoque limitado a alcohol sin contemplar otras adicciones**.

### 5.2 Antecedentes del proyecto

El presente proyecto tiene como antecedente el trabajo desarrollado por Andrea Díaz De La Hoz, estudiante del programa de Diseño Gráfico de la Universidad del Norte, quien realizó, durante el segundo semestre de 2025, el diseño UX/UI de alta fidelidad de la aplicación *NewLife* como parte de su proyecto de grado.

Este trabajo se llevó a cabo con el acompañamiento y asesoría de docentes de la Universidad del Norte, quienes guiaron las diferentes etapas del proceso de investigación, diseño y validación de la propuesta. A lo largo del desarrollo se adoptó un enfoque de diseño centrado en el usuario, apoyado en la metodología de *Design Thinking*, la cual estructura el proceso en fases de empatía, definición del problema, ideación, prototipado y evaluación.

Durante la fase de investigación y empatía se realizaron actividades de trabajo de campo con la Fundación Terapéutica Shalom, incluyendo visitas a la institución y acercamientos con el contexto real de jóvenes en procesos de rehabilitación por diversas adicciones. En este proceso también se realizaron conversaciones y validaciones con profesionales del área de la salud, particularmente psicólogos vinculados a procesos terapéuticos, con el fin de asegurar que la propuesta respondiera a necesidades reales del proceso de recuperación independientemente del tipo de adicción.

Posteriormente se desarrollaron las fases de ideación y diseño, en las cuales se definieron la arquitectura de información, los flujos de interacción y la identidad visual de la aplicación. Como resultado de este proceso se construyó un prototipo interactivo de alta fidelidad en la herramienta *Figma*, el cual representa de forma detallada la estructura, navegación y comportamiento esperado de la aplicación.

El diseño fue sometido a pruebas de usabilidad y procesos de validación, con el objetivo de evaluar la claridad de la interfaz, la facilidad de navegación y la pertinencia de las funcionalidades propuestas. Estas pruebas permitieron realizar ajustes iterativos al diseño y consolidar una propuesta validada desde la perspectiva de experiencia de usuario.

A partir de este antecedente, el presente proyecto retoma el prototipo UX/UI validado como base conceptual y funcional, y se enfoca en su implementación tecnológica, desarrollando la arquitectura del sistema, los componentes de software y la integración entre la aplicación móvil, el backend y el panel de administración, con el objetivo de transformar el diseño propuesto en una aplicación completamente funcional.

### 5.3 Arquitecturas de software en sistemas de salud digital móvil

El diseño arquitectónico de sistemas de salud digital móvil ha evolucionado desde arquitecturas **monolíticas tradicionales** hacia **microservicios** y, más recientemente, hacia *monolitos modulares* como punto de equilibrio entre **simplicidad operativa** y **separación de responsabilidades** (Richardson, 2018).

#### 5.3.1 Monolito modular vs. microservicios

Los **microservicios** ofrecen **alta escalabilidad** y **despliegue independiente**, pero introducen **complejidad operativa significativa** para equipos pequeños: gestión de múltiples repositorios, comunicación entre servicios y mayor curva de aprendizaje (Fowler y Lewis, 2014).

Para proyectos con equipos reducidos y plazos acotados como *NewLife* (tres desarrolladores, un semestre), el patrón de *monolito modular* representa una alternativa más adecuada: permite **separación lógica de dominios** dentro de una **única base de código desplegable**, facilitando la **mantenibilidad** sin la sobrecarga operativa de los microservicios (Newman, 2021).

**NestJS** está diseñado nativamente para implementar este patrón mediante su sistema de módulos.

#### 5.3.2 React Native para desarrollo móvil multiplataforma

**React Native** es uno de los frameworks líderes para aplicaciones móviles multiplataforma. Su modelo de **componentes reutilizables** y la capacidad de compartir lógica entre **iOS y Android** lo hacen eficiente para equipos con recursos limitados (Meta, 2023).

Estudios comparativos con *Flutter* muestran que **React Native** presenta ventajas en **ecosistema de librerías** y **curva de aprendizaje** para equipos con experiencia en desarrollo web (Nawrocki et al., 2021).

En *NewLife*, donde el equipo posee conocimientos previos en *React*, esta elección minimiza la **curva de aprendizaje** y maximiza la **velocidad de desarrollo**.

#### 5.3.3 Next.js para el panel de administración web

**Next.js**, basado en *React*, es el framework de referencia para aplicaciones web con **renderizado híbrido** (*SSR/SSG/CSR*). Su uso en el panel de administración de *NewLife* permite aprovechar **capacidades de renderizado del lado del servidor**, **soporte nativo para rutas API** y un **ecosistema maduro de autenticación y gestión de sesiones** (Vercel, 2023).

Para la *landing page* informativa, el **renderizado estático** garantiza **tiempos de respuesta óptimos**.

### 5.4 Diseño centrado en el usuario en aplicaciones de salud mental

El diseño de aplicaciones para poblaciones en situación de vulnerabilidad exige principios de **diseño centrado en el usuario** que van más allá de la usabilidad convencional. La literatura especializada destaca tres dimensiones críticas: **accesibilidad emocional**, **reducción de barreras de entrada** y **privacidad como valor de diseño** (Torous et al., 2019).

#### 5.4.1 Accesibilidad emocional y diseño no estigmatizante

Norman (2013) señala que el **diseño emocional** opera en tres niveles: *visceral* (impresión estética), *conductual* (facilidad de uso) y *reflexivo* (el significado e identidad que el producto genera en el usuario).  

Para aplicaciones de **salud mental y adicciones**, el nivel *reflexivo* es especialmente crítico: el usuario debe sentir que la herramienta lo comprende y acompaña sin juzgarlo.

El proyecto precedente incorporó estos principios en la **paleta de colores** (tonos cálidos y naturales), **tipografía accesible** (*Inter*), **lenguaje inclusivo** y una **mascota evolutiva** que personaliza el progreso sin imponer metas externas.

#### 5.4.2 Design Thinking como metodología de validación

El proyecto precedente aplicó **Design Thinking** en cinco etapas:  
- *Empatizar* (entrevistas con usuarios en rehabilitación por diversas adicciones y psicólogos de la Fundación Shalom)  
- *Definir* (síntesis de necesidades)  
- *Idear* (creación)  
- *Prototipar* (*Figma*)  
- *Testear* (pruebas de usabilidad con usuarios reales y expertos)  

Este proceso garantizó que el diseño de *NewLife* responda a **necesidades documentadas** y no a suposiciones del equipo (Brown, 2008).  

El presente proyecto hereda esta base validada y la extiende con **dos rondas adicionales de pruebas de usabilidad** durante el desarrollo.

#### 5.4.3 Gamificación en aplicaciones de salud

La incorporación de **gamificación** en aplicaciones de salud ha demostrado aumentar la **adherencia** y **motivación**. Según Cugelman (2013), las técnicas más efectivas incluyen el **progreso visible**, los **logros desbloqueables** y la **narrativa de avance personal**.

*NewLife* integra estos principios en el módulo *Motivación* mediante **retos**, **insignias** y una **mascota que evoluciona** con el tiempo de abstinencia.

La literatura señala que estos elementos deben alinearse con **metas intrínsecas del usuario** y no con competición externa, para ser efectivos en contextos de recuperación (Deterding et al., 2011).

### 5.5 Brecha identificada y aporte de NewLife

La revisión del estado del arte permite identificar que ninguna solución existente combina los siguientes atributos de forma integrada:

a) **Comunidades moderadas con acceso controlado por administrador**, adaptadas a la estructura de grupos de apoyo como Alcohólicos Anónimos y Narcóticos Anónimos.  
b) **Tres modos de acceso diferenciado** que reducen la barrera de entrada para usuarios estigmatizados.  
c) **Adaptación cultural, lingüística y de contenido** al contexto de Barranquilla, Colombia.  
d) Un **módulo de progreso estructurado alrededor de los 12 pasos** con *check-ins emocionales diarios*.  
e) **Enfoque transversal aplicable a múltiples tipos de adicción** (sustancias y comportamentales), no limitado exclusivamente a alcohol.

*NewLife* no pretende competir con soluciones internacionales consolidadas, sino cubrir una **necesidad específica y documentada en el contexto local**, donde la combinación de **alta prevalencia de consumo y adicciones diversas**, **estigma social**, **limitaciones del sistema de salud** y **ausencia de herramientas culturalmente adaptadas** crea una brecha que una aplicación móvil bien diseñada puede contribuir a cerrar.

## 6. Requerimientos

Los requerimientos del sistema *NewLife* se clasifican en **funcionales** y **no funcionales**.

Los **requerimientos funcionales** describen las capacidades y comportamientos específicos que el sistema debe proveer a sus usuarios.

Los **requerimientos no funcionales** establecen los atributos de calidad, restricciones técnicas y criterios de rendimiento que el sistema debe cumplir.

Esta especificación preliminar se basa en el análisis del **prototipo validado en Figma**, las necesidades identificadas en el proceso de **diseño centrado en el usuario** del proyecto precedente, y las restricciones técnicas e institucionales definidas en la sección 3.

## 6.1 Requerimientos Funcionales

#### RF-01 a RF-05: Autenticación y modos de acceso

* **RF-01.** El sistema debe permitir al usuario acceder en **modo invitado**, sin necesidad de registrarse, almacenando la información localmente en el dispositivo.

* **RF-02.** El sistema debe restringir el acceso del modo invitado únicamente a los módulos *Inicio* y *Mi Progreso*.

* **RF-03.** El sistema debe permitir al usuario registrarse e iniciar sesión mediante la **API institucional Roble de la Universidad del Norte**.

* **RF-04.** El sistema debe habilitar el acceso a los módulos *Inicio*, *Mi Progreso*, *Motivación* y *Cuidado* para los usuarios autenticados.

* **RF-05.** El sistema debe habilitar el acceso al módulo *Social* únicamente a usuarios que hayan sido añadidos a una comunidad por un administrador o moderador.

#### RF-06 a RF-10: Gestión de sesión y comunidades

* **RF-06.** El sistema debe permitir la migración automática de los datos locales del modo invitado a la cuenta del usuario al momento del registro.

* **RF-07.** El sistema debe permitir a administradores y moderadores invitar usuarios registrados a comunidades mediante correo electrónico.

* **RF-08.** El sistema debe permitir que un usuario pertenezca a múltiples comunidades simultáneamente.

* **RF-09.** El sistema debe gestionar diferentes roles dentro de la plataforma: usuario, moderador, administrador y superadministrador.

* **RF-10.** El sistema debe permitir el cierre de sesión del usuario invalidando el token activo y eliminando la información de sesión almacenada en el dispositivo.

#### RF-11 a RF-18: Módulo Inicio y sistema SOS

* **RF-11.** El sistema debe mostrar en el módulo *Inicio* el contador de días consecutivos de abstinencia del usuario.

* **RF-12.** El sistema debe mostrar una estimación del dinero ahorrado por el usuario durante su proceso de abstinencia.

* **RF-13.** El sistema debe mostrar una mascota evolutiva asociada al progreso del usuario.

* **RF-14.** El sistema debe otorgar experiencia a la mascota evolutiva mediante actividades como completar retos, realizar registros diarios y avanzar en los niveles de recuperación.

* **RF-15.** El sistema debe permitir visualizar las distintas evoluciones disponibles de la mascota y el progreso de desbloqueo de cada una.

* **RF-16.** El sistema debe mostrar un botón SOS accesible permanentemente dentro de la aplicación.

* **RF-17.** El sistema debe permitir acceder desde el botón SOS a los contactos de emergencia personales del usuario, incluyendo opciones rápidas de llamada y mensajería.

* **RF-18.** El sistema debe incluir un modo crisis dentro del botón SOS con:

  * Ejercicios de respiración guiada con sonido (*Modo Zen*)
  * Frases motivacionales
  * Meditaciones guiadas en audio

#### RF-19 a RF-29: Módulo Mi Progreso

* **RF-19.** El sistema debe permitir realizar múltiples registros diarios emocionales con fecha y hora.

* **RF-20.** El sistema debe solicitar durante el registro diario información sobre consumo y estado emocional del usuario.

* **RF-21.** El sistema debe mostrar preguntas adicionales durante el registro diario cuando el usuario indique que hubo consumo.

* **RF-22.** El sistema debe permitir registrar información contextual relacionada con recaídas, incluyendo ubicación, compañía y otros factores asociados.

* **RF-23.** El sistema debe permitir registrar entradas de gratitud dentro del registro diario.

* **RF-24.** El sistema debe mostrar un historial de gratitud con todas las entradas registradas por el usuario.

* **RF-25.** El sistema debe mostrar el progreso del usuario dentro de los 12 pasos del programa de recuperación.

* **RF-26.** El sistema debe dividir cada uno de los 12 pasos en módulos interactivos con elementos de gamificación y reflexión.

* **RF-27.** El sistema debe registrar el avance, estado y culminación de cada paso del programa de recuperación.

* **RF-28.** El sistema debe mostrar un calendario interactivo con los días limpios y días difíciles registrados por el usuario.

* **RF-29.** El sistema debe permitir consultar el detalle de los registros realizados en una fecha específica desde el calendario.

#### RF-30 a RF-34: Estadísticas y análisis

* **RF-30.** El sistema debe mostrar gráficas de evolución emocional del usuario.

* **RF-31.** El sistema debe mostrar gráficas relacionadas con la racha de abstinencia y recaídas.

* **RF-32.** El sistema debe permitir filtrar las estadísticas por semana, mes y acumulado total.

* **RF-33.** El sistema debe generar métricas basadas en la información recopilada durante los registros diarios.

* **RF-34.** El sistema debe mostrar resúmenes visuales personalizados del progreso del usuario.

#### RF-35 a RF-41: Módulo Motivación

* **RF-35.** El sistema debe mostrar una frase motivacional diaria (*Solo por hoy*).

* **RF-36.** El sistema debe permitir consultar el historial completo de frases motivacionales disponibles.

* **RF-37.** El sistema debe permitir marcar frases motivacionales como favoritas.

* **RF-38.** El sistema debe mostrar un listado de retos activos a los que el usuario pueda unirse.

* **RF-39.** El sistema debe registrar el progreso del usuario dentro de los retos activos.

* **RF-40.** El sistema debe otorgar experiencia y medallas al completar retos.

* **RF-41.** El sistema debe mostrar los logros, insignias y medallas obtenidas por el usuario.

#### RF-42 a RF-50: Módulo Cuidado

* **RF-42.** El sistema debe mostrar un directorio de grupos de apoyo y fundaciones relacionados con recuperación de adicciones.

* **RF-43.** El sistema debe permitir consultar información de contacto y ubicación de grupos de apoyo registrados.

* **RF-44.** El sistema debe mostrar contenido motivacional organizado cronológicamente.

* **RF-45.** El sistema debe mostrar contenido educativo administrado desde el panel web.

* **RF-46.** El sistema debe clasificar el contenido educativo mediante categorías y etiquetas.

* **RF-47.** El sistema debe permitir administrar contactos de emergencia personales.

* **RF-48.** El sistema debe permitir registrar zonas seguras y zonas de riesgo dentro de un mapa interactivo.

* **RF-49.** El sistema debe permitir asociar nombres y descripciones a las zonas registradas en el mapa.

* **RF-50.** El sistema debe incluir una agenda personal con tareas y recordatorios categorizables.

#### RF-51 a RF-61: Módulo Social y comunidades

* **RF-51.** El sistema debe mostrar un feed con publicaciones provenientes de todas las comunidades a las que pertenece el usuario.

* **RF-52.** El sistema debe permitir visualizar publicaciones filtradas por comunidad específica.

* **RF-53.** El sistema debe permitir crear publicaciones dirigidas a una o múltiples comunidades según los permisos del usuario.

* **RF-54.** El sistema debe permitir reaccionar y comentar publicaciones dentro de las comunidades.

* **RF-55.** El sistema debe mostrar perfiles de usuario con publicaciones, logros y tiempo de abstinencia visible según configuración de privacidad.

* **RF-56.** El sistema debe permitir editar el perfil del usuario incluyendo apodo, descripción y pronombres.

* **RF-57.** El sistema debe mostrar un foro de reflexión diaria compartido entre comunidades.

* **RF-58.** El sistema debe permitir responder el foro diario individualmente en cada comunidad.

* **RF-59.** El sistema debe manejar tres niveles de permisos comunitarios:

  * Solo lectura
  * Interacción con publicaciones y comentarios
  * Acceso completo con chat grupal

* **RF-60.** El sistema debe permitir el uso de un chat grupal por comunidad para usuarios con permisos habilitados.

* **RF-61.** El sistema debe permitir que moderadores eliminen publicaciones y comentarios, suspendan usuarios temporalmente y soliciten baneos al administrador.

#### RF-62 a RF-69: Administración y moderación

* **RF-62.** El sistema debe permitir que moderadores añadan usuarios a las comunidades que administran.

* **RF-63.** El sistema debe permitir que moderadores modifiquen los permisos de usuarios dentro de sus comunidades.

* **RF-64.** El panel administrativo debe permitir la gestión de usuarios, comunidades y roles.

* **RF-65.** El panel administrativo debe permitir la creación y administración de contenido educativo, frases motivacionales y foros diarios.

* **RF-66.** El panel administrativo debe permitir gestionar grupos de apoyo y recursos externos.

* **RF-67.** El sistema debe permitir a administradores aceptar o rechazar solicitudes de baneo realizadas por moderadores.

* **RF-68.** El sistema debe permitir a superadministradores crear nuevos administradores con acceso al panel web.

* **RF-69.** El sistema debe registrar acciones relevantes realizadas dentro de la plataforma para su posterior análisis y generación de métricas.

#### RF-70 a RF-72: Métricas y landing page

* **RF-70.** El panel administrativo debe mostrar métricas agregadas sobre el uso general de la plataforma y sus módulos.

* **RF-71.** El sistema debe generar estadísticas basadas en las interacciones y actividades realizadas por los usuarios dentro de la aplicación.

* **RF-72.** La *landing page* de *NewLife* debe mostrar información pública de la plataforma y acceso de descarga hacia Google Play.

## 6.2 Requerimientos No Funcionales

Los requerimientos no funcionales definen los **atributos de calidad**, restricciones técnicas y criterios de desempeño que el sistema *NewLife* debe cumplir para garantizar una experiencia segura, eficiente, accesible y sostenible.

#### Rendimiento

* **RNF-01.** La interfaz inicial de la aplicación móvil debe mostrarse en un tiempo no mayor a **3 segundos**, y la carga completa del dashboard de *Inicio* no debe superar los **5 segundos** bajo condiciones normales de conexión 4G.

* **RNF-02.** El tiempo de respuesta de los endpoints del **API REST** no debe superar los **500 ms** para el percentil 95 de las solicitudes bajo la carga esperada durante pruebas piloto.

* **RNF-03.** El sistema de **notificaciones push** debe entregar las notificaciones programadas con un margen máximo de tolerancia de **2 minutos** respecto a la hora configurada.

* **RNF-04.** El sistema debe permitir configurar y administrar notificaciones push sin afectar significativamente el consumo de batería del dispositivo móvil.

#### Seguridad y privacidad

* **RNF-05.** Toda la comunicación entre la aplicación móvil, el panel web y el backend debe realizarse mediante **HTTPS** utilizando certificados **SSL válidos**.

* **RNF-06.** Los datos personales de los usuarios deben almacenarse cifrados en reposo en la base de datos. Las contraseñas y tokens de sesión nunca deben almacenarse en texto plano.

* **RNF-07.** El sistema debe cumplir con los principios establecidos en la **Ley 1581 de 2012** sobre protección de datos personales en Colombia: finalidad, libertad, veracidad, transparencia, acceso y circulación restringida, seguridad y confidencialidad.

* **RNF-08.** Los datos relacionados con salud mental y progreso terapéutico del usuario, incluyendo check-ins, historial de gratitud y avance en los 12 pasos, deben ser accesibles únicamente por el propio usuario.

* **RNF-09.** El sistema debe registrar las acciones administrativas y de moderación realizadas dentro de las comunidades para fines de auditoría y seguimiento.

* **RNF-10.** El sistema debe garantizar la integridad y consistencia de los registros emocionales, avances terapéuticos y estadísticas del usuario ante fallos de sincronización o cierres inesperados de la aplicación.

#### Usabilidad y accesibilidad

* **RNF-11.** La aplicación móvil debe presentar una navegación intuitiva y consistente que permita acceder fácilmente a las funcionalidades principales desde el dashboard de *Inicio*.

* **RNF-12.** El lenguaje utilizado en la interfaz debe ser claro, cercano, empático y no estigmatizante, evitando términos clínicos o juiciosos.

* **RNF-13.** La aplicación debe superar un puntaje mínimo de **70 puntos** en la escala **System Usability Scale (SUS)** durante pruebas de usabilidad con usuarios reales.

* **RNF-14.** La interfaz debe mantener contraste adecuado, tipografía legible y componentes visuales accesibles para usuarios con dificultades visuales leves.

#### Disponibilidad y confiabilidad

* **RNF-15.** El backend y el panel web deben mantener una disponibilidad mínima del **99%** durante el periodo de pruebas con usuarios reales, excluyendo ventanas de mantenimiento programadas.

* **RNF-16.** El acceso al botón SOS y a los contactos de emergencia debe permanecer disponible incluso ante fallos parciales de conectividad o degradación de servicios no críticos.

* **RNF-17.** El sistema debe permitir el almacenamiento local de la información del usuario en modo invitado y sincronizarla automáticamente cuando el usuario cree una cuenta o inicie sesión.

#### Mantenibilidad y escalabilidad

* **RNF-18.** La arquitectura de monolito modular debe permitir modificar o extender un módulo sin afectar los demás, siempre que no cambien los contratos públicos de datos o endpoints.

* **RNF-19.** El código fuente del proyecto debe estar versionado en un repositorio **Git**, utilizando ramas separadas por funcionalidad, flujo de **Pull Request** y documentación de la API mediante **OpenAPI (Swagger)**.

* **RNF-20.** La arquitectura del sistema debe permitir el crecimiento progresivo de usuarios, comunidades y contenido social sin degradar significativamente el rendimiento general de la plataforma.

#### Compatibilidad

* **RNF-21.** La aplicación móvil debe ser compatible con dispositivos **Android 10 (API level 29) o superior**.

* **RNF-22.** El panel administrativo web debe ser funcional en las versiones más recientes de **Google Chrome, Mozilla Firefox, Microsoft Edge y Safari**.

* **RNF-23.** El panel administrativo debe contar con un diseño responsivo optimizado para pantallas de **13 pulgadas o superiores**.


## 7. Diseño y arquitectura

Explica cómo se estructurará la solución a nivel conceptual y técnico, justificando decisiones clave.

### 7.1 Evaluación de alternativas

Antes de definir cómo se construirá el sistema, es necesario analizar diferentes formas posibles de implementarlo.

La evaluación de alternativas consiste en:

- identificar múltiples opciones tecnológicas o arquitectónicas;
- compararlas usando criterios de ingeniería;
- justificar la selección de la opción más adecuada.

En esta sección deben presentarse las alternativas consideradas, los criterios utilizados para compararlas y la justificación de la decisión tomada. La selección final debe estar alineada con los requerimientos, restricciones y objetivos del proyecto.


### 7.2 Arquitectura

La arquitectura describe la estructura fundamental del sistema, incluyendo sus componentes, las relaciones entre ellos y la forma en que interactúan para cumplir con los requerimientos planteados.

#### 7.2.1 Descripción general de la arquitectura

Su objetivo es permitir que el lector entienda cómo está pensado el sistema antes de ver cualquier representación visual.

Debe incluir:

- tipo de arquitectura, por ejemplo cliente-servidor, basada en Backend as a Service u otra;
- enfoque general de la solución;
- relación con la alternativa seleccionada previamente.

#### 7.2.2 Componentes del sistema e interacción

##### 7.2.2.1 Descripción de componentes

Deben identificarse y explicarse:

- los componentes principales del sistema, por ejemplo frontend, backend, base de datos y servicios externos;
- la responsabilidad de cada componente;
- la relación de cada componente con los requerimientos del sistema.

Esta parte debe terminar con el **diagrama de arquitectura del sistema**.

##### 7.2.2.2 Interacción entre módulos

Debe explicarse:

- cómo se comunican los componentes;
- los flujos de datos;
- las dependencias;
- el nivel de acoplamiento.

Esta parte debe terminar con el **diagrama de interacción entre módulos**.

##### 7.2.2.3 Comportamiento

Debe explicarse cómo se comportan los componentes, describiendo las principales secuencias de la arquitectura y respondiendo preguntas como:

- ¿el flujo es eficiente?
- ¿existen pasos innecesarios?
- ¿hay problemas de latencia?
- ¿existen cuellos de botella?
- ¿la interacción refleja un buen desacoplamiento?

En esta parte se utilizan **diagramas de secuencia**.

## 8. Implementación

Documenta lo construido hasta el momento, mostrando el avance funcional y técnico del proyecto.

### 8.1 Stack tecnológico

Lista y justifica las tecnologías, frameworks, librerías y herramientas utilizadas.

### 8.2 Componentes

Documenta los componentes o módulos efectivamente implementados, indicando su estado de desarrollo, las funcionalidades que cubren, las decisiones técnicas relevantes tomadas durante su construcción y, cuando aplique, las diferencias entre el diseño propuesto y la implementación realizada.

### 8.3 Integraciones

Explica las conexiones con servicios externos, como APIs, bases de datos, autenticación o terceros, e indica su estado de funcionamiento.

## 9. Despliegue y operación

Describe cómo se ejecuta, configura y opera la solución en su entorno previsto, incluyendo aspectos de instalación, infraestructura, dependencias, puesta en marcha y condiciones de operación, según aplique al proyecto.

## 10. Validación

Presenta el informe de pruebas realizadas para verificar que el sistema funciona correctamente y cumple los requerimientos establecidos.

### 10.1 Pruebas por componentes

Documenta las pruebas unitarias o por módulo ejecutadas, los criterios de éxito, los casos evaluados y los resultados obtenidos.

### 10.2 Pruebas de integración

Describe las pruebas realizadas sobre la interacción entre componentes y servicios, incluyendo flujos completos, manejo de errores y resultados observados.

### 10.3 Pruebas de usabilidad

Expone las pruebas de usabilidad aplicadas para evaluar la experiencia del usuario, indicando metodología, criterios de aceptación, hallazgos y nivel de cumplimiento.

## 11. Resultados y discusión

Presenta los resultados obtenidos a partir del desarrollo y la validación del sistema, e interpreta su significado frente a los objetivos, requerimientos, decisiones de diseño y limitaciones del proyecto.

## 12. Referencias

Incluye todas las fuentes consultadas y citadas en el documento, en el formato de citación definido para el curso o proyecto.

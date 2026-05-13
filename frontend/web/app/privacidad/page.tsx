// app/privacidad/page.tsx
// Página pública de Política de Privacidad — requerida por Google Play
// Contenido exacto del documento oficial politica-privacidad-newlife-FINAL.md

import Link from "next/link"
import { Leaf } from "lucide-react"

export const metadata = {
  title: "Política de Privacidad — NewLife",
  description:
    "Política de privacidad y manejo de datos de la aplicación NewLife. Cumple con la Ley 1581 de 2012 de Colombia y la Google Play Health Apps Policy.",
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f3]">

      {/* Header */}
      <header className="bg-white border-b border-[#e5e5e5] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#d4854a] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1a1a1a]">NewLife</span>
          </Link>
          <span className="text-sm text-[#737373]">Política de Privacidad</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Título */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-2">
            Política de Privacidad y Manejo de Datos — NewLife
          </h1>
          <p className="text-[#737373] text-sm mb-1">
            Aplicación móvil Android y Panel Web de Administración
          </p>
          <p className="text-[#737373] text-sm mb-6">
            Versión 1.0 — 2026 · Barranquilla, Colombia
          </p>

          {/* Tabla resumen */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden mb-6">
            <div className="grid grid-cols-1 divide-y divide-[#e5e5e5]">
              {[
                ["Responsable", "Equipo NewLife — Universidad del Norte"],
                ["Plataformas", "Aplicación móvil Android · Panel web de administración · Landing page"],
                ["Categoría Google Play", "Salud y Bienestar (Mental Health / Addiction Recovery)"],
                ["Tecnología y servicios", "ROBLE / OPENLAB (autenticación y base de datos), MinIO (almacenamiento de archivos del sistema), Freesound API (audios de meditación)"],
                ["Ley aplicable", "Ley 1581 de 2012, Colombia"],
                ["Contacto", "proyecto.newlife.2026@gmail.com"],
              ].map(([label, value]) => (
                <div key={label} className="flex px-5 py-3 gap-4">
                  <span className="text-sm font-semibold text-[#1a1a1a] w-40 shrink-0">{label}</span>
                  <span className="text-sm text-[#4a4a4a]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nota introductoria */}
          <div className="bg-[#d4854a]/10 border border-[#d4854a]/20 rounded-xl px-5 py-4">
            <p className="text-sm text-[#1a1a1a]">
              <strong>Nota para el usuario:</strong> Esta política está escrita en lenguaje claro para
              que cualquier persona pueda entenderla. Al final del documento encontrará un{" "}
              <a href="#glosario" className="text-[#d4854a] hover:underline">Glosario</a>{" "}
              con los términos técnicos utilizados.
            </p>
          </div>
        </div>

        {/* Tabla de contenidos */}
        <nav className="bg-white rounded-xl border border-[#e5e5e5] p-6 mb-10">
          <h2 className="font-semibold text-[#1a1a1a] mb-4 text-sm uppercase tracking-wide">
            Tabla de contenidos
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
            {[
              ["responsable", "Identificación del Responsable"],
              ["declaracion-salud", "Declaración de Aplicación de Salud"],
              ["ambito", "Ámbito de Aplicación"],
              ["infraestructura", "Infraestructura Tecnológica y Acceso a Datos"],
              ["datos", "Datos Personales que Recopilamos"],
              ["datos-sensibles", "Datos Sensibles de Salud"],
              ["analytics", "Sistema de Analytics Anónimo"],
              ["finalidad", "Finalidad del Tratamiento"],
              ["restricciones", "Restricciones Explícitas de Uso de Datos"],
              ["base-legal", "Base Legal del Tratamiento"],
              ["roles", "Roles de Administración y Acceso"],
              ["seguridad", "Almacenamiento y Seguridad de los Datos"],
              ["terceros", "Compartición de Datos con Terceros"],
              ["derechos", "Derechos del Usuario y Eliminación de Cuenta"],
              ["menores", "Menores de Edad y Verificación"],
              ["retencion", "Retención de Datos"],
              ["seguimiento", "Tecnologías de Seguimiento"],
              ["consentimiento", "Consentimiento y Cambios a esta Política"],
              ["glosario", "Glosario"],
            ].map(([id, title], i) => (
              <li key={id} className="list-none">
                <a href={`#${id}`} className="text-sm text-[#d4854a] hover:text-[#c07842] transition-colors">
                  {i + 1}. {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Secciones ── */}
        <div className="space-y-8">

          {/* 1 */}
          <section id="responsable" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">1. Identificación del Responsable del Tratamiento</h2>
            <div className="prose-newlife">
              <p>En cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013, se informa que el responsable del tratamiento de datos personales es:</p>
              <ul>
                <li><strong>Nombre del proyecto:</strong> NewLife</li>
                <li><strong>Entidad legal responsable:</strong> Universidad del Norte</li>
                <li><strong>Ciudad:</strong> Barranquilla, Atlántico, Colombia</li>
                <li><strong>Correo de contacto:</strong> proyecto.newlife.2026@gmail.com</li>
              </ul>
              <p>NewLife es una aplicación móvil de acompañamiento dirigida a jóvenes entre 18 y 24 años en proceso de rehabilitación y post-rehabilitación por consumo problemático de sustancias psicoactivas, desarrollada como proyecto de grado en la Universidad del Norte.</p>
            </div>
          </section>

          {/* 2 */}
          <section id="declaracion-salud" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">2. Declaración de Aplicación de Salud (Health App Declaration)</h2>
            <div className="prose-newlife">
              <div className="bg-[#f8f6f3] rounded-lg p-4 mb-4 text-sm text-[#1a1a1a]">
                <strong>NewLife es una aplicación de salud mental y de apoyo en recuperación de adicciones.</strong> Maneja datos sensibles relacionados con consumo de sustancias psicoactivas, estados emocionales y proceso de rehabilitación. Por lo anterior, cumple con la Política de Aplicaciones de Salud de Google Play y aplica los siguientes principios:
              </div>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">2.1 Conexión con la funcionalidad principal</h3>
              <p>Los datos de salud que recolectamos están directa e inseparablemente conectados con la funcionalidad de la app: acompañamiento en el proceso de recuperación. No recolectamos datos de salud para funciones secundarias o no declaradas.</p>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">2.2 Restricciones explícitas de uso (alineadas con Google Play Policy 2026)</h3>
              <p>NewLife <strong>NUNCA</strong> utilizará los datos de salud sensibles para:</p>
              <ul>
                <li>Determinar elegibilidad para empleo</li>
                <li>Determinar elegibilidad para seguros médicos o de vida</li>
                <li>Compartir información en redes sociales sin autorización explícita del usuario</li>
                <li>Discriminación de ningún tipo</li>
                <li>Entrenamiento de modelos de inteligencia artificial sin consentimiento explícito separado</li>
                <li>Cualquier finalidad comercial</li>
              </ul>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">2.3 Disclaimer médico</h3>
              <p>NewLife <strong>NO es un tratamiento médico</strong> ni un sustituto de atención profesional de salud mental o adicciones. Es una herramienta de acompañamiento complementaria. Recomendamos siempre buscar atención profesional especializada para procesos de rehabilitación.</p>
            </div>
          </section>

          {/* 3 */}
          <section id="ambito" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">3. Ámbito de Aplicación</h2>
            <div className="prose-newlife">
              <p>La presente Política de Privacidad aplica a:</p>
              <ul>
                <li>La aplicación móvil <strong>NewLife</strong>, disponible para dispositivos Android.</li>
                <li>El <strong>panel web de administración</strong>, utilizado por el equipo NewLife y administradores autorizados para gestionar contenidos y métricas de uso.</li>
                <li>La <strong>landing page</strong> informativa del proyecto, disponible en <a href="https://newlife.openlab.uninorte.edu.co" target="_blank" rel="noopener noreferrer">newlife.openlab.uninorte.edu.co</a>.</li>
              </ul>
              <p>Esta política <strong>no aplica</strong> a sitios web o servicios de terceros que puedan estar enlazados desde nuestra plataforma.</p>
            </div>
          </section>

          {/* 4 */}
          <section id="infraestructura" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">4. Infraestructura Tecnológica y Acceso a Datos</h2>
            <div className="prose-newlife">
              <p>NewLife utiliza <strong>ROBLE</strong> como plataforma tecnológica principal para la autenticación de usuarios y el almacenamiento de datos. ROBLE es una plataforma de código abierto desarrollada por <strong>OPENLAB</strong>, el laboratorio de innovación de la Universidad del Norte.</p>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">4.1 Autenticación</h3>
              <p>El sistema de autenticación es gestionado íntegramente por ROBLE mediante estándares modernos como JWT (JSON Web Tokens) y manejo de sesiones por tokens de acceso y renovación. Como consecuencia de este diseño:</p>
              <ul>
                <li>El equipo de NewLife <strong>no tiene acceso a las contraseñas</strong> de los usuarios en ningún momento.</li>
                <li>Las contraseñas son gestionadas, cifradas y almacenadas exclusivamente por ROBLE.</li>
                <li>NewLife únicamente tiene acceso al <strong>correo electrónico</strong> e identificador interno generado por ROBLE, como referencia de cada cuenta.</li>
              </ul>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">4.2 Base de Datos</h3>
              <p>Los datos de perfil y actividad de los usuarios se almacenan en el servicio de base de datos administrado por ROBLE, bajo la infraestructura de OPENLAB. Los datos están cifrados tanto en tránsito (HTTPS/TLS) como en reposo dentro de la infraestructura de ROBLE.</p>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">4.3 Almacenamiento de archivos (MinIO)</h3>
              <p>NewLife utiliza <strong>MinIO</strong> como sistema de almacenamiento de archivos del sistema. <strong>MinIO NO almacena datos personales de los usuarios.</strong> Únicamente almacena:</p>
              <ul>
                <li>Fotos de perfil de los autores de los contenidos educativos (no son fotos de usuarios)</li>
                <li>Banners y miniaturas de los contenidos educativos (artículos y enlaces a videos de YouTube)</li>
                <li>Logos de los grupos de apoyo que se muestran en la aplicación</li>
              </ul>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">4.4 Audios de meditación (Freesound API)</h3>
              <p>NewLife utiliza la <strong>API pública de Freesound</strong> (<a href="https://freesound.org" target="_blank" rel="noopener noreferrer">freesound.org</a>) para acceder a audios de meditación dentro de la aplicación. Esta integración:</p>
              <ul>
                <li><strong>Solo descarga audios públicos</strong> de Freesound; no envía datos del usuario a su API</li>
                <li>No comparte información personal ni de uso con Freesound</li>
                <li>Los audios se reproducen localmente en la app</li>
              </ul>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">4.5 Métricas del Panel Web</h3>
              <p>El panel web incluye un módulo de métricas de uso de la aplicación. En este módulo los usuarios se presentan de forma <strong>completamente anonimizada</strong>: los administradores acceden a estadísticas agregadas, pero nunca pueden identificar a un usuario individual a partir de dicha información.</p>
            </div>
          </section>

          {/* 5 */}
          <section id="datos" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">5. Datos Personales que Recopilamos</h2>
            <div className="prose-newlife">
              <div className="bg-[#f8f6f3] rounded-lg p-4 mb-4 text-sm text-[#1a1a1a]">
                Esta sección está alineada con el formulario <strong>Data Safety</strong> de Google Play. La tabla a continuación es la divulgación completa de qué datos recolectamos, para qué, si son obligatorios y si son compartidos.
              </div>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-3 text-sm">5.1 Tabla resumen Data Safety</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8f6f3]">
                      <th className="border border-[#e5e5e5] px-3 py-2 text-left font-semibold text-[#1a1a1a]">Tipo de dato</th>
                      <th className="border border-[#e5e5e5] px-3 py-2 text-left font-semibold text-[#1a1a1a]">Categoría Google</th>
                      <th className="border border-[#e5e5e5] px-3 py-2 text-left font-semibold text-[#1a1a1a]">Propósito</th>
                      <th className="border border-[#e5e5e5] px-3 py-2 text-left font-semibold text-[#1a1a1a]">Obligatorio</th>
                      <th className="border border-[#e5e5e5] px-3 py-2 text-left font-semibold text-[#1a1a1a]">Compartido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Correo electrónico", "Personal info", "Identificación de cuenta, autenticación", "Sí (registro)", "No (solo ROBLE)"],
                      ["Contraseña", "Auth info", "Autenticación", "Sí (registro)", "No (solo ROBLE)"],
                      ["Nombre completo", "Personal info", "Identificación inicial", "Sí (registro)", "No"],
                      ["Apodo", "Personal info", "Visualización en la app", "Sí (perfil)", "No"],
                      ["Pronombre preferido", "Personal info", "Personalización", "Sí (perfil)", "No"],
                      ["Fecha del último consumo", "Health info (sensitive)", "Cálculo de tiempo en sobriedad", "Sí (perfil)", "No"],
                      ["Número de teléfono de contacto de emergencia", "Personal info", "Acceso rápido a persona de confianza en momentos de crisis", "Sí (perfil)", "No"],
                      ["Motivo de sobriedad", "Health info (sensitive)", "Refuerzo motivacional", "Sí (perfil)", "No"],
                      ["Gasto semanal estimado", "Financial info", "Cálculo de ahorro acumulado", "Sí (perfil)", "No"],
                      ["Estado emocional diario (categoría seleccionada de un conjunto predefinido)", "Health info (sensitive)", "Seguimiento personal", "Solo si el usuario hace check-in", "No"],
                      ["Registro de consumo (sí/no)", "Health info (sensitive)", "Seguimiento personal", "Solo si el usuario hace check-in", "No"],
                      ["Nota de gratitud (texto libre escrito por el usuario)", "App activity", "Diario personal de gratitud", "Solo si el usuario hace check-in", "No"],
                      ["Ubicación del episodio de consumo (categoría predefinida, sin GPS)", "App activity", "Apoyar la introspección del usuario al identificar contextos asociados al consumo", "Solo si el usuario reporta consumo en el check-in", "No"],
                      ["Contexto social del episodio de consumo (categoría predefinida)", "App activity", "Apoyar la introspección del usuario al identificar contextos asociados al consumo", "Solo si el usuario reporta consumo en el check-in", "No"],
                      ["Reflexión personal del episodio de consumo (texto libre)", "Health info (sensitive)", "Permitir al usuario hacer una introspección abierta sobre su recaída", "Solo si el usuario reporta consumo en el check-in", "No"],
                      ["Eventos de agenda personal", "App activity", "Funcionalidad de agenda", "No (opcional)", "No"],
                      ["Contactos de apoyo adicionales (registrados manualmente)", "Contacts", "Acceso rápido en crisis", "No (opcional)", "No"],
                      ["Métricas anónimas de uso (solo usuarios logueados, no invitados)", "App interactions", "Mejora del producto", "Sí (al usar la app)", "No (anonimizado con SHA-256)"],
                    ].map(([dato, cat, prop, oblig, comp]) => (
                      <tr key={dato} className="border-t border-[#e5e5e5] hover:bg-[#f8f6f3]">
                        <td className="border border-[#e5e5e5] px-3 py-2 text-[#1a1a1a]">{dato}</td>
                        <td className="border border-[#e5e5e5] px-3 py-2 text-[#4a4a4a]">{cat}</td>
                        <td className="border border-[#e5e5e5] px-3 py-2 text-[#4a4a4a]">{prop}</td>
                        <td className="border border-[#e5e5e5] px-3 py-2 text-[#4a4a4a]">{oblig}</td>
                        <td className="border border-[#e5e5e5] px-3 py-2 text-[#4a4a4a]">{comp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">5.2 Modo Invitado (sin registro)</h3>
              <p>Los usuarios que accedan como invitados <strong>no proporcionan datos personales identificables</strong> al equipo NewLife. Toda la información generada en este modo se almacena únicamente en el dispositivo del usuario y no se transmite a ningún servidor externo.</p>
              <div className="bg-[#f8f6f3] rounded-lg p-4 mt-2 text-sm text-[#1a1a1a]">
                Si el usuario decide crear una cuenta posteriormente, puede <strong>migrar voluntariamente</strong> la información del modo invitado a su perfil registrado. Esta migración requiere consentimiento explícito y no es obligatoria.
              </div>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">5.3 Registro de Cuenta</h3>
              <p>El proceso de registro recopila los siguientes datos:</p>
              <p className="font-semibold text-[#1a1a1a] mt-2">Credenciales gestionadas por ROBLE (sistema de autenticación):</p>
              <ul>
                <li><strong>Correo electrónico:</strong> usado como identificador principal de la cuenta.</li>
                <li><strong>Contraseña:</strong> gestionada y cifrada íntegramente por ROBLE. El equipo NewLife no tiene acceso a las contraseñas en ningún momento.</li>
                <li><strong>Identificador interno</strong> generado automáticamente por ROBLE al crear la cuenta. NewLife usa este identificador para asociar la información del usuario sin necesidad de exponer datos personales.</li>
              </ul>
              <p className="font-semibold text-[#1a1a1a] mt-2">Datos adicionales recopilados por NewLife en la misma pantalla de registro:</p>
              <ul>
                <li><strong>Nombre completo:</strong> solicitado por NewLife para identificación inicial de la cuenta. Se almacena en el perfil del usuario dentro de la base de datos de NewLife, separada del sistema de autenticación de ROBLE.</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">5.4 Configuración Inicial del Perfil</h3>
              <p>Tras el registro, el usuario completa su perfil con la siguiente información:</p>
              <ul>
                <li><strong>Apodo:</strong> nombre que el usuario elige mostrar dentro de la aplicación</li>
                <li><strong>Pronombre preferido</strong></li>
                <li><strong>Fecha y hora del último consumo</strong> de sustancias psicoactivas</li>
                <li><strong>Motivo de sobriedad:</strong> texto personal con la razón del usuario para mantenerse en recuperación</li>
                <li><strong>Gasto semanal estimado:</strong> monto aproximado destinado al consumo de sustancias</li>
                <li><strong>Número de teléfono de contacto de emergencia:</strong> persona de confianza a la que el usuario puede acudir en momentos de crisis</li>
                <li><strong>Momento motivacional:</strong> hora preferida para recibir notificaciones push de recordatorios (solo si el usuario acepta recibir notificaciones)</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">5.5 Actualizaciones de Perfil</h3>
              <p>El usuario puede actualizar en cualquier momento su apodo, pronombre, contraseña, motivo de sobriedad y gasto semanal estimado desde la sección de perfil de la aplicación.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">5.6 Registro Diario (Check-in)</h3>
              <p>La aplicación permite registros diarios <strong>voluntarios</strong> que incluyen:</p>
              <ul>
                <li><strong>Emoción del día:</strong> estado emocional reportado por el usuario.</li>
                <li><strong>Registro de consumo:</strong> el usuario indica si hubo o no consumo de sustancias ese día.</li>
                <li><strong>Nota de gratitud:</strong> texto libre donde el usuario expresa algo por lo que se siente agradecido ese día.</li>
              </ul>
              <p className="font-semibold text-[#1a1a1a] mt-2">Si el usuario SÍ reporta consumo:</p>
              <ul>
                <li><strong>Ubicación del episodio:</strong> el usuario selecciona el tipo de lugar donde ocurrió desde un conjunto de opciones predefinidas. NewLife <strong>no accede al GPS ni a la geolocalización</strong> del dispositivo.</li>
                <li><strong>Contexto social:</strong> el usuario selecciona desde un conjunto de opciones predefinidas con quién se encontraba.</li>
                <li><strong>Reflexión personal:</strong> texto libre donde el usuario puede analizar la experiencia, sus emociones y el contexto de la recaída.</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">5.7 Agenda Personal</h3>
              <p>El usuario puede crear eventos en su agenda personal con: título, fecha, hora de inicio y fin, categoría (reunión, grupo de apoyo, fundación, lectura u otro), configuración de repetición y recordatorio.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">5.8 Contactos de Apoyo</h3>
              <p>El usuario puede agregar contactos de confianza con: nombre y número de teléfono. Estos contactos <strong>NO se sincronizan automáticamente</strong> desde la lista de contactos del dispositivo; el usuario los ingresa manualmente.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">5.9 Interacción con Contenidos y Retos</h3>
              <ul>
                <li>Frases motivacionales del día marcadas como favoritas por el usuario</li>
                <li>Retos de recuperación a los que el usuario se une</li>
                <li>Contenido educativo marcado como favorito</li>
              </ul>
            </div>
          </section>

          {/* 6 */}
          <section id="datos-sensibles" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">6. Datos Sensibles de Salud</h2>
            <div className="prose-newlife">
              <div className="bg-[#f8f6f3] rounded-lg p-4 mb-4 text-sm text-[#1a1a1a]">
                <strong>NewLife maneja información directamente relacionada con la salud y el proceso de recuperación de sus usuarios.</strong> Estos datos reciben el nivel más alto de protección conforme al Artículo 6 de la Ley 1581 de 2012 y la Política de Aplicaciones de Salud de Google Play.
              </div>
              <p>Los siguientes datos son considerados <strong>datos sensibles de salud</strong>:</p>
              <ul>
                <li>Fecha y hora del último consumo de sustancias psicoactivas</li>
                <li>Registro diario de emociones</li>
                <li>Registro de consumo (si hubo o no consumo en un día determinado)</li>
                <li>Ubicación, contexto social y reflexiones asociadas a episodios de consumo</li>
                <li>Motivo personal de sobriedad</li>
                <li>Gasto semanal estimado en sustancias</li>
                <li>Notas de gratitud y contenido del diario personal</li>
              </ul>
              <p>Para estos datos se adoptan las siguientes medidas especiales:</p>
              <ul>
                <li>Su recolección requiere <strong>autorización explícita, libre, previa e informada</strong> del usuario, solicitada antes de registrarse en la aplicación.</li>
                <li><strong>No serán compartidos con terceros</strong> bajo ningún concepto, salvo obligación legal expresa de autoridad competente.</li>
                <li>Solo el <strong>propio usuario</strong> puede acceder a su historial de emociones, registro de consumo y reflexiones personales.</li>
                <li>Los administradores <strong>no tienen acceso</strong> a los datos de salud individuales de ningún usuario.</li>
                <li>El registro de todos estos datos es <strong>completamente voluntario</strong>. El usuario puede utilizar las funciones principales de la aplicación sin completar el registro diario.</li>
                <li><strong>No se utilizarán</strong> para decisiones de empleo, elegibilidad de seguros, ni discriminación de ningún tipo.</li>
                <li><strong>No se utilizarán</strong> para entrenar modelos de inteligencia artificial o aprendizaje automático sin consentimiento explícito y separado del usuario.</li>
              </ul>
            </div>
          </section>

          {/* 7 */}
          <section id="analytics" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">7. Sistema de Analytics Anónimo</h2>
            <div className="prose-newlife">
              <p>NewLife utiliza un sistema interno de analytics para mejorar la aplicación. Es importante que el usuario entienda exactamente cómo funciona:</p>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">7.1 Qué se recolecta</h3>
              <p>Únicamente se recolectan <strong>eventos de uso</strong> (acciones de navegación e interacción con funcionalidades), no contenido personal. Ejemplos de eventos:</p>
              <ul>
                <li>"Se abrió la aplicación"</li>
                <li>"Se inició un ejercicio de respiración"</li>
                <li>"Se completó el check-in diario"</li>
                <li>"Se navegó a la pestaña de Cuidado"</li>
              </ul>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">7.2 Qué NO se recolecta</h3>
              <ul>
                <li>Contenido escrito por el usuario (notas, reflexiones, mensajes)</li>
                <li>Datos de salud específicos (emociones registradas, días con consumo, etc.)</li>
                <li>Información personal identificable (PII)</li>
              </ul>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">7.3 Cómo se anonimiza</h3>
              <p>El identificador del usuario se transforma mediante <strong>hash criptográfico SHA-256 con sal secreta</strong> antes de almacenarse. Este proceso es irreversible: nadie, ni siquiera el equipo NewLife, puede convertir el hash de vuelta al identificador original sin la sal, que se almacena por separado y nunca se expone.</p>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">7.4 Para qué se usa</h3>
              <ul>
                <li>Calcular usuarios activos diarios (DAU) y mensuales (MAU)</li>
                <li>Identificar funcionalidades más usadas para priorizar mejoras</li>
                <li>Detectar puntos de abandono en flujos críticos (ej. checkin diario)</li>
                <li>Medir la efectividad de herramientas de crisis (ej. ejercicios de respiración)</li>
              </ul>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">7.5 Quién puede ver estos datos</h3>
              <p>Solo los administradores del panel web pueden ver las métricas agregadas. <strong>Nunca pueden ver eventos individuales atribuibles a un usuario específico.</strong></p>
            </div>
          </section>

          {/* 8 */}
          <section id="finalidad" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">8. Finalidad del Tratamiento de Datos</h2>
            <div className="prose-newlife">
              <p>Los datos recopilados son utilizados <strong>exclusivamente</strong> para las siguientes finalidades:</p>
              <ul>
                <li>Proveer el servicio de acompañamiento personalizado dentro de la aplicación</li>
                <li>Permitir al usuario hacer seguimiento de su proceso de recuperación</li>
                <li>Sincronizar el progreso del usuario entre sesiones</li>
                <li>Enviar <strong>notificaciones push de recordatorios</strong> en el horario elegido por el usuario (solo si el usuario aceptó recibir notificaciones)</li>
                <li>Generar métricas de uso <strong>completamente anonimizadas</strong> para la mejora de la aplicación</li>
              </ul>
              <div className="bg-[#f8f6f3] rounded-lg p-4 mt-4 text-sm text-[#1a1a1a]">
                <strong>Importante:</strong> NewLife <strong>NO envía mensajes SMS</strong> a los usuarios. Las únicas notificaciones que la aplicación genera son <strong>notificaciones push</strong> dentro del propio dispositivo, en el horario que el usuario haya configurado y siempre que haya aceptado recibirlas.
              </div>
            </div>
          </section>

          {/* 9 */}
          <section id="restricciones" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">9. Restricciones Explícitas de Uso de Datos</h2>
            <div className="prose-newlife">
              <p>Los datos <strong>NO serán utilizados</strong> para:</p>
              <ul>
                <li>Publicidad de ningún tipo</li>
                <li>Venta a terceros</li>
                <li>Perfilamiento comercial</li>
                <li>Investigación académica sin consentimiento adicional expreso</li>
                <li>Decisiones sobre empleo de los usuarios</li>
                <li>Decisiones sobre elegibilidad para seguros médicos, de vida u otros</li>
                <li>Discriminación de ningún tipo</li>
                <li>Entrenamiento de modelos de inteligencia artificial sin consentimiento separado</li>
                <li>Compartir en redes sociales sin autorización</li>
                <li>Envío de mensajes SMS</li>
                <li>Cualquier finalidad distinta a las explícitamente listadas en la sección 8</li>
              </ul>
            </div>
          </section>

          {/* 10 */}
          <section id="base-legal" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">10. Base Legal del Tratamiento</h2>
            <div className="prose-newlife">
              <p>El tratamiento de datos personales en NewLife se realiza bajo las siguientes bases legales:</p>
              <ul>
                <li><strong>Consentimiento libre, previo, explícito e informado</strong> del usuario (Art. 9, Ley 1581/2012), solicitado en el momento del registro.</li>
                <li><strong>Ejecución del servicio</strong> solicitado por el propio usuario.</li>
                <li><strong>Cumplimiento de obligaciones legales</strong> aplicables en Colombia.</li>
              </ul>
              <p>El usuario puede <strong>revocar su consentimiento</strong> en cualquier momento, lo que conlleva la eliminación de su cuenta y datos asociados, conforme a lo descrito en la Sección 14.</p>
            </div>
          </section>

          {/* 11 */}
          <section id="roles" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">11. Roles de Administración y Acceso</h2>
            <div className="prose-newlife">
              <p>El panel web de administración maneja los siguientes roles con acceso estrictamente delimitado:</p>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">11.1 Super Administrador</h3>
              <p>Es el único rol con capacidad de <strong>crear nuevos administradores</strong>. Los super administradores son designados por el equipo NewLife y no pueden ser creados por usuarios regulares. Sus datos registrados son: nombre, correo electrónico y contraseña (gestionada por ROBLE).</p>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">11.2 Administrador</h3>
              <p>Creados exclusivamente por super administradores. Gestionan contenidos educativos, retos, frases motivacionales y grupos de apoyo. Pueden ver métricas de uso anonimizadas. <strong>No tienen acceso a datos personales o de salud</strong> de los usuarios.</p>
            </div>
          </section>

          {/* 12 */}
          <section id="seguridad" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">12. Almacenamiento y Seguridad de los Datos</h2>
            <div className="prose-newlife">
              <p>NewLife utiliza ROBLE (plataforma de OPENLAB, Universidad del Norte) como infraestructura de autenticación y base de datos. Las medidas de seguridad incluyen:</p>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">12.1 Datos en tránsito</h3>
              <ul>
                <li>Comunicaciones cifradas mediante <strong>HTTPS/TLS 1.2+</strong> entre la aplicación y los servidores de ROBLE.</li>
                <li>Certificados SSL válidos.</li>
              </ul>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">12.2 Datos en reposo</h3>
              <ul>
                <li>Los datos almacenados en ROBLE están cifrados en reposo según los estándares de la infraestructura.</li>
                <li>Las contraseñas <strong>nunca se almacenan en texto plano</strong>; son hasheadas con algoritmos modernos (bcrypt o equivalente) gestionados íntegramente por ROBLE.</li>
              </ul>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">12.3 Autenticación</h3>
              <ul>
                <li>Autenticación gestionada con <strong>JWT</strong>, con tokens de acceso de corta duración y tokens de renovación.</li>
                <li>Renovación automática de tokens sin que el usuario deba reingresar credenciales.</li>
              </ul>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">12.4 Modo Invitado</h3>
              <p>Los datos del <strong>modo invitado</strong> se almacenan exclusivamente en el dispositivo del usuario (AsyncStorage cifrado a nivel del sistema operativo Android) y no son accesibles por NewLife ni por terceros.</p>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">12.5 Anonimización del sistema de analytics</h3>
              <ul>
                <li>Identificadores hasheados con <strong>SHA-256 + sal secreta</strong> (irreversible).</li>
                <li>Sal almacenada por separado de los datos.</li>
              </ul>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">12.6 Notificación de vulneraciones</h3>
              <p>En caso de una vulneración de seguridad que afecte datos personales, notificaremos a los usuarios afectados y a la Superintendencia de Industria y Comercio (SIC) en los plazos establecidos por la normativa vigente (Decreto 1377 de 2013).</p>
            </div>
          </section>

          {/* 13 */}
          <section id="terceros" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">13. Compartición de Datos con Terceros</h2>
            <div className="prose-newlife">
              <p>NewLife <strong>no vende, arrienda ni comparte</strong> datos personales con terceros con fines comerciales. Los datos podrían ser compartidos únicamente en los siguientes casos estrictamente limitados:</p>
              <ul>
                <li><strong>ROBLE / OPENLAB</strong>, como proveedor de la infraestructura tecnológica, bajo los términos de su propia política de privacidad.</li>
                <li><strong>MinIO</strong>, exclusivamente para el almacenamiento de archivos del sistema (no contiene datos personales del usuario).</li>
                <li><strong>Freesound API</strong>, exclusivamente para descargar audios públicos de meditación. <strong>No se envían datos del usuario a Freesound.</strong></li>
                <li><strong>Autoridades competentes colombianas</strong>, cuando exista una obligación legal explícita y formal.</li>
                <li>Con el <strong>consentimiento explícito y expreso</strong> del usuario para un propósito específico.</li>
              </ul>
              <p>En ningún caso los datos de salud o de progreso personal se compartirán con terceros, incluyendo la institución universitaria, fundaciones aliadas u otros usuarios de la plataforma. Lo único a lo que tienen acceso los usuarios administradores (previamente autorizados por el equipo NewLife) son las métricas que ya están hasheadas y anonimizadas.</p>
              <div className="bg-[#f8f6f3] rounded-lg p-4 mt-4 text-sm text-[#1a1a1a]">
                <strong>NewLife no integra SDKs de analítica de terceros</strong> (Google Analytics, Facebook SDK, Firebase Analytics, etc.) ni redes publicitarias.
              </div>
            </div>
          </section>

          {/* 14 */}
          <section id="derechos" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">14. Derechos del Titular de los Datos y Eliminación de Cuenta</h2>
            <div className="prose-newlife">
              <h3 className="font-semibold text-[#1a1a1a] mt-2 mb-2 text-sm">14.1 Derechos ARCO</h3>
              <p>Conforme a los Artículos 8 y 21 de la Ley 1581 de 2012, los usuarios tienen derecho a:</p>
              <ul>
                <li><strong>Acceso:</strong> conocer qué datos suyos están almacenados y cómo son utilizados.</li>
                <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos directamente desde la sección de perfil de la aplicación (apodo, pronombre, motivo de sobriedad, gasto semanal) o solicitándolo por correo.</li>
                <li><strong>Cancelación / Supresión:</strong> solicitar la eliminación de su cuenta y todos los datos asociados.</li>
                <li><strong>Oposición:</strong> oponerse al uso de sus datos para finalidades específicas (por ejemplo, recordatorios push).</li>
                <li><strong>Portabilidad:</strong> solicitar una copia de sus datos en formato legible.</li>
                <li><strong>Revocación del consentimiento:</strong> retirar el consentimiento en cualquier momento sin consecuencias negativas para el usuario.</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">14.2 Cómo eliminar tu cuenta y datos</h3>
              <div className="bg-[#f8f6f3] rounded-lg p-4 mb-4 text-sm text-[#1a1a1a]">
                Conforme a la Política de Eliminación de Cuenta de Google Play, ofrecemos múltiples mecanismos para que el usuario pueda eliminar su cuenta y datos asociados:
              </div>
              <p className="font-semibold text-[#1a1a1a]">Opción 1 — Dentro de la app móvil (recomendado)</p>
              <ol className="list-decimal pl-5 mt-2 mb-4 space-y-1 text-sm text-[#4a4a4a]">
                <li>Abre la aplicación NewLife</li>
                <li>Ve a <strong>Inicio → Configuración → Eliminar mi cuenta</strong></li>
                <li>Confirma la acción con tu contraseña</li>
                <li>La eliminación es inmediata y los datos se purgan en un plazo máximo de 30 días</li>
              </ol>
              <p className="font-semibold text-[#1a1a1a]">Opción 2 — A través de la landing page del proyecto</p>
              <p className="mt-2 mb-2">Si ya desinstalaste la aplicación, puedes solicitar la eliminación de tu cuenta a través del formulario de solicitud disponible en la landing page del proyecto:</p>
              <Link href="/eliminar-cuenta" className="inline-block px-4 py-2 bg-[#d4854a]/10 border border-[#d4854a]/30 rounded-lg text-[#d4854a] text-sm font-medium hover:bg-[#d4854a]/20 transition-colors mb-3">
                newlife.openlab.uninorte.edu.co/eliminar-cuenta →
              </Link>
              <p>El formulario te pedirá el correo electrónico con el que te registraste y procesará tu solicitud en un plazo máximo de <strong>15 días hábiles</strong>.</p>
              <p className="font-semibold text-[#1a1a1a] mt-4">Opción 3 — Por correo electrónico</p>
              <p>Envía un correo a <a href="mailto:proyecto.newlife.2026@gmail.com">proyecto.newlife.2026@gmail.com</a> solicitando la eliminación de tu cuenta. Te responderemos en un plazo máximo de <strong>15 días hábiles</strong>.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">14.3 Qué se elimina</h3>
              <p>Al solicitar la eliminación de tu cuenta, se eliminan:</p>
              <ul>
                <li>Tu perfil completo (apodo, pronombre, motivo de sobriedad, etc.)</li>
                <li>Todos los datos de salud asociados (registros diarios, emociones, episodios de consumo)</li>
                <li>Tu agenda personal y contactos de apoyo</li>
                <li>Frases motivacionales favoritas y contenidos educativos favoritos</li>
                <li>Tu progreso en retos y niveles del programa de los 12 pasos</li>
                <li>Tu historial de uso de la aplicación</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">14.4 Qué podría retenerse (y por qué)</h3>
              <p>En casos excepcionales podrían retenerse:</p>
              <ul>
                <li><strong>Credenciales mínimas en ROBLE</strong> (correo, identificador interno y contraseña hasheada): permanecen dentro del sistema de autenticación de ROBLE conforme a las políticas de esa plataforma.</li>
                <li><strong>Registros operacionales mínimos</strong> (logs de seguridad) por el tiempo que exija la normativa colombiana, anonimizados.</li>
                <li><strong>Métricas anónimas agregadas</strong> ya generadas (no atribuibles a tu cuenta) podrán conservarse indefinidamente, al no ser información personal.</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">14.5 Plazos</h3>
              <ul>
                <li><strong>Eliminación dentro de la app:</strong> inmediata, con purga total en máximo <strong>30 días calendario</strong>.</li>
                <li><strong>Solicitudes por formulario web o correo:</strong> respondidas en máximo <strong>15 días hábiles</strong> conforme a la Ley 1581/2012.</li>
              </ul>
            </div>
          </section>

          {/* 15 */}
          <section id="menores" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">15. Menores de Edad y Verificación</h2>
            <div className="prose-newlife">
              <p>NewLife está dirigida exclusivamente a personas <strong>mayores de 18 años</strong>.</p>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">15.1 Verificación de edad</h3>
              <p>Al registrarse, el usuario debe <strong>confirmar explícitamente</strong> su fecha de nacimiento mediante un selector de fecha. El sistema calcula la edad y <strong>bloquea automáticamente el registro</strong> si el usuario es menor de 18 años. Esta verificación se registra como parte del consentimiento informado. La fecha de nacimiento ingresada se utiliza únicamente para validar la edad y <strong>no se almacena en los servidores de NewLife</strong>.</p>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">15.2 Si detectamos un menor de edad</h3>
              <p>Si detectamos que un usuario registrado es menor de edad, procederemos a:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm text-[#4a4a4a]">
                <li>Suspensión inmediata de la cuenta</li>
                <li>Eliminación de todos los datos asociados en un plazo máximo de 30 días</li>
                <li>Notificación al usuario a través del correo electrónico de la cuenta</li>
              </ol>
              <h3 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">15.3 Para padres y tutores</h3>
              <p>Si usted es padre, madre o tutor y cree que su hijo menor de edad ha proporcionado datos a través de NewLife, contáctenos a <a href="mailto:proyecto.newlife.2026@gmail.com">proyecto.newlife.2026@gmail.com</a> de manera inmediata para proceder con la eliminación.</p>
            </div>
          </section>

          {/* 16 */}
          <section id="retencion" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">16. Retención de Datos</h2>
            <div className="prose-newlife">
              <p>Los datos personales se conservarán durante el tiempo en que el usuario mantenga su cuenta activa. Una vez que el usuario solicite la eliminación de su cuenta:</p>
              <ul>
                <li>Los datos personales identificables serán eliminados en un plazo máximo de <strong>30 días calendario</strong></li>
                <li>Los datos anónimos y agregados de métricas de uso podrán conservarse indefinidamente, al no ser atribuibles a ningún usuario específico</li>
                <li>Los registros de operaciones podrán conservarse por el tiempo que exija la normativa legal colombiana aplicable</li>
              </ul>
              <div className="bg-[#f8f6f3] rounded-lg p-4 mt-4 text-sm text-[#1a1a1a]">
                <strong>Sobre el fin del proyecto académico:</strong> En caso de que el proyecto NewLife concluya como iniciativa académica, el equipo se compromete a notificar a los usuarios registrados con al menos <strong>30 días de anticipación</strong> y a proceder con la eliminación completa de todos los datos personales almacenados, salvo que exista un sucesor responsable que asuma formalmente esta política.
              </div>
            </div>
          </section>

          {/* 17 */}
          <section id="seguimiento" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">17. Tecnologías de Seguimiento</h2>
            <div className="prose-newlife">
              <p>La aplicación móvil <strong>no utiliza cookies</strong>. Utiliza tokens JWT estrictamente necesarios para el funcionamiento del servicio de autenticación de ROBLE. Estos tokens:</p>
              <ul>
                <li>Son de corta duración y se renuevan automáticamente</li>
                <li>No se utilizan para rastreo publicitario ni análisis de comportamiento individual</li>
                <li>Se eliminan al cerrar sesión</li>
              </ul>
              <p><strong>No se utilizan tecnologías de rastreo de terceros</strong> (Google Analytics, Meta Pixel, Firebase Analytics, etc.) en ninguna de las plataformas de NewLife.</p>
              <p>El único sistema de seguimiento es el de <strong>analytics anónimo interno</strong> descrito en la Sección 7.</p>
            </div>
          </section>

          {/* 18 */}
          <section id="consentimiento" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">18. Consentimiento y Cambios a esta Política</h2>
            <div className="prose-newlife">
              <h3 className="font-semibold text-[#1a1a1a] mt-2 mb-2 text-sm">18.1 Cuándo se solicita consentimiento</h3>
              <p>NewLife solicita el consentimiento del usuario en los siguientes momentos del flujo de la aplicación:</p>
              <ol className="list-decimal pl-5 mt-2 mb-4 space-y-1 text-sm text-[#4a4a4a]">
                <li><strong>Durante el registro:</strong> el usuario debe aceptar explícitamente esta Política de Privacidad antes de crear su cuenta. Se solicita verificación de mayoría de edad (18+) mediante fecha de nacimiento.</li>
                <li><strong>Migración del modo invitado:</strong> al migrar datos locales a una cuenta registrada, el usuario confirma explícitamente qué información desea transferir.</li>
                <li><strong>Notificaciones push:</strong> el usuario debe aceptar específicamente el envío de notificaciones push de recordatorios; este permiso es revocable en cualquier momento desde la configuración del dispositivo o de la aplicación.</li>
              </ol>
              <p>El usuario puede consultar y revocar sus consentimientos en cualquier momento desde la configuración de la aplicación.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">18.2 Cambios a esta política</h3>
              <p>NewLife se reserva el derecho de actualizar esta política. Cuando se realicen cambios sustanciales:</p>
              <ul>
                <li>Se notificará a los usuarios registrados mediante un aviso dentro de la aplicación</li>
                <li>La fecha de la última actualización será visible en esta política y en la landing page</li>
                <li>El uso continuado de la aplicación tras la notificación constituirá aceptación de los cambios</li>
                <li>Para cambios sensibles (nuevos tipos de datos recolectados, nuevas finalidades) se solicitará re-consentimiento explícito</li>
              </ul>
              <p>Para cambios menores (correcciones de redacción, actualización de datos de contacto), la notificación podrá realizarse únicamente actualizando el documento.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">18.3 Contacto y reclamaciones</h3>
              <p>Para cualquier consulta, solicitud o reclamación relacionada con el tratamiento de datos personales:</p>
              <ul>
                <li><strong>Correo electrónico:</strong> <a href="mailto:proyecto.newlife.2026@gmail.com">proyecto.newlife.2026@gmail.com</a></li>
                <li><strong>Landing page:</strong> <a href="https://newlife.openlab.uninorte.edu.co" target="_blank" rel="noopener noreferrer">newlife.openlab.uninorte.edu.co</a></li>
                <li><strong>Institución:</strong> Universidad del Norte, Barranquilla, Colombia</li>
              </ul>
              <p>Si considera que su solicitud no ha sido atendida satisfactoriamente, tiene derecho a presentar una queja ante la <strong>Superintendencia de Industria y Comercio (SIC)</strong> de Colombia, autoridad nacional de protección de datos personales.</p>
              <ul>
                <li>Sitio web SIC: <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer">https://www.sic.gov.co</a></li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-sm">18.4 Marco normativo aplicable</h3>
              <p>Esta política se rige por la siguiente normativa colombiana y políticas internacionales:</p>
              <ul>
                <li><strong>Ley Estatutaria 1581 de 2012:</strong> Protección de Datos Personales (Colombia)</li>
                <li><strong>Decreto 1377 de 2013:</strong> Reglamentación parcial de la Ley 1581</li>
                <li><strong>Decreto 1074 de 2015:</strong> Decreto Único Reglamentario del Sector Comercio</li>
                <li><strong>Circular Externa 002 de 2015 de la SIC:</strong> Instrucciones sobre protección de datos</li>
                <li><strong>Google Play User Data Policy:</strong> Políticas de datos de usuario de Google Play</li>
                <li><strong>Google Play Health Apps Policy:</strong> Políticas para aplicaciones de salud de Google Play</li>
              </ul>
            </div>
          </section>

          {/* 19 — Glosario */}
          <section id="glosario" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">19. Glosario</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#f8f6f3]">
                    <th className="border border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#1a1a1a] w-44">Término</th>
                    <th className="border border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#1a1a1a]">Definición</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["ROBLE", "Plataforma tecnológica de OPENLAB (Universidad del Norte) que provee los servicios de autenticación y base de datos utilizados por NewLife"],
                    ["OPENLAB", "Laboratorio de innovación de código abierto de la Universidad del Norte"],
                    ["MinIO", "Sistema de almacenamiento de archivos compatible con S3 que NewLife usa para guardar archivos del sistema (no datos personales del usuario)"],
                    ["Freesound", "Plataforma pública de audios bajo licencias libres. NewLife usa su API para acceder a audios de meditación"],
                    ["JWT", "JSON Web Token. Estándar de seguridad para gestionar sesiones de usuario de forma cifrada y sin almacenar contraseñas en el servidor de la aplicación"],
                    ["Token de acceso", "Credencial temporal que identifica al usuario en cada solicitud a la aplicación. Tiene una duración corta por seguridad"],
                    ["Token de renovación", "Credencial de mayor duración que permite obtener un nuevo token de acceso sin que el usuario deba iniciar sesión de nuevo"],
                    ["Datos sensibles", "Categoría especial de datos personales que incluye información sobre salud, vida sexual, origen racial, opiniones políticas y creencias religiosas, protegida con requisitos más estrictos por la Ley 1581"],
                    ["Derechos ARCO", "Derechos de Acceso, Rectificación, Cancelación y Oposición que la ley colombiana reconoce a todo titular de datos personales"],
                    ["Anonimización", "Proceso por el cual los datos se transforman de forma que no es posible identificar a la persona a la que pertenecen, ni directa ni indirectamente"],
                    ["SHA-256", "Algoritmo criptográfico de hash que transforma datos de entrada en una cadena de 256 bits irreversible. Usado por NewLife para anonimizar identificadores en el sistema de analytics"],
                    ["Sal criptográfica (salt)", "Cadena secreta agregada antes de aplicar el hash, que hace imposible revertir el proceso aún con tablas precomputadas"],
                    ["Notificación push", "Mensaje breve que la aplicación envía al dispositivo del usuario, mostrándose como alerta del sistema operativo. Requiere autorización explícita del usuario para ser enviada"],
                    ["SIC", "Superintendencia de Industria y Comercio. Entidad del gobierno colombiano responsable de la protección de datos personales"],
                    ["Modo invitado", "Forma de acceso a NewLife sin crear una cuenta. La información se guarda solo en el dispositivo y no llega a los servidores de NewLife"],
                    ["PII", "Personally Identifiable Information. Información que permite identificar a una persona específica (nombre, correo, teléfono, etc.)"],
                    ["Data Safety Form", "Formulario de Google Play donde los desarrolladores deben declarar los datos que su app recolecta y comparte"],
                    ["Health App", "Categoría de Google Play para aplicaciones que manejan datos de salud, sujeta a políticas más estrictas"],
                  ].map(([term, def]) => (
                    <tr key={term} className="border-t border-[#e5e5e5] hover:bg-[#f8f6f3]">
                      <td className="border border-[#e5e5e5] px-4 py-2 font-medium text-[#1a1a1a]">{term}</td>
                      <td className="border border-[#e5e5e5] px-4 py-2 text-[#4a4a4a]">{def}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Pie */}
        <div className="mt-12 bg-white rounded-xl border border-[#e5e5e5] p-6 text-center">
          <p className="text-sm text-[#4a4a4a] italic mb-4">
            Al registrarse en NewLife, el usuario declara haber leído, entendido y aceptado esta Política de Privacidad y Manejo de Datos en su totalidad, y otorga su consentimiento libre, previo, explícito e informado para el tratamiento de sus datos personales conforme a lo aquí descrito.
          </p>
          <p className="text-xs text-[#a3a3a3] mb-4">
            Versión 1.0 — 2026 · NewLife, Universidad del Norte, Barranquilla, Colombia · © 2026 NewLife — Todos los derechos reservados
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/eliminar-cuenta" className="text-[#d4854a] hover:underline">
              Solicitar eliminación de cuenta
            </Link>
            <span className="text-[#e5e5e5]">·</span>
            <a href="mailto:proyecto.newlife.2026@gmail.com" className="text-[#d4854a] hover:underline">
              proyecto.newlife.2026@gmail.com
            </a>
            <span className="text-[#e5e5e5]">·</span>
            <Link href="/" className="text-[#d4854a] hover:underline">
              Volver al inicio
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}
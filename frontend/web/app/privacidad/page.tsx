// app/privacidad/page.tsx
// Pagina publica de Politica de Privacidad de NewLife.
//
// DISENO:
// - Sin header redundante (el documento ya tiene su propio titulo grande)
// - Boton flotante "Volver al inicio" arriba a la izquierda
// - Contenido sincronizado con politica-privacidad v1.1.0
// - Estructura por cards para cada seccion (mas legible)
// - Tabla de contenidos clickeable con scroll suave

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Política de Privacidad — NewLife",
  description:
    "Política de privacidad y manejo de datos de la aplicación NewLife. Cumple con la Ley 1581 de 2012 de Colombia y las políticas de Google Play.",
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f3] relative">

      {/* Boton flotante: Volver al inicio */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e5e5] rounded-full shadow-sm hover:shadow-md transition-shadow text-sm text-[#4a4a4a] hover:text-[#1a1a1a]"
        aria-label="Volver al inicio"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Volver al inicio</span>
      </Link>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-20">

        {/* Titulo principal del documento */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-2">
            Política de Privacidad y Manejo de Datos — NewLife
          </h1>
          <p className="text-[#737373] text-sm mb-1">
            Aplicación móvil Android y Panel Web de Administración
          </p>
          <p className="text-[#737373] text-sm mb-6">
            Versión 1.1.0 — Mayo 2026 · Barranquilla, Colombia
          </p>

          {/* Intro */}
          <div className="bg-[#d4854a]/10 border-l-4 border-[#d4854a] rounded-r-lg p-4 mb-6 text-sm text-[#4a4a4a]">
            <strong className="text-[#1a1a1a]">Esta política aplica a la aplicación móvil NewLife (Android) y al panel web de administración.</strong> Cumple con la Ley Estatutaria 1581 de 2012 y sus decretos reglamentarios vigentes en la República de Colombia. Adicionalmente, esta política está plenamente alineada con los requisitos vigentes de la Política de Datos del Usuario y la Política de Eliminación de Cuenta de Google Play para cuentas de desarrolladores personales.
          </div>

          {/* Tabla resumen */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden mb-6">
            <div className="grid grid-cols-1 divide-y divide-[#e5e5e5]">
              {[
                ["Responsable", "Equipo NewLife — Universidad del Norte"],
                ["Plataformas", "Aplicación móvil Android · Panel web de administración · Landing page"],
                ["Categoría Google Play", "Estilo de Vida / Bienestar y Crecimiento Personal"],
                ["Tecnología y servicios", "ROBLE / OPENLAB (autenticación y base de datos), MinIO (almacenamiento de archivos del sistema), Freesound API (audios de meditación)"],
                ["Ley aplicable", "Ley 1581 de 2012, Colombia"],
                ["Contacto", "proyecto.newlife.2026@gmail.com"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col sm:flex-row px-5 py-3 gap-1 sm:gap-4">
                  <span className="text-sm font-semibold text-[#1a1a1a] sm:w-44 shrink-0">{label}</span>
                  <span className="text-sm text-[#4a4a4a]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nota al usuario */}
          <div className="bg-[#f8f6f3] border border-[#e5e5e5] rounded-xl px-5 py-4">
            <p className="text-sm text-[#4a4a4a]">
              <strong className="text-[#1a1a1a]">Nota para el usuario:</strong> Esta política está escrita en lenguaje claro para
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
              ["naturaleza", "Naturaleza del Servicio y Deslinde de Responsabilidad Médica"],
              ["ambito", "Ámbito de Aplicación"],
              ["infraestructura", "Infraestructura Tecnológica y Acceso a Datos"],
              ["datos", "Datos de Personalización y Hábitos que Recopilamos"],
              ["proteccion", "Protección Especial de Datos de Introspección y Progreso Diario"],
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

        {/* === Secciones === */}
        <div className="space-y-8">

          {/* 1 */}
          <section id="responsable" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">1. Identificación del Responsable del Tratamiento</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-4">En cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013, se informa que el responsable del tratamiento de datos personales es:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li><strong className="text-[#1a1a1a]">Nombre del proyecto:</strong> NewLife</li>
                <li><strong className="text-[#1a1a1a]">Entidad institucional de respaldo:</strong> Universidad del Norte</li>
                <li><strong className="text-[#1a1a1a]">Ciudad:</strong> Barranquilla, Atlántico, Colombia</li>
                <li><strong className="text-[#1a1a1a]">Correo de contacto:</strong> proyecto.newlife.2026@gmail.com</li>
              </ul>
              <p>NewLife es una herramienta digital de organización personal y soporte motivacional dirigida a jóvenes entre 18 y 24 años. La aplicación está enfocada en el fortalecimiento del autocontrol, el registro diario de hábitos, la fijación de metas de bienestar y el seguimiento adaptativo del progreso del usuario, desarrollada como proyecto de grado en la Universidad del Norte.</p>
            </div>
          </section>

          {/* 2 */}
          <section id="naturaleza" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">2. Naturaleza del Servicio y Deslinde de Responsabilidad Médica</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-4">NewLife funciona exclusivamente como una bitácora de crecimiento personal, estilo de vida y apoyo motivacional autónomo.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">2.1 Exclusión de funciones de salud (Health App Disclaimer)</h3>
              <p>La aplicación <strong className="text-[#1a1a1a]">no realiza diagnósticos, no receta tratamientos, no interviene en crisis clínicas ni recopila datos biometrológicos o médicos</strong>. En cumplimiento estricto con las directrices de Google Play vigentes, se declara expresamente que NewLife <strong className="text-[#1a1a1a]">NO es una aplicación de salud (&quot;Health App&quot;)</strong> ni un servicio clínico.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">2.2 Deslinde Profesional</h3>
              <p>NewLife <strong className="text-[#1a1a1a]">NO sustituye</strong> bajo ninguna circunstancia el tratamiento médico, la terapia psicológica profesional ni la asistencia especializada en centros de rehabilitación de adicciones. Es una herramienta estrictamente complementaria para la autogestión de rutinas saludables y la motivación individual. Se insta a los usuarios a buscar ayuda profesional certificada para abordar problemáticas de dependencia de sustancias de manera médica.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">2.3 Restricciones explícitas de uso (alineadas con Google Play Policy 2026)</h3>
              <p className="mb-2">NewLife <strong className="text-[#1a1a1a]">NUNCA</strong> utilizará los datos del usuario para:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Determinar elegibilidad para empleo</li>
                <li>Determinar elegibilidad para seguros médicos o de vida</li>
                <li>Compartir información en redes sociales sin autorización explícita del usuario</li>
                <li>Discriminación de ningún tipo</li>
                <li>Entrenamiento de modelos de inteligencia artificial sin consentimiento explícito separado</li>
                <li>Cualquier finalidad comercial</li>
              </ul>
            </div>
          </section>

          {/* 3 */}
          <section id="ambito" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">3. Ámbito de Aplicación</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-3">La presente Política de Privacidad aplica a:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>La aplicación móvil <strong className="text-[#1a1a1a]">NewLife</strong>, disponible para dispositivos Android.</li>
                <li>El <strong className="text-[#1a1a1a]">panel web de administración</strong>, utilizado por el equipo NewLife y administradores autorizados para gestionar contenidos educativos y métricas generales de uso.</li>
                <li>La <strong className="text-[#1a1a1a]">landing page</strong> informativa del proyecto, disponible en <a href="https://newlife.openlab.uninorte.edu.co" target="_blank" rel="noopener noreferrer" className="text-[#d4854a] hover:underline">newlife.openlab.uninorte.edu.co</a>.</li>
              </ul>
              <p>Esta política <strong className="text-[#1a1a1a]">no aplica</strong> a sitios web o servicios de terceros que puedan estar enlazados desde nuestra plataforma.</p>
            </div>
          </section>

          {/* 4 */}
          <section id="infraestructura" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">4. Infraestructura Tecnológica y Acceso a Datos</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-4">NewLife utiliza <strong className="text-[#1a1a1a]">ROBLE</strong> como plataforma tecnológica principal para la autenticación de usuarios y el almacenamiento de datos. ROBLE es una plataforma de código abierto desarrollada por <strong className="text-[#1a1a1a]">OPENLAB</strong>, el laboratorio de innovación de la Universidad del Norte. Adicionalmente, NewLife integra otros servicios de apoyo que se describen en esta sección.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">4.1 Autenticación</h3>
              <p className="mb-2">El sistema de autenticación es gestionado íntegramente por ROBLE mediante estándares modernos como JWT (JSON Web Tokens) y manejo de sesiones por tokens de acceso y renovación. Como consecuencia de este diseño:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>El equipo de NewLife <strong className="text-[#1a1a1a]">no tiene acceso a las contraseñas</strong> de los usuarios en ningún momento.</li>
                <li>Las contraseñas son gestionadas, cifradas y almacenadas exclusivamente por ROBLE.</li>
                <li>NewLife únicamente tiene acceso al <strong className="text-[#1a1a1a]">correo electrónico</strong> e identificador interno generado por ROBLE, como referencia de cada cuenta.</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">4.2 Base de Datos</h3>
              <p>Los datos de perfil y actividad de los usuarios se almacenan en el servicio de base de datos administrado por ROBLE, bajo la infraestructura de OPENLAB. La comunicación entre la aplicación y ROBLE viaja cifrada en tránsito mediante HTTPS/TLS 1.2 o superior, lo cual es verificable mediante los certificados SSL del dominio. El cifrado en reposo de los datos almacenados es responsabilidad de OPENLAB como proveedor de la infraestructura, conforme a las políticas internas de seguridad de la Universidad del Norte.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">4.3 Almacenamiento de archivos (MinIO)</h3>
              <p className="mb-2">NewLife utiliza <strong className="text-[#1a1a1a]">MinIO</strong> como sistema de almacenamiento de archivos del sistema. <strong className="text-[#1a1a1a]">MinIO NO almacena datos personales de los usuarios.</strong> Únicamente almacena:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Fotos de perfil de los autores de los contenidos educativos (no son fotos de usuarios)</li>
                <li>Banners y miniaturas de los contenidos educativos (artículos y enlaces a videos de YouTube)</li>
                <li>Logos de los grupos de apoyo que se muestran en la aplicación</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">4.4 Audios de meditación (Freesound API)</h3>
              <p className="mb-2">NewLife utiliza la <strong className="text-[#1a1a1a]">API pública de Freesound</strong> (<a href="https://freesound.org" target="_blank" rel="noopener noreferrer" className="text-[#d4854a] hover:underline">freesound.org</a>) para acceder a audios de meditación dentro de la aplicación. Esta integración:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Es de <strong className="text-[#1a1a1a]">solo lectura</strong>: no enviamos datos del usuario a Freesound</li>
                <li>Los audios son descargados o reproducidos sin asociación al usuario</li>
                <li>No se comparten cookies, metadatos privados ni información de perfil con Freesound</li>
              </ul>
            </div>
          </section>

          {/* 5 */}
          <section id="datos" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">5. Datos de Personalización y Hábitos que Recopilamos</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-4">En cumplimiento con el formulario de <strong className="text-[#1a1a1a]">Seguridad de los Datos (Data Safety)</strong> de Google Play, declaramos con total transparencia los datos recopilados, los cuales se procesan como información de actividad de la aplicación y preferencias de estilo de vida, nunca con fines médicos.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-3 text-base">5.1 Tabla resumen Data Safety</h3>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-xs border-collapse min-w-[640px]">
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
                      ["Correo electrónico", "Información personal", "Creación y autenticación de la cuenta", "Sí", "No (Solo ROBLE)"],
                      ["Contraseña", "Información de autenticación", "Validación segura de acceso", "Sí", "No (Solo ROBLE)"],
                      ["Nombre completo", "Información personal", "Registro e identificación inicial", "Sí", "No"],
                      ["Apodo (Nickname)", "Información personal", "Visualización personalizada dentro de la app", "Sí", "No"],
                      ["Pronombre preferido", "Información personal", "Ajuste del lenguaje de la interfaz", "Sí", "No"],
                      ["Fecha/Hora de inicio del contador", "Actividad de la aplicación", "Cálculo dinámico del tiempo transcurrido en sobriedad/metas", "Sí", "No"],
                      ["Teléfono de contacto de confianza", "Información personal", "Enlace de marcado rápido en el dispositivo para uso autónomo en crisis", "Sí", "No"],
                      ["Motivo personal de sobriedad", "Actividad de la aplicación", "Despliegue de recordatorios motivacionales autónomos", "Sí", "No"],
                      ["Gasto financiero previo estimado", "Información financiera", "Cálculo estadístico del ahorro económico acumulado por metas", "Sí", "No"],
                      ["Estado de ánimo seleccionado", "Actividad de la aplicación", "Bitácora de autoevaluación diaria de bienestar emocional", "Opcional", "No"],
                      ["Reporte de cumplimiento de meta (Sí/No)", "Actividad de la aplicación", "Actualización del historial y las rachas del contador personal", "Opcional", "No"],
                      ["Notas de agradecimiento (Texto libre)", "Actividad de la aplicación", "Sección de diario personal y refuerzo de pensamientos positivos", "Opcional", "No"],
                      ["Contexto del entorno del hábito", "Actividad de la aplicación", "Identificación reflexiva de entornos que dificultan la meta (sin GPS)", "Opcional", "No"],
                      ["Contexto de interacción social", "Actividad de la aplicación", "Identificación reflexiva de compañías asociadas a la rutina diaria", "Opcional", "No"],
                      ["Reflexión de autoevaluación (Texto libre)", "Actividad de la aplicación", "Registro de diario personal ante rupturas de la racha de hábitos", "Opcional", "No"],
                      ["Eventos de agenda de actividades", "Actividad de la aplicación", "Calendario de recordatorios de grupos de apoyo o lecturas", "Opcional", "No"],
                      ["Contactos de apoyo añadidos manualmente", "Información de contactos", "Lista personalizada de contactos de emergencia (no lee la agenda del celular)", "Opcional", "No"],
                      ["Métricas de navegación interna", "Interacciones con la app", "Estadísticas técnicas de optimización del rendimiento", "Sí (Logueados)", "No (Anonimizado con SHA-256)"],
                    ].map(([dato, cat, prop, oblig, comp]) => (
                      <tr key={dato} className="border-t border-[#e5e5e5] hover:bg-[#f8f6f3]">
                        <td className="border border-[#e5e5e5] px-3 py-2 text-[#1a1a1a] align-top">{dato}</td>
                        <td className="border border-[#e5e5e5] px-3 py-2 text-[#4a4a4a] align-top">{cat}</td>
                        <td className="border border-[#e5e5e5] px-3 py-2 text-[#4a4a4a] align-top">{prop}</td>
                        <td className="border border-[#e5e5e5] px-3 py-2 text-[#4a4a4a] align-top">{oblig}</td>
                        <td className="border border-[#e5e5e5] px-3 py-2 text-[#4a4a4a] align-top">{comp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">5.2 Funcionamiento en Modo Invitado (Sin Registro)</h3>
              <p>Los usuarios que decidan utilizar la aplicación de forma anónima en Modo Invitado <strong className="text-[#1a1a1a]">no transmiten ningún dato personal identificable a los servidores</strong>. Toda la información de sus metas, contadores y bitácoras diarias se almacena de forma local y exclusiva dentro de la memoria privada del dispositivo (AsyncStorage). El usuario puede migrar estos datos voluntariamente en caso de registrar una cuenta en el futuro.</p>
            </div>
          </section>

          {/* 6 */}
          <section id="proteccion" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">6. Protección Especial de Datos de Introspección y Progreso Diario</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-3">Aunque los datos recopilados por NewLife se enmarcan estrictamente en el ámbito del <strong className="text-[#1a1a1a]">Estilo de Vida y la Productividad</strong>, el equipo reconoce que la información sobre el control de hábitos, rutinas de sobriedad y registros emocionales pertenece a la esfera más íntima del usuario. Por lo tanto, en concordancia con el Artículo 6 de la Ley 1581 de 2012 de Colombia, se implementan las siguientes medidas estrictas:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-[#1a1a1a]">Restricción absoluta de acceso:</strong> Los administradores <strong className="text-[#1a1a1a]">NO tienen acceso a los diarios, reflexiones, ni registros individuales</strong> de ningún usuario.</li>
                <li><strong className="text-[#1a1a1a]">Sin fines externos:</strong> Estos datos jamás serán compartidos, vendidos, cedidos, ni utilizados para fines comerciales, publicitarios, entrenamiento de modelos de Inteligencia Artificial o perfilamientos predictivos por parte de terceros o instituciones aliadas.</li>
                <li><strong className="text-[#1a1a1a]">Voluntariedad:</strong> El registro diario de check-in y la escritura en la bitácora son 100% opcionales. El usuario puede seguir usando el contador de tiempo principal sin necesidad de rellenar los diarios de texto.</li>
                <li><strong className="text-[#1a1a1a]">Geolocalización Desactivada:</strong> La app no solicita permisos de GPS. Cuando el usuario registra un entorno en sus hábitos, selecciona una opción de texto predefinida (ej. &quot;Lugar público&quot;), garantizando su anonimato espacial.</li>
              </ul>
            </div>
          </section>

          {/* 7 */}
          <section id="analytics" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">7. Sistema de Analytics Anónimo</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-4">Para la optimización de los flujos del sistema y estabilidad técnica de la app, se procesan logs técnicos agregados, <strong className="text-[#1a1a1a]">completamente anonimizados</strong> mediante criptografía irreversible.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">7.1 Criptografía irreversible (SHA-256 + sal secreta)</h3>
              <p className="mb-2">Para asegurar el anonimato total, los identificadores únicos de usuario son codificados con un <strong className="text-[#1a1a1a]">hash criptográfico SHA-256 enriquecido con una sal secreta</strong> antes de guardarse en el módulo estadístico. Esto impide de forma definitiva que los administradores web o atacantes externos puedan asociar un patrón de clics con el correo de un usuario real.</p>
              <p>La sal criptográfica se almacena <strong className="text-[#1a1a1a]">por separado</strong> de los datos hasheados, en una variable de entorno protegida que no es accesible desde el sistema de analytics.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">7.2 Datos de evento agregados</h3>
              <p>Solo se registran métricas procedimentales agregadas (ej. &quot;Interacción con audio de relajación&quot;, &quot;Navegación al módulo de diario&quot;, &quot;Usuario activo&quot;). <strong className="text-[#1a1a1a]">Jamás se capturan</strong> los textos escritos en las notas de gratitud, reflexiones, detalles confidenciales del usuario, ni los términos ingresados en barras de búsqueda.</p>
            </div>
          </section>

          {/* 8 */}
          <section id="finalidad" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">8. Finalidad del Tratamiento de Datos</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-3">Los datos recopilados son utilizados <strong className="text-[#1a1a1a]">exclusivamente</strong> para las siguientes finalidades:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Proveer el servicio de acompañamiento personalizado dentro de la aplicación</li>
                <li>Permitir al usuario hacer seguimiento de su proceso de autocontrol y crecimiento personal</li>
                <li>Sincronizar el progreso del usuario entre sesiones y dispositivos</li>
                <li>Enviar <strong className="text-[#1a1a1a]">notificaciones push de recordatorios</strong> en el horario elegido por el usuario (solo si el usuario aceptó recibir notificaciones)</li>
                <li>Generar métricas de uso <strong className="text-[#1a1a1a]">completamente anonimizadas</strong> para la mejora de la aplicación</li>
              </ul>
              <div className="bg-[#d4854a]/10 border-l-4 border-[#d4854a] rounded-r-lg p-4 text-sm">
                <strong className="text-[#1a1a1a]">Importante:</strong> NewLife <strong className="text-[#1a1a1a]">NO envía mensajes SMS</strong> a los usuarios. Las únicas notificaciones que la aplicación genera son <strong className="text-[#1a1a1a]">notificaciones push</strong> dentro del propio dispositivo, en el horario que el usuario haya configurado y siempre que haya aceptado recibirlas.
              </div>
            </div>
          </section>

          {/* 9 */}
          <section id="restricciones" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">9. Restricciones Explícitas de Uso de Datos</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-3">Los datos <strong className="text-[#1a1a1a]">NO serán utilizados</strong> para:</p>
              <ul className="list-disc pl-5 space-y-1">
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
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">10. Base Legal del Tratamiento</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-3">El tratamiento de datos personales en NewLife se realiza bajo las siguientes bases legales:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li><strong className="text-[#1a1a1a]">Consentimiento libre, previo, explícito e informado</strong> del usuario (Art. 9, Ley 1581/2012), solicitado en el momento del registro.</li>
                <li><strong className="text-[#1a1a1a]">Ejecución del servicio</strong> solicitado por el propio usuario.</li>
                <li><strong className="text-[#1a1a1a]">Cumplimiento de obligaciones legales</strong> aplicables en Colombia.</li>
              </ul>
              <p>El usuario puede <strong className="text-[#1a1a1a]">revocar su consentimiento</strong> en cualquier momento, lo que conlleva la eliminación de su cuenta y datos asociados, conforme a lo descrito en la <a href="#derechos" className="text-[#d4854a] hover:underline">Sección 14</a>.</p>
            </div>
          </section>

          {/* 11 */}
          <section id="roles" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">11. Roles de Administración y Acceso</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-4">El panel web de administración maneja los siguientes roles con acceso estrictamente delimitado:</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">11.1 Super Administrador</h3>
              <p>Es el único rol con capacidad de <strong className="text-[#1a1a1a]">crear nuevos administradores</strong>. Los super administradores son designados por el equipo NewLife y no pueden ser creados por usuarios regulares. Sus datos registrados son: nombre, correo electrónico y contraseña (gestionada por ROBLE).</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">11.2 Administrador (Moderador de Contenidos)</h3>
              <p>Creados exclusivamente por super administradores. Gestionan contenidos educativos, retos, frases motivacionales y grupos de apoyo. Pueden ver métricas de uso anonimizadas. <strong className="text-[#1a1a1a]">No tienen acceso a datos personales o de hábitos individuales</strong> de los usuarios.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">11.3 Protección de cuentas administrativas</h3>
              <p>Las cuentas con rol de Administrador o Super Administrador <strong className="text-[#1a1a1a]">no pueden ser eliminadas desde el formulario público de eliminación de cuenta</strong>. Esto previene que el sistema quede sin administradores por accidente o por credenciales comprometidas. Los administradores que deseen eliminar su cuenta deben contactar al equipo de NewLife mediante el correo <a href="mailto:proyecto.newlife.2026@gmail.com" className="text-[#d4854a] hover:underline">proyecto.newlife.2026@gmail.com</a>.</p>
            </div>
          </section>

          {/* 12 */}
          <section id="seguridad" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">12. Almacenamiento y Seguridad de los Datos</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-4">NewLife utiliza ROBLE (plataforma de OPENLAB, Universidad del Norte) como infraestructura de autenticación y base de datos. Las medidas de seguridad incluyen:</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">12.1 Datos en tránsito</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Comunicaciones cifradas mediante <strong className="text-[#1a1a1a]">HTTPS/TLS 1.2+</strong> entre la aplicación y los servidores de ROBLE.</li>
                <li>Certificados SSL válidos verificables públicamente en el dominio.</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">12.2 Datos en reposo</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>El <strong className="text-[#1a1a1a]">cifrado en reposo</strong> de los datos almacenados en ROBLE es gestionado por <strong className="text-[#1a1a1a]">OPENLAB</strong> (Universidad del Norte) como proveedor de la infraestructura, conforme a sus políticas internas de seguridad institucional.</li>
                <li>Las contraseñas <strong className="text-[#1a1a1a]">nunca se almacenan en texto plano</strong>; son hasheadas con algoritmos modernos (bcrypt o equivalente) gestionados íntegramente por ROBLE.</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">12.3 Autenticación</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Autenticación gestionada con <strong className="text-[#1a1a1a]">JWT</strong>, con tokens de acceso de corta duración y tokens de renovación.</li>
                <li>Renovación automática de tokens sin que el usuario deba reingresar credenciales.</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">12.4 Modo Invitado</h3>
              <p>Los datos del <strong className="text-[#1a1a1a]">modo invitado</strong> se almacenan exclusivamente en el dispositivo del usuario (AsyncStorage cifrado a nivel del sistema operativo Android) y no son accesibles por NewLife ni por terceros.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">12.5 Anonimización del sistema de analytics</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Identificadores hasheados con <strong className="text-[#1a1a1a]">SHA-256 + sal secreta</strong> (irreversible).</li>
                <li>Sal almacenada por separado de los datos.</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">12.6 Notificación de vulneraciones</h3>
              <p>En caso de una vulneración de seguridad que afecte datos personales, notificaremos a los usuarios afectados y a la Superintendencia de Industria y Comercio (SIC) en los plazos establecidos por la normativa vigente (Decreto 1377 de 2013).</p>
            </div>
          </section>

          {/* 13 */}
          <section id="terceros" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">13. Compartición de Datos con Terceros</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-3">NewLife <strong className="text-[#1a1a1a]">no vende, arrienda ni comparte</strong> datos personales con terceros con fines comerciales. Los datos podrían ser compartidos únicamente en los siguientes casos estrictamente limitados:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li><strong className="text-[#1a1a1a]">ROBLE / OPENLAB</strong>, como proveedor de la infraestructura tecnológica, bajo los términos de su propia política de privacidad.</li>
                <li><strong className="text-[#1a1a1a]">MinIO</strong>, exclusivamente para el almacenamiento de archivos del sistema (no contiene datos personales del usuario).</li>
                <li><strong className="text-[#1a1a1a]">Freesound API</strong>, exclusivamente para descargar audios públicos de meditación. <strong className="text-[#1a1a1a]">No se envían datos del usuario a Freesound.</strong></li>
                <li><strong className="text-[#1a1a1a]">Autoridades competentes colombianas</strong>, cuando exista una obligación legal explícita y formal (órdenes judiciales motivadas emitidas por jueces competentes).</li>
                <li>Con el <strong className="text-[#1a1a1a]">consentimiento explícito y expreso</strong> del usuario para un propósito específico.</li>
              </ul>
              <p className="mb-4">En ningún caso los datos de hábitos personales o de progreso individual se compartirán con terceros, incluyendo la institución universitaria, fundaciones aliadas u otros usuarios de la plataforma. Lo único a lo que tienen acceso los usuarios administradores (previamente autorizados por el equipo NewLife) son las métricas que ya están hasheadas y anonimizadas.</p>
              <div className="bg-[#d4854a]/10 border-l-4 border-[#d4854a] rounded-r-lg p-4 text-sm">
                <strong className="text-[#1a1a1a]">NewLife no integra SDKs de analítica de terceros</strong> (Google Analytics, Facebook SDK, Firebase Analytics, etc.) ni redes publicitarias.
              </div>
            </div>
          </section>

          {/* 14 */}
          <section id="derechos" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">14. Derechos del Titular de los Datos y Eliminación de Cuenta</h2>
            <div className="prose-newlife text-[#4a4a4a]">

              <h3 className="font-semibold text-[#1a1a1a] mt-2 mb-2 text-base">14.1 Derechos ARCO</h3>
              <p className="mb-2">Conforme a los Artículos 8 y 21 de la Ley 1581 de 2012, los usuarios tienen derecho a:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-[#1a1a1a]">Acceso:</strong> conocer qué datos suyos están almacenados y cómo son utilizados.</li>
                <li><strong className="text-[#1a1a1a]">Rectificación:</strong> corregir datos inexactos o incompletos directamente desde la sección de perfil de la aplicación (apodo, pronombre, motivo de sobriedad, gasto semanal) o solicitándolo por correo.</li>
                <li><strong className="text-[#1a1a1a]">Cancelación / Supresión:</strong> solicitar la eliminación de su cuenta y todos los datos asociados.</li>
                <li><strong className="text-[#1a1a1a]">Oposición:</strong> oponerse al uso de sus datos para finalidades específicas (por ejemplo, recordatorios push).</li>
                <li><strong className="text-[#1a1a1a]">Portabilidad:</strong> solicitar una copia de sus datos en formato legible.</li>
                <li><strong className="text-[#1a1a1a]">Revocación del consentimiento:</strong> retirar el consentimiento en cualquier momento sin consecuencias negativas para el usuario.</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">14.2 Cómo eliminar tu cuenta y datos</h3>
              <div className="bg-[#d4854a]/10 border-l-4 border-[#d4854a] rounded-r-lg p-4 mb-4 text-sm">
                <strong className="text-[#1a1a1a]">Conforme a la Política de Eliminación de Cuenta de Google Play, ofrecemos múltiples mecanismos para que el usuario pueda eliminar su cuenta y datos asociados:</strong>
              </div>

              <h4 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">Opción 1 — Dentro de la app móvil (recomendado)</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Abre la aplicación NewLife</li>
                <li>Ve a <strong className="text-[#1a1a1a]">Inicio → Configuración → Eliminar mi cuenta</strong></li>
                <li>Confirma la acción con tu contraseña</li>
                <li>La eliminación es <strong className="text-[#1a1a1a]">inmediata</strong> y los datos personales se borran al instante de las tablas relacionadas</li>
              </ol>

              <h4 className="font-semibold text-[#1a1a1a] mt-4 mb-2 text-sm">Opción 2 — A través de la landing page del proyecto</h4>
              <p className="mb-2">Si ya desinstalaste la aplicación, puedes solicitar la eliminación de tu cuenta a través del formulario disponible en la landing page:</p>
              <Link href="/eliminar-cuenta" className="inline-block px-4 py-2 bg-[#d4854a]/10 border border-[#d4854a]/30 rounded-lg text-[#d4854a] text-sm font-medium hover:bg-[#d4854a]/20 transition-colors mb-3">
                newlife.openlab.uninorte.edu.co/eliminar-cuenta →
              </Link>
              <p className="mb-2">El formulario te pedirá:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li><strong className="text-[#1a1a1a]">Correo electrónico</strong> de tu cuenta</li>
                <li><strong className="text-[#1a1a1a]">Contraseña actual</strong> (para verificar tu identidad)</li>
                <li><strong className="text-[#1a1a1a]">Motivo opcional</strong> de eliminación (para retroalimentación del producto)</li>
              </ul>
              <p>La eliminación es <strong className="text-[#1a1a1a]">inmediata</strong> una vez verificadas las credenciales. No requiere aprobación adicional ni espera de días.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">14.3 Qué se elimina</h3>
              <p className="mb-2">Al solicitar la eliminación de tu cuenta, se eliminan <strong className="text-[#1a1a1a]">inmediata e irreversiblemente</strong>:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Tu perfil completo (apodo, pronombre, motivo de sobriedad, gasto semanal, etc.)</li>
                <li>Todos los registros diarios de hábitos, emociones y autoevaluaciones</li>
                <li>Tu agenda personal y contactos de apoyo añadidos manualmente</li>
                <li>Frases motivacionales favoritas y contenidos educativos guardados</li>
                <li>Tu progreso en retos y niveles del programa de los 12 pasos</li>
                <li>Tu mascota virtual y todo el XP acumulado</li>
              </ul>
              <p>Adicionalmente, tu registro principal queda marcado con estado <strong className="text-[#1a1a1a]">&quot;ELIMINADO&quot;</strong> y tu nombre se anonimiza con un placeholder (<code className="px-1.5 py-0.5 bg-[#f0ebe5] text-[#1a1a1a] rounded text-xs font-mono">[Cuenta eliminada]</code>) para evitar que tus datos personales identificables permanezcan visibles en cualquier referencia residual.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">14.4 Qué podría retenerse y por qué</h3>
              <p className="mb-2">Por limitaciones técnicas y obligaciones legales, los siguientes elementos podrían retenerse:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-[#1a1a1a]">Credenciales mínimas en ROBLE</strong> (correo, identificador interno y contraseña hasheada): permanecen dentro del sistema de autenticación de ROBLE, dado que la plataforma de ROBLE no permite la eliminación programática de cuentas de autenticación (esta operación requiere acción manual del equipo administrativo). En NUESTRO sistema, la cuenta queda bloqueada y no puede acceder.</li>
                <li><strong className="text-[#1a1a1a]">Registro principal anonimizado</strong> en nuestra tabla de usuarios: queda únicamente con el correo, el estado <code className="px-1.5 py-0.5 bg-[#f0ebe5] text-[#1a1a1a] rounded text-xs font-mono">ELIMINADO</code>, la fecha de eliminación y un motivo opcional. Esto es necesario para impedir la reactivación accidental de la cuenta mediante re-login.</li>
                <li><strong className="text-[#1a1a1a]">Registros operacionales mínimos</strong> (logs de seguridad) por el tiempo que exija la normativa colombiana, anonimizados.</li>
                <li><strong className="text-[#1a1a1a]">Métricas anónimas agregadas</strong> ya generadas (no atribuibles a tu cuenta) podrán conservarse indefinidamente, al no constituir información personal identificable.</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">14.5 Reutilización del correo electrónico</h3>
              <div className="bg-[#d4854a]/10 border-l-4 border-[#d4854a] rounded-r-lg p-4 mb-3 text-sm">
                <strong className="text-[#1a1a1a]">Importante:</strong> Una vez eliminada una cuenta, el correo electrónico asociado <strong className="text-[#1a1a1a]">no podrá ser reutilizado</strong> para crear una nueva cuenta en NewLife. Esto se debe a que la cuenta en el sistema de autenticación (ROBLE) permanece registrada, y nuestra política de eliminación es irreversible para garantizar que la decisión del usuario sea respetada de forma permanente.
              </div>
              <p>Si deseas volver a usar NewLife después de eliminar tu cuenta, deberás registrarte con un correo electrónico distinto.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">14.6 Restricción para cuentas administrativas</h3>
              <p className="mb-2">Las cuentas con rol de <strong className="text-[#1a1a1a]">Administrador</strong> o <strong className="text-[#1a1a1a]">Super Administrador</strong> <strong className="text-[#1a1a1a]">no pueden eliminarse desde el formulario público</strong> de la landing page. Esto previene que el sistema quede sin administradores por accidente o por credenciales comprometidas.</p>
              <p>Los administradores que deseen eliminar su cuenta deben <strong className="text-[#1a1a1a]">contactar al equipo de NewLife</strong> mediante el correo <a href="mailto:proyecto.newlife.2026@gmail.com" className="text-[#d4854a] hover:underline">proyecto.newlife.2026@gmail.com</a> desde la dirección registrada de su cuenta, indicando el motivo. El equipo procesará la solicitud manualmente tras verificar la identidad.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">14.7 Plazos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f8f6f3]">
                      <th className="border border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#1a1a1a]">Vía de eliminación</th>
                      <th className="border border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#1a1a1a]">Plazo de ejecución</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#e5e5e5]">
                      <td className="border border-[#e5e5e5] px-4 py-2 text-[#1a1a1a]">Eliminación desde la app móvil</td>
                      <td className="border border-[#e5e5e5] px-4 py-2 text-[#4a4a4a]"><strong>Inmediata</strong> (instantánea)</td>
                    </tr>
                    <tr className="border-t border-[#e5e5e5]">
                      <td className="border border-[#e5e5e5] px-4 py-2 text-[#1a1a1a]">Eliminación desde landing page</td>
                      <td className="border border-[#e5e5e5] px-4 py-2 text-[#4a4a4a]"><strong>Inmediata</strong> (instantánea, tras verificación de credenciales)</td>
                    </tr>
                    <tr className="border-t border-[#e5e5e5]">
                      <td className="border border-[#e5e5e5] px-4 py-2 text-[#1a1a1a]">Eliminación de cuentas administrativas</td>
                      <td className="border border-[#e5e5e5] px-4 py-2 text-[#4a4a4a]">Máximo <strong>15 días hábiles</strong> (procesamiento manual del equipo)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 15 */}
          <section id="menores" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">15. Menores de Edad y Verificación</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-4">NewLife está dirigida exclusivamente a personas <strong className="text-[#1a1a1a]">mayores de 18 años</strong>.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">15.1 Verificación de edad</h3>
              <p>Al registrarse, el usuario debe <strong className="text-[#1a1a1a]">confirmar explícitamente</strong> su fecha de nacimiento mediante un selector de fecha. El sistema calcula la edad y <strong className="text-[#1a1a1a]">bloquea automáticamente el registro</strong> si el usuario es menor de 18 años. Esta verificación se registra como parte del consentimiento informado. La fecha de nacimiento ingresada se utiliza únicamente para validar la edad y <strong className="text-[#1a1a1a]">no se almacena en los servidores de NewLife</strong>.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">15.2 Si detectamos un menor de edad</h3>
              <p className="mb-2">Si detectamos que un usuario registrado es menor de edad, procederemos a:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Suspensión inmediata de la cuenta</li>
                <li>Eliminación de todos los datos asociados en un plazo máximo de 48 horas</li>
                <li>Notificación al usuario a través del correo electrónico de la cuenta</li>
              </ol>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">15.3 Para padres y tutores</h3>
              <p>Si usted es padre, madre o tutor y cree que su hijo menor de edad ha proporcionado datos a través de NewLife, contáctenos a <a href="mailto:proyecto.newlife.2026@gmail.com" className="text-[#d4854a] hover:underline">proyecto.newlife.2026@gmail.com</a> de manera inmediata para proceder con la eliminación.</p>
            </div>
          </section>

          {/* 16 */}
          <section id="retencion" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">16. Retención de Datos</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-3">Los datos personales se conservarán durante el tiempo en que el usuario mantenga su cuenta activa. Una vez que el usuario solicite la eliminación de su cuenta:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Los datos personales identificables son eliminados <strong className="text-[#1a1a1a]">inmediatamente</strong> al procesarse la solicitud</li>
                <li>El registro principal queda anonimizado y marcado como <code className="px-1.5 py-0.5 bg-[#f0ebe5] text-[#1a1a1a] rounded text-xs font-mono">ELIMINADO</code> para prevenir reactivación</li>
                <li>Los datos anónimos y agregados de métricas de uso podrán conservarse indefinidamente, al no ser atribuibles a ningún usuario específico</li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">16.1 Fin del proyecto académico</h3>
              <p>En caso de que el proyecto NewLife concluya como iniciativa académica, el equipo se compromete a notificar a los usuarios registrados con al menos <strong className="text-[#1a1a1a]">30 días de anticipación</strong> y a proceder con la eliminación completa de todos los datos personales almacenados, salvo que exista un sucesor responsable que asuma formalmente esta política.</p>
            </div>
          </section>

          {/* 17 */}
          <section id="seguimiento" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">17. Tecnologías de Seguimiento</h2>
            <div className="prose-newlife text-[#4a4a4a]">
              <p className="mb-3">La aplicación móvil <strong className="text-[#1a1a1a]">no utiliza cookies de rastreo comercial</strong>. Utiliza tokens JWT estrictamente necesarios para el funcionamiento del servicio de autenticación de ROBLE. Estos tokens:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Son de corta duración y se renuevan automáticamente</li>
                <li>No se utilizan para rastreo publicitario ni análisis de comportamiento individual</li>
                <li>Se eliminan al cerrar sesión</li>
              </ul>
              <p className="mb-3"><strong className="text-[#1a1a1a]">No se utilizan tecnologías de rastreo de terceros</strong> (Google Analytics, Meta Pixel, Firebase Analytics, Flurry, etc.) en ninguna de las plataformas de NewLife.</p>
              <p>El único sistema de seguimiento es el de <strong className="text-[#1a1a1a]">analytics anónimo interno</strong> descrito en la <a href="#analytics" className="text-[#d4854a] hover:underline">Sección 7</a>.</p>
            </div>
          </section>

          {/* 18 */}
          <section id="consentimiento" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">18. Consentimiento y Cambios a esta Política</h2>
            <div className="prose-newlife text-[#4a4a4a]">

              <h3 className="font-semibold text-[#1a1a1a] mt-2 mb-2 text-base">18.1 Cuándo se solicita consentimiento</h3>
              <p className="mb-3">NewLife solicita el consentimiento del usuario en los siguientes momentos del flujo de la aplicación:</p>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong className="text-[#1a1a1a]">Durante el registro:</strong> el usuario debe aceptar explícitamente esta Política de Privacidad antes de crear su cuenta. Se solicita verificación de mayoría de edad (18+) mediante fecha de nacimiento.</li>
                <li><strong className="text-[#1a1a1a]">Migración del modo invitado:</strong> al migrar datos locales a una cuenta registrada, el usuario confirma explícitamente qué información desea transferir.</li>
                <li><strong className="text-[#1a1a1a]">Notificaciones push:</strong> el usuario debe aceptar específicamente el envío de notificaciones push de recordatorios; este permiso es revocable en cualquier momento desde la configuración del dispositivo o de la aplicación.</li>
                <li>
                  <strong className="text-[#1a1a1a]">Eliminación de cuenta:</strong> el usuario debe confirmar explícitamente su decisión de eliminar la cuenta mediante un diálogo de confirmación.
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong className="text-[#1a1a1a]">Desde la app móvil:</strong> confirmación mediante modal de advertencia. La autenticación ya está verificada por la sesión activa.</li>
                    <li><strong className="text-[#1a1a1a]">Desde la landing pública:</strong> ingreso obligatorio de contraseña + checkbox de confirmación, dado que no hay sesión activa.</li>
                  </ul>
                  <p className="mt-2">En ambos canales el proceso es inmediato e irreversible.</p>
                </li>
              </ol>
              <p className="mt-4">El usuario puede consultar y revocar sus consentimientos en cualquier momento desde la configuración de la aplicación.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">18.2 Cambios a esta política</h3>
              <p className="mb-2">NewLife se reserva el derecho de actualizar esta política. Cuando se realicen cambios sustanciales:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Se notificará a los usuarios registrados mediante un aviso dentro de la aplicación</li>
                <li>La fecha de la última actualización será visible en esta política y en la landing page</li>
                <li>El uso continuado de la aplicación tras la notificación constituirá aceptación de los cambios</li>
                <li>Para cambios sensibles (nuevos tipos de datos recolectados, nuevas finalidades) se solicitará re-consentimiento explícito</li>
              </ul>
              <p>Para cambios menores (correcciones de redacción, actualización de datos de contacto), la notificación podrá realizarse únicamente actualizando el documento.</p>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">18.3 Contacto y reclamaciones</h3>
              <p className="mb-2">Para cualquier consulta, solicitud o reclamación relacionada con el tratamiento de datos personales:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li><strong className="text-[#1a1a1a]">Correo electrónico:</strong> <a href="mailto:proyecto.newlife.2026@gmail.com" className="text-[#d4854a] hover:underline">proyecto.newlife.2026@gmail.com</a></li>
                <li><strong className="text-[#1a1a1a]">Landing page:</strong> <a href="https://newlife.openlab.uninorte.edu.co" target="_blank" rel="noopener noreferrer" className="text-[#d4854a] hover:underline">newlife.openlab.uninorte.edu.co</a></li>
                <li><strong className="text-[#1a1a1a]">Institución:</strong> Universidad del Norte, Barranquilla, Colombia</li>
              </ul>
              <p className="mb-2">Si considera que su solicitud no ha sido atendida satisfactoriamente, tiene derecho a presentar una queja ante la <strong className="text-[#1a1a1a]">Superintendencia de Industria y Comercio (SIC)</strong> de Colombia, autoridad nacional de protección de datos personales.</p>
              <ul className="list-disc pl-5">
                <li>Sitio web SIC: <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="text-[#d4854a] hover:underline">https://www.sic.gov.co</a></li>
              </ul>

              <h3 className="font-semibold text-[#1a1a1a] mt-6 mb-2 text-base">18.4 Marco normativo aplicable</h3>
              <p className="mb-2">Esta política se rige por la siguiente normativa colombiana y políticas internacionales:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-[#1a1a1a]">Ley Estatutaria 1581 de 2012:</strong> Protección de Datos Personales (Colombia)</li>
                <li><strong className="text-[#1a1a1a]">Decreto 1377 de 2013:</strong> Reglamentación parcial de la Ley 1581</li>
                <li><strong className="text-[#1a1a1a]">Decreto 1074 de 2015:</strong> Decreto Único Reglamentario del Sector Comercio</li>
                <li><strong className="text-[#1a1a1a]">Circular Externa 002 de 2015 de la SIC:</strong> Instrucciones sobre protección de datos</li>
                <li><strong className="text-[#1a1a1a]">Google Play User Data Policy:</strong> Políticas de datos de usuario de Google Play</li>
                <li><strong className="text-[#1a1a1a]">Google Play Account Deletion Policy:</strong> Políticas de eliminación de cuenta de Google Play</li>
              </ul>
            </div>
          </section>

          {/* 19 — Glosario */}
          <section id="glosario" className="bg-white rounded-xl border border-[#e5e5e5] p-6 md:p-8 scroll-mt-20">
            <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">19. Glosario</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#f8f6f3]">
                    <th className="border border-[#e5e5e5] px-4 py-2 text-left font-semibold text-[#1a1a1a] w-48 align-top">Término</th>
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
                    ["Datos sensibles", "Categoría especial de datos personales protegida con requisitos más estrictos por la Ley 1581"],
                    ["Derechos ARCO", "Derechos de Acceso, Rectificación, Cancelación y Oposición que la ley colombiana reconoce a todo titular de datos personales"],
                    ["Anonimización", "Proceso por el cual los datos se transforman de forma que no es posible identificar a la persona a la que pertenecen, ni directa ni indirectamente"],
                    ["SHA-256", "Algoritmo criptográfico de hash que transforma datos de entrada en una cadena de 256 bits irreversible. Usado por NewLife para anonimizar identificadores en el sistema de analytics"],
                    ["Sal criptográfica (salt)", "Cadena secreta agregada antes de aplicar el hash, que hace imposible revertir el proceso aún con tablas precomputadas"],
                    ["Notificación push", "Mensaje breve que la aplicación envía al dispositivo del usuario, mostrándose como alerta del sistema operativo. Requiere autorización explícita del usuario para ser enviada"],
                    ["SIC", "Superintendencia de Industria y Comercio. Entidad del gobierno colombiano responsable de la protección de datos personales"],
                    ["Modo invitado", "Forma de acceso a NewLife sin crear una cuenta. La información se guarda solo en el dispositivo y no llega a los servidores de NewLife"],
                    ["PII", "Personally Identifiable Information. Información que permite identificar a una persona específica (nombre, correo, teléfono, etc.)"],
                    ["Data Safety Form", "Formulario de Google Play donde los desarrolladores deben declarar los datos que su app recolecta y comparte"],
                    ["Soft Delete", "Técnica que marca un registro como eliminado sin borrarlo físicamente, permitiendo prevenir reactivaciones accidentales y mantener integridad referencial"],
                    ["Bitácora / Diario Personal", "Espacio libre en texto dentro de la app diseñado para la introspección autónoma del usuario en la consecución de sus metas personales de cambio de hábitos"],
                  ].map(([term, def]) => (
                    <tr key={term} className="border-t border-[#e5e5e5] hover:bg-[#f8f6f3]">
                      <td className="border border-[#e5e5e5] px-4 py-2 font-medium text-[#1a1a1a] align-top">{term}</td>
                      <td className="border border-[#e5e5e5] px-4 py-2 text-[#4a4a4a] align-top">{def}</td>
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
            Versión 1.1.0 — Mayo 2026 · NewLife, Universidad del Norte, Barranquilla, Colombia · © 2026 NewLife — Todos los derechos reservados
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
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
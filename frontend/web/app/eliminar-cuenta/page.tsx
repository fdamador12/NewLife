'use client'
// app/eliminar-cuenta/page.tsx
// Pagina publica de solicitud de eliminacion de cuenta - requerida por Google Play

import { useState } from "react"
import Link from "next/link"
import {
  CheckCircle, AlertCircle, Eye, EyeOff, Trash2, Shield,
} from "lucide-react"

type FormState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "already-deleted"
  | "protected-account"

/**
 * Resuelve la URL del mobile-api a partir de la URL del admin-api.
 *
 * FIX 2026-05: en producción las URLs son subdomains (sin puertos), por lo
 * que el replace de puerto (5180 → 5181) no funciona. Ahora intentamos:
 *   1. NEXT_PUBLIC_MOBILE_API_URL explicito (preferido en prod)
 *   2. Si la URL tiene "5180" → reemplazar puerto (dev local)
 *   3. Si la URL tiene "admin-api" → reemplazar subdomain (produccion)
 *   4. Fallback a localhost
 */
function resolveMobileApiUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_MOBILE_API_URL
  if (explicit) return explicit

  const adminUrl = process.env.NEXT_PUBLIC_API_URL
  if (adminUrl) {
    if (adminUrl.includes("5180")) {
      // Local dev: cambiar puerto admin → mobile
      return adminUrl.replace("5180", "5181")
    }
    if (adminUrl.includes("admin-api")) {
      // Produccion: cambiar subdomain admin-api → mobile-api
      return adminUrl.replace("admin-api", "mobile-api")
    }
    return adminUrl
  }

  return "http://localhost:5181"
}

const MOBILE_API_URL = resolveMobileApiUrl()

export default function EliminarCuentaPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [confirmacion, setConfirmacion] = useState(false)
  const [estado, setEstado] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!email || !password || !confirmacion) return

    setEstado("loading")

    try {
      const res = await fetch(
        `${MOBILE_API_URL}/auth/request-account-deletion`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, motivo: motivo || undefined }),
        }
      )

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setEstado("success")
      } else if (res.status === 410) {
        setEstado("already-deleted")
      } else if (res.status === 403) {
        setEstado("protected-account")
      } else if (res.status === 401) {
        setErrorMsg("Correo o contraseña inválidos. Verifica tus datos e intenta de nuevo.")
        setEstado("error")
      } else if (res.status === 400) {
        const msg = Array.isArray(data?.message) ? data.message.join(", ") : data?.message
        setErrorMsg(msg || "Datos inválidos. Revisa el formulario.")
        setEstado("error")
      } else {
        setErrorMsg(
          data?.message ||
          "Ocurrió un error procesando tu solicitud. Intenta de nuevo o escríbenos al correo."
        )
        setEstado("error")
      }
    } catch (err) {
      setErrorMsg(
        "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo, o escríbenos al correo."
      )
      setEstado("error")
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <main className="max-w-2xl mx-auto px-6 py-12">
        {estado === "success" && (
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3">Cuenta eliminada</h1>
            <p className="text-[#737373] text-sm leading-relaxed mb-6">
              La cuenta asociada a <span className="font-medium text-[#1a1a1a]">{email}</span> ha sido
              eliminada exitosamente. Todos tus datos personales han sido borrados
              de nuestros servidores de forma permanente.
            </p>
            <div className="bg-[#f8f6f3] rounded-xl p-4 text-sm text-[#4a4a4a] text-left mb-6">
              <p className="font-medium text-[#1a1a1a] mb-2">Resumen de lo eliminado</p>
              <ul className="space-y-1">
                <li>• Tu perfil y datos personales</li>
                <li>• Tu progreso en los 12 pasos</li>
                <li>• Tu mascota virtual y XP acumulado</li>
                <li>• Contactos de emergencia y registros diarios</li>
                <li>• Membresías en comunidades, posts y comentarios</li>
              </ul>
            </div>
            <Link href="/" className="inline-block px-6 py-3 bg-[#d4854a] text-white rounded-xl font-medium hover:bg-[#c07842] transition-colors text-sm">
              Volver al inicio
            </Link>
          </div>
        )}

        {estado === "already-deleted" && (
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3">Esta cuenta ya fue eliminada</h1>
            <p className="text-[#737373] text-sm leading-relaxed mb-6">
              La cuenta asociada a <span className="font-medium text-[#1a1a1a]">{email}</span> ya
              había sido eliminada anteriormente. Tus datos personales ya no
              están en nuestros servidores.
            </p>
            <Link href="/" className="inline-block px-6 py-3 bg-[#d4854a] text-white rounded-xl font-medium hover:bg-[#c07842] transition-colors text-sm">
              Volver al inicio
            </Link>
          </div>
        )}

        {estado === "protected-account" && (
          <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3">Cuenta administrativa</h1>
            <p className="text-[#737373] text-sm leading-relaxed mb-6">
              La cuenta asociada a <span className="font-medium text-[#1a1a1a]">{email}</span> tiene
              permisos administrativos y no puede eliminarse desde este formulario.
            </p>
            <div className="bg-[#f8f6f3] rounded-xl p-4 text-sm text-[#4a4a4a] text-left mb-6">
              <p className="font-medium text-[#1a1a1a] mb-2">¿Necesitas eliminar tu cuenta?</p>
              <p className="text-[#737373]">
                Escríbenos a{" "}
                <a
                  href="mailto:proyecto.newlife.2026@gmail.com?subject=Solicitud de eliminación de cuenta administrativa"
                  className="text-[#d4854a] hover:underline font-medium"
                >
                  proyecto.newlife.2026@gmail.com
                </a>{" "}
                desde el correo de tu cuenta. El equipo de NewLife te ayudará con
                el proceso de forma segura.
              </p>
            </div>
            <Link href="/" className="inline-block px-6 py-3 bg-[#d4854a] text-white rounded-xl font-medium hover:bg-[#c07842] transition-colors text-sm">
              Volver al inicio
            </Link>
          </div>
        )}

        {(estado === "idle" || estado === "loading" || estado === "error") && (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">Eliminar mi cuenta</h1>
              <p className="text-[#737373] text-sm leading-relaxed">
                Para eliminar tu cuenta de NewLife, verifica tu identidad con tu
                correo y contraseña. La eliminación es{" "}
                <span className="font-medium text-[#1a1a1a]">inmediata e irreversible</span>.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Antes de continuar</p>
                  <ul className="space-y-1 text-amber-700">
                    <li>• Tu progreso, historial y mascota virtual se eliminarán permanentemente</li>
                    <li>• No podrás recuperar la cuenta una vez eliminada</li>
                    <li>• La eliminación es inmediata y no requiere aprobación adicional</li>
                    <li>
                      • Si tienes dudas, escríbenos a{" "}
                      <a href="mailto:proyecto.newlife.2026@gmail.com" className="underline hover:no-underline">
                        proyecto.newlife.2026@gmail.com
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {estado === "error" && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a]">
                    Correo electrónico de tu cuenta *
                  </label>
                  <input
                    id="email" type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-[#f8f6f3] text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#d4854a] focus:ring-1 focus:ring-[#d4854a] text-sm transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-[#1a1a1a]">Contraseña *</label>
                  <div className="relative">
                    <input
                      id="password" type={showPassword ? "text" : "password"} required autoComplete="current-password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña actual"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-[#e5e5e5] bg-[#f8f6f3] text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#d4854a] focus:ring-1 focus:ring-[#d4854a] text-sm transition-colors"
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#737373] transition-colors"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-[#a3a3a3]">Necesitamos tu contraseña para verificar que eres el dueño de la cuenta.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="motivo" className="block text-sm font-medium text-[#1a1a1a]">
                    Motivo de la eliminación <span className="text-[#a3a3a3] font-normal">(opcional)</span>
                  </label>
                  <textarea
                    id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Puedes contarnos por qué deseas eliminar tu cuenta. Tu opinión nos ayuda a mejorar."
                    rows={3} maxLength={500}
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-[#f8f6f3] text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#d4854a] focus:ring-1 focus:ring-[#d4854a] text-sm transition-colors resize-none"
                  />
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input
                    id="confirmacion" type="checkbox" required
                    checked={confirmacion} onChange={(e) => setConfirmacion(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#d4854a] cursor-pointer"
                  />
                  <label htmlFor="confirmacion" className="text-sm text-[#4a4a4a] cursor-pointer leading-relaxed">
                    Entiendo que esta acción es <span className="font-medium">inmediata e irreversible</span> y que
                    todos mis datos serán eliminados permanentemente. He leído la{" "}
                    <Link href="/privacidad" className="text-[#d4854a] hover:underline">Política de Privacidad</Link>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!email || !password || !confirmacion || estado === "loading"}
                  className="w-full py-3 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {estado === "loading" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Eliminando cuenta...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar mi cuenta permanentemente
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 text-center text-xs text-[#a3a3a3]">
              <Link href="/privacidad" className="hover:text-[#737373] transition-colors">Política de Privacidad</Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
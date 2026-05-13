// components/footer.tsx
// Footer corregido: links reales, sin idiomas irrelevantes, sin redes sociales sin usar

import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#2d2d2d] text-[#d4d4d4]">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">

        {/* Store links */}
        <div className="flex items-center justify-center gap-8 text-sm">
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ffffff] transition-colors"
          >
            Ir a Google Play
          </a>
        </div>

        <div className="w-full max-w-md mx-auto h-px bg-[#4a4a4a] my-6" />

        {/* Navegación */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm mb-6">
          <Link href="/" className="hover:text-[#ffffff] transition-colors">
            Inicio
          </Link>
          <Link href="/privacidad" className="hover:text-[#ffffff] transition-colors">
            Política de privacidad
          </Link>
          <Link href="/eliminar-cuenta" className="hover:text-[#ffffff] transition-colors">
            Eliminar cuenta
          </Link>
        </div>

        <div className="w-full max-w-2xl mx-auto h-px bg-[#4a4a4a] my-6" />

        {/* Info del proyecto */}
        <div className="text-center text-xs text-[#a3a3a3] space-y-1 mb-8">
          <p>NewLife — Proyecto de grado · Universidad del Norte · Barranquilla, Colombia</p>
          <p>
            Contacto:{" "}
            <a
              href="mailto:proyecto.newlife.2026@gmail.com"
              className="hover:text-[#ffffff] transition-colors"
            >
              proyecto.newlife.2026@gmail.com
            </a>
          </p>
          <p className="text-[#737373]">
            App de acompañamiento en recuperación de sustancias psicoactivas · Mayores de 18 años
          </p>
        </div>

        {/* Mascot */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden">
            <Image
              src="/images/mascot.png"
              alt="Mascota NewLife"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="w-full max-w-3xl mx-auto h-px bg-[#4a4a4a] my-6" />

        <p className="text-center text-xs text-[#737373]">
          © 2026 NewLife · Universidad del Norte · Todos los derechos reservados
        </p>
      </div>
    </footer>
  )
}
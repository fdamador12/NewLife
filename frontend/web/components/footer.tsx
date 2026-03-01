import Image from "next/image"

const languages = [
  "Turkce", "Dansk", "Nederlands", "Nederlands", "English",
  "Suomi", "Francais", "Deutsch", "Magyar",
  "Bahasa Indonesia", "Norsk bokmal", "Italiano", "Polski",
  "Portugues", "Romana", "Espanol", "Svenska",
]

export function Footer() {
  return (
    <footer className="bg-[#2d2d2d] text-[#d4d4d4]">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">
        {/* Store links */}
        <div className="flex items-center justify-center gap-8 text-sm">
          <a href="#" className="hover:text-[#ffffff] transition-colors">
            Ir a App Store
          </a>
          <a href="#" className="hover:text-[#ffffff] transition-colors">
            Ir a Google Play
          </a>
        </div>

        <div className="w-full max-w-md mx-auto h-px bg-[#4a4a4a] my-6" />

        {/* Inicio */}
        <div className="text-center mb-6">
          <a href="#" className="text-sm hover:text-[#ffffff] transition-colors">
            Inicio
          </a>
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#a3a3a3]">
          <a href="#" className="hover:text-[#ffffff] transition-colors">
            {"Politica de privacidad"}
          </a>
          <a href="#" className="hover:text-[#ffffff] transition-colors">
            Condiciones de servicio
          </a>
          <a href="#" className="hover:text-[#ffffff] transition-colors">
            Cumplimiento de la normativa de la RPI
          </a>
          <a href="#" className="hover:text-[#ffffff] transition-colors">
            Kit de prensa
          </a>
        </div>

        <div className="w-full max-w-2xl mx-auto h-px bg-[#4a4a4a] my-6" />

        {/* Language links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#a3a3a3]">
          {languages.map((lang, i) => (
            <a key={i} href="#" className="hover:text-[#ffffff] transition-colors">
              {lang}
            </a>
          ))}
        </div>

        <div className="w-full max-w-3xl mx-auto h-px bg-[#4a4a4a] my-8" />

        {/* Social icons */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {/* Instagram */}
          <a
            href="#"
            className="w-11 h-11 rounded-full border border-[#4a4a4a] flex items-center justify-center text-[#d4d4d4] hover:text-[#ffffff] hover:border-[#737373] transition-colors"
            aria-label="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="#"
            className="w-11 h-11 rounded-full border border-[#4a4a4a] flex items-center justify-center text-[#d4d4d4] hover:text-[#ffffff] hover:border-[#737373] transition-colors"
            aria-label="Facebook"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>

          {/* Twitter / X */}
          <a
            href="#"
            className="w-11 h-11 rounded-full border border-[#4a4a4a] flex items-center justify-center text-[#d4d4d4] hover:text-[#ffffff] hover:border-[#737373] transition-colors"
            aria-label="Twitter"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="#"
            className="w-11 h-11 rounded-full border border-[#4a4a4a] flex items-center justify-center text-[#d4d4d4] hover:text-[#ffffff] hover:border-[#737373] transition-colors"
            aria-label="LinkedIn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>

        {/* Mascot */}
        <div className="flex justify-center">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden">
            <Image
              src="/images/mascot.png"
              alt="NewLife mascot"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}

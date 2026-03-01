import Image from "next/image"

function FloatingLeaf({
  className,
  rotate = 0,
  size = "md",
}: {
  className?: string
  rotate?: number
  size?: "sm" | "md" | "lg"
}) {
  const dims = size === "sm" ? "w-6 h-6" : size === "md" ? "w-10 h-10" : "w-14 h-14"
  return (
    <svg
      className={`absolute ${dims} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 2C10 8 2 18 4 28C6 38 16 38 20 28C24 38 34 38 36 28C38 18 30 8 20 2Z"
        fill="#80c99c"
        opacity="0.6"
      />
      <path d="M20 2C20 2 20 15 20 28" stroke="#4ace7f" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

interface FeatureBlockProps {
  title: string
  description: string
  screenSrc: string
  screenAlt: string
  reverse?: boolean
}

function FeatureBlock({ title, description, screenSrc, screenAlt, reverse = false }: FeatureBlockProps) {
  return (
    <div
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"
        } items-center gap-8 md:gap-14 lg:gap-20`}
    >
      {/* Phone image */}
      <div className="relative w-[240px] md:w-[260px] flex-shrink-0">
        <Image
          src={screenSrc}
          alt={screenAlt}
          width={260}
          height={520}
          className="w-full h-auto object-contain drop-shadow-2xl"
        />
      </div>

      {/* Text */}
      <div className={`flex-1 text-center ${reverse ? "md:text-right" : "md:text-left"}`}>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight text-[#ffffff] mb-4 text-balance">
          {title}
        </h3>
        <p className={`text-sm md:text-base leading-relaxed text-[#d4d4d4] max-w-sm text-pretty ${reverse ? "md:ml-auto" : "mx-auto md:mx-0"}`}>
          {description}
        </p>
      </div>
    </div>
  )
}

export function FeaturesSection() {
  return (
    <section className="relative bg-gradient-to-b from-[#3d8a2e] via-[#358040] to-[#2d7a4a] py-20 md:py-28 overflow-hidden">
      {/* Floating leaves decoration */}
      <FloatingLeaf className="top-16 left-[10%] opacity-40" rotate={-30} size="lg" />
      <FloatingLeaf className="top-32 right-[8%] opacity-30" rotate={45} size="md" />
      <FloatingLeaf className="top-[40%] left-[5%] opacity-25" rotate={-60} size="sm" />
      <FloatingLeaf className="top-[55%] right-[12%] opacity-35" rotate={20} size="lg" />
      <FloatingLeaf className="top-[70%] left-[15%] opacity-20" rotate={-15} size="md" />
      <FloatingLeaf className="bottom-32 right-[6%] opacity-30" rotate={70} size="sm" />
      <FloatingLeaf className="bottom-48 left-[8%] opacity-25" rotate={-45} size="lg" />
      <FloatingLeaf className="top-24 left-[45%] opacity-20" rotate={35} size="sm" />
      <FloatingLeaf className="top-[65%] right-[25%] opacity-15" rotate={-50} size="md" />
      <FloatingLeaf className="bottom-20 left-[35%] opacity-20" rotate={10} size="sm" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-12 flex flex-col gap-24 md:gap-32">
        <FeatureBlock
          title="Celebra cada paso que das"
          description="Reconoce tus logros y descubre cómo cada día sin alcohol te acerca más a tu mejor versión."
          screenSrc="/images/phone1.png"
          screenAlt="Pantalla de logros mostrando la primera semana sin alcohol"
        />

        <FeatureBlock
          title="Mantente a salvo, estés donde estés"
          description="Recibe alertas cuando te acerques a zonas de riesgo y guarda tus lugares seguros. Tu entorno también puede ser parte de tu recuperación."
          screenSrc="/images/phone2.png"
          screenAlt="Pantalla del mapa mostrando zonas seguras"
          reverse
        />

        <FeatureBlock
          title="Encuentra calma en los momentos difíciles"
          description="Si sientes una urgencia o tentación, activa el modo SOS. Accede a respiraciones guiadas, contactos de apoyo y mensajes que te ayudan a mantenerte firme."
          screenSrc="/images/phone3.png"
          screenAlt="Pantalla de respiración guiada para momentos difíciles"
        />
      </div>
    </section>
  )
}
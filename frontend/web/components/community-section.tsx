import Image from "next/image"

interface ScatteredPhoto {
  src: string
  alt: string
  width: number
  height: number
  top: string
  left?: string
  right?: string
  rotate: number
  shape: "rounded-full" | "rounded-2xl" | "rounded-3xl" | "rounded-xl" | "hexagon" | "diamond" | "blob" | "squircle"
  mobileOrder?: number
}

const leftPhotos: ScatteredPhoto[] = [
  {
    src: "/images/person1.png",
    alt: "Miembro de la comunidad",
    width: 160,
    height: 160,
    top: "0%",
    left: "2%",
    rotate: -6,
    shape: "hexagon",
    mobileOrder: 1,
  },
  {
    src: "/images/person2.png",
    alt: "Miembro de la comunidad",
    width: 175,
    height: 210,
    top: "2%",
    left: "45%",
    rotate: 4,
    shape: "rounded-2xl",
    mobileOrder: 3,
  },
  {
    src: "/images/person3.png",
    alt: "Miembro de la comunidad",
    width: 155,
    height: 155,
    top: "62%",
    left: "0%",
    rotate: 8,
    shape: "blob",
    mobileOrder: 5,
  },
  {
    src: "/images/person4.png",
    alt: "Miembro de la comunidad",
    width: 180,
    height: 210,
    top: "58%",
    left: "45%",
    rotate: -3,
    shape: "squircle",
    mobileOrder: 7,
  },
]

const rightPhotos: ScatteredPhoto[] = [
  {
    src: "/images/person5.png",
    alt: "Miembro de la comunidad",
    width: 175,
    height: 210,
    top: "2%",
    right: "42%",
    rotate: 5,
    shape: "squircle",
    mobileOrder: 2,
  },
  {
    src: "/images/person6.png",
    alt: "Miembro de la comunidad",
    width: 160,
    height: 160,
    top: "4%",
    right: "0%",
    rotate: -8,
    shape: "blob",
    mobileOrder: 4,
  },
  {
    src: "/images/person7.png",
    alt: "Miembro de la comunidad",
    width: 170,
    height: 200,
    top: "60%",
    right: "42%",
    rotate: -4,
    shape: "rounded-3xl",
    mobileOrder: 6,
  },
  {
    src: "/images/person8.png",
    alt: "Miembro de la comunidad",
    width: 160,
    height: 160,
    top: "63%",
    right: "0%",
    rotate: 6,
    shape: "rounded-full",
    mobileOrder: 8,
  },
]

function getShapeStyle(shape: ScatteredPhoto["shape"]): React.CSSProperties {
  switch (shape) {
    case "hexagon":
      return { clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }
    case "diamond":
      return { clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }
    case "blob":
      return { clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }
    case "squircle":
      return { borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }
    default:
      return {}
  }
}

function ScatteredPhotoGroup({
  photos,
  side,
}: {
  photos: ScatteredPhoto[]
  side: "left" | "right"
}) {
  const customShapes = ["hexagon", "diamond", "blob", "squircle"]

  return (
    <div className="hidden md:block relative w-[320px] lg:w-[380px] h-[600px] lg:h-[680px] flex-shrink-0">
      {photos.map((photo, i) => {
        const isCustom = customShapes.includes(photo.shape)
        return (
          <div
            key={i}
            className={`absolute overflow-hidden shadow-md ${!isCustom ? photo.shape : ""}`}
            style={{
              width: photo.width,
              height: photo.height,
              top: photo.top,
              ...(side === "left" ? { left: photo.left } : { right: photo.right }),
              transform: `rotate(${photo.rotate}deg)`,
              ...(isCustom ? getShapeStyle(photo.shape) : {}),
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              className="w-full h-full object-cover"
            />
          </div>
        )
      })}
    </div>
  )
}

function TropicalLeaf({
  className,
  rotate = 0,
  flip = false,
}: {
  className?: string
  rotate?: number
  flip?: boolean
}) {
  return (
    <svg
      className={`absolute w-16 h-16 md:w-20 md:h-20 ${className}`}
      style={{
        transform: `rotate(${rotate}deg)${flip ? " scaleX(-1)" : ""}`,
      }}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 8C20 18 5 35 8 52C11 69 28 68 40 52C52 68 69 69 72 52C75 35 60 18 40 8Z"
        fill="#2d8a3e"
        opacity="0.85"
      />
      <path d="M40 8L40 52" stroke="#1d6a2e" strokeWidth="1.5" opacity="0.6" />
      <path d="M40 20C32 26 25 35 24 42" stroke="#1d6a2e" strokeWidth="1" opacity="0.4" />
      <path d="M40 20C48 26 55 35 56 42" stroke="#1d6a2e" strokeWidth="1" opacity="0.4" />
      <path d="M40 32C34 36 28 42 27 48" stroke="#1d6a2e" strokeWidth="1" opacity="0.3" />
      <path d="M40 32C46 36 52 42 53 48" stroke="#1d6a2e" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

export function CommunitySection() {
  return (
    <section className="relative bg-[#f5f5f0] py-16 md:py-24 overflow-hidden">
      {/* Decorative leaves */}
      <TropicalLeaf className="top-6 left-4 md:left-10 opacity-70" rotate={-20} />
      <TropicalLeaf className="top-20 left-0 md:left-4 opacity-50" rotate={15} flip />
      <TropicalLeaf className="bottom-24 right-4 md:right-10 opacity-70" rotate={30} />
      <TropicalLeaf className="bottom-10 right-0 md:right-4 opacity-50" rotate={-10} flip />
      <TropicalLeaf className="top-1/3 right-6 opacity-40" rotate={45} />
      <TropicalLeaf className="bottom-1/3 left-6 opacity-35" rotate={-40} flip />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Heading */}
        <h2 className="text-center text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1a1a1a] mb-10 md:mb-14 leading-snug text-balance">
          La sobriedad pesa menos
          <br />
          cuando no est&aacute;s{" "}
          <span className="relative inline-block">
            <span className="font-serif italic">solo...</span>
            <span
              className="absolute -bottom-1 left-0 w-full h-2 rounded-full"
              style={{ backgroundColor: "#e8a84c" }}
              aria-hidden="true"
            />
          </span>
        </h2>

        {/* Content grid: photos - stamp - photos */}
        <div className="flex items-center justify-center gap-4 md:gap-8 lg:gap-12">
          {/* Left photos */}
          <ScatteredPhotoGroup photos={leftPhotos} side="left" />

          {/* Central stamp card */}
          <div className="relative w-full max-w-[420px] md:max-w-[500px] flex-shrink-0">
            <div
              className="relative bg-[#e8e4de] rounded-sm p-8 md:p-12"
              style={{
                transform: "rotate(-2deg)",
                border: "3px dashed #c4bfb6",
                boxShadow: "4px 6px 16px rgba(0,0,0,0.08)",
              }}
            >
              {/* Stamp perforated edge - top */}
              <div className="absolute -top-1.5 left-4 right-4 flex justify-between">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#f5f5f0]" />
                ))}
              </div>
              {/* Stamp perforated edge - bottom */}
              <div className="absolute -bottom-1.5 left-4 right-4 flex justify-between">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#f5f5f0]" />
                ))}
              </div>
              {/* Stamp perforated edge - left */}
              <div className="absolute -left-1.5 top-4 bottom-4 flex flex-col justify-between">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#f5f5f0]" />
                ))}
              </div>
              {/* Stamp perforated edge - right */}
              <div className="absolute -right-1.5 top-4 bottom-4 flex flex-col justify-between">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#f5f5f0]" />
                ))}
              </div>

              <p className="text-base md:text-lg leading-relaxed text-[#3a3a3a] italic">
                En <strong className="not-italic font-bold text-[#1a1a1a]">NewLife</strong>
                , encuentras personas que te comprenden desde la experiencia:
                gente que tambi&eacute;n est&aacute; fortaleciendo sus decisiones,
                aprendiendo a vivir con m&aacute;s claridad y celebrando contigo cada
                d&iacute;a sin alcohol.{" "}
                <strong className="not-italic font-bold text-[#1a1a1a]">
                  Aqu&iacute; no caminas a solas: caminas acompa&ntilde;ado.
                </strong>
              </p>
            </div>
          </div>

          {/* Right photos */}
          <ScatteredPhotoGroup photos={rightPhotos} side="right" />
        </div>

        {/* Mobile-only scattered photos */}
        <div className="flex md:hidden justify-center items-center gap-3 mt-8 flex-wrap">
          {[...leftPhotos, ...rightPhotos]
            .sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0))
            .slice(0, 6)
            .map((photo, i) => (
              <div
                key={i}
                className={`overflow-hidden shadow-md ${!["hexagon", "diamond", "blob", "squircle"].includes(photo.shape)
                    ? photo.shape
                    : ""
                  }`}
                style={{
                  width: i % 3 === 0 ? 60 : i % 3 === 1 ? 68 : 55,
                  height:
                    photo.shape === "rounded-full"
                      ? i % 3 === 0 ? 60 : 55
                      : i % 3 === 1 ? 80 : 70,
                  transform: `rotate(${photo.rotate}deg)`,
                  ...(["hexagon", "diamond", "blob", "squircle"].includes(photo.shape)
                    ? getShapeStyle(photo.shape)
                    : {}),
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={70}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}
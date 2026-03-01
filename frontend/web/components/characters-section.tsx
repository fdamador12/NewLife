import Image from "next/image"

function GrassSVG() {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full h-32 md:h-48"
      viewBox="0 0 1200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {/* Base grass hill */}
      <path
        d="M0 120C100 100 200 80 400 90C600 100 800 70 1000 85C1100 90 1200 100 1200 100V200H0V120Z"
        fill="#4a9a3a"
      />
      <path
        d="M0 140C150 125 300 110 500 120C700 130 900 105 1200 125V200H0V140Z"
        fill="#3d8a2e"
      />
      {/* Grass blades */}
      <path d="M80 120C78 95 72 70 68 55C72 72 85 95 82 120Z" fill="#5aaa48" />
      <path d="M100 118C102 88 110 65 115 50C112 68 98 92 100 118Z" fill="#4a9a3a" />
      <path d="M250 100C248 75 242 50 238 35C242 52 255 78 252 100Z" fill="#6bba58" />
      <path d="M280 95C285 65 295 42 302 28C297 45 283 72 280 95Z" fill="#5aaa48" />
      <path d="M500 110C498 82 490 58 485 42C490 58 505 85 502 110Z" fill="#4a9a3a" />
      <path d="M530 105C535 78 545 55 552 40C547 58 532 82 530 105Z" fill="#6bba58" />
      <path d="M750 90C748 62 740 38 735 22C740 38 755 68 752 90Z" fill="#5aaa48" />
      <path d="M780 88C785 58 795 35 802 20C797 38 782 65 780 88Z" fill="#4a9a3a" />
      <path d="M1000 95C998 68 990 42 985 28C990 42 1005 72 1002 95Z" fill="#6bba58" />
      <path d="M1050 90C1055 60 1065 38 1072 22C1067 40 1052 68 1050 90Z" fill="#5aaa48" />
      {/* Small flowers/plants */}
      <circle cx="180" cy="108" r="4" fill="#e8a84c" />
      <circle cx="420" cy="100" r="3" fill="#d4854a" />
      <circle cx="650" cy="95" r="4" fill="#c9a0dc" />
      <circle cx="900" cy="92" r="3" fill="#e8a84c" />
      <circle cx="1120" cy="98" r="3.5" fill="#f0a0b0" />
    </svg>
  )
}

export function CharactersSection() {
  return (
    <section className="relative bg-[#f5f0eb] pt-16 md:pt-24 pb-32 md:pb-48 overflow-hidden">
      <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-12 flex flex-col items-center">
        {/* Characters illustration centrada */}
        <div className="relative w-full mx-auto">
          <Image
            src="/images/characters.png"
            alt="Personajes de NewLife - semilla, flores, arbol y brotes que representan tu crecimiento"
            width={1200}
            height={600}
            className="w-full h-auto object-contain relative z-10"
            priority
          />
        </div>
      </div>

      {/* Grass at bottom */}
      <GrassSVG />
    </section>
  )
}

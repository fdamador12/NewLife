function LeavesSVGTopLeft() {
  return (
    <svg
      className="absolute top-0 left-0 w-48 md:w-64 lg:w-80 h-auto z-10"
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main branch */}
      <path
        d="M-10 -10C40 40 80 100 100 180C110 220 90 260 60 300"
        stroke="#5a3825"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 -10C50 30 70 80 80 130"
        stroke="#5a3825"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Curling vine */}
      <path
        d="M100 180C120 170 140 185 135 200C130 215 110 210 115 195"
        stroke="#6b7a3a"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M60 300C75 290 95 295 90 310"
        stroke="#6b7a3a"
        strokeWidth="2"
        fill="none"
      />
      {/* Large leaf 1 */}
      <path
        d="M20 40C10 20 -20 10 -30 30C-40 50 -10 60 10 50C30 40 20 40 20 40Z"
        fill="#3d7a2e"
      />
      <path d="M20 40C0 30 -20 25 -30 30" stroke="#2d5a20" strokeWidth="1.5" fill="none" />
      {/* Large leaf 2 */}
      <path
        d="M50 80C30 60 10 50 -10 60C-20 80 10 100 30 90C50 80 50 80 50 80Z"
        fill="#4a8a38"
      />
      <path d="M50 80C25 70 5 65 -10 60" stroke="#2d5a20" strokeWidth="1.5" fill="none" />
      {/* Monstera-style leaf */}
      <path
        d="M80 130C60 100 30 90 10 100C-5 115 15 145 45 140C60 138 70 130 80 130Z"
        fill="#3d7a2e"
      />
      <path d="M80 130C50 115 25 108 10 100" stroke="#2d5a20" strokeWidth="1.5" fill="none" />
      {/* Small leaves */}
      <path
        d="M95 170C85 155 70 150 65 160C60 170 75 180 85 175Z"
        fill="#5a9a48"
      />
      <path
        d="M35 120C25 105 10 100 5 110C0 120 15 130 25 125Z"
        fill="#5a9a48"
      />
      {/* Top horizontal branch */}
      <path
        d="M-10 5C50 0 120 10 180 -5"
        stroke="#5a3825"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Leaves on top branch */}
      <path
        d="M80 -5C75 -25 90 -35 100 -20C110 -5 95 5 80 -5Z"
        fill="#4a8a38"
      />
      <path
        d="M140 0C135 -20 150 -30 160 -15C170 0 155 10 140 0Z"
        fill="#3d7a2e"
      />
      <path
        d="M120 5C125 25 115 35 105 22C95 10 108 0 120 5Z"
        fill="#5a9a48"
      />
    </svg>
  )
}

function VinesSVGTopRight() {
  return (
    <svg
      className="absolute top-0 right-0 w-40 md:w-56 lg:w-72 h-auto z-10"
      viewBox="0 0 288 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main branch from right */}
      <path
        d="M298 -5C250 10 200 30 170 60C140 90 150 110 180 100"
        stroke="#5a3825"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Secondary branch */}
      <path
        d="M298 15C260 25 230 50 220 80"
        stroke="#5a3825"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Curling tendrils */}
      <path
        d="M170 60C160 55 150 60 155 70C160 80 170 75 168 65"
        stroke="#6b7a3a"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M220 80C215 85 210 95 218 100C226 105 228 92 222 88"
        stroke="#6b7a3a"
        strokeWidth="2"
        fill="none"
      />
      {/* Small leaves */}
      <path
        d="M240 30C250 15 265 10 270 25C275 40 260 40 240 30Z"
        fill="#4a8a38"
      />
      <path
        d="M200 55C210 40 225 38 225 52C225 66 210 62 200 55Z"
        fill="#3d7a2e"
      />
      <path
        d="M230 70C240 58 250 55 252 68C254 80 242 78 230 70Z"
        fill="#5a9a48"
      />
      {/* Hanging vine */}
      <path
        d="M250 40C245 60 240 90 250 120C255 135 248 150 240 145"
        stroke="#5a3825"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M250 120C258 115 262 125 255 130"
        stroke="#6b7a3a"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}

function PlantsSVGBottom() {
  return (
    <svg
      className="absolute bottom-16 left-4 md:left-8 w-36 md:w-48 lg:w-56 h-auto z-10"
      viewBox="0 0 220 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tall leaf */}
      <path
        d="M60 200C55 150 40 100 30 70C20 40 35 20 50 40C65 60 70 120 60 200Z"
        fill="#3d7a2e"
      />
      <path d="M60 200C58 140 45 90 30 70" stroke="#2d5a20" strokeWidth="2" fill="none" />
      {/* Medium leaf */}
      <path
        d="M90 200C85 160 70 120 55 100C40 80 50 65 65 80C80 95 95 140 90 200Z"
        fill="#4a8a38"
      />
      <path d="M90 200C88 155 75 115 55 100" stroke="#2d5a20" strokeWidth="1.5" fill="none" />
      {/* Right leaf */}
      <path
        d="M120 200C125 155 140 120 155 100C170 80 165 60 148 75C130 90 118 140 120 200Z"
        fill="#5a9a48"
      />
      <path d="M120 200C122 155 135 115 155 100" stroke="#3d7a2e" strokeWidth="1.5" fill="none" />
      {/* Small grass blades */}
      <path
        d="M30 200C28 175 20 155 15 150C10 145 12 155 18 170C24 185 30 200 30 200Z"
        fill="#6ba858"
      />
      <path
        d="M150 200C155 170 170 145 178 140C186 135 180 150 170 170C160 190 150 200 150 200Z"
        fill="#6ba858"
      />
      {/* Sprout */}
      <path
        d="M180 200C178 185 175 170 180 160C185 150 195 155 190 170C185 185 180 200 180 200Z"
        fill="#7cba68"
      />
    </svg>
  )
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#c97a3e] via-[#d4854a] to-[#e8a265]">
      {/* Decorative elements */}
      <LeavesSVGTopLeft />
      <VinesSVGTopRight />
      <PlantsSVGBottom />

      {/* Main content */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 pt-32 pb-20 md:pt-40 md:pb-28 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left column - Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-block mb-6">
              <span className="inline-block rounded-full border border-[#ffffff]/30 bg-[#ffffff]/10 px-5 py-2.5 text-sm text-[#ffffff] backdrop-blur-sm">
                {'"Tu compañero hacia una vida sin alcohol"'}
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-[#ffffff] mb-6 text-balance">
              {'Haz '}
              <span className="font-serif italic text-[#fff3c4]">
                {'"florecer"'}
              </span>
              <br />
              {'¡tu cambio!'}
              <br />
              {'con '}
              <span className="font-black">NewLife</span>
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg leading-relaxed text-[#ffffff]/90 max-w-md mx-auto lg:mx-0 mb-8 text-pretty">
              Acompaña tu sobriedad con retos, reflexiones y autocuidado.
              Registra tu progreso y conéctate con una comunidad que te
              entiende.
            </p>

            {/* Login button */}
            <button className="inline-flex items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-[#ffffff] px-10 py-3.5 text-base font-semibold text-[#1a1a1a] transition-all hover:bg-[#1a1a1a] hover:text-[#ffffff] hover:shadow-lg">
              Login
            </button>
          </div>

          {/* Right column - Phone mockup */}
          <div className="relative flex-shrink-0 flex items-end justify-center self-end -mb-24">
            <img
              src="/images/phone-mockup.png"
              alt="NewLife App"
              className="h-[700px] w-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade to dark section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#2d2d2d] to-transparent z-30" />
    </section>
  )
}

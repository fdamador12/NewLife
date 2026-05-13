// components/cta-section.tsx
// Solo Google Play — la app es exclusivamente Android

import Image from "next/image"

function PhoneMockupAchievement() {
  return (
    <div className="relative w-[240px] md:w-[270px]">
      <Image
        src="/phone.png"
        alt="App preview"
        width={270}
        height={550}
        className="w-full h-auto"
        priority
      />
    </div>
  )
}

export function CTASection() {
  return (
    <section className="relative bg-[#c97b3f] overflow-hidden">

      <div className="max-w-6xl mx-auto px-6 pt-16 md:pt-24">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

          {/* Text + buttons */}
          <div className="flex-1 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#ffffff] leading-tight mb-10 text-balance">
              {"¡Haz florecer tu siguiente logro!"}
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">

              {/* Google Play button — único botón disponible */}
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-[#ffffff] rounded-xl text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors shadow-md"
              >
                <svg width="22" height="24" viewBox="0 0 22 24" fill="currentColor">
                  <path d="M1.22.557L12.9 12.001 1.22 23.445c-.43-.404-.72-1.006-.72-1.695V2.252C.5 1.563.79.961 1.22.557zm13.3 13.063l2.92 2.92-9.88 5.63 6.96-8.55zm2.92-5.54l-2.92 2.92-6.96-8.55 9.88 5.63zm1.68.95L22 10.88c.65.37 1 .94 1 1.56s-.35 1.19-1 1.56l-2.88 1.65-3.2-3.21 3.2-3.21z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-[#737373] leading-none">
                    Descargar en
                  </div>
                  <div className="text-base font-semibold leading-tight">
                    Google Play
                  </div>
                </div>
              </a>

            </div>
          </div>

          {/* Phone image */}
          <div className="flex-shrink-0 self-end">
            <Image
              src="/images/phone.png"
              alt="NewLife App"
              width={270}
              height={540}
              className="w-[240px] md:w-[270px] h-auto object-contain drop-shadow-2xl"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
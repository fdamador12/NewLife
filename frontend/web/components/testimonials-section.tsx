"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    quote:
      '"No me siento solo en este proceso de dejar el alcohol. Me ayuda a seguir adelante un día a la vez."',
    author: "PatoLoco",
    avatar: "/images/avatar1.jpg",
  },
  {
    id: 2,
    quote:
      '"NewLife me dio estructura en mis días más difíciles. Los retos diarios me mantienen motivado."',
    author: "MaríaFuerte",
    avatar: "/images/avatar2.jpg",
  },
  {
    id: 3,
    quote:
      '"La comunidad es increíble. Saber que otros están pasando por lo mismo me da fuerzas."',
    author: "CarlosNuevo",
    avatar: "/images/avatar1.jpg",
  },
  {
    id: 4,
    quote:
      '"Llevo 90 días sin alcohol gracias a esta app. Las reflexiones diarias cambiaron mi perspectiva."',
    author: "LuzEsperanza",
    avatar: "/images/avatar2.jpg",
  },
  {
    id: 5,
    quote:
      '"Mi familia nota el cambio. NewLife me acompañó cuando más lo necesitaba."',
    author: "PedroVida",
    avatar: "/images/avatar1.jpg",
  },
  {
    id: 6,
    quote:
      '"Cada día es un logro. La app me recuerda por qué empecé este camino."',
    author: "AnaRenacer",
    avatar: "/images/avatar2.jpg",
  },
]

export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    slidesToScroll: 1,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  return (
    <section className="relative bg-[#2d2d2d] py-16 md:py-24 overflow-hidden">
      {/* Subtle background leaf watermark */}
      <div className="absolute inset-0 opacity-5">
        <svg
          viewBox="0 0 800 400"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M200 350C200 350 250 200 400 150C550 100 600 50 600 50"
            stroke="#ffffff"
            strokeWidth="40"
            strokeLinecap="round"
          />
          <path
            d="M300 380C300 380 320 280 420 230C520 180 560 120 560 120"
            stroke="#ffffff"
            strokeWidth="30"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Stars */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-6 h-6 fill-[#e8a84c] text-[#e8a84c]" />
          ))}
        </div>

        {/* Heading */}
        <h2 className="text-center text-2xl md:text-3xl font-bold text-[#ffffff] mb-12">
          {"Historias que "}
          <span className="font-serif italic text-[#ffffff]">florecen</span>
          {" con NewLife"}
        </h2>

        {/* Carousel con fade en extremos */}
        <div
          className="relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
          }}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 px-[2%]">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-none w-[85%] md:w-[45%] lg:w-[32%]"
                >
                  <div className="rounded-2xl border border-[#4a4a4a] bg-[#3a3a3a] p-6 md:p-8 h-[160px] flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.avatar}
                        alt={`Avatar de ${testimonial.author}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base leading-relaxed text-[#d4d4d4] mb-3 line-clamp-3">
                        {testimonial.quote}
                      </p>
                      <p className="text-sm font-semibold text-[#a3a3a3]">
                        {testimonial.author}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Ir al testimonio ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all ${selectedIndex === i
                ? "bg-[#ffffff] w-3 h-3"
                : "bg-[#6b6b6b] hover:bg-[#8b8b8b]"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
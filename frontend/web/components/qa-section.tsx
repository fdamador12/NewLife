"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question:
      "¿Qué hace que NewLife sea diferente de otras aplicaciones de sobriedad?",
    answer:
      "NewLife combina el seguimiento de tu progreso con una comunidad real que te entiende. Además, incluye herramientas únicas como el modo SOS, zonas seguras con mapa, y un sistema de evolución de tu semilla que refleja tu crecimiento personal.",
  },
  {
    question: "¿Puedo usar NewLife si aún estoy empezando mi proceso?",
    answer:
      "Por supuesto. NewLife está diseñada para acompañarte desde el primer día. No importa en qué etapa te encuentres, la app se adapta a tu ritmo y te ofrece recursos para cada momento de tu camino.",
  },
  {
    question: "¿Qué pasa si tengo una recaída?",
    answer:
      "Una recaída no es el final, es parte del proceso. En NewLife encontrarás apoyo inmediato, mensajes de aliento de la comunidad y herramientas para retomar tu camino sin culpa ni juicio.",
  },
  {
    question: "¿Cómo me ayuda el botón SOS?",
    answer:
      "El botón SOS activa un modo de emergencia con respiraciones guiadas, contactos de apoyo predefinidos y mensajes motivacionales para ayudarte a superar momentos de urgencia o tentación.",
  },
]

function TropicalLeafDecor({
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
      className={`absolute w-14 h-14 md:w-20 md:h-20 ${className}`}
      style={{
        transform: `rotate(${rotate}deg)${flip ? " scaleX(-1)" : ""}`,
      }}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 5C15 20 5 40 10 55C15 70 30 65 40 50C50 65 65 70 70 55C75 40 65 20 40 5Z"
        fill="#2d8a3e"
        opacity="0.8"
      />
      <path d="M40 5L40 50" stroke="#1d6a2e" strokeWidth="1.5" opacity="0.5" />
      <path
        d="M40 18C32 24 22 34 20 42"
        stroke="#1d6a2e"
        strokeWidth="1"
        opacity="0.3"
      />
      <path
        d="M40 18C48 24 58 34 60 42"
        stroke="#1d6a2e"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  )
}

export function QASection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative bg-[#f5f5f0] pt-6 pb-20 md:pb-28 overflow-hidden">
      {/* Decorative leaves */}
      <TropicalLeafDecor className="top-8 right-4 md:right-16 opacity-60" rotate={25} />
      <TropicalLeafDecor className="top-36 right-0 md:right-8 opacity-45" rotate={-15} flip />
      <TropicalLeafDecor className="bottom-28 right-6 md:right-12 opacity-55" rotate={40} />
      <TropicalLeafDecor className="bottom-12 left-4 md:left-10 opacity-40" rotate={-30} />

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        {/* Heading */}
        <h2 className="text-center text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-10">
          {"Q&A"}
        </h2>

        {/* FAQ Items */}
        <div className="rounded-2xl border border-[#e0ddd6] bg-[#ffffff] overflow-hidden">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-8 py-6 text-left transition-colors hover:bg-[#fafaf7]"
                aria-expanded={openIndex === index}
              >
                <span className="text-base md:text-lg font-medium text-[#1a1a1a] leading-snug">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 flex-shrink-0 text-[#737373] transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Answer panel */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                  }`}
              >
                <div className="px-8 pb-6 text-base leading-relaxed text-[#555555]">
                  {faq.answer}
                </div>
              </div>

              {/* Divider */}
              {index < faqs.length - 1 && (
                <div className="mx-8 border-t border-[#e8e5de]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

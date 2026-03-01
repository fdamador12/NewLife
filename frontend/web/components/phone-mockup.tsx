import Image from "next/image"

export function PhoneMockup() {
  return (
    <div className="relative w-[280px] md:w-[300px]">
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-[8px] border-[#1a1a1a] bg-[#f5f0eb] shadow-2xl overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 bg-[#f5f0eb]">
          <span className="text-xs font-semibold text-[#1a1a1a]">9:41</span>
          <div className="flex items-center gap-1">
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              className="text-[#1a1a1a]"
            >
              <rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor" />
              <rect x="4" y="5" width="3" height="7" rx="0.5" fill="currentColor" />
              <rect x="8" y="2" width="3" height="10" rx="0.5" fill="currentColor" />
              <rect x="12" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
            </svg>
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              className="text-[#1a1a1a]"
            >
              <path
                d="M8 3C10.7 3 13.1 4.2 14.7 6.1L16 4.8C14 2.5 11.2 1 8 1C4.8 1 2 2.5 0 4.8L1.3 6.1C2.9 4.2 5.3 3 8 3Z"
                fill="currentColor"
              />
              <path
                d="M8 7C9.6 7 11 7.6 12 8.6L13.3 7.3C11.9 5.9 10 5 8 5C6 5 4.1 5.9 2.7 7.3L4 8.6C5 7.6 6.4 7 8 7Z"
                fill="currentColor"
              />
              <circle cx="8" cy="11" r="1.5" fill="currentColor" />
            </svg>
            <svg
              width="24"
              height="12"
              viewBox="0 0 24 12"
              fill="none"
              className="text-[#1a1a1a]"
            >
              <rect
                x="0"
                y="1"
                width="20"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <rect x="2" y="3" width="14" height="6" rx="1" fill="currentColor" />
              <rect x="21" y="4" width="2" height="4" rx="0.5" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* App content */}
        <div className="flex flex-col items-center px-8 pb-10 pt-6 bg-[#f5f0eb]">
          {/* Mascot */}
          <div className="relative w-36 h-36 mb-6">
            <Image
              src="/images/mascot.jpg"
              alt="NewLife mascot - a friendly seed character"
              fill
              className="object-contain rounded-full"
            />
          </div>

          {/* App name */}
          <h3 className="text-xl font-sans mb-8 text-[#1a1a1a]">
            <span className="font-bold">New</span>{" "}
            <span className="font-light">Life</span>
          </h3>

          {/* Buttons */}
          <button className="w-full py-3 rounded-xl bg-[#3a3a3a] text-[#ffffff] font-medium text-sm mb-3 hover:bg-[#2d2d2d] transition-colors">
            Entrar
          </button>
          <button className="w-full py-3 rounded-xl border-2 border-[#3a3a3a] text-[#3a3a3a] font-medium text-sm bg-transparent hover:bg-[#3a3a3a]/5 transition-colors">
            Registrarse
          </button>
        </div>
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#1a1a1a] rounded-full" />
    </div>
  )
}

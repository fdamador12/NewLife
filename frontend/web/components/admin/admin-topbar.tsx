"use client"

import { usePathname } from "next/navigation"

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/usuarios": "Gestión de Usuarios",
  "/admin/comunidades": "Comunidades",
  "/admin/solicitudes-baneo": "Solicitudes de Baneo",
}

export function AdminTopbar() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Panel de Administración"

  return (
    <header className="h-16 bg-white border-b border-[#e5e5e5] flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-[#1a1a1a]">{title}</h1>
    </header>
  )
}
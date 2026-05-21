"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/usuarios": "Gestión de Usuarios",
  "/admin/comunidades": "Comunidades",
  "/admin/solicitudes-baneo": "Solicitudes de Baneo",
}

const pageActions: Record<string, { label: string; onClick?: () => void }> = {
  "/admin/comunidades": { label: "Nueva comunidad" },
}

interface AdminTopbarProps {
  onAction?: () => void
}

export function AdminTopbar({ onAction }: AdminTopbarProps) {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Panel de Administración"
  const action = pageActions[pathname]

  return (
    <header className="h-16 bg-white border-b border-[#e5e5e5] flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-[#1a1a1a]">{title}</h1>
      
      {action && (
        <Button
          onClick={onAction}
          className="bg-[#d4854a] hover:bg-[#c07842] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </Button>
      )}
    </header>
  )
}
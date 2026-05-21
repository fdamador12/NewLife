"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Leaf, 
  LayoutDashboard, 
  Users, 
  Building2, 
  AlertTriangle, 
  BookOpen,
  LogOut,
  ChevronRight,
  HeartHandshake,
  Trophy,
  Quote,
  MessageSquare,
  Activity
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/AuthContext"

const navigation = [
  {
    title: "General",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Gestión",
    items: [
      { name: "Usuarios", href: "/admin/usuarios", icon: Users },
      { name: "Comunidades", href: "/admin/comunidades", icon: Building2 },
      { name: "Sol. de baneo", href: "/admin/solicitudes-baneo", icon: AlertTriangle, badge: 3 }, // Ojo: Aquí puedes conectar este 3 dinámicamente luego
      { name: "Foros del día", href: "/admin/foros", icon: MessageSquare },
      { name: "Métricas de uso", href: "/admin/metricas", icon: Activity },
    ],
  },
  {
    title: "Motivación",
    items: [
      { name: "Frases del día", href: "/admin/frases", icon: Quote },
      { name: "Retos", href: "/admin/retos", icon: Trophy },
    ],
  },
  {
    title: "Cuidado",
    items: [
      { name: "Grupos de apoyo", href: "/admin/grupos-apoyo", icon: HeartHandshake },
      { name: "Contenido educativo", href: "/admin/contenido", icon: BookOpen },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Iniciales del nombre para el avatar
  const initials = user?.nombre
    ? user.nombre.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "AD"

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-[#e5e5e5] flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d4854a] flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-[#1a1a1a] block">NewLife</span>
            <span className="text-xs text-[#737373]">Panel de administración</span>
          </div>
        </Link>
      </div>

      <Separator className="bg-[#e5e5e5]" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {navigation.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-3 px-3">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                        isActive
                          ? "bg-[#d4854a] text-white"
                          : "text-[#525252] hover:bg-[#f8f6f3] hover:text-[#1a1a1a]"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActive ? "text-white" : "text-[#a3a3a3] group-hover:text-[#d4854a]"
                      )} />
                      <span className="flex-1">{item.name}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge className="bg-[#e8a84c] text-[#1a1a1a] text-xs px-2 py-0.5 font-semibold">
                          {item.badge}
                        </Badge>
                      )}
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <Separator className="bg-[#e5e5e5]" />

      {/* User section */}
      <div className="p-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#f8f6f3]">
          <div className="w-9 h-9 rounded-full bg-[#d4854a] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1a1a1a] truncate">
              {user?.nombre || "Admin"}
            </p>
            <p className="text-xs text-[#a3a3a3] truncate">
              {user?.email || ""}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full mt-3 text-[#737373] hover:text-[#1a1a1a] hover:bg-[#f8f6f3] justify-start gap-3"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
import {
  LayoutDashboard,
  Users,
  CalendarRange,
  Calendar,
  Gift,
  BarChart3,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Membros", href: "/membros", icon: Users },
  { title: "Escalas", href: "/escalas", icon: CalendarRange },
  { title: "Eventos", href: "/eventos", icon: Calendar },
  { title: "Aniversariantes", href: "/aniversariantes", icon: Gift },
  { title: "Relatórios", href: "/relatorios", icon: BarChart3 },
]

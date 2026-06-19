"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mainNavItems } from "@/constants/navigation"
import { Cross as CrossIcon } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-card/80 backdrop-blur-sm z-40">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
          <CrossIcon className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight">Ministerio+</span>
      </div>
      <div className="mx-4 h-px bg-border" />
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "active:scale-[0.98]",
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
              {item.title}
            </Link>
          )
        })}
      </nav>
      <div className="mx-4 h-px bg-border" />
      <div className="p-4">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3 text-center">
          <p className="text-xs font-medium text-primary">Ministerio+</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}

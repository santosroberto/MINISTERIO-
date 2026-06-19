"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mainNavItems } from "@/constants/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Cross as CrossIcon } from "lucide-react"

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="px-6 pt-5 pb-2">
          <SheetTitle className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
              <CrossIcon className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Ministerio+</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
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
        <div className="p-4 border-t">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3 text-center">
            <p className="text-xs font-medium text-primary">Ministerio+ v1.0.0</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

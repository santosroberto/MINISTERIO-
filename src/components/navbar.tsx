"use client"

import { useTheme } from "next-themes"
import { Menu, Moon, Sun, Bell, Cross as CrossIcon, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSyncExternalStore } from "react"
import { useAuth } from "@/auth/auth-context"
import { useRouter } from "next/navigation"

interface NavbarProps {
  onMenuClick: () => void
}

function getIsClient() {
  return typeof window !== "undefined"
}

function subscribe() {
  return () => {}
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const mounted = useSyncExternalStore(subscribe, getIsClient, () => false)

  async function handleSignOut() {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick} title="Abrir menu" aria-label="Abrir menu">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
          <CrossIcon className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">Ministerio+</span>
      </div>

      <div className="flex-1" />

      <Button variant="ghost" size="icon" className="relative transition-transform hover:scale-110" title="Notificações" aria-label="Notificações">
        <Bell className="h-5 w-5" />
      </Button>

      {mounted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="transition-transform hover:scale-110"
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <Avatar fallback={user?.email?.charAt(0).toUpperCase() || "U"} className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all duration-200 hover:ring-primary" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 animate-scale-in">
          <DropdownMenuLabel>
            <div className="truncate">{user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-not-allowed opacity-50">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

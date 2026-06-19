"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  useEffect(() => {
    supabaseRef.current = createClient()
    const supabase = supabaseRef.current

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case "SIGNED_IN":
          logger.info("Usuário fez login", "Auth", {
            userId: session?.user?.id,
            email: session?.user?.email,
          })
          break
        case "SIGNED_OUT":
          logger.info("Usuário fez logout", "Auth")
          break
        case "TOKEN_REFRESHED":
          logger.debug("Token de sessão renovado", "Auth")
          break
        case "USER_UPDATED":
          logger.info("Dados do usuário atualizados", "Auth", {
            userId: session?.user?.id,
          })
          break
        case "INITIAL_SESSION":
          logger.debug("Sessão inicial carregada", "Auth", {
            hasSession: !!session,
          })
          break
      }
      setUser(session?.user ?? null)
      setLoading(false)
    })

    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        logger.warn("Falha ao recuperar sessão do usuário", "Auth", {
          error: error.message,
        })
      }
      setUser(user)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function refreshUser() {
    const supabase = supabaseRef.current
    if (!supabase) {
      logger.warn("refreshUser chamado sem cliente Supabase", "Auth")
      return
    }
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      logger.error("Erro ao recarregar usuário", "Auth", { error: error.message })
    }
    setUser(user)
  }

  async function signOut() {
    logger.info("Iniciando logout", "Auth")
    try {
      await supabaseRef.current!.auth.signOut()
      setUser(null)
      logger.info("Logout concluído", "Auth")
    } catch (err) {
      logger.error("Erro ao fazer logout", "Auth", {
        error: err instanceof Error ? err.message : "Erro desconhecido",
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

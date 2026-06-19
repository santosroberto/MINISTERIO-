"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
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
  const initialSession = useRef<Session | null>(null)

  useEffect(() => {
    supabaseRef.current = createClient()
    const supabase = supabaseRef.current

    supabase.auth.getSession().then(({ data: { session } }) => {
      initialSession.current = session
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return

      switch (event) {
        case "SIGNED_IN":
          if (session?.user?.id === initialSession.current?.user?.id) return
          logger.info("Usuário fez login", "Auth", {
            userId: session?.user?.id,
            email: session?.user?.email,
          })
          break
        case "SIGNED_OUT":
          logger.info("Usuário fez logout", "Auth")
          break
        case "TOKEN_REFRESHED":
          return
        case "USER_UPDATED":
          logger.info("Dados do usuário atualizados", "Auth", {
            userId: session?.user?.id,
          })
          break
      }
      setUser(session?.user ?? null)
      setLoading(false)
      initialSession.current = session
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function refreshUser() {
    const supabase = supabaseRef.current
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
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

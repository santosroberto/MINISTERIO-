"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cross, Loader2, Eye, EyeOff, ArrowLeft, Mail } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login")
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMode("login")
        setError("Conta criada! Verifique seu email para confirmar.")
        return
      }

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        })
        if (error) throw error
        setError("Email de recuperação enviado! Verifique sua caixa de entrada.")
        setMode("login")
        return
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const redirectTo = searchParams.get("redirectTo") || "/dashboard"
      router.push(redirectTo)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao autenticar"

      if (message.includes("Email not confirmed")) {
        setError("Email não confirmado. Verifique sua caixa de entrada.")
      } else if (message.includes("Invalid login credentials")) {
        setError("Email ou senha incorretos.")
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
              <Cross className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Ministerio+</CardTitle>
          <CardDescription>
            {mode === "login" && "Faça login para continuar"}
            {mode === "register" && "Crie sua conta"}
            {mode === "forgot" && "Recuperar senha"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Esconder senha" : "Mostrar senha"}
                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary hover:underline"
                  onClick={() => { setMode("forgot"); setError("") }}
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {error && (
              <p className={`text-sm text-center ${error.includes("criada") || error.includes("enviado") ? "text-emerald-600" : "text-destructive"}`}>
                {error}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" && "Entrar"}
              {mode === "register" && "Criar conta"}
              {mode === "forgot" && (
                <>
                  <Mail className="h-4 w-4" />
                  Enviar recuperação
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              {mode === "login" && (
                <p>
                  Não tem conta?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => { setMode("register"); setError("") }}
                  >
                    Cadastre-se
                  </button>
                </p>
              )}
              {mode === "register" && (
                <p>
                  Já tem conta?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => { setMode("login"); setError("") }}
                  >
                    Faça login
                  </button>
                </p>
              )}
              {mode === "forgot" && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  onClick={() => { setMode("login"); setError("") }}
                >
                  <ArrowLeft className="h-3 w-3" />
                  Voltar ao login
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

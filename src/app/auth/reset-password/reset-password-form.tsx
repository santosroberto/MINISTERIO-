"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Eye, EyeOff, KeyRound } from "lucide-react"

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef<SupabaseClient>(createClient())

  useEffect(() => {
    supabaseRef.current.auth.getUser().then(({ data: { user }, error }) => {
      if (user && !error) {
        setReady(true)
      } else {
        setError("Link inválido ou expirado. Solicite uma nova recuperação.")
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Senhas não conferem.")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres.")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabaseRef.current.auth.updateUser({ password })
      if (error) throw error

      setSuccess(true)
      setTimeout(() => router.push("/dashboard"), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir senha")
    } finally {
      setLoading(false)
    }
  }

  if (!ready && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
              <KeyRound className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Redefinir senha</CardTitle>
          <CardDescription>
            {success ? "Senha redefinida com sucesso!" : "Digite sua nova senha"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-emerald-600 font-medium">Sua senha foi redefinida com sucesso.</p>
              <p className="text-sm text-muted-foreground">Redirecionando para o dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-center text-destructive">{error}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Redefinir senha
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { escalaSchema, type EscalaSchemaType } from "@/lib/schemas"
import { scheduleService } from "@/services/schedule-service"
import { memberService } from "@/services/member-service"
import { Escala, Membro } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { MINISTERIOS } from "@/constants"

const ministerioOptions = MINISTERIOS.map((m) => ({ value: m, label: m }))

interface EscalaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  escala?: Escala | null
  onSuccess: () => void
}

export function EscalaForm({ open, onOpenChange, escala, onSuccess }: EscalaFormProps) {
  const [loading, setLoading] = useState(false)
  const [membros, setMembros] = useState<Membro[]>([])
  const [selectedMembros, setSelectedMembros] = useState<string[]>([])
  const [membroSearch, setMembroSearch] = useState("")
  const isEditing = !!escala

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EscalaSchemaType>({
    resolver: zodResolver(escalaSchema),
    defaultValues: {
      ministerio: "",
      data: "",
      horaInicio: "",
      horaFim: "",
      responsaveis: [],
      observacoes: "",
    },
  })

  useEffect(() => {
    if (!open) return
    memberService.list().then(setMembros).catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open) return
    if (escala) {
      setSelectedMembros(escala.responsaveis)
      reset({
        ministerio: escala.ministerio,
        data: escala.data,
        horaInicio: escala.horaInicio,
        horaFim: escala.horaFim,
        responsaveis: escala.responsaveis,
        observacoes: escala.observacoes,
      })
    } else {
      setSelectedMembros([])
      reset({
        ministerio: "",
        data: "",
        horaInicio: "",
        horaFim: "",
        responsaveis: [],
        observacoes: "",
      })
    }
  }, [open, escala, reset])

  function toggleMembro(id: string) {
    setSelectedMembros((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const filteredMembros = membros.filter(
    (m) =>
      m.nome.toLowerCase().includes(membroSearch.toLowerCase()) ||
      m.ministerio.toLowerCase().includes(membroSearch.toLowerCase())
  )

  const onSubmit = async (data: EscalaSchemaType) => {
    if (selectedMembros.length === 0) {
      toast.error("Selecione pelo menos um responsável")
      return
    }
    setLoading(true)
    try {
      const payload = { ...data, responsaveis: selectedMembros }
      if (isEditing && escala) {
        await scheduleService.update(escala.id, payload)
        toast.success("Escala atualizada com sucesso!")
      } else {
        await scheduleService.create(payload)
        toast.success("Escala criada com sucesso!")
      }
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error("Erro ao salvar escala. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Escala" : "Nova Escala"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da escala abaixo."
              : "Preencha os dados para criar uma nova escala."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ministerio">Ministério</Label>
                <Select id="ministerio" options={ministerioOptions} placeholder="Selecione..." {...register("ministerio")} />
                {errors.ministerio && (
                  <p className="text-xs text-destructive">{errors.ministerio.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input id="data" type="date" {...register("data")} />
                {errors.data && (
                  <p className="text-xs text-destructive">{errors.data.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Horário de início</Label>
                <Input id="horaInicio" type="time" {...register("horaInicio")} />
                {errors.horaInicio && (
                  <p className="text-xs text-destructive">{errors.horaInicio.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaFim">Horário de fim</Label>
                <Input id="horaFim" type="time" {...register("horaFim")} />
                {errors.horaFim && (
                  <p className="text-xs text-destructive">{errors.horaFim.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Responsáveis</Label>
              {selectedMembros.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedMembros.map((id) => {
                    const m = membros.find((m) => m.id === id)
                    return m ? (
                      <Badge key={id} variant="secondary" className="gap-1 pr-1">
                        {m.nome}
                        <button type="button" onClick={() => toggleMembro(id)} className="ml-1 hover:text-destructive" title="Remover responsável" aria-label="Remover responsável">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
              <Input
                placeholder="Buscar membros..."
                value={membroSearch}
                onChange={(e) => setMembroSearch(e.target.value)}
              />
              <div className="max-h-32 overflow-y-auto border rounded-md divide-y">
                {filteredMembros.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2">Nenhum membro encontrado.</p>
                ) : (
                  filteredMembros.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent ${
                        selectedMembros.includes(m.id) ? "bg-accent" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembros.includes(m.id)}
                        onChange={() => toggleMembro(m.id)}
                        className="rounded"
                      />
                      <span>{m.nome}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{m.ministerio}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                {...register("observacoes")}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Criar escala"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { eventoSchema, type EventoSchemaType } from "@/lib/schemas"
import { eventService } from "@/services/event-service"
import { Evento, EventoFormData } from "@/types"
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
import { Loader2 } from "lucide-react"

const categoriaOptions = [
  { value: "culto_especial", label: "Culto Especial" },
  { value: "conferencia", label: "Conferência" },
  { value: "congresso", label: "Congresso" },
  { value: "vigilia", label: "Vigília" },
  { value: "encontro_casais", label: "Encontro de Casais" },
  { value: "evento_jovem", label: "Evento Jovem" },
]

interface EventoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evento?: Evento | null
  onSuccess: () => void
}

export function EventoForm({ open, onOpenChange, evento, onSuccess }: EventoFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!evento
  const [initDone, setInitDone] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventoSchemaType>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      titulo: "",
      categoria: "",
      data: "",
      hora: "",
      local: "",
      descricao: "",
    },
  })

  if (open && !initDone) {
    setInitDone(true)
    if (evento) {
      reset({
        titulo: evento.titulo,
        categoria: evento.categoria,
        data: evento.data,
        hora: evento.hora,
        local: evento.local,
        descricao: evento.descricao,
      })
    } else {
      reset({
        titulo: "",
        categoria: "",
        data: "",
        hora: "",
        local: "",
        descricao: "",
      })
    }
  }

  if (!open && initDone) {
    setInitDone(false)
  }

  const onSubmit = async (formData: EventoSchemaType) => {
    setLoading(true)
    try {
      const eventoForm: EventoFormData = {
        titulo: formData.titulo,
        categoria: formData.categoria as EventoFormData["categoria"],
        data: formData.data,
        hora: formData.hora,
        local: formData.local,
        descricao: formData.descricao,
      }
      if (isEditing && evento) {
        await eventService.update(evento.id, eventoForm)
        toast.success("Evento atualizado com sucesso!")
      } else {
        await eventService.create(eventoForm)
        toast.success("Evento cadastrado com sucesso!")
      }
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error("Erro ao salvar evento. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Evento" : "Novo Evento"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do evento abaixo."
              : "Preencha os dados para cadastrar um novo evento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="titulo">Nome do evento</Label>
              <Input id="titulo" {...register("titulo")} placeholder="Nome do evento" />
              {errors.titulo && (
                <p className="text-xs text-destructive">{errors.titulo.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select id="categoria" options={categoriaOptions} placeholder="Selecione..." {...register("categoria")} />
                {errors.categoria && (
                  <p className="text-xs text-destructive">{errors.categoria.message}</p>
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
                <Label htmlFor="hora">Horário</Label>
                <Input id="hora" type="time" {...register("hora")} />
                {errors.hora && (
                  <p className="text-xs text-destructive">{errors.hora.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="local">Local</Label>
                <Input id="local" {...register("local")} placeholder="Local do evento" />
                {errors.local && (
                  <p className="text-xs text-destructive">{errors.local.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <textarea
                id="descricao"
                {...register("descricao")}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descreva o evento..."
              />
              {errors.descricao && (
                <p className="text-xs text-destructive">{errors.descricao.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Cadastrar evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

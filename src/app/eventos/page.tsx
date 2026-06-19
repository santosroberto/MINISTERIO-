"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { eventService } from "@/services/event-service"
import { Evento } from "@/types"
import { EventoForm } from "@/features/eventos/evento-form"
import { CalendarView } from "@/features/eventos/calendar-view"
import { cn } from "@/lib/utils"
import { CATEGORIA_LABELS, CATEGORIA_COLORS } from "@/constants"
import { Plus, Search, List, Calendar, Clock, MapPin } from "lucide-react"
import { toast } from "sonner"

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Evento | null>(null)

  const loadEventos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await eventService.list()
      setEventos(data)
    } catch {
      toast.error("Erro ao carregar eventos.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEventos()
  }, [loadEventos])

  const filtered = eventos.filter(
    (e) =>
      e.titulo.toLowerCase().includes(search.toLowerCase()) ||
      e.descricao.toLowerCase().includes(search.toLowerCase()) ||
      e.local.toLowerCase().includes(search.toLowerCase()) ||
      (CATEGORIA_LABELS[e.categoria] || e.categoria).toLowerCase().includes(search.toLowerCase())
  )

  function handleNew() {
    setEditingEvento(null)
    setFormOpen(true)
  }

  function handleEdit(evento: Evento) {
    setEditingEvento(evento)
    setFormOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await eventService.delete(deleteTarget.id)
      toast.success("Evento excluído com sucesso!")
      setDeleteTarget(null)
      await loadEventos()
    } catch {
      toast.error("Erro ao excluir evento.")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os eventos da igreja
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border p-0.5">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              Lista
            </Button>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1"
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4" />
              Calendário
            </Button>
          </div>
          <Button className="gap-2" onClick={handleNew}>
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar eventos..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {viewMode === "calendar" ? (
        <CalendarView
          eventos={filtered}
          onEdit={handleEdit}
          onDelete={(evento) => setDeleteTarget(evento)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((evento) => (
            <Card key={evento.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{evento.titulo}</CardTitle>
                  <Badge className={cn("text-xs", CATEGORIA_COLORS[evento.categoria] || "bg-gray-500")}>
                    {CATEGORIA_LABELS[evento.categoria] || evento.categoria}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(evento.data).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {evento.hora}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {evento.local}
                </div>
                <p className="text-sm text-muted-foreground pt-1">{evento.descricao}</p>
                <div className="flex justify-end gap-1 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(evento)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(evento)}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === "list" && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "Nenhum evento encontrado para esta busca." : "Nenhum evento cadastrado."}
        </div>
      )}

      <EventoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        evento={editingEvento}
        onSuccess={loadEventos}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Excluir evento"
        description={`Tem certeza que deseja excluir o evento "${deleteTarget?.titulo}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}

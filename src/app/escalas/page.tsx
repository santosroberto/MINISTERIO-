"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { scheduleService } from "@/services/schedule-service"
import { memberService } from "@/services/member-service"
import { Escala, Membro } from "@/types"
import { EscalaForm } from "@/features/escalas/escala-form"
import { CalendarView } from "@/features/escalas/calendar-view"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { MINISTERIOS } from "@/constants"
import {
  Plus,
  Search,
  Calendar,
  List,
  Clock,
  Users,
  Pencil,
  Trash2,
  FilterX,
  CalendarRange,
} from "lucide-react"

const ministerioOptions = [
  { value: "", label: "Todos os ministérios" },
  ...MINISTERIOS.map((m) => ({ value: m, label: m })),
]

type ViewMode = "list" | "calendar"

export default function EscalasPage() {
  const [escalas, setEscalas] = useState<Escala[]>([])
  const [membros, setMembros] = useState<Membro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [ministerioFilter, setMinisterioFilter] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  const [formOpen, setFormOpen] = useState(false)
  const [editingEscala, setEditingEscala] = useState<Escala | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingEscala, setDeletingEscala] = useState<Escala | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [escalasData, membrosData] = await Promise.all([
        scheduleService.list(),
        memberService.list(),
      ])
      setEscalas(escalasData)
      setMembros(membrosData)
    } catch {
      toast.error("Erro ao carregar escalas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = escalas.filter((e) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      e.ministerio.toLowerCase().includes(q) ||
      e.observacoes.toLowerCase().includes(q)

    const matchesMinisterio = !ministerioFilter || e.ministerio === ministerioFilter
    return matchesSearch && matchesMinisterio
  })

  const hasFilters = search || ministerioFilter

  function handleClearFilters() {
    setSearch("")
    setMinisterioFilter("")
  }

  function handleOpenCreate() {
    setEditingEscala(null)
    setFormOpen(true)
  }

  function handleOpenEdit(escala: Escala) {
    setEditingEscala(escala)
    setFormOpen(true)
  }

  function handleOpenDelete(escala: Escala) {
    setDeletingEscala(escala)
    setDeleteOpen(true)
  }

  async function handleConfirmDelete() {
    if (!deletingEscala) return
    setDeleting(true)
    try {
      await scheduleService.delete(deletingEscala.id)
      toast.success("Escala excluída com sucesso!")
      loadData()
      setDeleteOpen(false)
      setDeletingEscala(null)
    } catch {
      toast.error("Erro ao excluir escala")
    } finally {
      setDeleting(false)
    }
  }

  function handleFormSuccess() {
    loadData()
  }

  const getMembroNome = (id: string) => membros.find((m) => m.id === id)?.nome || "---"

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as escalas de serviço da igreja
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-1" />
              Lista
            </Button>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendário
            </Button>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Escala
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ministério..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={ministerioOptions}
          value={ministerioFilter}
          onChange={(e) => setMinisterioFilter(e.target.value)}
          className="w-full sm:w-48"
        />
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={handleClearFilters} title="Limpar filtros">
            <FilterX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {viewMode === "calendar" ? (
        <CalendarView
          escalas={filtered}
          membros={membros}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarRange className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              {hasFilters ? "Nenhuma escala encontrada" : "Nenhuma escala cadastrada"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              {hasFilters
                ? "Tente ajustar os filtros."
                : "Clique em \"Nova Escala\" para criar."}
            </p>
            {hasFilters ? (
              <Button variant="outline" onClick={handleClearFilters}>
                <FilterX className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            ) : (
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Escala
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((escala) => (
            <Card key={escala.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="text-xs">{escala.ministerio}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(escala.data).toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {escala.horaInicio} - {escala.horaFim}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {escala.responsaveis.length} responsável(is)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {escala.responsaveis.map((id) => (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {getMembroNome(id)}
                        </Badge>
                      ))}
                    </div>

                    {escala.observacoes && (
                      <p className="text-sm text-muted-foreground pt-1">
                        {escala.observacoes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenEdit(escala)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleOpenDelete(escala)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EscalaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        escala={editingEscala}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir escala"
        description={`Tem certeza que deseja excluir a escala de "${deletingEscala?.ministerio}" do dia ${deletingEscala?.data ? new Date(deletingEscala.data).toLocaleDateString("pt-BR") : ""}?`}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  )
}

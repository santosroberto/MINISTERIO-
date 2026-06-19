"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { memberService } from "@/services/member-service"
import { Membro } from "@/types"
import { MembroForm } from "@/features/membros/membro-form"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { MINISTERIOS } from "@/constants"
import {
  Plus,
  Search,
  Phone,
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  FilterX,
  Church,
  ChevronLeft,
  ChevronRight,
  UserCircle2,
  Eye,
} from "lucide-react"

const ITEMS_PER_PAGE = 10

const ministerioOptions = [
  { value: "", label: "Todos os ministérios" },
  ...MINISTERIOS.map((m) => ({ value: m, label: m })),
]

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
]

export default function MembrosPage() {
  const [membros, setMembros] = useState<Membro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [ministerioFilter, setMinisterioFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editingMembro, setEditingMembro] = useState<Membro | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingMembro, setDeletingMembro] = useState<Membro | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [selectedMembro, setSelectedMembro] = useState<Membro | null>(null)

  const loadMembros = useCallback(async () => {
    try {
      const data = await memberService.list()
      setMembros(data)
    } catch {
      toast.error("Erro ao carregar membros")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembros()
  }, [loadMembros])

  const filtered = membros.filter((m) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      m.nome.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.telefone.includes(q) ||
      m.cargo.toLowerCase().includes(q)

    const matchesMinisterio = !ministerioFilter || m.ministerio === ministerioFilter
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "ativo" && m.ativo) ||
      (statusFilter === "inativo" && !m.ativo)

    return matchesSearch && matchesMinisterio && matchesStatus
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleMinisterioChange(value: string) {
    setMinisterioFilter(value)
    setPage(1)
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  function handleClearFilters() {
    setSearch("")
    setMinisterioFilter("")
    setStatusFilter("")
    setPage(1)
  }

  function handleOpenCreate() {
    setEditingMembro(null)
    setFormOpen(true)
  }

  function handleOpenEdit(membro: Membro) {
    setEditingMembro(membro)
    setFormOpen(true)
  }

  function handleOpenDelete(membro: Membro) {
    setDeletingMembro(membro)
    setDeleteOpen(true)
  }

  async function handleConfirmDelete() {
    if (!deletingMembro) return
    setDeleting(true)
    try {
      await memberService.delete(deletingMembro.id)
      toast.success("Membro excluído com sucesso!")
      loadMembros()
      setDeleteOpen(false)
      setDeletingMembro(null)
    } catch {
      toast.error("Erro ao excluir membro")
    } finally {
      setDeleting(false)
    }
  }

  function handleFormSuccess() {
    loadMembros()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const hasFilters = search || ministerioFilter || statusFilter

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Membros</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os membros da igreja
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Membro
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, telefone ou cargo..."
            className="pl-10"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select
          options={ministerioOptions}
          value={ministerioFilter}
          onChange={(e) => handleMinisterioChange(e.target.value)}
          className="w-full sm:w-48"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full sm:w-40"
        />
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={handleClearFilters} title="Limpar filtros">
            <FilterX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {paginated.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserCircle2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              {hasFilters ? "Nenhum membro encontrado" : "Nenhum membro cadastrado"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              {hasFilters
                ? "Tente ajustar os filtros ou busca."
                : "Clique em \"Novo Membro\" para cadastrar."}
            </p>
            {hasFilters ? (
              <Button variant="outline" onClick={handleClearFilters}>
                <FilterX className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            ) : (
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Membro
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-lg border">
            <div className="hidden md:grid md:grid-cols-[1fr_140px_180px_100px_120px] gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
              <div>Membro</div>
              <div>Ministério</div>
              <div>Contato</div>
              <div>Status</div>
              <div className="text-right">Ações</div>
            </div>

            {paginated.map((membro) => (
              <div
                key={membro.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_140px_180px_100px_120px] gap-3 md:gap-4 px-6 py-4 border-t hover:bg-muted/30 transition-colors"
              >
                  <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm overflow-hidden">
                    {membro.foto ? (
                      <img src={membro.foto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      membro.nome.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{membro.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">{membro.cargo}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="md:hidden text-xs text-muted-foreground mr-2">Ministério:</span>
                  <Badge variant="secondary" className="text-xs">{membro.ministerio}</Badge>
                </div>

                <div className="flex flex-col text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {membro.telefone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(membro.dataNascimento).toLocaleDateString("pt-BR")}
                  </div>
                </div>

                <div className="flex items-center">
                  <Badge variant={membro.ativo ? "success" : "destructive"} className="text-xs">
                    {membro.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedMembro(selectedMembro?.id === membro.id ? null : membro)}
                    title="Ver detalhes"
                    aria-label="Ver detalhes do membro"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenEdit(membro)}
                    title="Editar membro"
                    aria-label="Editar membro"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleOpenDelete(membro)}
                    title="Excluir membro"
                    aria-label="Excluir membro"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {selectedMembro?.id === membro.id && (
                  <div className="md:col-span-5 bg-muted/30 rounded-lg p-4 -mx-2 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{membro.endereco}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Church className="h-4 w-4 shrink-0" />
                      <span>Estado civil: {membro.estadoCivil}</span>
                    </div>
                    {membro.observacoes && (
                      <p className="text-muted-foreground pl-6">{membro.observacoes}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {paginated.length} de {filtered.length} membro{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                title="Página anterior"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
                {page} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                title="Próxima página"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <MembroForm
        open={formOpen}
        onOpenChange={setFormOpen}
        membro={editingMembro}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir membro"
        description={`Tem certeza que deseja excluir "${deletingMembro?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  )
}

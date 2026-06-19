"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { birthdayService } from "@/services/birthday-service"
import { Membro } from "@/types"
import { Cake, Gift, CalendarDays, CalendarRange, Search, Phone, PartyPopper } from "lucide-react"

type TabType = "dia" | "semana" | "mes"

const tabs: { key: TabType; label: string; icon: typeof Cake }[] = [
  { key: "dia", label: "Hoje", icon: PartyPopper },
  { key: "semana", label: "Esta Semana", icon: CalendarDays },
  { key: "mes", label: "Este Mês", icon: CalendarRange },
]

const gradientColors = [
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-orange-500 to-red-600",
]

const faixasEtarias = birthdayService.getFaixasEtarias()

function getInitials(nome: string): string {
  return nome
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradientColors[Math.abs(hash) % gradientColors.length]
}

function formatDate(data: string): string {
  const d = new Date(data)
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })
}

function BirthdayCard({ membro }: { membro: Membro }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${getGradient(membro.id)}`} />
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ring-2 ring-muted">
              <div
                className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${getGradient(membro.id)} text-white text-lg font-bold`}
              >
                {getInitials(membro.nome)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-base truncate">{membro.nome}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-muted-foreground">
                      {birthdayService.getAge(membro.dataNascimento)} anos
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(membro.dataNascimento)}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  <Cake className="h-5 w-5 text-rose-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  {membro.ministerio}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {membro.telefone}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BirthdayGrid({ membros, loading }: { membros: Membro[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border p-5 space-y-3">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (membros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Gift className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground">Nenhum aniversariante</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Não encontramos aniversariantes para este período com os filtros atuais.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {membros.map((membro) => (
        <BirthdayCard key={membro.id} membro={membro} />
      ))}
    </div>
  )
}

export default function AniversariantesPage() {
  const [tab, setTab] = useState<TabType>("dia")
  const [search, setSearch] = useState("")
  const [ministerioFilter, setMinisterioFilter] = useState("")
  const [faixaFilter, setFaixaFilter] = useState("")

  return (
    <AniversariantesPageContent
      tab={tab}
      onTabChange={setTab}
      search={search}
      onSearchChange={setSearch}
      ministerioFilter={ministerioFilter}
      onMinisterioFilterChange={setMinisterioFilter}
      faixaFilter={faixaFilter}
      onFaixaFilterChange={setFaixaFilter}
    />
  )
}

function AniversariantesPageContent({
  tab,
  onTabChange,
  search,
  onSearchChange,
  ministerioFilter,
  onMinisterioFilterChange,
  faixaFilter,
  onFaixaFilterChange,
}: {
  tab: TabType
  onTabChange: (t: TabType) => void
  search: string
  onSearchChange: (s: string) => void
  ministerioFilter: string
  onMinisterioFilterChange: (s: string) => void
  faixaFilter: string
  onFaixaFilterChange: (s: string) => void
}) {
  const [loading, setLoading] = useState(true)
  const [doDia, setDoDia] = useState<Membro[]>([])
  const [daSemana, setDaSemana] = useState<Membro[]>([])
  const [doMes, setDoMes] = useState<Membro[]>([])
  const [ministerios, setMinisterios] = useState<string[]>([])

  useEffect(() => {
    const filters = {
      search: search || undefined,
      ministerio: ministerioFilter || undefined,
      faixaEtaria: faixaFilter || undefined,
    }
    Promise.all([
      birthdayService.getDoDia(filters),
      birthdayService.getDaSemana(filters),
      birthdayService.getDoMes(undefined, filters),
      birthdayService.getMinisterios(),
    ]).then(([dia, semana, mes, mins]) => {
      setDoDia(dia)
      setDaSemana(semana)
      setDoMes(mes)
      setMinisterios(mins)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [search, ministerioFilter, faixaFilter])

  const currentList = tab === "dia" ? doDia : tab === "semana" ? daSemana : doMes

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aniversariantes</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe os aniversários dos membros da igreja
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white border-0">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-full bg-white/20 p-2.5">
              <PartyPopper className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{doDia.length}</p>
              <p className="text-sm text-white/80">Hoje</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-full bg-white/20 p-2.5">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{daSemana.length}</p>
              <p className="text-sm text-white/80">Esta Semana</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-full bg-white/20 p-2.5">
              <CalendarRange className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{doMes.length}</p>
              <p className="text-sm text-white/80">Este Mês</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, ministério..."
            className="pl-10"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select
          options={ministerios.map((m) => ({ value: m, label: m }))}
          placeholder="Todos os ministérios"
          value={ministerioFilter}
          onChange={(e) => onMinisterioFilterChange(e.target.value)}
          className="w-full sm:w-52"
        />
        <Select
          options={faixasEtarias.map((f) => ({ value: f.value, label: f.label }))}
          placeholder="Todas as idades"
          value={faixaFilter}
          onChange={(e) => onFaixaFilterChange(e.target.value)}
          className="w-full sm:w-52"
        />
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => {
          const count = key === "dia" ? doDia.length : key === "semana" ? daSemana.length : doMes.length
          const isActive = tab === key
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span
                className={`ml-1 inline-flex items-center justify-center h-5 min-w-5 rounded-full px-1.5 text-xs font-bold ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <BirthdayGrid membros={currentList} loading={loading} />
    </div>
  )
}

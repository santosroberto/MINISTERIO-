"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { reportService, type ReportFilters } from "@/services/report-service"
import { Membro, Evento, Escala } from "@/types"
import { exportToCsv } from "@/lib/csv"
import { MINISTERIOS, CATEGORIAS_EVENTO, CATEGORIA_LABELS } from "@/constants"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"

const CHART_MARGIN = { top: 8, right: 12, left: -10, bottom: 4 }
import {
  Users,
  Calendar,
  Church,
  TrendingUp,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
} from "lucide-react"

const PIE_COLORS = ["#6d28d9", "#a78bfa", "#8b5cf6", "#c4b5fd", "#7c3aed", "#ddd6fe", "#5b21b6", "#3b0764"]

const categoriaOptions = CATEGORIAS_EVENTO.map((c) => ({ value: c.value, label: c.label }))

const ministerioOptions = MINISTERIOS.map((m) => ({ value: m, label: m }))

const mesesOptions = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
]

export default function RelatoriosPage() {
  const [mesFilter, setMesFilter] = useState("")
  const [anoFilter, setAnoFilter] = useState("")
  const [ministerioFilter, setMinisterioFilter] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState("")

  return (
    <RelatoriosContent
      mesFilter={mesFilter}
      anoFilter={anoFilter}
      ministerioFilter={ministerioFilter}
      categoriaFilter={categoriaFilter}
      onMesFilterChange={setMesFilter}
      onAnoFilterChange={setAnoFilter}
      onMinisterioFilterChange={setMinisterioFilter}
      onCategoriaFilterChange={setCategoriaFilter}
    />
  )
}

function RelatoriosContent({
  mesFilter,
  anoFilter,
  ministerioFilter,
  categoriaFilter,
  onMesFilterChange,
  onAnoFilterChange,
  onMinisterioFilterChange,
  onCategoriaFilterChange,
}: {
  mesFilter: string
  anoFilter: string
  ministerioFilter: string
  categoriaFilter: string
  onMesFilterChange: (v: string) => void
  onAnoFilterChange: (v: string) => void
  onMinisterioFilterChange: (v: string) => void
  onCategoriaFilterChange: (v: string) => void
}) {
  const [loading, setLoading] = useState(true)
  const [membros, setMembros] = useState<Membro[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [escalas, setEscalas] = useState<Escala[]>([])

  useEffect(() => {
    const filters: ReportFilters = {
      ...(mesFilter ? { mes: parseInt(mesFilter) } : {}),
      ...(anoFilter ? { ano: parseInt(anoFilter) } : {}),
      ...(ministerioFilter ? { ministerio: ministerioFilter } : {}),
      ...(categoriaFilter ? { categoria: categoriaFilter } : {}),
    }
    reportService.getRawData(filters).then((data) => {
      setMembros(data.membros)
      setEventos(data.eventos)
      setEscalas(data.escalas)
      setLoading(false)
    })
  }, [mesFilter, anoFilter, ministerioFilter, categoriaFilter])

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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-80 md:col-span-2" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  const membrosAtivos = membros.filter((m) => m.ativo).length
  const membrosInativos = membros.length - membrosAtivos
  const taxaAtividade = membros.length > 0 ? ((membrosAtivos / membros.length) * 100).toFixed(1) : "0"
  const totalResponsaveis = escalas.reduce((acc, e) => acc + e.responsaveis.length, 0)
  const mediaResponsaveis = escalas.length > 0 ? (totalResponsaveis / escalas.length).toFixed(1) : "0"

  const crescimento = reportService.getCrescimentoMensal(membros)
  const participacao = reportService.getParticipacaoMinisterio(membros)
  const eventosPorMes = reportService.getEventosPorMes(eventos, anoFilter ? parseInt(anoFilter) : undefined)
  const escalasPorMes = reportService.getEscalasPorMes(escalas, anoFilter ? parseInt(anoFilter) : undefined)

  const cargos = membros.reduce<Record<string, number>>((acc, m) => {
    acc[m.cargo] = (acc[m.cargo] || 0) + 1
    return acc
  }, {})

  const categorias = eventos.reduce<Record<string, number>>((acc, e) => {
    acc[e.categoria] = (acc[e.categoria] || 0) + 1
    return acc
  }, {})

  const ministerios = escalas.reduce<Record<string, number>>((acc, e) => {
    acc[e.ministerio] = (acc[e.ministerio] || 0) + 1
    return acc
  }, {})

  function handleExportCSV() {
    const data = membros.map((m) => ({
      nome: m.nome,
      email: m.email,
      telefone: m.telefone,
      cargo: m.cargo,
      ministerio: m.ministerio,
      estadoCivil: m.estadoCivil,
      ativo: m.ativo ? "Sim" : "Não",
      dataNascimento: m.dataNascimento,
      dataEntrada: m.dataEntrada,
    }))
    exportToCsv(data, [
      { key: "nome", label: "Nome" },
      { key: "email", label: "Email" },
      { key: "telefone", label: "Telefone" },
      { key: "cargo", label: "Cargo" },
      { key: "ministerio", label: "Ministério" },
      { key: "estadoCivil", label: "Estado Civil" },
      { key: "ativo", label: "Ativo" },
      { key: "dataNascimento", label: "Data de Nascimento" },
      { key: "dataEntrada", label: "Data de Entrada" },
    ], "relatorio-membros")
  }

  const statCards = [
    { title: "Total de Membros", value: membros.length, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Membros Ativos", value: membrosAtivos, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { title: "Total de Eventos", value: eventos.length, icon: Calendar, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30" },
    { title: "Total de Escalas", value: escalas.length, icon: Church, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { title: "Média por Escala", value: mediaResponsaveis, icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30" },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Análises e estatísticas do ministério
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          options={mesesOptions}
          placeholder="Todos os meses"
          value={mesFilter}
          onChange={(e) => onMesFilterChange(e.target.value)}
          className="w-40"
        />
        <Select
          options={[
            { value: "2026", label: "2026" },
            { value: "2025", label: "2025" },
            { value: "2024", label: "2024" },
          ]}
          placeholder="Todos os anos"
          value={anoFilter}
          onChange={(e) => onAnoFilterChange(e.target.value)}
          className="w-36"
        />
        <Select
          options={ministerioOptions}
          placeholder="Todos os ministérios"
          value={ministerioFilter}
          onChange={(e) => onMinisterioFilterChange(e.target.value)}
          className="w-48"
        />
        <Select
          options={categoriaOptions}
          placeholder="Todas as categorias"
          value={categoriaFilter}
          onChange={(e) => onCategoriaFilterChange(e.target.value)}
          className="w-48"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Crescimento Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {crescimento.length === 0 ? (
              <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                Nenhum dado de crescimento disponível.
              </div>
            ) : (
              <div className="h-72 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={crescimento} margin={CHART_MARGIN} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="mes" className="text-xs" tick={{ fill: "currentColor" }} />
                    <YAxis className="text-xs" tick={{ fill: "currentColor" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="entradas" name="Entradas" fill="#6d28d9" radius={[4, 4, 0, 0]} maxBarSize={48} />
                    <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Ministérios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participacao.length === 0 ? (
              <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                Nenhum dado de ministérios disponível.
              </div>
            ) : (
              <div className="h-72 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <Pie
                      data={participacao}
                      dataKey="membros"
                      nameKey="ministerio"
                      cx="50%"
                      cy="45%"
                      outerRadius={70}
                      innerRadius={44}
                      paddingAngle={2}
                    >
                      {participacao.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
            Eventos e Escalas por Mês
          </CardTitle>
        </CardHeader>
          <CardContent>
            {eventosPorMes.length === 0 && escalasPorMes.length === 0 ? (
              <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
                Nenhum dado de eventos ou escalas disponível.
              </div>
            ) : (
              <div className="h-72 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={eventosPorMes.map((e, i) => ({ ...e, escalas: escalasPorMes[i]?.escalas || 0 }))}
                    margin={CHART_MARGIN}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="mes" className="text-xs" tick={{ fill: "currentColor" }} />
                    <YAxis className="text-xs" tick={{ fill: "currentColor" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="eventos"
                      name="Eventos"
                      stroke="#6d28d9"
                      strokeWidth={3}
                      dot={{ fill: "#6d28d9", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="escalas"
                      name="Escalas"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: "#f59e0b", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Membros por Cargo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(cargos).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhum dado disponível.</p>
              ) : (
                Object.entries(cargos).map(([cargo, qtde]) => {
                  const total = Object.values(cargos).reduce((a, b) => a + b, 0)
                  const pct = ((qtde / total) * 100).toFixed(0)
                  return (
                    <div key={cargo} className="flex items-center gap-3 py-1.5">
                      <span className="text-sm w-32 truncate">{cargo}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{qtde}</span>
                    </div>
                  )
                })
              )}
            </div>
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taxa de atividade</span>
                <span className="font-medium">{taxaAtividade}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${taxaAtividade}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{membrosInativos} inativos</span>
                <span>{membrosAtivos} ativos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Eventos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(categorias).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum evento encontrado.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(categorias).map(([cat, qtde]) => {
                  const total = Object.values(categorias).reduce((a, b) => a + b, 0)
                  const pct = ((qtde / total) * 100).toFixed(0)
                  return (
                    <div key={cat} className="flex items-center justify-between text-sm">
                       <span>{CATEGORIA_LABELS[cat] || cat}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-medium w-6 text-right">{qtde}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-4 pt-3 border-t">
              <h4 className="text-sm font-medium mb-2">Escalas por Ministério</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ministerios).length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma escala encontrada.</p>
                ) : (
                  Object.entries(ministerios).map(([min, qtde]) => (
                    <Badge key={min} variant="secondary" className="text-xs">
                      {min}: {qtde}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

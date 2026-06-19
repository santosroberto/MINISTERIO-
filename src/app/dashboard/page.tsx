"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/services/api"
import { DashboardStats, Evento, Escala, CrescimentoMensal, ParticipacaoMinisterio, EventosPorMes } from "@/types"
import {
  Users,
  UserPlus,
  Calendar,
  CalendarRange,
  Gift,
  Church,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
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

const PIE_COLORS = ["#6d28d9", "#a78bfa", "#8b5cf6", "#c4b5fd", "#7c3aed", "#ddd6fe", "#5b21b6"]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [escalas, setEscalas] = useState<Escala[]>([])
  const [crescimento, setCrescimento] = useState<CrescimentoMensal[]>([])
  const [participacao, setParticipacao] = useState<ParticipacaoMinisterio[]>([])
  const [eventosPorMes, setEventosPorMes] = useState<EventosPorMes[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [
          statsData,
          eventosData,
          escalasData,
          crescimentoData,
          participacaoData,
          eventosPorMesData,
        ] = await Promise.all([
          api.getEstatisticas(),
          api.getEventos(),
          api.getEscalas(),
          api.getCrescimentoMensal(),
          api.getParticipacaoMinisterio(),
          api.getEventosPorMes(),
        ])
        setStats(statsData)
        setEventos(eventosData)
        setEscalas(escalasData)
        setCrescimento(crescimentoData)
        setParticipacao(participacaoData)
        setEventosPorMes(eventosPorMesData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Church className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-muted-foreground">Nenhum dado encontrado</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Não foi possível carregar os dados do dashboard. Verifique a conexão e tente novamente.
        </p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total de Membros",
      value: stats.totalMembros,
      icon: Users,
      href: "/membros",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Novos Este Mês",
      value: stats.novosMembrosMes,
      icon: UserPlus,
      href: "/membros",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Eventos Próximos",
      value: stats.eventosProximos,
      icon: Calendar,
      href: "/eventos",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-100 dark:bg-violet-900/30",
    },
    {
      title: "Escalas Programadas",
      value: stats.escalasProgramadas,
      icon: CalendarRange,
      href: "/escalas",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Aniversariantes Semana",
      value: stats.aniversariantesSemana,
      icon: Gift,
      href: "/aniversariantes",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100 dark:bg-rose-900/30",
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do ministério
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href} style={{ animationDelay: `${idx * 80}ms` }}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${stat.bg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Crescimento de Membros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crescimento} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mes" className="text-xs" tick={{ fill: "currentColor" }} />
                  <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="entradas"
                    name="Entradas"
                    fill="#6d28d9"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="saidas"
                    name="Saídas"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Church className="h-5 w-5 text-primary" />
              Participação por Ministério
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={participacao}
                    dataKey="membros"
                    nameKey="ministerio"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    label={({ name, percent }) => {
                      const pct = Number(percent) || 0
                      return `${name} ${(pct * 100).toFixed(0)}%`
                    }}
                    labelLine={false}
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Eventos Realizados por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={eventosPorMes}>
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
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            <Link href="/eventos">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {eventos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum evento</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cadastre eventos para acompanhá-los aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventos.slice(0, 3).map((evento) => (
                  <div
                    key={evento.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{evento.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(evento.data).toLocaleDateString("pt-BR")} às{" "}
                        {evento.hora}
                      </p>
                    </div>
                    <Badge
                      className={
                        evento.categoria === "culto_especial"
                          ? "bg-violet-500 hover:bg-violet-600"
                          : evento.categoria === "conferencia"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : evento.categoria === "congresso"
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : evento.categoria === "vigilia"
                                ? "bg-indigo-500 hover:bg-indigo-600"
                                : evento.categoria === "encontro_casais"
                                  ? "bg-rose-500 hover:bg-rose-600"
                                  : evento.categoria === "evento_jovem"
                                    ? "bg-amber-500 hover:bg-amber-600"
                                    : ""
                      }
                    >
                      {evento.categoria === "culto_especial"
                        ? "Culto Especial"
                        : evento.categoria === "conferencia"
                          ? "Conferência"
                          : evento.categoria === "congresso"
                            ? "Congresso"
                            : evento.categoria === "vigilia"
                              ? "Vigília"
                              : evento.categoria === "encontro_casais"
                                ? "Encontro Casais"
                                : evento.categoria === "evento_jovem"
                                  ? "Evento Jovem"
                                  : evento.categoria}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Próximas Escalas</CardTitle>
            <Link href="/escalas">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {escalas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarRange className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhuma escala</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Crie escalas de serviço para a igreja.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {escalas.slice(0, 3).map((escala) => (
                  <div
                    key={escala.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{escala.ministerio}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(escala.data).toLocaleDateString("pt-BR")} •{" "}
                        {escala.horaInicio} - {escala.horaFim}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {escala.responsaveis.length} responsável(is)
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

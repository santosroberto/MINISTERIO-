"use client"

import { useState, useMemo } from "react"
import { Evento } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock, MapPin, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { CATEGORIA_LABELS, CATEGORIA_COLORS } from "@/constants"

interface CalendarViewProps {
  eventos: Evento[]
  onEdit: (evento: Evento) => void
  onDelete: (evento: Evento) => void
}

export function CalendarView({ eventos, onEdit, onDelete }: CalendarViewProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const days = useMemo(() => {
    const result: (number | null)[] = []
    for (let i = 0; i < firstDayOfWeek; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    return result
  }, [firstDayOfWeek, daysInMonth])

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ]
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  function getEventosForDay(day: number) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return eventos.filter((e) => e.data === dateStr)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth} title="Mês anterior" aria-label="Mês anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth} title="Próximo mês" aria-label="Próximo mês">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {dayNames.map((name) => (
          <div key={name} className="bg-muted/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground">
            {name}
          </div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="bg-card min-h-[100px] p-1" />
          const dayEventos = getEventosForDay(day)
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()

          return (
            <div
              key={day}
              className={cn(
                "bg-card min-h-[100px] p-1 space-y-0.5",
                isToday && "ring-2 ring-primary ring-inset"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-5 w-5 items-center justify-center text-xs rounded-full",
                  isToday && "bg-primary text-primary-foreground font-bold"
                )}
              >
                {day}
              </span>
              <div className="space-y-0.5">
                {dayEventos.slice(0, 3).map((evento) => (
                  <div
                    key={evento.id}
                    className={cn(
                      "text-[10px] text-white rounded px-1 py-0.5 truncate cursor-pointer hover:opacity-90",
                      CATEGORIA_COLORS[evento.categoria] || "bg-gray-500"
                    )}
                    title={`${evento.titulo} - ${evento.hora}`}
                  >
                    {evento.titulo}
                  </div>
                ))}
                {dayEventos.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">
                    +{dayEventos.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Eventos do dia
        </h4>
        {(() => {
          const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
          const todayEventos = eventos.filter((e) => e.data === todayStr)
          if (todayEventos.length === 0) {
            return (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum evento para hoje.
              </p>
            )
          }
          return todayEventos.map((evento) => (
            <Card key={evento.id} className="border-l-4 hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cn("text-xs", CATEGORIA_COLORS[evento.categoria])}>
                         {CATEGORIA_LABELS[evento.categoria] || evento.categoria}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(evento.data).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="font-medium">{evento.titulo}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {evento.hora}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {evento.local}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(evento)} title="Editar evento" aria-label="Editar evento">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(evento)} title="Excluir evento" aria-label="Excluir evento">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        })()}
      </div>
    </div>
  )
}

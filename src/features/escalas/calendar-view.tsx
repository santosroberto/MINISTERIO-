"use client"

import { useState, useMemo } from "react"
import { Escala, Membro } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { MINISTERIO_COLORS } from "@/constants"

interface CalendarViewProps {
  escalas: Escala[]
  membros: Membro[]
  onEdit: (escala: Escala) => void
  onDelete: (escala: Escala) => void
}

export function CalendarView({ escalas, membros, onEdit, onDelete }: CalendarViewProps) {
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

  function getEscalasForDay(day: number) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return escalas.filter((e) => e.data === dateStr)
  }

  const getMembroNome = (id: string) => membros.find((m) => m.id === id)?.nome || "---"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
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
          const dayEscalas = getEscalasForDay(day)
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
                {dayEscalas.slice(0, 3).map((escala) => (
                  <div
                    key={escala.id}
                    className={cn(
                      "text-[10px] text-white rounded px-1 py-0.5 truncate cursor-pointer hover:opacity-90",
                      MINISTERIO_COLORS[escala.ministerio] || "bg-gray-500"
                    )}
                    title={`${escala.ministerio} - ${escala.horaInicio} às ${escala.horaFim}`}
                  >
                    {escala.ministerio}
                  </div>
                ))}
                {dayEscalas.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">
                    +{dayEscalas.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Escalas do dia
        </h4>
        {(() => {
          const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
          const todayEscalas = escalas.filter((e) => e.data === todayStr)
          if (todayEscalas.length === 0) {
            return (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma escala para hoje.
              </p>
            )
          }
          return todayEscalas.map((escala) => (
            <Card key={escala.id} className="border-l-4" style={{ borderLeftColor: MINISTERIO_COLORS[escala.ministerio] }}>
              <CardContent className="p-3 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-[10px]", MINISTERIO_COLORS[escala.ministerio])}>
                      {escala.ministerio}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {escala.horaInicio} - {escala.horaFim}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {escala.responsaveis.length} responsável(is)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {escala.responsaveis.map((id) => (
                      <span key={id} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {getMembroNome(id)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(escala)}>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(escala)}>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        })()}
      </div>
    </div>
  )
}

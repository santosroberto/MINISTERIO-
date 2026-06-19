import { Membro, Evento, Escala, CrescimentoMensal, ParticipacaoMinisterio } from "@/types"
import { createClient } from "@/lib/supabase/client"
import { mapRowToMembro, mapRowToEvento, mapRowToEscala } from "@/lib/supabase/mapping"

export interface ReportFilters {
  mes?: number
  ano?: number
  ministerio?: string
  categoria?: string
}

function filterMembros(list: Membro[], filters?: ReportFilters): Membro[] {
  let result = list
  if (filters?.ministerio) {
    result = result.filter((m) => m.ministerio === filters.ministerio)
  }
  return result
}

function filterEventos(list: Evento[], filters?: ReportFilters): Evento[] {
  let result = list
  if (filters?.categoria) {
    result = result.filter((e) => e.categoria === filters.categoria)
  }
  if (filters?.mes !== undefined) {
    result = result.filter((e) => new Date(e.data).getMonth() === filters.mes)
  }
  if (filters?.ano !== undefined) {
    result = result.filter((e) => new Date(e.data).getFullYear() === filters.ano)
  }
  return result
}

function filterEscalas(list: Escala[], filters?: ReportFilters): Escala[] {
  let result = list
  if (filters?.ministerio) {
    result = result.filter((e) => e.ministerio === filters.ministerio)
  }
  if (filters?.mes !== undefined) {
    result = result.filter((e) => new Date(e.data).getMonth() === filters.mes)
  }
  if (filters?.ano !== undefined) {
    result = result.filter((e) => new Date(e.data).getFullYear() === filters.ano)
  }
  return result
}

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dec"]

export const reportService = {
  async getRawData(filters?: ReportFilters) {
    const supabase = createClient()

    let queryMembros = supabase.from("membros").select("*")
    let queryEventos = supabase.from("eventos").select("*")
    let queryEscalas = supabase.from("escalas").select("*")

    if (filters?.ministerio) {
      queryMembros = queryMembros.eq("ministerio", filters.ministerio)
      queryEscalas = queryEscalas.eq("ministerio", filters.ministerio)
    }
    if (filters?.categoria) {
      queryEventos = queryEventos.eq("categoria", filters.categoria)
    }

    const [membrosResult, eventosResult, escalasResult] = await Promise.all([
      queryMembros,
      queryEventos,
      queryEscalas,
    ])

    let membros = (membrosResult.data || []).map(mapRowToMembro)
    let eventos = (eventosResult.data || []).map(mapRowToEvento)
    let escalas = (escalasResult.data || []).map(mapRowToEscala)

    membros = filterMembros(membros, filters)
    eventos = filterEventos(eventos, filters)
    escalas = filterEscalas(escalas, filters)

    return { membros, eventos, escalas }
  },

  getCrescimentoMensal(membros: Membro[]): CrescimentoMensal[] {
    const porMes: Record<string, { entradas: number; saidas: number }> = {}
    for (const m of membros) {
      const chave = new Date(m.dataEntrada).toLocaleDateString("pt-BR", { month: "short" })
      if (!porMes[chave]) porMes[chave] = { entradas: 0, saidas: 0 }
      porMes[chave].entradas++
      if (!m.ativo) porMes[chave].saidas++
    }
    return Object.entries(porMes).map(([mes, v]) => ({ mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3), ...v }))
  },

  getParticipacaoMinisterio(membros: Membro[]): ParticipacaoMinisterio[] {
    const map: Record<string, number> = {}
    for (const m of membros) {
      map[m.ministerio] = (map[m.ministerio] || 0) + 1
    }
    return Object.entries(map)
      .map(([ministerio, membros]) => ({ ministerio, membros }))
      .sort((a, b) => b.membros - a.membros)
  },

  getEventosPorMes(eventos: Evento[], ano?: number): { mes: string; eventos: number }[] {
    const targetAno = ano ?? new Date().getFullYear()
    const map: Record<string, number> = {}
    for (const e of eventos) {
      const d = new Date(e.data)
      if (d.getFullYear() !== targetAno) continue
      const chave = meses[d.getMonth()]
      map[chave] = (map[chave] || 0) + 1
    }
    return meses.map((mes) => ({ mes, eventos: map[mes] || 0 }))
  },

  getEscalasPorMes(escalas: Escala[], ano?: number): { mes: string; escalas: number }[] {
    const targetAno = ano ?? new Date().getFullYear()
    const map: Record<string, number> = {}
    for (const e of escalas) {
      const d = new Date(e.data)
      if (d.getFullYear() !== targetAno) continue
      const chave = meses[d.getMonth()]
      map[chave] = (map[chave] || 0) + 1
    }
    return meses.map((mes) => ({ mes, escalas: map[mes] || 0 }))
  },
}

import { createClient } from "@/lib/supabase/client"
import { mapRowToMembro } from "@/lib/supabase/mapping"
import { Membro } from "@/types"

function getAge(dataNascimento: string): number {
  const hoje = new Date()
  const nasc = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const mesDif = hoje.getMonth() - nasc.getMonth()
  if (mesDif < 0 || (mesDif === 0 && hoje.getDate() < nasc.getDate())) {
    idade--
  }
  return idade
}

function getWeekRange() {
  const hoje = new Date()
  const diaSemana = hoje.getDay()
  const inicio = new Date(hoje)
  inicio.setDate(hoje.getDate() - diaSemana)
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(inicio)
  fim.setDate(inicio.getDate() + 6)
  fim.setHours(23, 59, 59, 999)
  return { inicio, fim }
}

function isSameMonthDay(data: string, target: Date): boolean {
  const d = new Date(data)
  return d.getDate() === target.getDate() && d.getMonth() === target.getMonth()
}

function isInWeek(data: string, inicio: Date, fim: Date): boolean {
  const d = new Date(data)
  const thisYear = new Date().getFullYear()
  const compare = new Date(thisYear, d.getMonth(), d.getDate())
  return compare >= inicio && compare <= fim
}

function isInMonth(data: string, mes: number): boolean {
  return new Date(data).getMonth() === mes
}

export interface BirthdayFilters {
  ministerio?: string
  faixaEtaria?: string
  search?: string
}

const faixasEtarias: { value: string; label: string; min: number; max: number }[] = [
  { value: "crianca", label: "Criança (0-12)", min: 0, max: 12 },
  { value: "adolescente", label: "Adolescente (13-17)", min: 13, max: 17 },
  { value: "jovem", label: "Jovem (18-25)", min: 18, max: 25 },
  { value: "adulto_jovem", label: "Adulto Jovem (26-35)", min: 26, max: 35 },
  { value: "adulto", label: "Adulto (36-50)", min: 36, max: 50 },
  { value: "senior", label: "Sênior (51+)", min: 51, max: 200 },
]

function applyFilters(list: Membro[], filters?: BirthdayFilters): Membro[] {
  let result = list
  if (filters?.ministerio) {
    result = result.filter((m) => m.ministerio === filters.ministerio)
  }
  if (filters?.faixaEtaria) {
    const faixa = faixasEtarias.find((f) => f.value === filters.faixaEtaria)
    if (faixa) {
      result = result.filter((m) => {
        const idade = getAge(m.dataNascimento)
        return idade >= faixa.min && idade <= faixa.max
      })
    }
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (m) =>
        m.nome.toLowerCase().includes(q) ||
        m.ministerio.toLowerCase().includes(q) ||
        m.cargo.toLowerCase().includes(q)
    )
  }
  return result
}

export const birthdayService = {
  async getDoDia(filters?: BirthdayFilters): Promise<Membro[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("membros")
      .select("*")

    if (error) throw new Error(error.message)
    const hoje = new Date()
    const result = (data || [])
      .map(mapRowToMembro)
      .filter((m) => isSameMonthDay(m.dataNascimento, hoje))
    return applyFilters(result, filters)
  },

  async getDaSemana(filters?: BirthdayFilters): Promise<Membro[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("membros")
      .select("*")

    if (error) throw new Error(error.message)
    const { inicio, fim } = getWeekRange()
    const result = (data || [])
      .map(mapRowToMembro)
      .filter((m) => isInWeek(m.dataNascimento, inicio, fim))
    return applyFilters(result, filters)
  },

  async getDoMes(mes?: number, filters?: BirthdayFilters): Promise<Membro[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("membros")
      .select("*")

    if (error) throw new Error(error.message)
    const targetMes = mes ?? new Date().getMonth()
    const result = (data || [])
      .map(mapRowToMembro)
      .filter((m) => isInMonth(m.dataNascimento, targetMes))
    return applyFilters(result, filters)
  },

  async getMinisterios(): Promise<string[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("membros")
      .select("ministerio")

    if (error) throw new Error(error.message)
    const ministerios = new Set((data || []).map((m) => m.ministerio))
    return Array.from(ministerios).sort()
  },

  getFaixasEtarias() {
    return faixasEtarias
  },

  getAge,
}

import { createClient } from "@/lib/supabase/client"
import { mapMembroToRow, mapRowToMembro } from "@/lib/supabase/mapping"
import { Membro } from "@/types"
import { validateMembro, ValidationError } from "@/lib/validate"
import { logger } from "@/lib/logger"

function handleError(err: unknown, operation: string): never {
  if (err instanceof ValidationError) throw err
  const message = err instanceof Error ? err.message : "Erro inesperado"
  logger.error(`Falha em ${operation}`, "MemberService", { error: message })
  throw new Error(message)
}

export const memberService = {
  async list(): Promise<Membro[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("membros")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      logger.error("Erro ao listar membros", "MemberService", { error: error.message })
      throw new Error(error.message)
    }
    logger.debug(`${data?.length || 0} membros carregados`, "MemberService")
    return (data || []).map(mapRowToMembro)
  },

  async getById(id: string): Promise<Membro | undefined> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("membros")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      logger.debug(`Membro não encontrado: ${id}`, "MemberService")
      return undefined
    }
    return mapRowToMembro(data)
  },

  async create(data: unknown): Promise<Membro> {
    const supabase = createClient()
    const validated = validateMembro(data)
    const row = mapMembroToRow(validated as never)

    const { data: created, error } = await supabase
      .from("membros")
      .insert(row)
      .select()
      .single()

    if (error) handleError(error, "criar membro")
    logger.info(`Membro criado: ${created!.nome}`, "MemberService", { id: created!.id })
    return mapRowToMembro(created!)
  },

  async update(id: string, data: unknown): Promise<Membro> {
    const supabase = createClient()
    const validated = validateMembro(data)
    const row = mapMembroToRow(validated as never)

    const { data: updated, error } = await supabase
      .from("membros")
      .update(row)
      .eq("id", id)
      .select()
      .single()

    if (error) handleError(error, "atualizar membro")
    logger.info(`Membro atualizado: ${updated!.nome}`, "MemberService", { id })
    return mapRowToMembro(updated!)
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from("membros")
      .delete()
      .eq("id", id)

    if (error) {
      logger.error("Erro ao excluir membro", "MemberService", { id, error: error.message })
      throw new Error(error.message)
    }
    logger.info(`Membro excluído: ${id}`, "MemberService")
  },

  async search(query: string): Promise<Membro[]> {
    const supabase = createClient()
    const q = `%${query.toLowerCase()}%`

    const { data, error } = await supabase
      .from("membros")
      .select("*")
      .or(`nome.ilike.${q},email.ilike.${q},telefone.ilike.${q},cargo.ilike.${q},ministerio.ilike.${q}`)
      .order("created_at", { ascending: false })

    if (error) {
      logger.error("Erro ao buscar membros", "MemberService", { query, error: error.message })
      throw new Error(error.message)
    }
    logger.debug(`Busca por "${query}": ${data?.length || 0} resultados`, "MemberService")
    return (data || []).map(mapRowToMembro)
  },

  async getMinistries(): Promise<string[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("membros")
      .select("ministerio")

    if (error) {
      logger.error("Erro ao listar ministérios", "MemberService", { error: error.message })
      throw new Error(error.message)
    }
    const ministries = [...new Set((data || []).map((m) => m.ministerio))]
    return ministries.sort()
  },
}

import { createClient } from "@/lib/supabase/client"
import { mapEscalaToRow, mapRowToEscala } from "@/lib/supabase/mapping"
import { Escala } from "@/types"
import { MINISTERIOS } from "@/constants"
import { validateEscala, ValidationError } from "@/lib/validate"
import { logger } from "@/lib/logger"

function handleError(err: unknown, operation: string): never {
  if (err instanceof ValidationError) throw err
  const message = err instanceof Error ? err.message : "Erro inesperado"
  logger.error(`Falha em ${operation}`, "ScheduleService", { error: message })
  throw new Error(message)
}

export const scheduleService = {
  async list(): Promise<Escala[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("escalas")
      .select("*")
      .order("data", { ascending: true })

    if (error) {
      logger.error("Erro ao listar escalas", "ScheduleService", { error: error.message })
      throw new Error(error.message)
    }
    logger.debug(`${data?.length || 0} escalas carregadas`, "ScheduleService")
    return (data || []).map(mapRowToEscala)
  },

  async getById(id: string): Promise<Escala | undefined> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("escalas")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      logger.debug(`Escala não encontrada: ${id}`, "ScheduleService")
      return undefined
    }
    return mapRowToEscala(data)
  },

  async create(data: unknown): Promise<Escala> {
    const supabase = createClient()
    const validated = validateEscala(data)
    const row = mapEscalaToRow(validated as never)

    const { data: created, error } = await supabase
      .from("escalas")
      .insert(row)
      .select()
      .single()

    if (error) handleError(error, "criar escala")
    logger.info(`Escala criada: ${created!.ministerio} em ${created!.data}`, "ScheduleService", {
      id: created!.id,
    })
    return mapRowToEscala(created!)
  },

  async update(id: string, data: unknown): Promise<Escala> {
    const supabase = createClient()
    const validated = validateEscala(data)
    const row = mapEscalaToRow(validated as never)

    const { data: updated, error } = await supabase
      .from("escalas")
      .update(row)
      .eq("id", id)
      .select()
      .single()

    if (error) handleError(error, "atualizar escala")
    logger.info(`Escala atualizada: ${id}`, "ScheduleService")
    return mapRowToEscala(updated!)
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from("escalas")
      .delete()
      .eq("id", id)

    if (error) {
      logger.error("Erro ao excluir escala", "ScheduleService", { id, error: error.message })
      throw new Error(error.message)
    }
    logger.info(`Escala excluída: ${id}`, "ScheduleService")
  },

  getMinisterios(): string[] {
    return [...MINISTERIOS]
  },
}

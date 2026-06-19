import { createClient } from "@/lib/supabase/client"
import { mapEventoToRow, mapRowToEvento } from "@/lib/supabase/mapping"
import { Evento } from "@/types"
import { validateEvento, ValidationError } from "@/lib/validate"
import { logger } from "@/lib/logger"

function handleError(err: unknown, operation: string): never {
  if (err instanceof ValidationError) throw err
  const message = err instanceof Error ? err.message : "Erro inesperado"
  logger.error(`Falha em ${operation}`, "EventService", { error: message })
  throw new Error(message)
}

export const eventService = {
  async list(): Promise<Evento[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("data", { ascending: true })

    if (error) {
      logger.error("Erro ao listar eventos", "EventService", { error: error.message })
      throw new Error(error.message)
    }
    logger.debug(`${data?.length || 0} eventos carregados`, "EventService")
    return (data || []).map(mapRowToEvento)
  },

  async getById(id: string): Promise<Evento | undefined> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      logger.debug(`Evento não encontrado: ${id}`, "EventService")
      return undefined
    }
    return mapRowToEvento(data)
  },

  async create(data: unknown): Promise<Evento> {
    const supabase = createClient()
    const validated = validateEvento(data)
    const row = mapEventoToRow(validated as never)

    const { data: created, error } = await supabase
      .from("eventos")
      .insert(row)
      .select()
      .single()

    if (error) handleError(error, "criar evento")
    logger.info(`Evento criado: ${created!.titulo}`, "EventService", { id: created!.id })
    return mapRowToEvento(created!)
  },

  async update(id: string, data: unknown): Promise<Evento> {
    const supabase = createClient()
    const validated = validateEvento(data)
    const row = mapEventoToRow(validated as never)

    const { data: updated, error } = await supabase
      .from("eventos")
      .update(row)
      .eq("id", id)
      .select()
      .single()

    if (error) handleError(error, "atualizar evento")
    logger.info(`Evento atualizado: ${updated!.titulo}`, "EventService", { id })
    return mapRowToEvento(updated!)
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id", id)

    if (error) {
      logger.error("Erro ao excluir evento", "EventService", { id, error: error.message })
      throw new Error(error.message)
    }
    logger.info(`Evento excluído: ${id}`, "EventService")
  },

  getCategorias(): { value: string; label: string }[] {
    return [
      { value: "culto_especial", label: "Culto Especial" },
      { value: "conferencia", label: "Conferência" },
      { value: "congresso", label: "Congresso" },
      { value: "vigilia", label: "Vigília" },
      { value: "encontro_casais", label: "Encontro de Casais" },
      { value: "evento_jovem", label: "Evento Jovem" },
    ]
  },
}

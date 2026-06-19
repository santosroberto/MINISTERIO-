import { membroSchema, escalaSchema, eventoSchema } from "@/lib/schemas"
import type { MembroSchemaType, EscalaSchemaType, EventoSchemaType } from "@/lib/schemas"
import { sanitizeObject } from "./sanitize"

export class ValidationError extends Error {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message)
    this.name = "ValidationError"
  }
}

export function validateMembro(data: unknown): MembroSchemaType {
  const result = membroSchema.safeParse(data)
  if (!result.success) {
    const fields: Record<string, string[]> = {}
    for (const issue of result.error.issues) {
      const key = issue.path.join(".")
      if (!fields[key]) fields[key] = []
      fields[key].push(issue.message)
    }
    throw new ValidationError("Dados inválidos do membro.", fields)
  }
  return sanitizeObject(result.data) as MembroSchemaType
}

export function validateEvento(data: unknown): EventoSchemaType {
  const result = eventoSchema.safeParse(data)
  if (!result.success) {
    const fields: Record<string, string[]> = {}
    for (const issue of result.error.issues) {
      const key = issue.path.join(".")
      if (!fields[key]) fields[key] = []
      fields[key].push(issue.message)
    }
    throw new ValidationError("Dados inválidos do evento.", fields)
  }
  return sanitizeObject(result.data) as EventoSchemaType
}

export function validateEscala(data: unknown): EscalaSchemaType {
  const result = escalaSchema.safeParse(data)
  if (!result.success) {
    const fields: Record<string, string[]> = {}
    for (const issue of result.error.issues) {
      const key = issue.path.join(".")
      if (!fields[key]) fields[key] = []
      fields[key].push(issue.message)
    }
    throw new ValidationError("Dados inválidos da escala.", fields)
  }
  return sanitizeObject(result.data) as EscalaSchemaType
}

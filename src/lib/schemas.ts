import { z } from "zod"
import { CATEGORIAS_EVENTO } from "@/constants"

const categoriaValues = CATEGORIAS_EVENTO.map((c) => c.value) as [string, ...string[]]

export const membroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido").max(20),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  endereco: z.string().min(5, "Endereço deve ter no mínimo 5 caracteres"),
  estadoCivil: z.string().min(1, "Estado civil é obrigatório"),
  cargo: z.string().min(2, "Cargo deve ter no mínimo 2 caracteres"),
  ministerio: z.string().min(2, "Ministério deve ter no mínimo 2 caracteres"),
  dataBatismo: z.string().min(1, "Data de batismo é obrigatória"),
  observacoes: z.string().default(""),
})

export type MembroSchemaType = z.input<typeof membroSchema>

export const escalaSchema = z.object({
  ministerio: z.string().min(1, "Selecione um ministério"),
  data: z.string().min(1, "Data é obrigatória"),
  horaInicio: z.string().min(1, "Horário de início é obrigatório"),
  horaFim: z.string().min(1, "Horário de fim é obrigatório"),
  responsaveis: z.array(z.string()).min(1, "Selecione pelo menos um responsável"),
  observacoes: z.string().default(""),
})

export type EscalaSchemaType = z.input<typeof escalaSchema>

export const eventoSchema = z.object({
  titulo: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(100, "Título muito longo"),
  categoria: z.enum(categoriaValues, "Selecione uma categoria"),
  data: z.string().min(1, "Data é obrigatória"),
  hora: z.string().min(1, "Horário é obrigatório"),
  local: z.string().min(3, "Local deve ter no mínimo 3 caracteres"),
  descricao: z.string().min(5, "Descrição deve ter no mínimo 5 caracteres"),
})

export type EventoSchemaType = z.input<typeof eventoSchema>

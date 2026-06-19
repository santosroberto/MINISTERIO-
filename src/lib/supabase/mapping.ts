import { Membro, MembroFormData, Escala, EscalaFormData, Evento, EventoFormData } from "@/types"
import { Database } from "./database.types"

type MembroRow = Database["public"]["Tables"]["membros"]["Row"]
type EventoRow = Database["public"]["Tables"]["eventos"]["Row"]
type EscalaRow = Database["public"]["Tables"]["escalas"]["Row"]

export function mapMembroToRow(data: MembroFormData): Database["public"]["Tables"]["membros"]["Insert"] {
  return {
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    data_nascimento: data.dataNascimento,
    endereco: data.endereco,
    estado_civil: data.estadoCivil,
    cargo: data.cargo,
    ministerio: data.ministerio,
    data_batismo: data.dataBatismo,
    observacoes: data.observacoes || "",
    foto_url: data.foto || null,
  }
}

export function mapRowToMembro(row: MembroRow): Membro {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    dataNascimento: row.data_nascimento,
    endereco: row.endereco,
    estadoCivil: row.estado_civil,
    cargo: row.cargo,
    ministerio: row.ministerio,
    dataBatismo: row.data_batismo,
    dataEntrada: row.data_entrada,
    observacoes: row.observacoes || "",
    foto: row.foto_url || undefined,
    ativo: row.ativo,
    createdAt: row.created_at,
  }
}

export function mapEventoToRow(data: EventoFormData): Database["public"]["Tables"]["eventos"]["Insert"] {
  return {
    titulo: data.titulo,
    data: data.data,
    hora: data.hora,
    local: data.local,
    descricao: data.descricao,
    categoria: data.categoria,
  }
}

export function mapRowToEvento(row: EventoRow): Evento {
  return {
    id: row.id,
    titulo: row.titulo,
    data: row.data,
    hora: row.hora,
    local: row.local,
    descricao: row.descricao,
    categoria: row.categoria as Evento["categoria"],
    createdAt: row.created_at,
  }
}

export function mapEscalaToRow(data: EscalaFormData): Database["public"]["Tables"]["escalas"]["Insert"] {
  return {
    ministerio: data.ministerio,
    data: data.data,
    hora_inicio: data.horaInicio,
    hora_fim: data.horaFim,
    responsaveis: data.responsaveis,
    observacoes: data.observacoes || "",
  }
}

export function mapRowToEscala(row: EscalaRow): Escala {
  return {
    id: row.id,
    ministerio: row.ministerio,
    data: row.data,
    horaInicio: row.hora_inicio,
    horaFim: row.hora_fim,
    responsaveis: row.responsaveis,
    observacoes: row.observacoes || "",
    createdAt: row.created_at,
  }
}

export interface Membro {
  id: string
  nome: string
  email: string
  telefone: string
  dataNascimento: string
  endereco: string
  estadoCivil: string
  cargo: string
  ministerio: string
  dataBatismo: string
  dataEntrada: string
  observacoes: string
  foto?: string
  ativo: boolean
  createdAt: string
}

export interface MembroFormData {
  nome: string
  email: string
  telefone: string
  dataNascimento: string
  endereco: string
  estadoCivil: string
  cargo: string
  ministerio: string
  dataBatismo: string
  observacoes?: string
  foto?: string
}

export interface Escala {
  id: string
  ministerio: string
  data: string
  horaInicio: string
  horaFim: string
  responsaveis: string[]
  observacoes: string
  createdAt: string
}

export interface EscalaFormData {
  ministerio: string
  data: string
  horaInicio: string
  horaFim: string
  responsaveis: string[]
  observacoes?: string
}

export interface Evento {
  id: string
  titulo: string
  data: string
  hora: string
  local: string
  descricao: string
  categoria: "culto_especial" | "conferencia" | "congresso" | "vigilia" | "encontro_casais" | "evento_jovem"
  createdAt: string
}

export interface EventoFormData {
  titulo: string
  data: string
  hora: string
  local: string
  descricao: string
  categoria: "culto_especial" | "conferencia" | "congresso" | "vigilia" | "encontro_casais" | "evento_jovem"
}

export interface DashboardStats {
  totalMembros: number
  novosMembrosMes: number
  membrosAtivos: number
  totalEventos: number
  totalEscalas: number
  aniversariantesSemana: number
  eventosProximos: number
  escalasProgramadas: number
}

export interface CrescimentoMensal {
  mes: string
  entradas: number
  saidas: number
}

export interface ParticipacaoMinisterio {
  ministerio: string
  membros: number
}

export interface EventosPorMes {
  mes: string
  eventos: number
}

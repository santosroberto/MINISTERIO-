export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nome: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          avatar_url?: string | null
        }
        Update: {
          nome?: string
          email?: string
          avatar_url?: string | null
        }
      }
      membros: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string
          data_nascimento: string
          endereco: string
          estado_civil: string
          cargo: string
          ministerio: string
          data_batismo: string
          data_entrada: string
          observacoes: string
          foto_url: string | null
          ativo: boolean
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          nome: string
          email: string
          telefone: string
          data_nascimento: string
          endereco: string
          estado_civil: string
          cargo: string
          ministerio: string
          data_batismo: string
          data_entrada?: string
          observacoes?: string
          foto_url?: string | null
          ativo?: boolean
        }
        Update: {
          nome?: string
          email?: string
          telefone?: string
          data_nascimento?: string
          endereco?: string
          estado_civil?: string
          cargo?: string
          ministerio?: string
          data_batismo?: string
          observacoes?: string
          foto_url?: string | null
          ativo?: boolean
        }
      }
      eventos: {
        Row: {
          id: string
          titulo: string
          data: string
          hora: string
          local: string
          descricao: string
          categoria: string
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          titulo: string
          data: string
          hora: string
          local: string
          descricao: string
          categoria: string
        }
        Update: {
          titulo?: string
          data?: string
          hora?: string
          local?: string
          descricao?: string
          categoria?: string
        }
      }
      escalas: {
        Row: {
          id: string
          ministerio: string
          data: string
          hora_inicio: string
          hora_fim: string
          responsaveis: string[]
          observacoes: string
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          ministerio: string
          data: string
          hora_inicio: string
          hora_fim: string
          responsaveis: string[]
          observacoes?: string
        }
        Update: {
          ministerio?: string
          data?: string
          hora_inicio?: string
          hora_fim?: string
          responsaveis?: string[]
          observacoes?: string
        }
      }
    }
  }
}

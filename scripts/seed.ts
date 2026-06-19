import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log("🌱 Seeding database...")

  // Seed membros
  const membros = [
    { nome: "João Silva", email: "joao.silva@email.com", telefone: "(11) 99999-0001", data_nascimento: "1985-03-15", endereco: "Rua das Flores, 123 - Centro", estado_civil: "Casado(a)", cargo: "Pastor Titular", ministerio: "Liderança", data_batismo: "2000-01-10", ativo: true },
    { nome: "Maria Oliveira", email: "maria.oliveira@email.com", telefone: "(11) 99999-0002", data_nascimento: "1990-07-22", endereco: "Av. Principal, 456 - Jardins", estado_civil: "Solteiro(a)", cargo: "Diácona", ministerio: "Ação Social", data_batismo: "2005-06-15", ativo: true },
    { nome: "Pedro Santos", email: "pedro.santos@email.com", telefone: "(11) 99999-0003", data_nascimento: "1978-11-08", endereco: "Rua da Igreja, 789 - Centro", estado_civil: "Casado(a)", cargo: "Presbítero", ministerio: "Ensino", data_batismo: "1998-12-25", ativo: true },
    { nome: "Ana Costa", email: "ana.costa@email.com", telefone: "(11) 99999-0004", data_nascimento: "1995-02-18", endereco: "Rua Nova, 321 - Vila Nova", estado_civil: "Solteiro(a)", cargo: "Membro", ministerio: "Louvor", data_batismo: "2010-04-20", ativo: true },
    { nome: "Carlos Pereira", email: "carlos.pereira@email.com", telefone: "(11) 99999-0005", data_nascimento: "1982-09-30", endereco: "Av. Central, 654 - Centro", estado_civil: "Casado(a)", cargo: "Tesoureiro", ministerio: "Administrativo", data_batismo: "2003-08-12", ativo: true },
    { nome: "Lúcia Mendes", email: "lucia.mendes@email.com", telefone: "(11) 99999-0006", data_nascimento: "1988-12-05", endereco: "Rua do Sol, 100 - Centro", estado_civil: "Casado(a)", cargo: "Membro", ministerio: "Louvor", data_batismo: "2008-03-22", ativo: true },
    { nome: "Roberto Almeida", email: "roberto.almeida@email.com", telefone: "(11) 99999-0007", data_nascimento: "1975-06-14", endereco: "Rua das Acácias, 200 - Jardim", estado_civil: "Casado(a)", cargo: "Diácono", ministerio: "Ação Social", data_batismo: "1995-11-30", ativo: true },
    { nome: "Fernanda Lima", email: "fernanda.lima@email.com", telefone: "(11) 99999-0008", data_nascimento: "1992-08-25", endereco: "Rua Azul, 500 - Centro", estado_civil: "Solteiro(a)", cargo: "Membro", ministerio: "Infantil", data_batismo: "2012-05-18", ativo: true },
    { nome: "Antônio Souza", email: "antonio.souza@email.com", telefone: "(11) 99999-0009", data_nascimento: "1968-04-10", endereco: "Rua Velha, 300 - Centro", estado_civil: "Viúvo(a)", cargo: "Presbítero", ministerio: "Ensino", data_batismo: "1988-07-15", ativo: true },
    { nome: "Juliana Martins", email: "juliana.martins@email.com", telefone: "(11) 99999-0010", data_nascimento: "1993-11-20", endereco: "Rua Verde, 150 - Parque", estado_civil: "Solteiro(a)", cargo: "Membro", ministerio: "Louvor", data_batismo: "2013-09-10", ativo: true },
    { nome: "Paulo Ricardo", email: "paulo.ricardo@email.com", telefone: "(11) 99999-0011", data_nascimento: "1980-01-28", endereco: "Rua dos Ipês, 700 - Jardim", estado_civil: "Casado(a)", cargo: "Membro", ministerio: "Juventude", data_batismo: "2002-10-05", ativo: true },
    { nome: "Beatriz Campos", email: "beatriz.campos@email.com", telefone: "(11) 99999-0012", data_nascimento: "1987-09-12", endereco: "Rua Amarela, 250 - Centro", estado_civil: "Divorciado(a)", cargo: "Membro", ministerio: "Infantil", data_batismo: "2007-12-20", ativo: false },
    { nome: "Marcos Vinícius", email: "marcos.vinicius@email.com", telefone: "(11) 99999-0013", data_nascimento: "1990-05-08", endereco: "Rua Larga, 800 - Centro", estado_civil: "Solteiro(a)", cargo: "Membro", ministerio: "Juventude", data_batismo: "2010-08-14", ativo: true },
    { nome: "Sandra Vieira", email: "sandra.vieira@email.com", telefone: "(11) 99999-0014", data_nascimento: "1983-12-01", endereco: "Rua do Porto, 400 - Centro", estado_civil: "Casado(a)", cargo: "Membro", ministerio: "Ação Social", data_batismo: "2004-06-30", ativo: true },
    { nome: "Felipe Araújo", email: "felipe.araujo@email.com", telefone: "(11) 99999-0015", data_nascimento: "1995-10-15", endereco: "Rua Nova Esperança, 600 - Parque", estado_civil: "Solteiro(a)", cargo: "Membro", ministerio: "Louvor", data_batismo: "2015-02-28", ativo: true },
  ]

  const { error: membrosError } = await supabase.from("membros").upsert(membros, { onConflict: "email" })
  if (membrosError) { console.error("Error seeding membros:", membrosError) }
  else { console.log(`✅ ${membros.length} membros seeded`) }

  // Get seeded membros for IDs
  const { data: seededMembros } = await supabase.from("membros").select("id, nome").limit(15)

  if (!seededMembros) {
    console.error("Failed to get seeded membros")
    return
  }

  const idMap = new Map(seededMembros.map((m, i) => [membros[i].nome, m.id]))

  // Seed eventos
  const eventos = [
    { titulo: "Culto Especial de Domingo", data: "2026-06-15", hora: "09:00", local: "Templo Principal", descricao: "Culto especial de celebração com ministração da Palavra.", categoria: "culto_especial" },
    { titulo: "Conferência de Louvor", data: "2026-07-01", hora: "19:00", local: "Salão de Eventos", descricao: "Três dias de conferência com ministérios de louvor convidados.", categoria: "conferencia" },
    { titulo: "Congresso de Jovens", data: "2026-07-20", hora: "14:00", local: "Área de Lazer da Igreja", descricao: "Congresso anual da juventude com palestras e dinâmicas.", categoria: "congresso" },
    { titulo: "Vigília de Oração", data: "2026-06-18", hora: "22:00", local: "Templo Principal", descricao: "Vigília de oração e jejum por toda a noite.", categoria: "vigilia" },
    { titulo: "Encontro de Casais", data: "2026-08-10", hora: "19:00", local: "Salão de Eventos", descricao: "Encontro especial para casais com palestra sobre relacionamento.", categoria: "encontro_casais" },
    { titulo: "Evento Jovem - Gincana", data: "2026-08-22", hora: "09:00", local: "Área de Lazer", descricao: "Gincana esportiva e cultural para os jovens da igreja.", categoria: "evento_jovem" },
    { titulo: "Culto Especial de Ação de Graças", data: "2026-09-07", hora: "19:00", local: "Templo Principal", descricao: "Culto de ação de graças pelo aniversário da igreja.", categoria: "culto_especial" },
    { titulo: "Conferência de Missões", data: "2026-09-15", hora: "19:00", local: "Templo Principal", descricao: "Conferência missionária com missionários convidados.", categoria: "conferencia" },
  ]

  const { error: eventosError } = await supabase.from("eventos").upsert(eventos, { onConflict: "titulo" })
  if (eventosError) { console.error("Error seeding eventos:", eventosError) }
  else { console.log(`✅ ${eventos.length} eventos seeded`) }

  // Seed escalas
  const escalas = [
    { ministerio: "Louvor", data: "2026-06-15", hora_inicio: "09:00", hora_fim: "11:00", responsaveis: [idMap.get("João Silva"), idMap.get("Ana Costa"), idMap.get("Juliana Martins"), idMap.get("Felipe Araújo")].filter(Boolean), observacoes: "Culto matutino - ensaio às 08h." },
    { ministerio: "Recepção", data: "2026-06-15", hora_inicio: "08:30", hora_fim: "11:30", responsaveis: [idMap.get("Maria Oliveira"), idMap.get("Roberto Almeida")].filter(Boolean), observacoes: "Recepção dos visitantes." },
    { ministerio: "Sonoplastia", data: "2026-06-16", hora_inicio: "19:00", hora_fim: "20:30", responsaveis: [idMap.get("Carlos Pereira"), idMap.get("Paulo Ricardo")].filter(Boolean), observacoes: "Reunião de oração - som e iluminação." },
    { ministerio: "Crianças", data: "2026-06-16", hora_inicio: "19:00", hora_fim: "20:30", responsaveis: [idMap.get("Fernanda Lima"), idMap.get("Beatriz Campos"), idMap.get("Sandra Vieira")].filter(Boolean), observacoes: "Ministério infantil durante a reunião." },
    { ministerio: "Louvor", data: "2026-06-17", hora_inicio: "18:00", hora_fim: "19:30", responsaveis: [idMap.get("Ana Costa"), idMap.get("Lúcia Mendes"), idMap.get("Felipe Araújo"), idMap.get("Juliana Martins")].filter(Boolean), observacoes: "Ensaio geral do ministério de louvor." },
  ]

  const { error: escalasError } = await supabase.from("escalas").insert(escalas)
  if (escalasError) { console.error("Error seeding escalas:", escalasError) }
  else { console.log(`✅ ${escalas.length} escalas seeded`) }

  console.log("🎉 Seed complete!")
}

seed().catch(console.error)

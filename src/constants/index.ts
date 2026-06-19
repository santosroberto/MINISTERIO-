export const CATEGORIAS_EVENTO = [
  { value: "culto_especial", label: "Culto Especial" },
  { value: "conferencia", label: "Conferência" },
  { value: "congresso", label: "Congresso" },
  { value: "vigilia", label: "Vigília" },
  { value: "encontro_casais", label: "Encontro de Casais" },
  { value: "evento_jovem", label: "Evento Jovem" },
] as const

export type CategoriaEvento = (typeof CATEGORIAS_EVENTO)[number]["value"]

export const CATEGORIA_LABELS: Record<string, string> = {
  culto_especial: "Culto Especial",
  conferencia: "Conferência",
  congresso: "Congresso",
  vigilia: "Vigília",
  encontro_casais: "Encontro de Casais",
  evento_jovem: "Evento Jovem",
}

export const CATEGORIA_COLORS: Record<string, string> = {
  culto_especial: "bg-violet-500 dark:bg-violet-600",
  conferencia: "bg-blue-500 dark:bg-blue-600",
  congresso: "bg-emerald-500 dark:bg-emerald-600",
  vigilia: "bg-indigo-500 dark:bg-indigo-600",
  encontro_casais: "bg-rose-500 dark:bg-rose-600",
  evento_jovem: "bg-amber-500 dark:bg-amber-600",
}

export const MINISTERIOS = [
  "Liderança",
  "Louvor",
  "Ensino",
  "Juventude",
  "Infantil",
  "Ação Social",
  "Administrativo",
  "Sonoplastia",
  "Mídia",
  "Recepção",
  "Diáconos",
  "Crianças",
] as const

export const MINISTERIO_COLORS: Record<string, string> = {
  Louvor: "bg-violet-500 dark:bg-violet-600",
  Sonoplastia: "bg-blue-500 dark:bg-blue-600",
  Mídia: "bg-cyan-500 dark:bg-cyan-600",
  Recepção: "bg-emerald-500 dark:bg-emerald-600",
  Diáconos: "bg-amber-500 dark:bg-amber-600",
  Crianças: "bg-rose-500 dark:bg-rose-600",
  Liderança: "bg-purple-500 dark:bg-purple-600",
  Ensino: "bg-indigo-500 dark:bg-indigo-600",
  Juventude: "bg-orange-500 dark:bg-orange-600",
  Infantil: "bg-pink-500 dark:bg-pink-600",
  "Ação Social": "bg-teal-500 dark:bg-teal-600",
  Administrativo: "bg-slate-500 dark:bg-slate-600",
}

export const CARGOS = [
  "Pastor Titular",
  "Pastor Auxiliar",
  "Presbítero",
  "Diácono",
  "Diácona",
  "Tesoureiro",
  "Secretário",
  "Membro",
] as const

export const ESTADO_CIVIL_OPTIONS = [
  { value: "Solteiro(a)", label: "Solteiro(a)" },
  { value: "Casado(a)", label: "Casado(a)" },
  { value: "Divorciado(a)", label: "Divorciado(a)" },
  { value: "Viúvo(a)", label: "Viúvo(a)" },
  { value: "União Estável", label: "União Estável" },
] as const

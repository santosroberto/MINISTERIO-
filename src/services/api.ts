import { memberService } from "./member-service"
import { eventService } from "./event-service"
import { scheduleService } from "./schedule-service"
import { birthdayService } from "./birthday-service"
import { reportService } from "./report-service"
import { Membro, Escala, Evento, CrescimentoMensal, ParticipacaoMinisterio, EventosPorMes, DashboardStats } from "@/types"

export const api = {
  async getMembros(): Promise<Membro[]> {
    return memberService.list()
  },

  async getMembro(id: string): Promise<Membro | undefined> {
    return memberService.getById(id)
  },

  async getEscalas(): Promise<Escala[]> {
    return scheduleService.list()
  },

  async getEventos(): Promise<Evento[]> {
    return eventService.list()
  },

  async getAniversariantes(): Promise<Membro[]> {
    return birthdayService.getDaSemana()
  },

  async getCrescimentoMensal(): Promise<CrescimentoMensal[]> {
    const { membros } = await reportService.getRawData()
    return reportService.getCrescimentoMensal(membros)
  },

  async getParticipacaoMinisterio(): Promise<ParticipacaoMinisterio[]> {
    const { membros } = await reportService.getRawData()
    return reportService.getParticipacaoMinisterio(membros)
  },

  async getEventosPorMes(): Promise<EventosPorMes[]> {
    const { eventos } = await reportService.getRawData()
    return reportService.getEventosPorMes(eventos)
  },

  async getEstatisticas(): Promise<DashboardStats> {
    const [membros, eventos, escalas] = await Promise.all([
      memberService.list(),
      eventService.list(),
      scheduleService.list(),
    ])

    const hoje = new Date()
    const mesAtual = hoje.getMonth()
    const anoAtual = hoje.getFullYear()
    const diaSemana = hoje.getDay()

    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - diaSemana)
    const fimSemana = new Date(inicioSemana)
    fimSemana.setDate(inicioSemana.getDate() + 6)

    const novosMembrosMes = membros.filter((m) => {
      const entrada = new Date(m.dataEntrada)
      return entrada.getMonth() === mesAtual && entrada.getFullYear() === anoAtual
    }).length

    const aniversariantesSemana = membros.filter((m) => {
      const nasc = new Date(m.dataNascimento)
      nasc.setFullYear(anoAtual)
      return nasc >= inicioSemana && nasc <= fimSemana
    }).length

    const eventosProximos = eventos.filter((e) => new Date(e.data) >= hoje).length
    const escalasProgramadas = escalas.filter((e) => new Date(e.data) >= hoje).length

    return {
      totalMembros: membros.length,
      novosMembrosMes,
      membrosAtivos: membros.filter((m) => m.ativo).length,
      totalEventos: eventos.length,
      totalEscalas: escalas.length,
      aniversariantesSemana,
      eventosProximos,
      escalasProgramadas,
    }
  },
}

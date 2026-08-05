import { progressStore, type UserProgress } from '../storage'

/** Motor de progresso genérico do Compasso.
 *
 *  Regra de futuro: TODO exercício (ache-a-nota, ouvido, ditado rítmico)
 *  fala com o progresso por estas duas funções — nunca direto no storage.
 *  Quem quiser inventar um jogo novo só precisa chamar award(). */

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

/** Registra atividade: soma XP, atualiza streak, marca conclusão opcional. */
export async function award(xp: number, completionId?: string): Promise<UserProgress> {
  const p = await progressStore.load()
  p.xp += xp

  const today = todayISO()
  if (p.lastActiveDate !== today) {
    p.streak = p.lastActiveDate === yesterdayISO() ? p.streak + 1 : 1
    p.lastActiveDate = today
  }

  if (completionId && !p.completed.includes(completionId)) {
    p.completed.push(completionId)
  }

  await progressStore.save(p)
  return p
}

export async function getProgress(): Promise<UserProgress> {
  return progressStore.load()
}

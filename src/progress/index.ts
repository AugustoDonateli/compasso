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

/** Marca ou desmarca um passo da trilha (concluir dá XP uma única vez). */
export async function setStepDone(stepId: string, done: boolean): Promise<UserProgress> {
  const p = await progressStore.load()
  const already = p.completed.includes(stepId)
  if (done && !already) {
    p.completed.push(stepId)
    p.xp += 50
    const today = new Date().toISOString().slice(0, 10)
    if (p.lastActiveDate !== today) {
      const d = new Date()
      d.setDate(d.getDate() - 1)
      p.streak = p.lastActiveDate === d.toISOString().slice(0, 10) ? p.streak + 1 : 1
      p.lastActiveDate = today
    }
  } else if (!done && already) {
    p.completed = p.completed.filter((id) => id !== stepId)
    p.xp = Math.max(0, p.xp - 50)
  }
  await progressStore.save(p)
  return p
}

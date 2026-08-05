import { progressStore, type UserProgress } from '../storage'
import { baixarProgresso, enviarProgresso, juntar, somarXpRemoto } from '../backend/perfil'

/** Motor de progresso genérico do Compasso.
 *
 *  Regra de futuro: TODO exercício (ache-a-nota, ouvido, ditado rítmico)
 *  fala com o progresso por estas funções — nunca direto no storage.
 *  Quem quiser inventar um jogo novo só precisa chamar award().
 *
 *  SINCRONIZAÇÃO: o localStorage continua sendo a fonte imediata — nada no
 *  site espera a rede pra responder. O servidor é uma segunda cópia,
 *  atualizada em segundo plano. Se a rede cair, tudo continua funcionando e
 *  sincroniza depois. */

/** Manda pro servidor sem travar a interface e sem quebrar se falhar. */
function sincronizarEmSegundoPlano(p: UserProgress): void {
  void enviarProgresso(p).catch(() => {})
}

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
  sincronizarEmSegundoPlano(p)
  // o XP semanal do ranking é somado no servidor, atomicamente
  void somarXpRemoto(xp).catch(() => {})
  return p
}

export async function getProgress(): Promise<UserProgress> {
  return progressStore.load()
}

/** Puxa o que está no servidor e junta com o local, SEM PERDER NADA.
 *  Chamado uma vez ao abrir o site. Se não houver rede, devolve o local. */
export async function sincronizar(): Promise<UserProgress> {
  const local = await progressStore.load()
  try {
    const remoto = await baixarProgresso()
    if (!remoto) {
      sincronizarEmSegundoPlano(local)
      return local
    }
    const junto = juntar(local, remoto)
    await progressStore.save(junto)
    sincronizarEmSegundoPlano(junto)
    return junto
  } catch {
    return local
  }
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
  sincronizarEmSegundoPlano(p)
  if (done && !already) void somarXpRemoto(50).catch(() => {})
  return p
}

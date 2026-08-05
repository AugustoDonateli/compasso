/** Contrato de persistência do progresso.
 *  NINGUÉM chama localStorage direto — só através do adaptador.
 *  Trocar pra Supabase = escrever um segundo adaptador, zero mudança nas telas. */

export interface UserProgress {
  /** XP total acumulado */
  xp: number
  /** Dias seguidos de prática */
  streak: number
  /** ISO date (YYYY-MM-DD) do último dia com atividade */
  lastActiveDate: string | null
  /** Ids de lições/exercícios concluídos */
  completed: string[]
  /** Preferências soltas (tema fica fora — é do design, não do progresso) */
  settings: Record<string, string>
}

export const EMPTY_PROGRESS: UserProgress = {
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  completed: [],
  settings: {},
}

export interface ProgressStore {
  load(): Promise<UserProgress>
  save(progress: UserProgress): Promise<void>
  clear(): Promise<void>
}

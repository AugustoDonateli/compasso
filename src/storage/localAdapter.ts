import { EMPTY_PROGRESS, type ProgressStore, type UserProgress } from './types'

const KEY = 'compasso.progress.v1'

/** Adaptador v1: localStorage. Async na assinatura de propósito —
 *  o contrato já nasce compatível com um backend remoto. */
export const localAdapter: ProgressStore = {
  async load(): Promise<UserProgress> {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return { ...EMPTY_PROGRESS }
      const parsed = JSON.parse(raw) as Partial<UserProgress>
      // merge defensivo: campos novos ganham default sem quebrar dados antigos
      return { ...EMPTY_PROGRESS, ...parsed }
    } catch {
      return { ...EMPTY_PROGRESS }
    }
  },

  async save(progress: UserProgress): Promise<void> {
    localStorage.setItem(KEY, JSON.stringify(progress))
  },

  async clear(): Promise<void> {
    localStorage.removeItem(KEY)
  },
}

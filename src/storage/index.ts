import { localAdapter } from './localAdapter'
import type { ProgressStore } from './types'

/** Ponto único de troca: quando vier o Supabase, muda-se SÓ esta linha. */
export const progressStore: ProgressStore = localAdapter

export type { ProgressStore, UserProgress } from './types'
export { EMPTY_PROGRESS } from './types'

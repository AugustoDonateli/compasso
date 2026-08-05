import type { DrumPiece } from '../../audio/instruments'

/** Padrões de groove — puros, sem UI, sem áudio.
 *  16 semicolcheias = 1 compasso de 4/4. */

export const STEPS = 16

/** Ordem de cima pra baixo, como na notação de bateria */
export const LANES: Array<{ id: DrumPiece; name: string }> = [
  { id: 'chimbal', name: 'chimbal' },
  { id: 'caixa', name: 'caixa' },
  { id: 'tom', name: 'tom' },
  { id: 'bumbo', name: 'bumbo' },
]

export type PatternSteps = Record<DrumPiece, boolean[]>

export interface Pattern {
  name: string
  bpm: number
  steps: PatternSteps
}

function lane(...active: number[]): boolean[] {
  const arr = new Array<boolean>(STEPS).fill(false)
  active.forEach((i) => {
    arr[i] = true
  })
  return arr
}

export function emptyPattern(): Pattern {
  return {
    name: 'sua levada',
    bpm: 90,
    steps: {
      chimbal: lane(),
      caixa: lane(),
      tom: lane(),
      bumbo: lane(),
    },
  }
}

/** Presets de estudo — aproximações honestas pro kit de 4 peças */
export const PRESETS: Pattern[] = [
  {
    name: 'rock básico',
    bpm: 96,
    steps: {
      chimbal: lane(0, 2, 4, 6, 8, 10, 12, 14),
      caixa: lane(4, 12),
      tom: lane(),
      bumbo: lane(0, 8),
    },
  },
  {
    name: 'funk',
    bpm: 100,
    steps: {
      chimbal: lane(0, 2, 4, 6, 8, 10, 12, 14),
      caixa: lane(4, 12),
      tom: lane(),
      bumbo: lane(0, 3, 10),
    },
  },
  {
    name: 'samba',
    bpm: 104,
    steps: {
      chimbal: lane(0, 2, 4, 6, 8, 10, 12, 14),
      caixa: lane(3, 6, 10, 13),
      tom: lane(),
      bumbo: lane(0, 6, 8, 14),
    },
  },
  {
    name: 'bossa',
    bpm: 76,
    steps: {
      chimbal: lane(0, 2, 4, 6, 8, 10, 12, 14),
      caixa: lane(0, 3, 6, 10, 13),
      tom: lane(),
      bumbo: lane(0, 6, 8, 14),
    },
  },
]

export function toggleStep(p: Pattern, laneId: DrumPiece, step: number): Pattern {
  const steps = { ...p.steps, [laneId]: p.steps[laneId].map((v, i) => (i === step ? !v : v)) }
  return { ...p, name: 'sua levada', steps }
}

/** Rótulo da contagem de cada semicolcheia: 1 e & a 2 e & a ... */
export function countLabel(step: number): string {
  const sub = step % 4
  if (sub === 0) return String(Math.floor(step / 4) + 1)
  return ['', 'e', '&', 'a'][sub]
}

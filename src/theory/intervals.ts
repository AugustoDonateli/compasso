import { mod12, type PitchClass } from './notes'

/** Intervalos por distância em semitons (0..12), com nomes brasileiros */
export interface Interval {
  semitones: number
  /** Nome completo: "terça maior" */
  name: string
  /** Abreviação: "3M" */
  short: string
}

export const INTERVALS: Interval[] = [
  { semitones: 0, name: 'uníssono', short: '1J' },
  { semitones: 1, name: 'segunda menor', short: '2m' },
  { semitones: 2, name: 'segunda maior', short: '2M' },
  { semitones: 3, name: 'terça menor', short: '3m' },
  { semitones: 4, name: 'terça maior', short: '3M' },
  { semitones: 5, name: 'quarta justa', short: '4J' },
  { semitones: 6, name: 'trítono', short: '4A/5d' },
  { semitones: 7, name: 'quinta justa', short: '5J' },
  { semitones: 8, name: 'sexta menor', short: '6m' },
  { semitones: 9, name: 'sexta maior', short: '6M' },
  { semitones: 10, name: 'sétima menor', short: '7m' },
  { semitones: 11, name: 'sétima maior', short: '7M' },
  { semitones: 12, name: 'oitava justa', short: '8J' },
]

/** Intervalo (em semitons, ascendente) entre duas pitch classes */
export function intervalBetween(from: PitchClass, to: PitchClass): Interval {
  return INTERVALS[mod12(to - from)]
}

/** Intervalo entre dois números MIDI, respeitando distância real (até uma oitava composta vira simples) */
export function intervalBetweenMidi(a: number, b: number): Interval {
  const dist = Math.abs(b - a)
  if (dist === 12) return INTERVALS[12]
  return INTERVALS[dist % 12]
}

export function transpose(pc: PitchClass, semitones: number): PitchClass {
  return mod12(pc + semitones)
}

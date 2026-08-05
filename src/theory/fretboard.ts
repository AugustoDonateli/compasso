import { midiToPc, nameToMidi, type PitchClass } from './notes'

export type InstrumentId = 'guitarra' | 'baixo' | 'violao'

export interface Tuning {
  instrument: InstrumentId
  name: string
  /** MIDI das cordas soltas, da corda mais grave (maior número/mais grossa) pra mais aguda.
   *  Índice 0 = corda 6 na guitarra (Mi grave). */
  openStrings: number[]
  frets: number
}

export const TUNINGS: Record<InstrumentId, Tuning> = {
  guitarra: {
    instrument: 'guitarra',
    name: 'Guitarra — afinação padrão',
    openStrings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map(nameToMidi),
    frets: 22,
  },
  violao: {
    instrument: 'violao',
    name: 'Violão — afinação padrão',
    openStrings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map(nameToMidi),
    frets: 19,
  },
  baixo: {
    instrument: 'baixo',
    name: 'Baixo 4 cordas — afinação padrão',
    openStrings: ['E1', 'A1', 'D2', 'G2'].map(nameToMidi),
    frets: 20,
  },
}

/** MIDI da nota em (corda, casa). stringIndex 0 = corda mais grave. fret 0 = solta. */
export function midiAt(tuning: Tuning, stringIndex: number, fret: number): number {
  if (stringIndex < 0 || stringIndex >= tuning.openStrings.length)
    throw new Error(`Corda inválida: ${stringIndex}`)
  if (fret < 0 || fret > tuning.frets) throw new Error(`Casa inválida: ${fret}`)
  return tuning.openStrings[stringIndex] + fret
}

/** Pitch class em (corda, casa) */
export function pcAt(tuning: Tuning, stringIndex: number, fret: number): PitchClass {
  return midiToPc(midiAt(tuning, stringIndex, fret))
}

/** Todas as posições (corda, casa) de uma pitch class até maxFret */
export function positionsOf(
  tuning: Tuning,
  pc: PitchClass,
  maxFret = tuning.frets,
): Array<{ string: number; fret: number }> {
  const out: Array<{ string: number; fret: number }> = []
  for (let s = 0; s < tuning.openStrings.length; s++) {
    for (let f = 0; f <= maxFret; f++) {
      if (midiToPc(tuning.openStrings[s] + f) === pc) out.push({ string: s, fret: f })
    }
  }
  return out
}

import { mod12, noteName, type PitchClass, type SpelledNote, pcOf } from './notes'

export type ChordQuality =
  | 'maior'
  | 'menor'
  | 'diminuto'
  | 'aumentado'
  | 'maior7'
  | 'menor7'
  | 'dominante7'
  | 'meio-diminuto'
  | 'diminuto7'

export interface ChordDef {
  quality: ChordQuality
  name: string
  /** Intervalos em semitons a partir da fundamental */
  steps: number[]
  /** Sufixo de cifra (padrão brasileiro de leitura, símbolos universais) */
  suffix: string
}

export const CHORDS: Record<ChordQuality, ChordDef> = {
  maior: { quality: 'maior', name: 'Maior', steps: [0, 4, 7], suffix: '' },
  menor: { quality: 'menor', name: 'Menor', steps: [0, 3, 7], suffix: 'm' },
  diminuto: { quality: 'diminuto', name: 'Diminuto', steps: [0, 3, 6], suffix: '°' },
  aumentado: { quality: 'aumentado', name: 'Aumentado', steps: [0, 4, 8], suffix: '+' },
  maior7: { quality: 'maior7', name: 'Maior com sétima maior', steps: [0, 4, 7, 11], suffix: '7M' },
  menor7: { quality: 'menor7', name: 'Menor com sétima', steps: [0, 3, 7, 10], suffix: 'm7' },
  dominante7: { quality: 'dominante7', name: 'Dominante', steps: [0, 4, 7, 10], suffix: '7' },
  'meio-diminuto': {
    quality: 'meio-diminuto',
    name: 'Meio-diminuto',
    steps: [0, 3, 6, 10],
    suffix: 'm7(♭5)',
  },
  diminuto7: { quality: 'diminuto7', name: 'Diminuto com sétima', steps: [0, 3, 6, 9], suffix: '°7' },
}

/** Pitch classes do acorde */
export function chordPcs(rootPc: PitchClass, quality: ChordQuality): PitchClass[] {
  return CHORDS[quality].steps.map((s) => mod12(rootPc + s))
}

/** Cifra: "C", "Am", "F♯m7(♭5)", "B♭7M"… */
export function chordSymbol(root: SpelledNote, quality: ChordQuality): string {
  return noteName(root) + CHORDS[quality].suffix
}

/** A nota pertence ao acorde? */
export function inChord(pc: PitchClass, rootPc: PitchClass, quality: ChordQuality): boolean {
  return chordPcs(rootPc, quality).includes(pc)
}

/** Papel da nota dentro do acorde (pra codificação por intensidade na UI) */
export type NoteRole = 'tonica' | 'acorde' | 'escala' | 'fora'

export function noteRole(
  pc: PitchClass,
  rootPc: PitchClass,
  quality: ChordQuality,
  scaleContains: (pc: PitchClass) => boolean,
): NoteRole {
  if (pc === rootPc) return 'tonica'
  if (inChord(pc, rootPc, quality)) return 'acorde'
  if (scaleContains(pc)) return 'escala'
  return 'fora'
}

export { pcOf }

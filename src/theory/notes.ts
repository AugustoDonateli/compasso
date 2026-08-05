/** Núcleo puro de teoria musical — sem React, sem áudio, sem DOM.
 *
 * Convenções:
 * - PitchClass: 0..11 (0 = Dó/C)
 * - midi: número MIDI (60 = Dó central / C4)
 * - Grafia correta por letra+acidente (Fá# maior tem Mi#, não Fá),
 *   porque é isso que separa uma ferramenta de estudo séria de um brinquedo.
 */

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

/** Nota grafada: letra + acidente (-2 = dobrado bemol .. +2 = dobrado sustenido) */
export interface SpelledNote {
  letter: Letter
  /** -2..2 — negativo = bemóis, positivo = sustenidos */
  accidental: number
}

export const LETTERS: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

/** Pitch class natural de cada letra */
export const LETTER_PC: Record<Letter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

/** Nome em solfejo de cada letra (padrão brasileiro) */
export const LETTER_SOLFEJO: Record<Letter, string> = {
  C: 'Dó',
  D: 'Ré',
  E: 'Mi',
  F: 'Fá',
  G: 'Sol',
  A: 'Lá',
  B: 'Si',
}

export function mod12(n: number): PitchClass {
  return (((n % 12) + 12) % 12) as PitchClass
}

export function pcOf(note: SpelledNote): PitchClass {
  return mod12(LETTER_PC[note.letter] + note.accidental)
}

const ACCIDENTAL_GLYPHS: Record<number, string> = {
  [-2]: '𝄫',
  [-1]: '♭',
  0: '',
  1: '♯',
  2: '𝄪',
}

/** Acidente em texto simples (pra cifras/IDs): bb, b, '', #, ## */
const ACCIDENTAL_ASCII: Record<number, string> = {
  [-2]: 'bb',
  [-1]: 'b',
  0: '',
  1: '#',
  2: '##',
}

/** "F♯", "B♭"… (formato cifra, com glifos tipográficos) */
export function noteName(note: SpelledNote): string {
  return note.letter + (ACCIDENTAL_GLYPHS[note.accidental] ?? '')
}

/** "F#", "Bb"… (formato ASCII pra chaves, URLs, samples) */
export function noteId(note: SpelledNote): string {
  return note.letter + (ACCIDENTAL_ASCII[note.accidental] ?? '')
}

/** "Fá♯", "Si♭"… (formato solfejo brasileiro) */
export function noteSolfejo(note: SpelledNote): string {
  return LETTER_SOLFEJO[note.letter] + (ACCIDENTAL_GLYPHS[note.accidental] ?? '')
}

/** Interpreta "C", "F#", "Bb", "E##"… como SpelledNote */
export function parseNote(id: string): SpelledNote {
  const m = /^([A-G])(##|bb|#|b)?$/.exec(id.trim())
  if (!m) throw new Error(`Nota inválida: "${id}"`)
  const letter = m[1] as Letter
  const acc = m[2] ?? ''
  const accidental = acc === '##' ? 2 : acc === '#' ? 1 : acc === 'bb' ? -2 : acc === 'b' ? -1 : 0
  return { letter, accidental }
}

/** Grafia padrão de cada pitch class fora de contexto tonal (preferência por sustenidos) */
const DEFAULT_SPELLING: SpelledNote[] = [
  { letter: 'C', accidental: 0 },
  { letter: 'C', accidental: 1 },
  { letter: 'D', accidental: 0 },
  { letter: 'D', accidental: 1 },
  { letter: 'E', accidental: 0 },
  { letter: 'F', accidental: 0 },
  { letter: 'F', accidental: 1 },
  { letter: 'G', accidental: 0 },
  { letter: 'G', accidental: 1 },
  { letter: 'A', accidental: 0 },
  { letter: 'A', accidental: 1 },
  { letter: 'B', accidental: 0 },
]

export function spellPc(pc: PitchClass): SpelledNote {
  return DEFAULT_SPELLING[pc]
}

/** MIDI -> pitch class */
export function midiToPc(midi: number): PitchClass {
  return mod12(midi)
}

/** MIDI -> oitava (convenção C4 = 60 -> oitava 4) */
export function midiToOctave(midi: number): number {
  return Math.floor(midi / 12) - 1
}

/** "A4" -> 69; usa grafia padrão. Formato aceito: nota + oitava, ex. "C4", "F#3", "Bb2" */
export function nameToMidi(id: string): number {
  const m = /^([A-G](?:##|bb|#|b)?)(-?\d+)$/.exec(id.trim())
  if (!m) throw new Error(`Nota+oitava inválida: "${id}"`)
  const note = parseNote(m[1])
  const octave = parseInt(m[2], 10)
  return (octave + 1) * 12 + pcOf(note)
}

/** 69 -> "A4" (grafia padrão com sustenidos) */
export function midiToName(midi: number): string {
  return noteId(spellPc(midiToPc(midi))) + midiToOctave(midi)
}

/** Frequência em Hz (lá 440) */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

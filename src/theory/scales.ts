import {
  LETTERS,
  LETTER_PC,
  mod12,
  pcOf,
  type Letter,
  type PitchClass,
  type SpelledNote,
} from './notes'

export type ScaleId =
  | 'maior'
  | 'menor-natural'
  | 'menor-harmonica'
  | 'menor-melodica'
  | 'pentatonica-maior'
  | 'pentatonica-menor'

export interface ScaleDef {
  id: ScaleId
  name: string
  /** Intervalos em semitons a partir da tônica */
  steps: number[]
  /** Grau da escala diatônica correspondente a cada nota (1-based), pra grafia por letra.
   *  Nas pentatônicas, indica quais graus da escala de 7 notas sobrevivem. */
  degrees: number[]
}

export const SCALES: Record<ScaleId, ScaleDef> = {
  maior: {
    id: 'maior',
    name: 'Maior',
    steps: [0, 2, 4, 5, 7, 9, 11],
    degrees: [1, 2, 3, 4, 5, 6, 7],
  },
  'menor-natural': {
    id: 'menor-natural',
    name: 'Menor natural',
    steps: [0, 2, 3, 5, 7, 8, 10],
    degrees: [1, 2, 3, 4, 5, 6, 7],
  },
  'menor-harmonica': {
    id: 'menor-harmonica',
    name: 'Menor harmônica',
    steps: [0, 2, 3, 5, 7, 8, 11],
    degrees: [1, 2, 3, 4, 5, 6, 7],
  },
  'menor-melodica': {
    id: 'menor-melodica',
    name: 'Menor melódica',
    steps: [0, 2, 3, 5, 7, 9, 11],
    degrees: [1, 2, 3, 4, 5, 6, 7],
  },
  'pentatonica-maior': {
    id: 'pentatonica-maior',
    name: 'Pentatônica maior',
    steps: [0, 2, 4, 7, 9],
    degrees: [1, 2, 3, 5, 6],
  },
  'pentatonica-menor': {
    id: 'pentatonica-menor',
    name: 'Pentatônica menor',
    steps: [0, 3, 5, 7, 10],
    degrees: [1, 3, 4, 5, 7],
  },
}

/** Escala com grafia correta: cada grau usa a letra seguinte à da tônica.
 *  É isso que faz Fá# maior ter Mi# (e não Fá), e Láb maior ter Réb (e não Dó#). */
export function spellScale(tonic: SpelledNote, scaleId: ScaleId): SpelledNote[] {
  const def = SCALES[scaleId]
  const tonicPc = pcOf(tonic)
  const tonicLetterIndex = LETTERS.indexOf(tonic.letter)

  return def.steps.map((step, i) => {
    const degree = def.degrees[i] // 1-based
    const letter: Letter = LETTERS[(tonicLetterIndex + degree - 1) % 7]
    const targetPc = mod12(tonicPc + step)
    // acidente = distância do pc alvo pro pc natural da letra, normalizada pra faixa -2..2
    let accidental = targetPc - LETTER_PC[letter]
    if (accidental > 6) accidental -= 12
    if (accidental < -6) accidental += 12
    return { letter, accidental }
  })
}

/** Pitch classes da escala (pra iluminar braço/teclado, sem se importar com grafia) */
export function scalePcs(tonicPc: PitchClass, scaleId: ScaleId): PitchClass[] {
  return SCALES[scaleId].steps.map((s) => mod12(tonicPc + s))
}

/** A nota pertence à escala? */
export function inScale(pc: PitchClass, tonicPc: PitchClass, scaleId: ScaleId): boolean {
  return scalePcs(tonicPc, scaleId).includes(pc)
}

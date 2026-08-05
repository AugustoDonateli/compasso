import { type SpelledNote } from './notes'
import { spellScale } from './scales'
import { chordSymbol, type ChordQuality } from './chords'

export type FieldMode = 'maior' | 'menor-natural'

/** Qualidade de cada grau no campo harmônico (tríades e tétrades) */
const FIELD_TRIADS: Record<FieldMode, ChordQuality[]> = {
  maior: ['maior', 'menor', 'menor', 'maior', 'maior', 'menor', 'diminuto'],
  'menor-natural': ['menor', 'diminuto', 'maior', 'menor', 'menor', 'maior', 'maior'],
}

const FIELD_SEVENTHS: Record<FieldMode, ChordQuality[]> = {
  maior: ['maior7', 'menor7', 'menor7', 'maior7', 'dominante7', 'menor7', 'meio-diminuto'],
  'menor-natural': [
    'menor7',
    'meio-diminuto',
    'maior7',
    'menor7',
    'menor7',
    'maior7',
    'dominante7',
  ],
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

export interface FieldDegree {
  /** 1..7 */
  degree: number
  /** Algarismo romano com a convenção de caixa: maiúscula = maior, minúscula = menor, ° = diminuto */
  roman: string
  root: SpelledNote
  quality: ChordQuality
  /** Cifra pronta: "Am", "G7", "F♯m7(♭5)"… */
  symbol: string
}

function romanFor(degree: number, quality: ChordQuality): string {
  const base = ROMAN[degree - 1]
  switch (quality) {
    case 'maior':
    case 'maior7':
    case 'dominante7':
    case 'aumentado':
      return base
    case 'menor':
    case 'menor7':
      return base.toLowerCase()
    case 'diminuto':
    case 'diminuto7':
    case 'meio-diminuto':
      return base.toLowerCase() + '°'
  }
}

/** Campo harmônico completo de uma tonalidade */
export function harmonicField(
  tonic: SpelledNote,
  mode: FieldMode,
  sevenths = false,
): FieldDegree[] {
  const scaleId = mode === 'maior' ? 'maior' : 'menor-natural'
  const notes = spellScale(tonic, scaleId)
  const qualities = (sevenths ? FIELD_SEVENTHS : FIELD_TRIADS)[mode]

  return notes.map((root, i) => {
    const quality = qualities[i]
    return {
      degree: i + 1,
      roman: romanFor(i + 1, quality),
      root,
      quality,
      symbol: chordSymbol(root, quality),
    }
  })
}

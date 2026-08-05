import { INTERVALS } from '../../theory/intervals'
import { CHORDS, chordPcs, type ChordQuality } from '../../theory/chords'
import { midiToPc, noteId, noteSolfejo, spellPc } from '../../theory/notes'

/** Treino de ouvido — geração e correção de exercícios. Puro e testável.
 *
 *  Regra de futuro: a trilha vai apontar pra estes mesmos exercícios
 *  ("hoje: 10 intervalos"); nada aqui sabe de React nem de Tone. */

export type ExerciseKind = 'nota' | 'intervalo' | 'acorde' | 'braco'
export type Level = 'facil' | 'completo'

export interface Question {
  kind: ExerciseKind
  /** notas MIDI a tocar, na ordem */
  midis: number[]
  /** tocar junto (acorde) ou em sequência */
  together: boolean
  /** id da alternativa correta */
  answerId: string
  /** alternativas oferecidas (id + rótulo) */
  options: Array<{ id: string; label: string }>
  /** frase mostrada depois de responder */
  explanation: string
}

const C4 = 60

/** Intervalos por nível: fácil pega os "âncora" que todo mundo reconhece */
const EASY_INTERVALS = [0, 4, 5, 7, 12]
const ALL_INTERVALS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const EASY_CHORDS: ChordQuality[] = ['maior', 'menor']
const ALL_CHORDS: ChordQuality[] = ['maior', 'menor', 'diminuto', 'aumentado', 'dominante7', 'maior7', 'menor7']

/** Notas naturais no fácil (dó ré mi fá sol lá si), cromático no completo */
const EASY_PCS = [0, 2, 4, 5, 7, 9, 11]
const ALL_PCS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

export function generate(kind: ExerciseKind, level: Level, rand: () => number = Math.random): Question {
  if (kind === 'braco') {
    // ouvido -> instrumento: soa uma nota, você acha ela no braço.
    // A resposta é a classe de altura: a mesma nota mora em vários lugares,
    // e descobrir isso É a lição.
    const pcs = level === 'facil' ? EASY_PCS : ALL_PCS
    const pc = pick(pcs, rand)
    const spelled = spellPc(pc as never)
    return {
      kind,
      midis: [C4 + pc],
      together: false,
      answerId: String(pc),
      options: [], // responde-se tocando no braço, não escolhendo alternativa
      explanation: `Era ${noteSolfejo(spelled)} (${noteId(spelled)}) — e ela mora em várias casas do braço, não só numa.`,
    }
  }

  if (kind === 'nota') {
    const pcs = level === 'facil' ? EASY_PCS : ALL_PCS
    const pc = pick(pcs, rand)
    const spelled = spellPc(pc as never)
    return {
      kind,
      // referência (dó) e depois a nota mistério — sem âncora não dá pra julgar
      midis: [C4, C4 + pc],
      together: false,
      answerId: String(pc),
      options: pcs.map((p) => ({ id: String(p), label: noteSolfejo(spellPc(p as never)) })),
      explanation: `Era ${noteSolfejo(spelled)} (${noteId(spelled)}) — a referência antes dela é sempre dó.`,
    }
  }

  if (kind === 'intervalo') {
    const semis = level === 'facil' ? EASY_INTERVALS : ALL_INTERVALS
    const semitones = pick(semis, rand)
    const root = C4 + Math.floor(rand() * 5)
    const interval = INTERVALS[semitones]
    return {
      kind,
      midis: [root, root + semitones],
      together: false,
      answerId: String(semitones),
      options: semis.map((s) => ({ id: String(s), label: INTERVALS[s].name })),
      explanation: `Era ${interval.name} (${interval.short}) — ${semitones} ${semitones === 1 ? 'semitom' : 'semitons'} de distância.`,
    }
  }

  const qualities = level === 'facil' ? EASY_CHORDS : ALL_CHORDS
  const quality = pick(qualities, rand)
  const rootPc = Math.floor(rand() * 12)
  const root = C4 + rootPc
  const pcs = chordPcs(rootPc as never, quality)
  // empilha subindo a partir da fundamental
  let prev = root
  const midis = pcs.map((pc, i) => {
    if (i === 0) return prev
    let m = prev - (prev % 12) + pc
    if (m <= prev) m += 12
    prev = m
    return m
  })
  return {
    kind: 'acorde',
    midis,
    together: true,
    answerId: quality,
    options: qualities.map((q) => ({ id: q, label: CHORDS[q].name })),
    explanation: `Era um acorde ${CHORDS[quality].name.toLowerCase()} — ${
      quality === 'maior'
        ? 'som aberto, alegre'
        : quality === 'menor'
          ? 'som fechado, melancólico'
          : 'som mais tenso'
    }.`,
  }
}

export function isCorrect(q: Question, answerId: string): boolean {
  return q.answerId === answerId
}

/** Registro de cada instrumento — treinar ouvido na região onde você toca.
 *  Baixista ouve intervalo no grave, onde ele é mais denso e difícil;
 *  treinar em dó central não prepara pra isso. */
export const REGISTER_SHIFT: Record<string, number> = {
  piano: 0,
  guitarra: -12,
  baixo: -24,
}

/** Desloca a pergunta de oitava sem mexer na resposta (a classe de altura
 *  e o intervalo continuam os mesmos — só a região muda). */
export function transposeQuestion(q: Question, semitones: number): Question {
  if (semitones === 0) return q
  return { ...q, midis: q.midis.map((m) => m + semitones) }
}

/** Rótulo da nota de um MIDI (pra mostrar o que soou) */
export function midiLabel(midi: number): string {
  return noteSolfejo(spellPc(midiToPc(midi)))
}

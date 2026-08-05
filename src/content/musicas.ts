import type { ChordQuality } from '../theory/chords'
import type { PitchClass } from '../theory/notes'

/** O Desmontador — a resposta direta à dor nº2 do site:
 *  "estudei a apostila, mas na hora de tocar não muda nada".
 *
 *  Aqui a teoria para de ser abstrata: você escolhe uma música que já
 *  conhece e vê a mesma sequência de graus que estudou na trilha
 *  acendendo dentro dela.
 *
 *  IMPORTANTE, sobre direitos: aqui não há letra, melodia nem áudio de
 *  música nenhuma. Sequência de acordes é procedimento harmônico, não obra
 *  protegida — é justamente por isso que tantas músicas diferentes usam a
 *  mesma. O site toca os acordes com seus próprios samples. */

export interface Trecho {
  /** grau na tonalidade: 1 = I, 6 = vi, etc. */
  grau: number
  /** quantos tempos esse acorde dura */
  tempos: number
}

export interface Musica {
  id: string
  titulo: string
  /** o que a pessoa reconhece: "o refrão", "a introdução" */
  parte: string
  /** classe de altura da tônica */
  tonica: PitchClass
  modo: 'maior' | 'menor'
  bpm: number
  progressao: Trecho[]
  /** a sacada — por que essa progressão faz o que faz */
  sacada: string
}

/** Os graus de uma tonalidade maior e menor, com a qualidade de cada um */
export const GRAUS_MAIOR: ChordQuality[] = [
  'maior',
  'menor',
  'menor',
  'maior',
  'maior',
  'menor',
  'diminuto',
]
export const GRAUS_MENOR: ChordQuality[] = [
  'menor',
  'diminuto',
  'maior',
  'menor',
  'menor',
  'maior',
  'maior',
]

/** Distância em semitons da tônica até cada grau */
export const INTERVALO_DO_GRAU_MAIOR = [0, 2, 4, 5, 7, 9, 11]
export const INTERVALO_DO_GRAU_MENOR = [0, 2, 3, 5, 7, 8, 10]

export const MUSICAS: Musica[] = [
  {
    id: 'quatro-acordes',
    titulo: 'A sequência dos quatro acordes',
    parte: 'a que está em tudo',
    tonica: 0,
    modo: 'maior',
    bpm: 92,
    progressao: [
      { grau: 1, tempos: 4 },
      { grau: 5, tempos: 4 },
      { grau: 6, tempos: 4 },
      { grau: 4, tempos: 4 },
    ],
    sacada:
      'I–V–vi–IV. Sai de casa, cria expectativa no V, escorrega pro relativo menor e volta pelo IV. Está por trás de um número absurdo de sucessos pop, rock e sertanejo — e depois que você percebe, começa a ouvir em todo lugar.',
  },
  {
    id: 'volta-por-cima',
    titulo: 'A cadência do refrão',
    parte: 'quando a música "chega"',
    tonica: 7,
    modo: 'maior',
    bpm: 96,
    progressao: [
      { grau: 4, tempos: 4 },
      { grau: 5, tempos: 4 },
      { grau: 1, tempos: 8 },
    ],
    sacada:
      'IV–V–I é a chegada mais definitiva que existe. O V cria uma tensão que praticamente exige o I — por isso essa sequência costuma fechar refrão, e por isso ela soa como "acabou".',
  },
  {
    id: 'blues',
    titulo: 'O blues de 12 compassos',
    parte: 'a forma inteira',
    tonica: 9,
    modo: 'maior',
    bpm: 84,
    progressao: [
      { grau: 1, tempos: 16 },
      { grau: 4, tempos: 8 },
      { grau: 1, tempos: 8 },
      { grau: 5, tempos: 4 },
      { grau: 4, tempos: 4 },
      { grau: 1, tempos: 8 },
    ],
    sacada:
      'Doze compassos, três acordes, e é a forma mais tocada da história da música popular. Todo rock and roll nasceu daqui. Se você souber essa forma, entra numa roda de blues em qualquer lugar do mundo sem combinar nada antes.',
  },
  {
    id: 'menor-melancolico',
    titulo: 'A sequência menor',
    parte: 'a que soa nostálgica',
    tonica: 9,
    modo: 'menor',
    bpm: 76,
    progressao: [
      { grau: 1, tempos: 4 },
      { grau: 6, tempos: 4 },
      { grau: 3, tempos: 4 },
      { grau: 7, tempos: 4 },
    ],
    sacada:
      'i–VI–III–VII. Repare que os três últimos são MAIORES mesmo a música sendo menor — é essa mistura que dá o ar agridoce, nostálgico. Muito rock melancólico e muita trilha de filme vivem aqui.',
  },
  {
    id: 'cadencia-andaluza',
    titulo: 'A descida espanhola',
    parte: 'a que desce',
    tonica: 9,
    modo: 'menor',
    bpm: 88,
    progressao: [
      { grau: 1, tempos: 4 },
      { grau: 7, tempos: 4 },
      { grau: 6, tempos: 4 },
      { grau: 5, tempos: 4 },
    ],
    sacada:
      'Cada acorde desce um degrau: i–VII–VI–V. Essa descida em passos é o som do flamenco, mas também aparece em rock e em música pop — o ouvido adora acompanhar uma linha que desce.',
  },
  {
    id: 'doo-wop',
    titulo: 'A sequência dos anos 50',
    parte: 'a mais romântica',
    tonica: 0,
    modo: 'maior',
    bpm: 68,
    progressao: [
      { grau: 1, tempos: 4 },
      { grau: 6, tempos: 4 },
      { grau: 4, tempos: 4 },
      { grau: 5, tempos: 4 },
    ],
    sacada:
      'I–vi–IV–V. É a mesma família da sequência dos quatro acordes, só em outra ordem — e a mudança de ordem muda tudo: esta soa vintage e romântica, aquela soa moderna e épica.',
  },
]

/** A classe de altura do acorde de um grau, dentro da tonalidade */
export function pcDoGrau(m: Musica, grau: number): PitchClass {
  const tab = m.modo === 'maior' ? INTERVALO_DO_GRAU_MAIOR : INTERVALO_DO_GRAU_MENOR
  return (((m.tonica + tab[grau - 1]) % 12) + 12) % 12 as PitchClass
}

export function qualidadeDoGrau(m: Musica, grau: number): ChordQuality {
  return (m.modo === 'maior' ? GRAUS_MAIOR : GRAUS_MENOR)[grau - 1]
}

/** Algarismo romano com a convenção de caixa: maiúscula = maior, minúscula = menor */
const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
export function romano(m: Musica, grau: number): string {
  const q = qualidadeDoGrau(m, grau)
  const base = ROMANOS[grau - 1]
  if (q === 'menor') return base.toLowerCase()
  if (q === 'diminuto') return base.toLowerCase() + '°'
  return base
}

/** Duração total da progressão, em tempos */
export function duracaoEmTempos(m: Musica): number {
  return m.progressao.reduce((soma, t) => soma + t.tempos, 0)
}

/** Qual trecho está soando no tempo N (com a progressão em loop) */
export function trechoNoTempo(m: Musica, tempo: number): number {
  const total = duracaoEmTempos(m)
  let t = ((tempo % total) + total) % total
  for (let i = 0; i < m.progressao.length; i++) {
    if (t < m.progressao[i].tempos) return i
    t -= m.progressao[i].tempos
  }
  return 0
}

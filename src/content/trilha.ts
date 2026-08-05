import type { PitchClass } from '../theory/notes'

/** A trilha do Compasso — o caminho que responde "o que eu pratico hoje?".
 *
 *  REGRA DE FUTURO: conteúdo é DADO, não código. Unidades, lições e perguntas
 *  vivem aqui; o motor (caminho, sessão, XP) não conhece nenhuma pergunta
 *  específica. Reordenar a trilha, reescrever um enunciado ou criar galhos
 *  por instrumento é mexer só neste arquivo.
 *
 *  ⚠️ CONTEÚDO EM RASCUNHO: as perguntas abaixo provam o motor. Elas serão
 *  reescritas com o Augusto — a qualidade e a progressão das perguntas é o
 *  ponto mais importante da trilha, e merece uma passada dedicada. */

/* ---------- tipos de pergunta ---------- */

interface Base {
  id: string
  /** frase mostrada depois de responder — toda pergunta vira aula */
  explica: string
}

/** Múltipla escolha conceitual. Reconhecimento: barato, bom pra introduzir. */
export interface QEscolha extends Base {
  tipo: 'escolha'
  enunciado: string
  alternativas: string[]
  correta: number
}

/** Ouvir e identificar. Reusa o motor do Ouvido. */
export interface QOuvir extends Base {
  tipo: 'ouvir'
  enunciado: string
  /** notas MIDI a tocar */
  midis: number[]
  /** tocar junto (acorde) ou em sequência (melódico) */
  junto: boolean
  alternativas: string[]
  correta: number
}

/** Montar clicando as notas no teclado. RECORDAÇÃO — o tipo que mais fixa,
 *  segundo a pesquisa. É o carro-chefe da trilha. */
export interface QMontar extends Base {
  tipo: 'montar'
  enunciado: string
  /** classes de altura esperadas, em qualquer ordem */
  alvo: PitchClass[]
  /** se true, cobra a ordem exata (escala); se false, só o conjunto (acorde) */
  ordenado: boolean
}

/** Achar a nota no braço do instrumento. Ponte ouvido/olho → dedo. */
export interface QAchar extends Base {
  tipo: 'achar'
  enunciado: string
  alvo: PitchClass
  /** se preenchido, toca essa nota em vez de mostrar o nome */
  tocarMidi?: number
}

/** Bater no tempo — mede precisão em milissegundos. O treino de ritmo que
 *  nenhum site de teoria faz bem, e o terreno do baterista. */
export interface QTempo extends Base {
  tipo: 'tempo'
  enunciado: string
  bpm: number
  /** quantas batidas o usuário precisa acertar */
  batidas: number
  /** tolerância em ms pra contar como acerto */
  toleranciaMs: number
}

export type Pergunta = QEscolha | QOuvir | QMontar | QAchar | QTempo

/* ---------- estrutura ---------- */

export interface Licao {
  id: string
  titulo: string
  perguntas: Pergunta[]
}

export interface Unidade {
  id: string
  n: number
  titulo: string
  /** o "guia da unidade": o que você vai sair sabendo, em uma frase */
  guia: string
  licoes: Licao[]
}

const C4 = 60

export const UNIDADES: Unidade[] = [
  {
    id: 'som-tem-nome',
    n: 1,
    titulo: 'O som tem nome',
    guia: 'Sair daqui sabendo nomear qualquer som que você toca — as sete notas, as cinco que faltavam e por que tudo se repete.',
    licoes: [
      {
        id: 'sete-notas',
        titulo: 'As sete notas',
        perguntas: [
          {
            id: 'u1l1q1',
            tipo: 'escolha',
            enunciado: 'Depois do si, qual nota vem?',
            alternativas: ['dó', 'lá', 'ré', 'acaba a sequência'],
            correta: 0,
            explica:
              'As sete notas formam um ciclo: depois do si volta pro dó, só que mais agudo. Música não é uma escada infinita de nomes — são sete que giram.',
          },
          {
            id: 'u1l1q2',
            tipo: 'ouvir',
            enunciado: 'Toquei dó e depois outra nota. Qual foi?',
            midis: [C4, C4 + 4],
            junto: false,
            alternativas: ['ré', 'mi', 'fá', 'sol'],
            correta: 1,
            explica: 'Era mi — a terceira nota da sequência a partir do dó.',
          },
          {
            id: 'u1l1q3',
            tipo: 'montar',
            enunciado: 'Toque as sete notas naturais, do dó ao si, em ordem.',
            alvo: [0, 2, 4, 5, 7, 9, 11],
            ordenado: true,
            explica:
              'Essas são as sete naturais: as teclas brancas do piano. Todo o resto da teoria é construído em cima delas.',
          },
        ],
      },
      {
        id: 'doze-notas',
        titulo: 'As cinco que faltavam',
        perguntas: [
          {
            id: 'u1l2q1',
            tipo: 'escolha',
            enunciado: 'Entre quais notas NÃO cabe um sustenido?',
            alternativas: ['dó e ré', 'mi e fá', 'sol e lá', 'lá e si'],
            correta: 1,
            explica:
              'Mi–fá e si–dó já são vizinhas coladas: não cabe nada entre elas. Por isso são 12 notas no total, e não 14. No braço, elas ficam em casas seguidas.',
          },
          {
            id: 'u1l2q2',
            tipo: 'montar',
            enunciado: 'Toque as cinco notas que ficam ENTRE as naturais.',
            alvo: [1, 3, 6, 8, 10],
            ordenado: false,
            explica:
              'São as teclas pretas: dó♯, ré♯, fá♯, sol♯ e lá♯. Sete naturais mais cinco: as 12 notas que existem.',
          },
          {
            id: 'u1l2q3',
            tipo: 'escolha',
            enunciado: 'Na guitarra, uma casa de distância equivale a quanto?',
            alternativas: ['um semitom', 'um tom', 'uma oitava', 'depende da corda'],
            correta: 0,
            explica:
              'Cada casa é um semitom — o menor passo que existe. Duas casas fazem um tom. É por isso que subir 2 casas às vezes muda de mi pra fá♯ e às vezes não.',
          },
        ],
      },
      {
        id: 'oitava',
        titulo: 'A oitava',
        perguntas: [
          {
            id: 'u1l3q1',
            tipo: 'ouvir',
            enunciado: 'Essas duas notas têm o mesmo nome?',
            midis: [C4, C4 + 12],
            junto: false,
            alternativas: ['sim, é a mesma nota mais aguda', 'não, são notas diferentes'],
            correta: 0,
            explica:
              'É a oitava: a mesma nota, o dobro da frequência. Soa tão parecido que a gente dá o mesmo nome pras duas.',
          },
          {
            id: 'u1l3q2',
            tipo: 'achar',
            enunciado: 'Ache um lá em qualquer lugar do braço.',
            alvo: 9,
            explica:
              'A mesma nota mora em vários lugares do braço — e todas essas posições são "lá". Descobrir isso é o que te liberta dos desenhos decorados.',
          },
        ],
      },
    ],
  },
  {
    id: 'o-pulso',
    n: 2,
    titulo: 'O pulso',
    guia: 'Ritmo é o que mais faz gente desistir. Aqui você sente o pulso, entende o compasso e para de se perder na contagem.',
    licoes: [
      {
        id: 'tempo',
        titulo: 'O tempo',
        perguntas: [
          {
            id: 'u2l1q1',
            tipo: 'escolha',
            enunciado: 'O que é o "pulso" de uma música?',
            alternativas: [
              'a batida constante que você bate o pé junto',
              'o volume da música',
              'a nota mais grave',
              'a velocidade do vocal',
            ],
            correta: 0,
            explica:
              'O pulso é a batida regular por baixo de tudo — é nele que você bate o pé sem pensar. Todo o resto do ritmo se organiza em cima dele.',
          },
          {
            id: 'u2l1q2',
            tipo: 'tempo',
            enunciado: 'Sinta o pulso e bata junto: 8 batidas a 80 bpm.',
            bpm: 80,
            batidas: 8,
            toleranciaMs: 160,
            explica:
              'Manter o pulso constante é mais difícil do que parece — e é exatamente o que separa quem sabe os acordes de quem consegue tocar a música.',
          },
        ],
      },
      {
        id: 'compasso',
        titulo: 'O compasso',
        perguntas: [
          {
            id: 'u2l2q1',
            tipo: 'escolha',
            enunciado: 'Num compasso 4/4, quantos tempos existem antes de recomeçar?',
            alternativas: ['dois', 'três', 'quatro', 'oito'],
            correta: 2,
            explica:
              'Quatro. Você conta 1-2-3-4 e volta pro 1. O 4/4 é onde mora quase tudo que você escuta — rock, pop, funk, sertanejo.',
          },
          {
            id: 'u2l2q2',
            tipo: 'escolha',
            enunciado: 'Numa levada de rock básica, a caixa cai em quais tempos?',
            alternativas: ['1 e 3', '2 e 4', 'todos', 'só no 1'],
            correta: 1,
            explica:
              'Caixa no 2 e no 4 — é o "tá" que responde o bumbo. Esse contratempo é a espinha do rock, do pop e do funk.',
          },
          {
            id: 'u2l2q3',
            tipo: 'tempo',
            enunciado: 'Bata só no tempo 1 de cada compasso: 4 compassos a 90 bpm.',
            bpm: 90,
            batidas: 4,
            toleranciaMs: 180,
            explica:
              'Sentir onde o compasso recomeça é o que te deixa entrar na música na hora certa — e voltar pro lugar quando se perde.',
          },
        ],
      },
    ],
  },
]

/* ---------- consultas ---------- */

export const TODAS_LICOES = UNIDADES.flatMap((u) =>
  u.licoes.map((l) => ({ unidade: u, licao: l })),
)

export function licaoPorId(id: string) {
  return TODAS_LICOES.find((x) => x.licao.id === id)
}

/** O próximo passo: a primeira lição não concluída. A resposta pra
 *  "o que eu pratico hoje?" — que é a promessa do nome do site. */
export function proximaLicao(concluidas: string[]) {
  return TODAS_LICOES.find((x) => !concluidas.includes(x.licao.id)) ?? null
}

export function licaoDesbloqueada(licaoId: string, concluidas: string[]): boolean {
  const i = TODAS_LICOES.findIndex((x) => x.licao.id === licaoId)
  if (i <= 0) return true
  return concluidas.includes(TODAS_LICOES[i - 1].licao.id)
}

export function progressoPct(concluidas: string[]): number {
  const feitas = TODAS_LICOES.filter((x) => concluidas.includes(x.licao.id)).length
  return Math.round((feitas / TODAS_LICOES.length) * 100)
}

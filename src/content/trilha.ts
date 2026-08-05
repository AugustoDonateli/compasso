import type { PitchClass } from '../theory/notes'
import type { InstrumentSoundId } from '../audio/instruments'
import type { DiagramaId } from '../app/trilha/Diagrama'
import { TRILHAS_DE_INSTRUMENTO } from './instrumentos'

/** Quem a pessoa É na trilha — diferente de qual SOM o site toca.
 *  Bateria não tem notas afinadas, então não existe como sampler de altura;
 *  mas existe como identidade de quem estuda. */
export type TrilhaInstrumento = InstrumentSoundId | 'bateria'

/** Duas trilhas paralelas, e a escolha é da pessoa.
 *  'instrumento' — só o seu instrumento. Um baterista não precisa saber o
 *    nome das sete notas pra tocar bateria.
 *  'teoria' — a teoria musical em si, pra quem quer entender harmonia.
 *  Antes isso era tudo misturado, e o baterista levava 9 lições de altura
 *  que ele não vai usar. */
export type TipoTrilha = 'instrumento' | 'teoria'

/** REGRA DE CONTEÚDO (corrigida): TODA lição ensina antes de perguntar.
 *
 *  A versão anterior aplicava explicação-antes só em 3 lições de 20, com a
 *  justificativa de que chutar primeiro melhora a retenção. Isso é verdade
 *  PRA FATO QUE A PESSOA JÁ TEM COMO DEDUZIR — e eu estiquei demais esse
 *  critério, deixando a maioria das lições virar adivinhação pura.
 *
 *  Agora o padrão é ensinar. Perguntar sem ensinar só se justifica quando a
 *  pessoa provavelmente já tem a intuição (julgar se um acorde soa alegre ou
 *  triste, por exemplo) — e aí é exceção deliberada, não descuido. */

/* ---------- tipos de pergunta ---------- */

interface Base {
  id: string
  /** a aula que aparece depois de responder — obrigatória */
  explica: string
}

export interface QEscolha extends Base {
  tipo: 'escolha'
  enunciado: string
  alternativas: string[]
  correta: number
}

export interface QOuvir extends Base {
  tipo: 'ouvir'
  enunciado: string
  midis: number[]
  junto: boolean
  alternativas: string[]
  correta: number
}

/** Montar clicando as notas. RECORDAÇÃO — o tipo que mais fixa. */
export interface QMontar extends Base {
  tipo: 'montar'
  enunciado: string
  alvo: PitchClass[]
  ordenado: boolean
}

export interface QAchar extends Base {
  tipo: 'achar'
  enunciado: string
  alvo: PitchClass
  posicao?: { corda: number; casa: number }
  tocarMidi?: number
}

export interface QTempo extends Base {
  tipo: 'tempo'
  enunciado: string
  bpm: number
  batidas: number
  toleranciaMs: number
}

/** TOCAR NO INSTRUMENTO, conferido pelo microfone.
 *  O tipo que justifica o site existir: vídeo explica, só o site confere. */
export interface QTocar extends Base {
  tipo: 'tocar'
  enunciado: string
  alvo: PitchClass
  alternativaNaTela: 'braco' | 'teclado'
}

export type Pergunta = QEscolha | QOuvir | QMontar | QAchar | QTempo | QTocar

/* ---------- estrutura ---------- */

export interface Licao {
  id: string
  titulo: string
  /** A aula, antes das perguntas. Pode trazer um diagrama — pra anatomia e
   *  posição, desenho ensina mais que texto ou foto. */
  abertura?: { titulo: string; texto: string; diagrama?: DiagramaId }
  perguntas: Pergunta[]
}

export interface Unidade {
  id: string
  n: number
  titulo: string
  guia: string
  trilha: TipoTrilha
  /** só na trilha de instrumento: pra quem essa unidade aparece */
  paraInstrumentos?: TrilhaInstrumento[]
  licoes: Licao[]
}

const C4 = 60

/* ============================================================
   A TRILHA DE TEORIA — opcional, vale pra qualquer instrumento
   ============================================================ */

const TEORIA: Unidade[] = [
  {
    id: 't-som-tem-nome',
    n: 1,
    trilha: 'teoria',
    titulo: 'O som tem nome',
    guia: 'As sete notas, as cinco que faltavam e por que tudo se repete.',
    licoes: [
      {
        id: 't-sete-notas',
        titulo: 'As sete notas',
        abertura: {
          titulo: 'Sete nomes que giram',
          texto:
            'Toda a música ocidental usa sete nomes: dó, ré, mi, fá, sol, lá, si. Depois do si volta pro dó, só que mais agudo — é um ciclo, não uma escada infinita de nomes novos. Essas sete são as chamadas notas naturais: no piano, as teclas brancas.',
        },
        perguntas: [
          {
            id: 'x1q1',
            tipo: 'escolha',
            enunciado: 'Depois do si, qual nota vem?',
            alternativas: ['acaba a sequência', 'dó, só que mais agudo', 'lá, voltando'],
            correta: 1,
            explica:
              'Volta pro dó, um degrau acima. Esse ciclo é o que faz sete nomes darem conta de toda a extensão de qualquer instrumento.',
          },
          {
            id: 'x1q2',
            tipo: 'montar',
            enunciado: 'Toque as sete notas naturais, do dó ao si, em ordem.',
            alvo: [0, 2, 4, 5, 7, 9, 11],
            ordenado: true,
            explica:
              'Essas são as sete naturais — as teclas brancas. Todo o resto da teoria é construído em cima delas.',
          },
        ],
      },
      {
        id: 't-doze-notas',
        titulo: 'As cinco que faltavam',
        abertura: {
          titulo: 'Por que 12 e não 14',
          texto:
            'Entre a maioria das notas cabe mais uma — o sustenido. Mas entre mi e fá, e entre si e dó, não cabe nada: elas já são vizinhas coladas. Sete naturais mais cinco sustenidos dão as 12 notas que existem. E dó♯ e ré♭ são a mesma tecla: o nome muda conforme a tonalidade, pra cada letra aparecer uma vez só na escala.',
        },
        perguntas: [
          {
            id: 'x2q1',
            tipo: 'escolha',
            enunciado: 'Entre quais notas NÃO existe nada no meio?',
            alternativas: ['entre dó e ré', 'entre mi e fá', 'entre sol e lá'],
            correta: 1,
            explica:
              'Mi–fá já são vizinhas coladas, e si–dó também. É por isso que são 12 notas no total, e não 14.',
          },
          {
            id: 'x2q2',
            tipo: 'montar',
            enunciado: 'Toque as cinco notas que ficam ENTRE as naturais.',
            alvo: [1, 3, 6, 8, 10],
            ordenado: false,
            explica:
              'As teclas pretas: dó♯, ré♯, fá♯, sol♯ e lá♯. Sete mais cinco: as 12 notas da música ocidental.',
          },
        ],
      },
      {
        id: 't-oitava',
        titulo: 'A oitava',
        abertura: {
          titulo: 'A mesma nota, o dobro da frequência',
          texto:
            'Quando uma nota vibra exatamente o dobro de rápido que outra, o ouvido escuta as duas como "a mesma nota" — só que uma mais aguda. Isso é a oitava, e é por isso que homem e mulher cantam a mesma melodia em alturas diferentes sem que ninguém ache estranho.',
        },
        perguntas: [
          {
            id: 'x3q1',
            tipo: 'ouvir',
            enunciado: 'Essas duas notas têm o mesmo nome?',
            midis: [C4, C4 + 12],
            junto: false,
            alternativas: ['sim, é a mesma nota mais aguda', 'não, são diferentes'],
            correta: 0,
            explica: 'É a oitava. Soam tão parecidas que a gente dá o mesmo nome pras duas.',
          },
          {
            id: 'x3q2',
            tipo: 'ouvir',
            enunciado: 'E essas duas?',
            midis: [C4, C4 + 7],
            junto: true,
            alternativas: ['mesma nota, oitava diferente', 'notas diferentes'],
            correta: 1,
            explica:
              'Notas diferentes — é uma quinta, o intervalo mais aberto e estável depois da oitava. Ela sozinha faz o power chord de qualquer riff de rock.',
          },
        ],
      },
    ],
  },
  {
    id: 't-distancias',
    n: 2,
    trilha: 'teoria',
    titulo: 'Distâncias',
    guia: 'Contar intervalo sem errar e reconhecer de ouvido os três que aparecem em tudo.',
    licoes: [
      {
        id: 't-contar',
        titulo: 'Contar sem errar',
        abertura: {
          titulo: 'Intervalo conta nomes, não passos',
          texto:
            'Aqui mora o erro mais comum de toda a teoria musical. De dó até mi você anda dois passos — então parece que é uma "segunda". Mas intervalo se conta pelos NOMES das notas, incluindo as duas pontas: dó, ré, mi são três nomes, logo é uma TERÇA. Por isso a matemática parece torta: uma segunda mais uma segunda dá uma terça, não uma quarta.',
        },
        perguntas: [
          {
            id: 'x4q1',
            tipo: 'escolha',
            enunciado: 'De dó até sol, qual é o intervalo?',
            alternativas: ['uma quarta', 'uma quinta', 'uma sexta'],
            correta: 1,
            explica:
              'Quinta: dó, ré, mi, fá, sol — cinco nomes. Quem responde quarta contou os passos entre as notas, que é a armadilha.',
          },
          {
            id: 'x4q2',
            tipo: 'montar',
            enunciado: 'Toque dó e a nota que forma uma terça com ele.',
            alvo: [0, 4],
            ordenado: true,
            explica:
              'Dó e mi. Essa é a distância que decide se um acorde soa alegre ou melancólico — a terça é a nota mais expressiva da música ocidental.',
          },
        ],
      },
      {
        id: 't-ouvir-distancias',
        titulo: 'As três que você já conhece',
        abertura: {
          titulo: 'Oitava, quinta e terça',
          texto:
            'Antes de decorar os doze intervalos, vale reconhecer três de ouvido. A OITAVA é a mesma nota mais aguda — a mais fácil. A QUINTA é aberta e estável, o som do power chord. A TERÇA é a que carrega emoção: maior soa alegre, menor soa melancólica. Com esses três você já tira muita coisa de ouvido.',
        },
        perguntas: [
          {
            id: 'x5q1',
            tipo: 'ouvir',
            enunciado: 'Que distância é essa?',
            midis: [C4, C4 + 7],
            junto: true,
            alternativas: ['terça', 'quinta', 'oitava'],
            correta: 1,
            explica:
              'Quinta — o som mais aberto e estável depois da oitava. É ela sozinha, sem terça nenhuma no meio, que faz o power chord de qualquer riff de rock.',
          },
          {
            id: 'x5q2',
            tipo: 'ouvir',
            enunciado: 'E essa?',
            midis: [C4, C4 + 3],
            junto: true,
            alternativas: ['terça menor', 'terça maior', 'quarta'],
            correta: 0,
            explica:
              'Terça menor — meio tom menor que a maior, e é só isso que separa um acorde alegre de um melancólico.',
          },
        ],
      },
    ],
  },
  {
    id: 't-regua',
    n: 3,
    trilha: 'teoria',
    titulo: 'A régua',
    guia: 'A escala maior é uma receita de distâncias — e funciona começando em qualquer nota.',
    licoes: [
      {
        id: 't-padrao',
        titulo: 'O padrão',
        abertura: {
          titulo: 'Uma receita, não uma lista',
          texto:
            'Muita gente decora "dó ré mi fá sol lá si" e acha que escala maior é isso. Mas essas notas são só o resultado da receita aplicada no dó. A receita é uma sequência de distâncias: tom, tom, semitom, tom, tom, tom, semitom. Aplique começando em qualquer nota e você tem a escala maior dela — e é aí que aparecem os sustenidos, pra a conta fechar.',
        },
        perguntas: [
          {
            id: 'x6q1',
            tipo: 'escolha',
            enunciado: 'Por que a escala de dó maior não tem sustenido nenhum?',
            alternativas: [
              'porque dó é a nota principal da música',
              'coincidência: as teclas brancas já caem no padrão',
              'porque escala maior nunca tem sustenido',
            ],
            correta: 1,
            explica:
              'Coincidência de onde ficam os semitons naturais. Mi–fá e si–dó caem justo onde a receita pede semitom. Em qualquer outra tonalidade a conta não fecha sozinha.',
          },
          {
            id: 'x6q2',
            tipo: 'montar',
            enunciado: 'Monte a escala de sol maior, do sol ao fá♯.',
            alvo: [7, 9, 11, 0, 2, 4, 6],
            ordenado: true,
            explica:
              'Sol, lá, si, dó, ré, mi, fá♯. O fá♯ não é enfeite: sem ele o último passo daria um tom em vez de semitom e a escala deixaria de soar maior.',
          },
        ],
      },
    ],
  },
  {
    id: 't-acordes',
    n: 4,
    trilha: 'teoria',
    titulo: 'Como acorde é feito',
    guia: 'Construir qualquer acorde sozinho em vez de decorar desenho.',
    licoes: [
      {
        id: 't-tercas',
        titulo: 'Empilhar terças',
        abertura: {
          titulo: 'Pule uma, pegue a próxima',
          texto:
            'Acorde não é um punhado aleatório de notas: é terça em cima de terça. Comece numa nota da escala, pule a vizinha, pegue a seguinte, pule de novo, pegue de novo. Do dó sai dó, mi e sol. A nota do MEIO é a que decide o clima: mais aguda soa maior, meio tom abaixo soa menor. E empilhando mais uma terça você ganha a sétima, que soa "pedindo" pra resolver.',
        },
        perguntas: [
          {
            id: 'x7q1',
            tipo: 'montar',
            enunciado: 'Comece no ré e empilhe duas terças, usando só notas naturais.',
            alvo: [2, 5, 9],
            ordenado: false,
            explica:
              'Ré, fá, lá. Repare que saiu um acorde MENOR sem você pedir — a distância entre ré e fá é uma terça menor. É a escala que decide, não você.',
          },
          {
            id: 'x7q2',
            tipo: 'escolha',
            enunciado: 'Qual nota decide se o acorde é maior ou menor?',
            alternativas: ['a fundamental', 'a do meio, a terça', 'a de cima, a quinta'],
            correta: 1,
            explica:
              'A do meio. Fundamental e quinta são as mesmas nos dois — só a terça muda, meio tom pra cada lado.',
          },
          {
            id: 'x7q3',
            tipo: 'ouvir',
            enunciado: 'Empilhei mais uma terça. Que acorde virou?',
            midis: [C4, C4 + 4, C4 + 7, C4 + 10],
            junto: true,
            alternativas: ['continua maior simples', 'ganhou uma sétima — soa pedindo resolução'],
            correta: 1,
            explica:
              'Acorde com sétima. Ele soa incompleto de propósito, e é essa tensão que faz o refrão parecer que "chegou" quando resolve.',
          },
        ],
      },
    ],
  },
  {
    id: 't-familia',
    n: 5,
    trilha: 'teoria',
    titulo: 'A família',
    guia: 'Por que certos acordes combinam — e a sequência que está em metade das músicas.',
    licoes: [
      {
        id: 't-sete-acordes',
        titulo: 'Os sete da casa',
        abertura: {
          titulo: 'Cada tonalidade tem sua família',
          texto:
            'Construindo um acorde em cima de cada nota da escala, saem sete acordes — e todos usam só notas daquela escala. É por isso que eles combinam: não é regra decorada, é consequência de virem da mesma família. Numa tonalidade maior, três saem maiores, três menores e um diminuto.',
        },
        perguntas: [
          {
            id: 'x8q1',
            tipo: 'escolha',
            enunciado: 'Por que dó, fá e sol combinam tão bem numa música em dó?',
            alternativas: [
              'porque são os mais fáceis de tocar',
              'porque os três saem só de notas da escala de dó',
              'porque são vizinhos no braço',
            ],
            correta: 1,
            explica:
              'Vêm da mesma escala, então nenhum briga com a melodia. Combinar é consequência, não regra.',
          },
          {
            id: 'x8q2',
            tipo: 'escolha',
            enunciado: 'Quantos acordes saem de uma tonalidade maior?',
            alternativas: ['três', 'cinco', 'sete'],
            correta: 2,
            explica:
              'Sete, um por grau. Sabendo isso você adivinha o próximo acorde de uma música que nunca ouviu.',
          },
        ],
      },
      {
        id: 't-progressao',
        titulo: 'A sequência que está em tudo',
        abertura: {
          titulo: 'Sair de casa e voltar',
          texto:
            'Uma progressão de acordes funciona como uma viagem: sai da casa (o primeiro grau), cria tensão em algum ponto e volta. A sequência I–V–vi–IV faz esse trajeto de um jeito que o ouvido adora, e por isso está por trás de um número absurdo de sucessos. O que diferencia as músicas é melodia, ritmo, letra e arranjo — a mesma base sustenta coisas completamente diferentes.',
        },
        perguntas: [
          {
            id: 'x9q1',
            tipo: 'escolha',
            enunciado: 'Por que tantas músicas diferentes usam a mesma sequência?',
            alternativas: [
              'preguiça dos compositores',
              'porque ela cria tensão e resolução de um jeito que o ouvido gosta',
              'porque é a única que funciona',
            ],
            correta: 1,
            explica:
              'Porque funciona. E o que faz cada música ser única não é a base: é tudo que se constrói em cima dela.',
          },
        ],
      },
    ],
  },
  {
    id: 't-tonalidade',
    n: 6,
    trilha: 'teoria',
    titulo: 'Tonalidade',
    guia: 'O assunto mais temido, devagar: por que há sustenidos no começo da partitura e por que a ordem nunca muda.',
    licoes: [
      {
        id: 't-armadura',
        titulo: 'Aqueles sustenidos no começo',
        abertura: {
          titulo: 'Um aviso, não uma decoração',
          texto:
            'Os sustenidos logo depois da clave são a armadura, e ela é um aviso dado uma vez só: "nesta música, todo fá é fá♯". Sem ela, o compositor teria que escrever o sinal em cada fá da página. Não é enfeite nem regra decorada — é economia de escrita, e de quebra te diz de cara em que tonalidade a música está.',
        },
        perguntas: [
          {
            id: 'x10q1',
            tipo: 'escolha',
            enunciado: 'A partitura tem um fá♯ na armadura. O que significa?',
            alternativas: [
              'que a música começa em fá♯',
              'que todo fá da música é tocado como fá♯',
              'que existe um fá♯ em algum lugar',
            ],
            correta: 1,
            explica:
              'Todo fá vira fá♯, do começo ao fim, em qualquer oitava. Por isso a armadura se repete no início de cada linha.',
          },
          {
            id: 'x10q2',
            tipo: 'escolha',
            enunciado: 'Um fá♯ na armadura indica qual tonalidade maior?',
            alternativas: ['fá maior', 'sol maior', 'ré maior'],
            correta: 1,
            explica:
              'Sol maior — a escala que você montou antes, com o fá♯ no fim. Truque: o último sustenido é sempre o sétimo grau, então a tônica é a nota logo acima dele.',
          },
        ],
      },
      {
        id: 't-ordem',
        titulo: 'A ordem nunca muda',
        abertura: {
          titulo: 'Fá, dó, sol, ré, lá, mi, si',
          texto:
            'Os sustenidos aparecem sempre nessa ordem, e ela nunca inverte nem pula. E não é aleatória: cada um está uma quinta acima do anterior — de fá pra dó é uma quinta, de dó pra sol é uma quinta, e assim por diante. É a mesma lógica do círculo das quintas, e é por isso que os bemóis aparecem exatamente na ordem inversa.',
        },
        perguntas: [
          {
            id: 'x11q1',
            tipo: 'escolha',
            enunciado: 'Qual é a ordem dos sustenidos na armadura?',
            alternativas: ['dó ré mi fá sol lá si', 'fá dó sol ré lá mi si', 'varia conforme a tonalidade'],
            correta: 1,
            explica:
              'Fá, dó, sol, ré, lá, mi, si. Com dois sustenidos são fá♯ e dó♯; com três, acrescenta sol♯. Nunca pula.',
          },
          {
            id: 'x11q2',
            tipo: 'montar',
            enunciado: 'Toque os quatro primeiros sustenidos na ordem da armadura.',
            alvo: [6, 1, 8, 3],
            ordenado: true,
            explica:
              'Fá♯, dó♯, sol♯, ré♯ — cada um uma quinta acima do anterior. Tocando dá pra sentir que não é lista decorada: é uma sequência com passo constante.',
          },
        ],
      },
    ],
  },
]

const TODAS_UNIDADES: Unidade[] = [...TRILHAS_DE_INSTRUMENTO, ...TEORIA]

/* ---------- consultas ---------- */

/** As unidades de uma trilha. Instrumento filtra pelo instrumento; teoria
 *  é a mesma pra todo mundo. */
export function trilhaDe(instrumento: TrilhaInstrumento, tipo: TipoTrilha): Unidade[] {
  if (tipo === 'teoria') return TEORIA
  return TRILHAS_DE_INSTRUMENTO.filter((u) => u.paraInstrumentos?.includes(instrumento))
}

export function licoesDe(instrumento: TrilhaInstrumento, tipo: TipoTrilha) {
  return trilhaDe(instrumento, tipo).flatMap((u) => u.licoes.map((l) => ({ unidade: u, licao: l })))
}

export function licaoPorId(id: string, instrumento: TrilhaInstrumento, tipo: TipoTrilha) {
  return licoesDe(instrumento, tipo).find((x) => x.licao.id === id)
}

export function proximaLicao(
  concluidas: string[],
  instrumento: TrilhaInstrumento,
  tipo: TipoTrilha,
) {
  return licoesDe(instrumento, tipo).find((x) => !concluidas.includes(x.licao.id)) ?? null
}

export function licaoDesbloqueada(
  licaoId: string,
  concluidas: string[],
  instrumento: TrilhaInstrumento,
  tipo: TipoTrilha,
): boolean {
  const lista = licoesDe(instrumento, tipo)
  const i = lista.findIndex((x) => x.licao.id === licaoId)
  if (i <= 0) return true
  return concluidas.includes(lista[i - 1].licao.id)
}

export function progressoPct(
  concluidas: string[],
  instrumento: TrilhaInstrumento,
  tipo: TipoTrilha,
): number {
  const lista = licoesDe(instrumento, tipo)
  if (lista.length === 0) return 0
  const feitas = lista.filter((x) => concluidas.includes(x.licao.id)).length
  return Math.round((feitas / lista.length) * 100)
}

export { TODAS_UNIDADES, TEORIA }

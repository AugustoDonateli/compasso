import type { TrilhaInstrumento } from './trilha'

/** O QUARTO — o menu do Compasso.
 *
 *  Ideia do Augusto, e a melhor que o site teve: em vez de uma barra com oito
 *  palavras do mesmo tamanho, o menu é a foto de um quarto de quem toca. Cada
 *  ferramenta é um OBJETO. Você passa o mouse na bateria, ela acende, clica e
 *  cai no groove.
 *
 *  Por que funciona: memória espacial ganha de lista. Você lembra que a
 *  bateria fica no canto direito; você não lembra que "groove" é o sétimo item
 *  de um menu.
 *
 *  A LUZ ESTÁ NO LUGAR "ERRADO" DE PROPÓSITO. Na foto, quem está iluminado é a
 *  cama e o abajur — o que não clica. Os instrumentos estão na penumbra. Em vez
 *  de clarear a foto (o que a transformaria em render de catálogo, que é
 *  exatamente a cara de IA que estamos evitando), os objetos ACENDEM SOZINHOS,
 *  fraco e devagar, em repouso. Você entra numa penumbra onde sete coisas
 *  respiram. O escuro virou vantagem. */

export interface ObjetoDoQuarto {
  id: string
  /** o que aparece quando o objeto acende */
  nome: string
  para: string
  /** silhueta em coordenadas NORMALIZADAS (0..1) sobre a imagem.
   *  Normalizada porque a mesma silhueta tem que servir pra qualquer
   *  resolução — e a imagem ainda vai ser regerada maior. */
  forma: Array<[number, number]>
  /** peça da bancada que destrava este objeto. Sem isso, sempre disponível. */
  peca?: string
  /** só faz sentido pra quem toca isto */
  so?: TrilhaInstrumento[]
}

/** O ponto onde o rótulo do objeto aparece: o centro da silhueta. */
export function centro(forma: Array<[number, number]>): [number, number] {
  const n = forma.length
  const soma = forma.reduce<[number, number]>((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0])
  return [soma[0] / n, soma[1] / n]
}

/** `polygon()` do CSS a partir da silhueta normalizada. */
export function clipPath(forma: Array<[number, number]>): string {
  return `polygon(${forma.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(', ')})`
}

/** Converte coordenada da FOTO em coordenada da TELA.
 *
 *  A foto cobre a tela com `object-cover`, que corta as bordas pra preencher.
 *  Numa janela mais quadrada que a foto, sobra imagem fora da tela dos dois
 *  lados. Então "50% da foto" não é "50% da tela" — e sem esta conta a área
 *  de clique da bateria fica em cima do tapete em qualquer monitor que não
 *  seja exatamente da proporção da imagem.
 *
 *  object-cover escala pelo maior fator e centraliza; é isso que a conta
 *  desfaz. */
export function paraTela(
  forma: Array<[number, number]>,
  caixa: { largura: number; altura: number },
  foto: { largura: number; altura: number },
): Array<[number, number]> {
  if (!caixa.largura || !caixa.altura) return forma
  const escala = Math.max(caixa.largura / foto.largura, caixa.altura / foto.altura)
  const vistaL = foto.largura * escala
  const vistaA = foto.altura * escala
  const sobraX = (caixa.largura - vistaL) / 2
  const sobraY = (caixa.altura - vistaA) / 2
  return forma.map(([x, y]) => [
    (sobraX + x * vistaL) / caixa.largura,
    (sobraY + y * vistaA) / caixa.altura,
  ])
}

/* As silhuetas nascem vazias e são preenchidas pelo modo de calibração
   (/quarto?calibrar): clicar em volta do objeto na própria foto e copiar o
   resultado. Chutar coordenada em cima de uma foto é o caminho mais rápido
   pra área de clique que não bate com o que se vê. */

/** Medidas lidas sobre a foto de desktop (4096x2294) com uma grade de 5% por
 *  cima. Não precisam de precisão de cirurgião: só cobrir o objeto sem
 *  invadir o vizinho. */
export const OBJETOS_DESKTOP: ObjetoDoQuarto[] = [
  {
    id: 'guitarra',
    nome: 'mapa das notas',
    para: '/braco',
    peca: 'mapa',
    so: ['guitarra', 'violao', 'baixo', 'violino'],
    // braço estreito em cima, corpo largo embaixo
    forma: [
      [0.476, 0.02],
      [0.508, 0.02],
      [0.508, 0.235],
      [0.549, 0.26],
      [0.551, 0.375],
      [0.522, 0.445],
      [0.468, 0.445],
      [0.45, 0.365],
      [0.453, 0.258],
      [0.476, 0.235],
    ],
  },
  {
    id: 'fotos',
    nome: 'a semana',
    para: '/ranking',
    peca: 'ranking',
    forma: [
      [0.183, 0.028],
      [0.362, 0.028],
      [0.362, 0.375],
      [0.183, 0.375],
    ],
  },
  {
    id: 'bateria',
    nome: 'groove machine',
    para: '/groove',
    peca: 'groove',
    // prato da esquerda, tons, bumbo e o tom de chão da direita
    forma: [
      [0.608, 0.325],
      [0.75, 0.3],
      [0.93, 0.4],
      [0.93, 0.63],
      [0.8, 0.87],
      [0.632, 0.87],
      [0.598, 0.6],
    ],
  },
  {
    id: 'pedal',
    nome: 'afinador',
    para: '/afinador',
    peca: 'afinador',
    forma: [
      [0.55, 0.85],
      [0.64, 0.846],
      [0.642, 0.908],
      [0.548, 0.912],
    ],
  },
  {
    id: 'vitrola',
    nome: 'desmontador',
    para: '/desmontador',
    peca: 'desmontador',
    // o toca-discos e a pilha de vinis encostada nele, em L
    forma: [
      [0.391, 0.552],
      [0.497, 0.549],
      [0.499, 0.45],
      [0.582, 0.453],
      [0.582, 0.609],
      [0.391, 0.609],
    ],
  },
  {
    id: 'fone',
    nome: 'treino de ouvido',
    para: '/ouvido',
    peca: 'ouvido',
    forma: [
      [0.23, 0.62],
      [0.32, 0.618],
      [0.322, 0.69],
      [0.228, 0.692],
    ],
  },
  {
    id: 'caderno',
    nome: 'sua trilha',
    para: '/trilha',
    // aberto sobre a mesa, em perspectiva: é um losango, não um retângulo
    forma: [
      [0.126, 0.758],
      [0.245, 0.71],
      [0.402, 0.758],
      [0.397, 0.802],
      [0.256, 0.85],
      [0.128, 0.802],
    ],
  },
]

export const OBJETOS_MOBILE: ObjetoDoQuarto[] = []

/** O catálogo do que cada objeto significa. Separado das silhuetas de
 *  propósito: isto aqui é decisão de produto e não muda quando a foto muda. */
export const PAPEIS: Array<Omit<ObjetoDoQuarto, 'forma'>> = [
  { id: 'bateria', nome: 'groove machine', para: '/groove', peca: 'groove' },
  {
    id: 'guitarra',
    nome: 'mapa das notas',
    para: '/braco',
    peca: 'mapa',
    so: ['guitarra', 'violao', 'baixo', 'violino'],
  },
  { id: 'pedal', nome: 'afinador', para: '/afinador', peca: 'afinador' },
  { id: 'vitrola', nome: 'desmontador', para: '/desmontador', peca: 'desmontador' },
  { id: 'fone', nome: 'treino de ouvido', para: '/ouvido', peca: 'ouvido' },
  { id: 'caderno', nome: 'sua trilha', para: '/trilha' },
  { id: 'fotos', nome: 'a semana', para: '/ranking', peca: 'ranking' },
]

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

/* As silhuetas nascem vazias e são preenchidas pelo modo de calibração
   (/quarto?calibrar): clicar em volta do objeto na própria foto e copiar o
   resultado. Chutar coordenada em cima de uma foto é o caminho mais rápido
   pra área de clique que não bate com o que se vê. */

export const OBJETOS_DESKTOP: ObjetoDoQuarto[] = []

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

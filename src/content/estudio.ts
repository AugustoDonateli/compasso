import type { TrilhaInstrumento } from './trilha'

/** A bancada.
 *
 *  Por que peças e não um número: pesquisa de gamificação é clara nos dois
 *  sentidos. Streak e XP funcionam — quem chega a sete dias seguidos tem ~3,6x
 *  mais chance de continuar. Mas o MESMO material avisa que quem depende da
 *  gamificação abandona mais que quem tem interesse real. Então a recompensa
 *  não pode ser o número: tem que ser mais site, mais coisa pra fazer.
 *
 *  Cada nível libera uma PEÇA de verdade, que existe e faz algo. "Nível 4" não
 *  quer dizer nada; "o metrônomo chegou" quer dizer que agora dá pra estudar
 *  no tempo. E como a peça é real, a curiosidade de ver a próxima é a mesma
 *  curiosidade de aprender — em vez de competir com ela. */

export interface Peca {
  id: string
  nome: string
  /** o que a peça faz, na voz de quem toca */
  faz: string
  /** rota que ela destrava, quando destrava alguma */
  para?: string
  /** XP necessário */
  custo: number
  /** só aparece pra quem toca isto; ausente = serve pra todo mundo */
  so?: TrilhaInstrumento[]
}

/* Os custos sobem devagar no começo (as três primeiras peças chegam na
   primeira semana) e abrem depois. A pior sensação possível aqui é a segunda
   peça demorar — é nela que a pessoa aprende que a bancada é real. */
export const PECAS: Peca[] = [
  {
    id: 'afinador',
    nome: 'Afinador',
    faz: 'o site te ouve e diz se a corda está no ponto',
    para: '/afinador',
    custo: 0,
    so: ['guitarra', 'violao', 'baixo', 'violino'],
  },
  {
    id: 'ouvido',
    nome: 'Treino de ouvido',
    faz: 'reconhecer nota, intervalo e acorde só escutando',
    para: '/ouvido',
    custo: 0,
  },
  {
    id: 'mapa',
    nome: 'Mapa das notas',
    faz: 'onde cada nota mora no braço, e por quê',
    para: '/braco',
    custo: 150,
    so: ['guitarra', 'violao', 'baixo', 'violino'],
  },
  {
    id: 'metronomo',
    nome: 'Metrônomo',
    faz: 'o tempo firme por trás do que você toca',
    para: '/groove',
    custo: 150,
  },
  {
    id: 'groove',
    nome: 'Groove machine',
    faz: 'monte a levada e veja a partitura dela aparecer',
    para: '/groove',
    custo: 400,
  },
  {
    id: 'desmontador',
    nome: 'Desmontador',
    faz: 'a teoria por dentro de músicas que você já conhece',
    para: '/desmontador',
    custo: 800,
  },
  {
    id: 'ranking',
    nome: 'A semana',
    faz: 'onde você está entre seus amigos',
    para: '/ranking',
    custo: 1200,
  },
  {
    id: 'separador',
    nome: 'Separador de faixas',
    faz: 'tira o seu instrumento da música e você toca no lugar',
    custo: 2500,
  },
]

/** As peças que servem pra quem toca este instrumento. */
export function pecasDe(instrumento: TrilhaInstrumento): Peca[] {
  return PECAS.filter((p) => !p.so || p.so.includes(instrumento))
}

export interface EstadoDaBancada {
  liberadas: Peca[]
  proxima: Peca | null
  /** quanto falta de XP pra próxima peça */
  falta: number
  /** 0-1: o quanto já andou entre a peça anterior e a próxima */
  fracao: number
}

export function bancada(xp: number, instrumento: TrilhaInstrumento): EstadoDaBancada {
  const minhas = pecasDe(instrumento)
  const liberadas = minhas.filter((p) => xp >= p.custo)
  const proxima = minhas.find((p) => xp < p.custo) ?? null

  if (!proxima) return { liberadas, proxima: null, falta: 0, fracao: 1 }

  const anterior = liberadas.length ? liberadas[liberadas.length - 1].custo : 0
  const vao = proxima.custo - anterior
  return {
    liberadas,
    proxima,
    falta: proxima.custo - xp,
    // vao nunca é 0 aqui: duas peças com o mesmo custo liberam juntas, então
    // a próxima sempre custa mais que a última liberada
    fracao: Math.min(1, Math.max(0, (xp - anterior) / vao)),
  }
}

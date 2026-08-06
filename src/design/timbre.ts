import type { TrilhaInstrumento } from '../content/trilha'

/** O timbre: a cor do SEU instrumento.
 *
 *  O latão é do site — títulos, botões, o que VOCÊ faz. O timbre é seu — o som
 *  soando, a nota certa, o LED aceso. São dois papéis diferentes, e é por isso
 *  que existem duas famílias em vez de um acento só carregando tudo.
 *
 *  Quem toca baixo vê o site em âmbar; quem toca bateria vê em vermelho de luz
 *  de gravação. Os valores moram no CSS (index.css), selecionados por
 *  `data-timbre` — assim o tema claro pode ter a versão escura de cada timbre
 *  sem nenhum JavaScript decidindo cor. O mesmo atributo funciona em qualquer
 *  elemento, então uma ferramenta pode vestir outro timbre no seu próprio
 *  pedaço sem repintar o site.
 *
 *  IMPORTANTE: dois dos timbres são quentes, da mesma família do latão. Eles
 *  dão identidade, não profundidade. Quem dá profundidade é o par
 *  sombra-fria/luz-quente (--sombra-* e --luz-topo), que vale igual pros seis. */

export const CHAVE_INSTRUMENTO = 'compasso.instrumento'

const INSTRUMENTOS: TrilhaInstrumento[] = [
  'guitarra',
  'violao',
  'baixo',
  'piano',
  'violino',
  'bateria',
]

/** Como o timbre de cada instrumento se chama, pra quando a interface precisar
 *  nomear a cor em vez de só usá-la. */
export const NOME_DO_TIMBRE: Record<TrilhaInstrumento, string> = {
  guitarra: 'verde de mostrador',
  violao: 'sálvia amadeirada',
  baixo: 'âmbar profundo',
  piano: 'marfim frio',
  violino: 'malva',
  bateria: 'vermelho de gravação',
}

export function instrumentoSalvo(): TrilhaInstrumento {
  try {
    const v = localStorage.getItem(CHAVE_INSTRUMENTO)
    return INSTRUMENTOS.find((i) => i === v) ?? 'guitarra'
  } catch {
    return 'guitarra'
  }
}

/** Pinta a raiz. Chamar sempre que o instrumento mudar — inclusive na carga. */
export function aplicarTimbre(instrumento: TrilhaInstrumento = instrumentoSalvo()): void {
  document.documentElement.dataset.timbre = instrumento
}

/** Lê a cor efetiva do timbre agora (já resolvida pelo tema).
 *  Serve pro canvas e pro SVG, que não enxergam variável CSS. */
export function corDoTimbre(): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--timbre').trim()
  return v || '#7fd1a0'
}

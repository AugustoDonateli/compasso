/** Detecção de altura — a vantagem injusta do Compasso.
 *
 *  O site pode OUVIR você tocar e dizer se está certo. Nenhum vídeo faz isso.
 *  E não precisa de IA nem de servidor: é autocorrelação, matemática pura,
 *  rodando no navegador com custo zero.
 *
 *  Como funciona: desliza uma cópia da onda sobre ela mesma e mede o quanto
 *  ela casa a cada deslocamento. O deslocamento onde a semelhança é máxima é
 *  o período da onda — e o inverso do período é a frequência.
 *
 *  Tudo aqui é função pura: entra um buffer de áudio, sai um número. Por isso
 *  dá pra testar com ondas sintéticas, sem microfone nenhum. */

/** Silêncio abaixo disso não vale a pena analisar (evita ruído virar nota) */
const RMS_MINIMO = 0.01
/** Só aceita a leitura se a onda casar bem consigo mesma */
const CLAREZA_MINIMA = 0.9
/** Faixa útil: do mi grave do baixo (~41Hz) ao topo do violino (~2100Hz) */
const FREQ_MIN = 38
const FREQ_MAX = 2200

/** Volume médio do trecho — usado pra ignorar silêncio */
export function rms(buffer: Float32Array): number {
  let soma = 0
  for (let i = 0; i < buffer.length; i++) soma += buffer[i] * buffer[i]
  return Math.sqrt(soma / buffer.length)
}

/**
 * Frequência fundamental em Hz, ou null se não houver nota clara.
 * Implementa autocorrelação com normalização e interpolação parabólica.
 */
export function detectarFrequencia(buffer: Float32Array, sampleRate: number): number | null {
  const n = buffer.length
  if (rms(buffer) < RMS_MINIMO) return null

  // 1) Corta o silêncio das pontas: sobra só o miolo com sinal de verdade
  const limiar = 0.2
  let ini = 0
  let fim = n - 1
  while (ini < n / 2 && Math.abs(buffer[ini]) < limiar) ini++
  while (fim > n / 2 && Math.abs(buffer[fim]) < limiar) fim--
  const trecho = buffer.subarray(ini, fim + 1)
  const m = trecho.length
  if (m < 128) return null

  // 2) Autocorrelação: quanto a onda casa consigo mesma a cada deslocamento
  const corr = new Float32Array(m).fill(0)
  for (let lag = 0; lag < m; lag++) {
    let soma = 0
    for (let i = 0; i < m - lag; i++) soma += trecho[i] * trecho[i + lag]
    corr[lag] = soma
  }

  // 3) Pula a descida inicial — o pico em lag 0 é a onda com ela mesma
  let d = 0
  while (d < m - 1 && corr[d] > corr[d + 1]) d++

  // 4) Acha o maior pico depois disso, dentro da faixa de frequência útil
  const lagMin = Math.floor(sampleRate / FREQ_MAX)
  const lagMax = Math.ceil(sampleRate / FREQ_MIN)
  let melhorLag = -1
  let melhorValor = -Infinity
  for (let lag = Math.max(d, lagMin); lag < Math.min(m, lagMax); lag++) {
    if (corr[lag] > melhorValor) {
      melhorValor = corr[lag]
      melhorLag = lag
    }
  }
  if (melhorLag <= 0) return null

  // 5) Clareza: o pico precisa ser forte perto do casamento perfeito (lag 0),
  //    senão é ruído passando por nota
  const clareza = corr[0] > 0 ? melhorValor / corr[0] : 0
  if (clareza < CLAREZA_MINIMA * 0.35) return null

  // 6) Interpolação parabólica: refina o pico entre duas amostras inteiras.
  //    Sem isso a leitura pula de degrau em degrau e o afinador fica nervoso.
  let lagFinal = melhorLag
  if (melhorLag > 0 && melhorLag < m - 1) {
    const a = corr[melhorLag - 1]
    const b = corr[melhorLag]
    const c = corr[melhorLag + 1]
    const denom = 2 * (2 * b - a - c)
    if (denom !== 0) lagFinal = melhorLag + (c - a) / denom
  }

  const freq = sampleRate / lagFinal
  return freq >= FREQ_MIN && freq <= FREQ_MAX ? freq : null
}

/** Nota mais próxima de uma frequência, e o quanto ela está desafinada.
 *  cents: 0 = afinado, negativo = baixo (bemol), positivo = alto (sustenido).
 *  100 cents = um semitom, então ±50 já é meio caminho pra nota vizinha. */
export interface Leitura {
  freq: number
  midi: number
  cents: number
}

export function freqParaNota(freq: number, la = 440): Leitura {
  const midiExato = 69 + 12 * Math.log2(freq / la)
  const midi = Math.round(midiExato)
  return { freq, midi, cents: Math.round((midiExato - midi) * 100) }
}

export function notaParaFreq(midi: number, la = 440): number {
  return la * Math.pow(2, (midi - 69) / 12)
}

/** Está afinado o bastante? ±5 cents é o padrão de afinador. */
export function estaAfinado(cents: number, tolerancia = 5): boolean {
  return Math.abs(cents) <= tolerancia
}

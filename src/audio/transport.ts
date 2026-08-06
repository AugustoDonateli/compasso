import { Tone, ensureAudio } from './engine'

/** Transporte global do Compasso — o relógio da banda.
 *
 *  Regra de futuro: qualquer coisa que aconteça "no tempo" (groove machine,
 *  metrônomo da trilha, ditado rítmico) passa por aqui. Um relógio só,
 *  todo mundo tocando junto. */

export function setBpm(bpm: number): void {
  Tone.getTransport().bpm.value = bpm
}

export function getBpm(): number {
  return Math.round(Tone.getTransport().bpm.value)
}

/** Agenda um passo de semicolcheia em loop. Retorna a função de parada.
 *
 *  Duas camadas deliberadamente separadas:
 *  - onStep roda no relógio do ÁUDIO (com lookahead) — use `time` pra disparar som.
 *  - onDraw é disparado no INSTANTE em que aquele passo soa.
 *
 *  DEFEITO CORRIGIDO EM 2026-08-06: o desenho rodava num laço de
 *  `requestAnimationFrame` lendo a posição do transporte. Quando o rAF não roda
 *  — aba oculta, janela não composta, economia de bateria — o playhead
 *  simplesmente nunca aparecia, enquanto o som seguia normal. Foi assim que o
 *  destaque de acorde do Desmontador ficou preso no primeiro acorde.
 *
 *  Agora cada passo agenda o próprio desenho com `setTimeout`, com o atraso
 *  exato que falta pro som sair (`time - agora`). Sem rAF no caminho, e sem o
 *  adiantamento de ~0,1s que apareceria se o desenho saísse direto do callback
 *  de áudio — o que num sequenciador de semicolcheias seria bem visível. */
export async function startSixteenthLoop(
  onStep: (step: number, time: number) => void,
  onDraw?: (step: number) => void,
  steps = 16,
): Promise<() => void> {
  await ensureAudio()
  const transport = Tone.getTransport()
  let step = 0
  const pendentes = new Set<ReturnType<typeof setTimeout>>()

  const id = transport.scheduleRepeat((time) => {
    onStep(step, time)
    if (onDraw) {
      const esse = step
      const faltam = Math.max(0, (time - Tone.now()) * 1000)
      const t = setTimeout(() => {
        pendentes.delete(t)
        onDraw(esse)
      }, faltam)
      pendentes.add(t)
    }
    step = (step + 1) % steps
  }, '16n')

  transport.position = 0
  transport.start()

  return () => {
    pendentes.forEach(clearTimeout)
    pendentes.clear()
    transport.clear(id)
    transport.stop()
    transport.position = 0
  }
}

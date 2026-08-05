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

/** Passo de semicolcheia atual, lido da posição real do transporte. */
export function currentSixteenth(steps = 16): number {
  const transport = Tone.getTransport()
  const ticksPerSixteenth = transport.PPQ / 4
  return Math.floor(transport.ticks / ticksPerSixteenth) % steps
}

/** Agenda um passo de semicolcheia em loop. Retorna a função de parada.
 *
 *  Duas camadas deliberadamente separadas:
 *  - onStep roda no relógio do ÁUDIO (com lookahead) — use `time` pra disparar som.
 *  - onDraw roda num loop de animação que LÊ a posição do transporte, em vez de
 *    reproduzir uma fila agendada. Isso importa: com a aba oculta o rAF pausa, e
 *    uma fila (Tone.Draw) acumularia eventos vencidos que são descartados — o
 *    playhead travaria ou pularia ao voltar. Lendo a posição, ele ressincroniza
 *    sozinho no primeiro quadro. */
export async function startSixteenthLoop(
  onStep: (step: number, time: number) => void,
  onDraw?: (step: number) => void,
  steps = 16,
): Promise<() => void> {
  await ensureAudio()
  const transport = Tone.getTransport()
  let step = 0

  const id = transport.scheduleRepeat((time) => {
    onStep(step, time)
    step = (step + 1) % steps
  }, '16n')

  let raf = 0
  if (onDraw) {
    let lastDrawn = -1
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (transport.state !== 'started') return
      const now = currentSixteenth(steps)
      if (now !== lastDrawn) {
        lastDrawn = now
        onDraw(now)
      }
    }
    raf = requestAnimationFrame(tick)
  }

  transport.position = 0
  transport.start()

  return () => {
    cancelAnimationFrame(raf)
    transport.clear(id)
    transport.stop()
    transport.position = 0
  }
}

import { useEffect, useRef } from 'react'
import { Tone, onAudioUnlock } from './engine'

/** Waveform viva: desenha num <canvas> a forma de onda real do que está
 *  soando (master). O som vira tinta. Fica invisível no silêncio. */
export function useWaveformCanvas(color = '#e0a34a') {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let raf = 0
    let analyser: Tone.Analyser | null = null
    let alive = true

    onAudioUnlock(() => {
      if (!alive) return
      analyser = new Tone.Analyser('waveform', 256)
      Tone.getDestination().connect(analyser)

      const loop = () => {
        raf = requestAnimationFrame(loop)
        const canvas = canvasRef.current
        if (!canvas || !analyser) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const values = analyser.getValue() as Float32Array
        const w = canvas.width
        const h = canvas.height
        ctx.clearRect(0, 0, w, h)

        // energia do sinal: no silêncio, não desenha nada
        let energy = 0
        for (let i = 0; i < values.length; i++) energy += Math.abs(values[i])
        if (energy / values.length < 0.0004) return

        ctx.beginPath()
        for (let i = 0; i < values.length; i++) {
          const x = (i / (values.length - 1)) * w
          const y = h / 2 + values[i] * h * 1.4
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = color
        ctx.lineWidth = 1.2
        ctx.stroke()
      }
      loop()
    })

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      analyser?.dispose()
    }
  }, [color])

  return canvasRef
}

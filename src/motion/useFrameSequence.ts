import { useEffect, useRef, useCallback } from 'react'

/** Sequência de frames dirigida por progresso (0–1), desenhada em <canvas>.
 *
 *  A técnica dos sites premiados (e da Apple): vídeo HTML5 sincronizado a
 *  scroll falha (engasga, autoplay, compressão) — frames WebP em canvas não.
 *
 *  Estratégia de carga (dos estudos de caso de produção):
 *  - primeiros N frames imediatos (a animação já responde)
 *  - o resto em lotes via requestIdleCallback, com img.decode()
 *  - desenha sempre o frame carregado mais próximo do pedido,
 *    então a experiência degrada suave enquanto carrega */

export interface FrameSequenceOptions {
  /** ex.: (i) => `/assets/frames/hero/desktop/frame_${String(i + 1).padStart(4, '0')}.webp` */
  frameUrl: (index: number) => string
  frameCount: number
  /** Quantos frames carregar imediatamente (padrão 10) */
  eagerCount?: number
  /** Tamanho do lote em segundo plano (padrão 20) */
  batchSize?: number
}

export interface FrameSequenceHandle {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  /** Desenha o frame correspondente ao progresso 0–1 */
  draw: (progress: number) => void
  /** Fração da sequência já carregada (0–1) — pra indicador discreto */
  loadedRatio: () => number
}

const idle: (cb: () => void) => number =
  typeof requestIdleCallback !== 'undefined'
    ? (cb) => requestIdleCallback(() => cb(), { timeout: 500 })
    : (cb) => window.setTimeout(cb, 60)

export function useFrameSequence(options: FrameSequenceOptions): FrameSequenceHandle {
  const { frameUrl, frameCount, eagerCount = 10, batchSize = 20 } = options
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const framesRef = useRef<(HTMLImageElement | null)[]>([])
  const loadedCountRef = useRef(0)
  const lastDrawnRef = useRef(-1)
  const pendingProgressRef = useRef<number | null>(null)

  const drawIndex = useCallback((index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    // procura o frame carregado mais próximo (pra trás primeiro, depois pra frente)
    let img: HTMLImageElement | null = null
    let chosen = index
    for (let d = 0; d < frameCount; d++) {
      const back = index - d
      const fwd = index + d
      if (back >= 0 && framesRef.current[back]) {
        img = framesRef.current[back]
        chosen = back
        break
      }
      if (fwd < frameCount && framesRef.current[fwd]) {
        img = framesRef.current[fwd]
        chosen = fwd
        break
      }
    }
    if (!img || chosen === lastDrawnRef.current) return
    lastDrawnRef.current = chosen

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // cobre o canvas mantendo proporção (object-fit: cover)
    const cw = canvas.width
    const ch = canvas.height
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
  }, [frameCount])

  const draw = useCallback(
    (progress: number) => {
      const index = Math.min(frameCount - 1, Math.max(0, Math.round(progress * (frameCount - 1))))
      pendingProgressRef.current = progress
      drawIndex(index)
    },
    [drawIndex, frameCount],
  )

  useEffect(() => {
    let cancelled = false
    framesRef.current = new Array(frameCount).fill(null)
    loadedCountRef.current = 0
    lastDrawnRef.current = -1

    const load = async (index: number) => {
      const img = new Image()
      img.src = frameUrl(index)
      try {
        await img.decode()
      } catch {
        return // frame faltando não derruba a sequência
      }
      if (cancelled) return
      framesRef.current[index] = img
      loadedCountRef.current++
      // se o scroll está parado num frame que acabou de chegar, redesenha
      if (pendingProgressRef.current !== null) {
        const want = Math.round(pendingProgressRef.current * (frameCount - 1))
        if (want === index) drawIndex(index)
      }
    }

    // 1) frames imediatos
    const eager = Math.min(eagerCount, frameCount)
    for (let i = 0; i < eager; i++) void load(i)

    // 2) o resto em lotes no tempo ocioso
    let next = eager
    const pump = () => {
      if (cancelled || next >= frameCount) return
      const end = Math.min(next + batchSize, frameCount)
      for (let i = next; i < end; i++) void load(i)
      next = end
      idle(pump)
    }
    idle(pump)

    return () => {
      cancelled = true
    }
  }, [frameUrl, frameCount, eagerCount, batchSize, drawIndex])

  const loadedRatio = useCallback(
    () => (frameCount === 0 ? 1 : loadedCountRef.current / frameCount),
    [frameCount],
  )

  return { canvasRef, draw, loadedRatio }
}

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useScrollDriver } from '../motion/useScrollDriver'
import { useFrameSequence } from '../motion/useFrameSequence'

/* O herói cinematográfico: a viagem pelo braço da guitarra.
   Um único valor de scroll (0–1) dirige TODAS as camadas —
   frames no canvas, título, dica de rolagem. A rolagem é a viagem. */

const DESKTOP = { dir: 'desktop', count: 121 }
const MOBILE = { dir: 'mobile', count: 91 }

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const hintRef = useRef<HTMLDivElement | null>(null)

  // escolhe a sequência uma vez por carga (trocar exigiria recarregar frames de qualquer forma)
  const variant = useMemo(
    () => (window.matchMedia('(min-width: 768px)').matches ? DESKTOP : MOBILE),
    [],
  )

  const frameUrl = useCallback(
    (i: number) =>
      `/assets/frames/hero/${variant.dir}/frame_${String(i + 1).padStart(4, '0')}.webp`,
    [variant],
  )

  const { canvasRef, draw } = useFrameSequence({
    frameUrl,
    frameCount: variant.count,
  })

  // todas as camadas dirigidas pelo mesmo progresso
  const onProgress = useCallback(
    (p: number) => {
      draw(p)
      const title = titleRef.current
      if (title) {
        // título vivo até ~55% da viagem, depois se entrega à imagem
        const fade = Math.max(0, 1 - p / 0.55)
        title.style.opacity = String(fade)
        title.style.transform = `translateY(${p * -60}px)`
      }
      const hint = hintRef.current
      if (hint) hint.style.opacity = String(Math.max(0, 1 - p / 0.15))
    },
    [draw],
  )

  useScrollDriver(sectionRef, onProgress, { end: '+=250%', pin: true, scrub: 0.5 })

  // canvas do tamanho do viewport, nítido em telas de alta densidade
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      draw(0)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [canvasRef, draw])

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden bg-[#12100e]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* véu sutil pra tipografia assentar sobre a imagem */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#12100e]/70 via-transparent to-transparent" />

      <div
        ref={titleRef}
        className="absolute inset-x-0 top-[22%] px-6 md:left-[8%] md:right-auto md:max-w-xl"
      >
        <div className="type-label mb-4 text-[#a69c90]">teoria musical · do jeito que soa</div>
        <h1 className="type-display text-6xl text-[#f2ede6] md:text-8xl">Compasso</h1>
        <p className="mt-5 max-w-md text-lg text-[#a69c90]">
          O caminho é o braço do instrumento. Rola pra percorrer.
        </p>
      </div>

      <div
        ref={hintRef}
        className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2"
      >
        <span className="type-label text-[#a69c90]">rolar</span>
        <span className="block h-8 w-px animate-pulse bg-[#e0a34a]" />
      </div>
    </section>
  )
}

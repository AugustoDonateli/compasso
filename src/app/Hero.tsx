import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useScrollDriver } from '../motion/useScrollDriver'
import { useFrameSequence } from '../motion/useFrameSequence'

/* ┃1┃ ABERTURA · Grave
   A viagem pelo braço. Um único progresso (0–1) dirige frames,
   tipografia e rótulos. A palavra COMPASSO é o layout — gigante,
   sangrando pra fora do quadro à esquerda, como manda a assimetria. */

const DESKTOP = { dir: 'desktop', count: 121 }
const MOBILE = { dir: 'mobile', count: 91 }

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const metaRef = useRef<HTMLDivElement | null>(null)
  const hintRef = useRef<HTMLDivElement | null>(null)

  const variant = useMemo(
    () => (window.matchMedia('(min-width: 768px)').matches ? DESKTOP : MOBILE),
    [],
  )

  const frameUrl = useCallback(
    (i: number) =>
      `/assets/frames/hero/${variant.dir}/frame_${String(i + 1).padStart(4, '0')}.webp`,
    [variant],
  )

  const { canvasRef, draw } = useFrameSequence({ frameUrl, frameCount: variant.count })

  const onProgress = useCallback(
    (p: number) => {
      draw(p)
      // o título mergulha na imagem: desce levemente e some até 55% da viagem
      const title = titleRef.current
      if (title) {
        const fade = Math.max(0, 1 - p / 0.55)
        title.style.opacity = String(fade)
        title.style.transform = `translateY(${p * 90}px)`
      }
      const meta = metaRef.current
      if (meta) meta.style.opacity = String(Math.max(0, 1 - p / 0.35))
      const hint = hintRef.current
      if (hint) hint.style.opacity = String(Math.max(0, 1 - p / 0.12))
    },
    [draw],
  )

  useScrollDriver(sectionRef, onProgress, { end: '+=250%', pin: true, scrub: 0.5 })

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

      {/* luz apenas onde o texto assenta — sem véu genérico por cima de tudo */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#12100e]/85 via-[#12100e]/25 to-transparent" />

      {/* rótulo do compasso — canto superior esquerdo, como numa partitura */}
      <div ref={metaRef} className="absolute left-5 top-6 flex items-center gap-4 md:left-10">
        <span className="measure-no text-[#a69c90]">1</span>
        <span className="type-label text-[#a69c90]">abertura · grave</span>
      </div>

      {/* andamento no canto oposto: assimetria estrutural */}
      <div className="type-label absolute right-5 top-6 hidden text-[#6e655c] md:block md:right-10">
        ♩ = 40
      </div>

      {/* A PALAVRA É O LAYOUT: sangra pra fora do quadro à esquerda */}
      <h1
        ref={titleRef}
        className="type-display pointer-events-none absolute bottom-[16%] left-[-0.04em] whitespace-nowrap text-[#f2ede6]"
        style={{ fontSize: 'clamp(4.5rem, 17vw, 16rem)', lineHeight: 0.9, letterSpacing: '-0.03em' }}
      >
        Compasso
      </h1>

      <div className="absolute bottom-[8%] left-5 max-w-xs md:left-10 md:max-w-sm">
        <p className="text-base text-[#a69c90] md:text-lg">
          Teoria musical que vira som e vira gesto. O caminho é o braço do instrumento — rola pra
          percorrer.
        </p>
      </div>

      <div ref={hintRef} className="absolute bottom-8 right-5 flex items-center gap-3 md:right-10">
        <span className="type-label text-[#a69c90]">rolar</span>
        <span className="block h-8 w-px animate-pulse bg-[#e0a34a]" />
      </div>
    </section>
  )
}

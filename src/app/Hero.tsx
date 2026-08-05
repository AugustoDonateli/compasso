import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useScrollDriver } from '../motion/useScrollDriver'
import { useFrameSequence } from '../motion/useFrameSequence'
import { gsap } from '../motion/useLenisGsap'
import { isAudioUnlocked, onAudioUnlock } from '../audio/engine'
import { playFretHarmonic } from '../audio/harmonics'
import { useWaveformCanvas } from '../audio/useAnalyser'

/* ┃1┃ ABERTURA · Grave ♩=40
   A viagem pelo braço. Um único progresso (0–1) dirige frames, tipografia,
   harmônicos e luz. Cada "traste" cruzado solta um harmônico de corda —
   o scroll toca o instrumento. */

const DESKTOP = { dir: 'desktop', count: 121 }
const MOBILE = { dir: 'mobile', count: 91 }
const FRETS_IN_JOURNEY = 12

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const metaRef = useRef<HTMLDivElement | null>(null)
  const hintRef = useRef<HTMLDivElement | null>(null)
  const glowRef = useRef<HTMLDivElement | null>(null)
  const lastFretRef = useRef(-1)
  const [soundOn, setSoundOn] = useState(isAudioUnlocked)
  const waveRef = useWaveformCanvas()

  useEffect(() => {
    onAudioUnlock(() => setSoundOn(true))
  }, [])

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

      // glissando: um harmônico por traste cruzado (nos dois sentidos)
      const fret = Math.min(FRETS_IN_JOURNEY, Math.floor(p * (FRETS_IN_JOURNEY + 1)))
      if (fret !== lastFretRef.current) {
        if (lastFretRef.current !== -1 && p > 0.015) {
          playFretHarmonic(fret)
          // modo palco: a luz da cena respira junto com o harmônico
          if (glowRef.current) {
            gsap.fromTo(
              glowRef.current,
              { opacity: 0.28 },
              { opacity: 0, duration: 1.1, ease: 'power2.out', overwrite: true },
            )
          }
        }
        lastFretRef.current = fret
      }

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

      {/* modo palco: glow de latão que respira a cada harmônico */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(224,163,74,0.35), transparent 70%)',
        }}
      />

      {/* luz apenas onde o texto assenta */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#12100e]/85 via-[#12100e]/25 to-transparent" />

      {/* rótulo do compasso */}
      <div ref={metaRef} className="absolute left-5 top-6 flex items-center gap-4 md:left-10">
        <span className="measure-no text-[#a69c90]">1</span>
        <span className="type-label text-[#a69c90]">abertura · grave</span>
      </div>

      {/* andamento pulsando de verdade em ♩=40 */}
      <div className="absolute right-5 top-6 hidden items-center gap-2 md:flex md:right-10">
        <span className="pulse-40 block h-3 w-0.5 bg-[#e0a34a]" />
        <span className="type-label text-[#6e655c]">♩ = 40</span>
      </div>

      {/* A PALAVRA É O LAYOUT */}
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
        {!soundOn && (
          <p className="type-label mt-4 text-[#e0a34a]">♪ toca na tela pra ligar o som</p>
        )}
      </div>

      {/* a onda do que está soando — o som vira tinta */}
      <canvas
        ref={waveRef}
        width={220}
        height={36}
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
      />

      <div ref={hintRef} className="absolute bottom-8 right-5 flex items-center gap-3 md:right-10">
        <span className="type-label text-[#a69c90]">rolar</span>
        <span className="pulse-40 block h-8 w-px bg-[#e0a34a]" />
      </div>
    </section>
  )
}

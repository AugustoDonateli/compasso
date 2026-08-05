import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useScrollDriver } from '../motion/useScrollDriver'
import { useFrameSequence } from '../motion/useFrameSequence'
import { gsap } from '../motion/useLenisGsap'
import { isAudioUnlocked, onAudioUnlock } from '../audio/engine'
import { playFretHarmonic } from '../audio/harmonics'
import { useWaveformCanvas } from '../audio/useAnalyser'

/* ┃1┃ ABERTURA · Grave ♩=40
   A viagem pelo braço NARRA a mensagem: frases entram e saem em atos
   conforme o scroll percorre o instrumento. Um progresso (0–1) dirige
   frames, texto, harmônicos e luz. */

const DESKTOP = { dir: 'desktop', count: 121 }
const MOBILE = { dir: 'mobile', count: 91 }
const FRETS_IN_JOURNEY = 12

/** Os atos da narrativa: [início, fim] no progresso da viagem */
const BEATS = [
  { from: 0.3, to: 0.52, align: 'left' as const, text: 'Toda a teoria musical num lugar só.' },
  {
    from: 0.56,
    to: 0.78,
    align: 'right' as const,
    text: 'Você não lê sobre música.\nVocê toca.',
  },
  { from: 0.84, to: 1.01, align: 'left' as const, text: 'O caminho começa aqui.' },
]

/** Opacidade de um ato: entra, segura, sai — com rampas suaves */
function beatOpacity(p: number, from: number, to: number): number {
  const ramp = 0.06
  if (p < from || p > to) return 0
  const inRamp = Math.min(1, (p - from) / ramp)
  const outRamp = Math.min(1, (to - p) / ramp)
  return Math.min(inRamp, outRamp)
}

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const metaRef = useRef<HTMLDivElement | null>(null)
  const hintRef = useRef<HTMLDivElement | null>(null)
  const glowRef = useRef<HTMLDivElement | null>(null)
  const beatRefs = useRef<(HTMLDivElement | null)[]>([])
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

      // ato de abertura: nome + promessa, vivos até ~26% da viagem
      const title = titleRef.current
      if (title) {
        const fade = Math.max(0, 1 - p / 0.26)
        title.style.opacity = String(fade)
        title.style.transform = `translateY(${p * 120}px)`
      }
      const meta = metaRef.current
      if (meta) meta.style.opacity = String(Math.max(0, 1 - p / 0.3))
      const hint = hintRef.current
      if (hint) hint.style.opacity = String(Math.max(0, 1 - p / 0.12))

      // os atos da narrativa
      BEATS.forEach((b, i) => {
        const el = beatRefs.current[i]
        if (!el) return
        const o = beatOpacity(p, b.from, b.to)
        el.style.opacity = String(o)
        // cada frase sobe suavemente enquanto vive
        const life = (p - b.from) / (b.to - b.from)
        el.style.transform = `translateY(${(1 - life) * 26}px)`
      })
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

      {/* modo palco: glow que respira a cada harmônico */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(224,163,74,0.35), transparent 70%)',
        }}
      />

      {/* luz onde o texto assenta */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#12100e]/85 via-[#12100e]/25 to-transparent" />

      {/* rótulo do compasso */}
      <div ref={metaRef} className="absolute left-5 top-6 flex items-center gap-4 md:left-10">
        <span className="measure-no text-[#a69c90]">1</span>
        <span className="type-label text-[#a69c90]">abertura · grave</span>
      </div>

      {/* andamento pulsando em ♩=40 */}
      <div className="absolute right-5 top-6 hidden items-center gap-2 md:flex md:right-10">
        <span className="pulse-40 block h-3 w-0.5 bg-[#e0a34a]" />
        <span className="type-label text-[#6e655c]">♩ = 40</span>
      </div>

      {/* ATO DE ABERTURA: nome + a promessa, clara e direta */}
      <div ref={titleRef} className="absolute bottom-[10%] left-0 right-0 px-5 md:px-10">
        <h1
          className="type-display pointer-events-none whitespace-nowrap text-[#f2ede6]"
          style={{
            fontSize: 'clamp(4.2rem, 16vw, 15rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.03em',
            marginLeft: '-0.04em',
          }}
        >
          Compasso
        </h1>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <p className="max-w-md text-xl leading-snug text-[#f2ede6] md:text-2xl">
            Aprenda teoria musical <span className="text-[#e0a34a]">tocando</span>.
          </p>
          <p className="max-w-xs text-sm text-[#a69c90] md:text-right">
            feito pra quem está começando num instrumento — guitarra, baixo, bateria, piano
          </p>
        </div>
        {!soundOn && (
          <p className="type-label mt-5 text-[#e0a34a]">♪ toca na tela pra ligar o som</p>
        )}
      </div>

      {/* OS ATOS DA NARRATIVA — aparecem durante a viagem */}
      {BEATS.map((b, i) => (
        <div
          key={i}
          ref={(el) => {
            beatRefs.current[i] = el
          }}
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 px-5 opacity-0 md:px-10 ${
            b.align === 'left' ? 'left-0 text-left' : 'right-0 text-right'
          }`}
          style={{ maxWidth: 'min(85vw, 34rem)' }}
        >
          <p className="type-display whitespace-pre-line text-3xl leading-tight text-[#f2ede6] md:text-5xl">
            {b.text}
          </p>
        </div>
      ))}

      {/* a onda do que está soando */}
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

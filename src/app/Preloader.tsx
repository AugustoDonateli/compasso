import { useEffect, useRef, useState } from 'react'
import { gsap } from '../motion/useLenisGsap'
import { playClick } from '../audio/harmonics'

/* Count-in de metrônomo: 1 · 2 · 3 · 4 — e a página entra no tempo.
   Uma vez por sessão; pulado por completo com prefers-reduced-motion. */

const SESSION_KEY = 'compasso.countin'
const BEAT_MS = 340

export function Preloader({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    try {
      return sessionStorage.getItem(SESSION_KEY) === null
    } catch {
      return true
    }
  })
  const rootRef = useRef<HTMLDivElement | null>(null)
  const beatRef = useRef<HTMLSpanElement | null>(null)
  const barLRef = useRef<HTMLSpanElement | null>(null)
  const barRRef = useRef<HTMLSpanElement | null>(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (!visible) {
      doneRef.current()
      return
    }
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* sem storage, o count-in só roda mesmo */
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false)
        doneRef.current()
      },
    })

    for (let beat = 1; beat <= 4; beat++) {
      tl.call(
        () => {
          if (beatRef.current) beatRef.current.textContent = String(beat)
          playClick(beat === 1) // soa só se o áudio já estiver destravado
        },
        [],
        ((beat - 1) * BEAT_MS) / 1000,
      )
      // as hastes pulsam alternadas, como pêndulo de metrônomo
      const bar = beat % 2 === 1 ? barLRef : barRRef
      tl.fromTo(
        bar.current,
        { scaleY: 0.55, opacity: 0.5 },
        { scaleY: 1, opacity: 1, duration: BEAT_MS / 1000 / 2, ease: 'power2.out' },
        ((beat - 1) * BEAT_MS) / 1000,
      )
    }
    tl.to(rootRef.current, { opacity: 0, duration: 0.45, ease: 'power2.inOut' }, '+=0.1')

    return () => {
      tl.kill()
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12100e]"
    >
      <div className="flex items-center gap-8">
        <div className="flex h-16 items-end gap-3">
          <span ref={barLRef} className="block h-16 w-1.5 origin-bottom bg-[#e0a34a]" />
          <span ref={barRRef} className="block h-16 w-1.5 origin-bottom bg-[#e0a34a] opacity-50" />
        </div>
        <span ref={beatRef} className="w-8 font-mono text-3xl text-[#a69c90]">
          &nbsp;
        </span>
      </div>
    </div>
  )
}

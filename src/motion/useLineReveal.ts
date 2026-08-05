import { useEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from './useLenisGsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

/** Revela texto linha a linha, cada linha nascendo de dentro de uma máscara
 *  quando o scroll chega nela. O padrão nº 1 dos sites premiados.
 *  Roda uma vez só; respeita prefers-reduced-motion (vira fade rápido). */
export function useLineReveal(ref: RefObject<HTMLElement | null>, delay = 0): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let split: SplitText | null = null
    let st: ScrollTrigger | null = null

    // espera as fontes pra não quebrar linha no lugar errado
    const setup = () => {
      split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'reveal-line' })
      gsap.set(el, { visibility: 'visible' })
      const tween = gsap.from(split.lines, {
        yPercent: 110,
        duration: reduced ? 0.3 : 0.9,
        ease: 'power3.out',
        stagger: reduced ? 0 : 0.08,
        delay,
        paused: true,
      })
      st = ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => tween.play(),
      })
    }

    gsap.set(el, { visibility: 'hidden' })
    void document.fonts.ready.then(() => {
      if (ref.current) setup()
    })

    return () => {
      st?.kill()
      split?.revert()
    }
  }, [ref, delay])
}

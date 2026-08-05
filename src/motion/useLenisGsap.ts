import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Um relógio só pra tudo: o Lenis é dirigido pelo gsap.ticker.
 *  É isso que elimina o descompasso entre rolagem e animação —
 *  a regra nº 1 da pesquisa sobre sites premiados. */
export function useLenisGsap(): void {
  useEffect(() => {
    const lenis = new Lenis({
      // valores contidos: suave sem parecer "flutuando no espaço"
      lerp: 0.12,
      wheelMultiplier: 1,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => {
      lenis.raf(time * 1000) // gsap.ticker entrega segundos; Lenis espera ms
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
}

export { gsap, ScrollTrigger }

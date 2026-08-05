import { useEffect, useRef, type RefObject } from 'react'
import { gsap, ScrollTrigger } from './useLenisGsap'

export interface ScrollDriverOptions {
  /** Distância de scroll "virtual" da seção pinada, ex. '+=300%' */
  end?: string
  /** Pina a seção enquanto o progresso corre (padrão do herói cinematográfico) */
  pin?: boolean
  /** Suavização do scrub em segundos (true = sem suavização) */
  scrub?: boolean | number
}

/** Um único valor normalizado (0–1) por seção, dirigindo TODAS as camadas juntas
 *  (frames, texto, som). O padrão que separa "efeitos empilhados" de "uma coisa só".
 *
 *  Lê-se o valor imperativo via progressRef (sem re-render por frame);
 *  onProgress é chamado a cada update pra desenhar no canvas etc. */
export function useScrollDriver(
  targetRef: RefObject<HTMLElement | null>,
  onProgress?: (p: number) => void,
  options: ScrollDriverOptions = {},
): RefObject<number> {
  const progressRef = useRef(0)
  const onProgressRef = useRef(onProgress)
  onProgressRef.current = onProgress

  const { end = '+=200%', pin = false, scrub = 0.5 } = options

  useEffect(() => {
    const el = targetRef.current
    if (!el) return

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end,
      pin,
      scrub,
      onUpdate: (self) => {
        progressRef.current = self.progress
        onProgressRef.current?.(self.progress)
      },
    })

    return () => st.kill()
  }, [targetRef, end, pin, scrub])

  return progressRef
}

export { gsap, ScrollTrigger }

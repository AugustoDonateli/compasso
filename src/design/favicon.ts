/** Favicon-metrônomo: o ícone da aba pulsa no andamento do site.
 *  Detalhe que ninguém faz. Desligado com prefers-reduced-motion. */

const BPM = 40 // o "grave" do herói

export function startFaviconMetronome(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) return () => {}
  const original = link.href

  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  let beat = 0
  const draw = (strong: boolean) => {
    ctx.fillStyle = '#12100E'
    ctx.fillRect(0, 0, 32, 32)
    ctx.fillStyle = strong ? '#E0A34A' : '#8A6329'
    // as duas hastes; a do tempo forte fica cheia
    ctx.fillRect(12, strong ? 5 : 8, 2.5, strong ? 22 : 18)
    ctx.fillRect(18, strong ? 8 : 5, 2.5, strong ? 18 : 22)
    link.href = canvas.toDataURL('image/png')
  }

  draw(true)
  const interval = window.setInterval(
    () => {
      beat = (beat + 1) % 2
      draw(beat === 0)
    },
    (60 / BPM / 2) * 1000, // alterna a cada meio tempo
  )

  return () => {
    clearInterval(interval)
    link.href = original
  }
}

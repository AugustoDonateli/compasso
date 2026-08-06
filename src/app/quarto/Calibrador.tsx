import { useCallback, useEffect, useState } from 'react'
import { clipPath, PAPEIS } from '../../content/quarto'

/* O CALIBRADOR — só existe em /quarto?calibrar

   Desenhar sete silhuetas em cima de uma foto por tentativa e erro no código
   é meio dia perdido e termina com área de clique que não bate com o que se
   vê. Aqui você clica em volta do objeto na própria foto e ele cospe o
   TypeScript pronto pra colar em content/quarto.ts.

   Mesma ideia da calibração do braço de guitarra: mede-se uma vez, à mão, e
   depois é dado. E como as coordenadas saem normalizadas (0..1), elas
   sobrevivem quando a foto for regerada em resolução maior. */

type Ponto = [number, number]

export function Calibrador({ foto }: { foto: string }) {
  const [i, setI] = useState(0)
  const [pontos, setPontos] = useState<Ponto[]>([])
  const [prontos, setProntos] = useState<Record<string, Ponto[]>>({})

  const papel = PAPEIS[i]

  const clicar = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    setPontos((p) => [...p, [Number(x.toFixed(4)), Number(y.toFixed(4))]])
  }, [])

  const fechar = useCallback(() => {
    if (pontos.length < 3 || !papel) return
    setProntos((p) => ({ ...p, [papel.id]: pontos }))
    setPontos([])
    setI((v) => Math.min(v + 1, PAPEIS.length))
  }, [pontos, papel])

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Enter') fechar()
      if (e.key === 'Backspace') setPontos((p) => p.slice(0, -1))
      if (e.key === 'Escape') setPontos([])
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [fechar])

  const codigo = Object.entries(prontos)
    .map(([id, forma]) => {
      const p = PAPEIS.find((x) => x.id === id)!
      const campos = [
        `    id: '${id}',`,
        `    nome: '${p.nome}',`,
        `    para: '${p.para}',`,
        p.peca ? `    peca: '${p.peca}',` : null,
        p.so ? `    so: [${p.so.map((s) => `'${s}'`).join(', ')}],` : null,
        `    forma: [${forma.map(([x, y]) => `[${x}, ${y}]`).join(', ')}],`,
      ].filter(Boolean)
      return `  {\n${campos.join('\n')}\n  },`
    })
    .join('\n')

  return (
    <div className="min-h-screen bg-base p-5 text-ink">
      <p className="type-label text-brass">
        {papel
          ? `contorne: ${papel.nome} (${papel.id}) — ${i + 1} de ${PAPEIS.length}`
          : 'todos contornados'}
      </p>
      <p className="type-label mt-1 text-ink-2">
        clique em volta do objeto · enter fecha a forma · backspace desfaz · esc limpa
      </p>

      <div className="relative mt-4 inline-block select-none">
        <img src={foto} alt="" onClick={clicar} className="block max-w-full cursor-crosshair" />

        {/* o que já foi contornado, aceso */}
        {Object.entries(prontos).map(([id, forma]) => (
          <div
            key={id}
            className="pointer-events-none absolute inset-0 bg-brass/25"
            style={{ clipPath: clipPath(forma) }}
          />
        ))}

        {/* a forma em construção */}
        {pontos.length > 2 && (
          <div
            className="pointer-events-none absolute inset-0 bg-[var(--timbre)]/40"
            style={{ clipPath: clipPath(pontos) }}
          />
        )}
        {pontos.map(([x, y], k) => (
          <span
            key={k}
            className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass"
            style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
          />
        ))}
      </div>

      {codigo && (
        <pre className="mt-6 max-w-full overflow-x-auto border border-line bg-raised p-4 text-xs text-ink-2">
          {codigo}
        </pre>
      )}
    </div>
  )
}

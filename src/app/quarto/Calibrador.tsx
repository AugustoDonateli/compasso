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

  const baixar = () => {
    /* Baixar em vez de só copiar: o arquivo cai na pasta de Downloads e eu
       consigo ler ele direto do disco. Um passo a menos pro Augusto do que
       selecionar texto na tela e colar no chat. */
    const url = URL.createObjectURL(new Blob([codigo], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'quarto-calibrado.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const refazer = () => {
    if (!papel) return
    setPontos([])
    setProntos((p) => {
      const c = { ...p }
      delete c[papel.id]
      return c
    })
  }

  const voltar = () => {
    if (i === 0) return
    const anterior = PAPEIS[i - 1]
    setPontos([])
    setProntos((p) => {
      const c = { ...p }
      delete c[anterior.id]
      return c
    })
    setI(i - 1)
  }

  return (
    <div className="min-h-screen bg-base p-5 text-ink">
      <p className="type-label text-brass">
        {papel
          ? `contorne: ${papel.nome} (${papel.id}) — ${i + 1} de ${PAPEIS.length}`
          : `todos os ${PAPEIS.length} contornados`}
      </p>
      <p className="type-label mt-1 text-ink-2">
        clique em volta do objeto · enter fecha a forma · backspace desfaz um ponto · esc limpa
      </p>

      {/* ESCOLHER O QUE ESTOU CONTORNANDO.
          Sem isto, o calibrador rotulava pela ordem DELE. Na primeira
          calibração o Augusto contornou na ordem dele — caderno antes do
          vinil — e os quatro últimos vieram com o nome trocado. Precisei
          conferir cada forma contra a foto pra descobrir. Agora ele escolhe. */}
      <div className="mt-3 flex flex-wrap gap-2">
        {PAPEIS.map((p, k) => {
          const feito = !!prontos[p.id]
          const atual = k === i
          return (
            <button
              key={p.id}
              onClick={() => {
                setPontos([])
                setI(k)
              }}
              className="type-label flex min-h-11 items-center gap-2 border px-4 transition-colors"
              style={{
                borderColor: atual ? 'var(--accent)' : feito ? 'var(--ok)' : 'var(--border)',
                color: atual ? 'var(--accent)' : feito ? 'var(--ok)' : 'var(--text-2)',
              }}
            >
              {feito ? '✓' : '○'} {p.nome}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={fechar}
          disabled={pontos.length < 3}
          className="type-label flex min-h-11 items-center border border-brass px-4 text-brass disabled:opacity-35"
        >
          fechar forma (enter)
        </button>
        <button
          onClick={refazer}
          className="type-label flex min-h-11 items-center border border-line px-4 text-ink-2"
        >
          refazer este
        </button>
        <button
          onClick={voltar}
          disabled={i === 0}
          className="type-label flex min-h-11 items-center border border-line px-4 text-ink-2 disabled:opacity-35"
        >
          voltar um
        </button>
        <button
          onClick={baixar}
          disabled={!codigo}
          className="type-label flex min-h-11 items-center border-2 border-brass bg-brass px-5 text-base disabled:opacity-35"
          style={{ color: 'var(--bg-base)' }}
        >
          ⤓ baixar o arquivo
        </button>
        <button
          onClick={() => void navigator.clipboard.writeText(codigo)}
          disabled={!codigo}
          className="type-label flex min-h-11 items-center border border-line px-4 text-ink-2 disabled:opacity-35"
        >
          copiar
        </button>
      </div>

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

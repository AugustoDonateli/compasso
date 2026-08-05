import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Caminho } from '../trilha/Caminho'
import { Sessao } from '../trilha/Sessao'
import {
  licaoPorId,
  progressoPct,
  proximaLicao,
  TODAS_LICOES,
  UNIDADES,
} from '../../content/trilha'
import { award, getProgress, setStepDone } from '../../progress'
import { preloadInstrument, type InstrumentSoundId } from '../../audio/instruments'
import type { UserProgress } from '../../storage'

/* ┃trilha┃ O caminho — a resposta pra "o que eu pratico hoje?".
   Sem vidas, sem punição: a lição termina sempre, e o que você errou volta. */

const INSTRUMENTOS: Array<{ id: InstrumentSoundId; nome: string }> = [
  { id: 'guitarra', nome: 'guitarra' },
  { id: 'violao', nome: 'violão' },
  { id: 'baixo', nome: 'baixo' },
  { id: 'piano', nome: 'piano' },
  { id: 'violino', nome: 'violino' },
]

const SOM_KEY = 'compasso.instrumento'

export function TrilhaPage() {
  const [prog, setProg] = useState<UserProgress | null>(null)
  const [emAula, setEmAula] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{ acertos: number; total: number } | null>(null)
  const [som, setSom] = useState<InstrumentSoundId>(() => {
    const salvo = localStorage.getItem(SOM_KEY) as InstrumentSoundId | null
    return INSTRUMENTOS.some((x) => x.id === salvo) ? salvo! : 'guitarra'
  })

  useEffect(() => {
    void getProgress().then(setProg)
  }, [])

  useEffect(() => {
    localStorage.setItem(SOM_KEY, som)
    preloadInstrument(som)
  }, [som])

  const concluidas = prog?.completed ?? []
  const proxima = proximaLicao(concluidas)

  const concluir = useCallback(
    async (acertos: number, total: number) => {
      if (!emAula) return
      const p = await setStepDone(emAula, true)
      if (acertos > 0) await award(acertos * 10)
      setProg(await getProgress())
      void p
      setResultado({ acertos, total })
      setEmAula(null)
    },
    [emAula],
  )

  if (emAula) {
    const alvo = licaoPorId(emAula)
    if (alvo) {
      return (
        <Sessao
          licao={alvo.licao}
          som={som}
          onConcluir={(a, t) => void concluir(a, t)}
          onSair={() => setEmAula(null)}
        />
      )
    }
  }

  const pct = progressoPct(concluidas)

  return (
    <div className="min-h-screen bg-[#12100e] text-[#f2ede6]">
      <header className="flex items-center justify-between px-5 pb-6 pt-6 md:px-10">
        <Link to="/" className="type-label text-[#a69c90] transition-colors hover:text-[#e0a34a]">
          ← compasso
        </Link>
        <span className="type-label text-[#6e655c]">trilha</span>
      </header>

      <main className="px-5 pb-24 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[#332d27] pb-8">
          <div className="max-w-lg">
            <h1
              className="type-display leading-none"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 7rem)', marginLeft: '-0.03em' }}
            >
              A trilha
            </h1>
            <p className="mt-4 text-lg text-[#a69c90]">
              Um caminho com ordem. Você nunca precisa decidir o que estudar —{' '}
              <span className="text-[#e0a34a]">é só subir o braço</span>.
            </p>
          </div>

          <div className="flex items-end gap-10">
            <div>
              <span className="type-label block text-[#6e655c]">progresso</span>
              <span className="type-display text-5xl md:text-6xl">{pct}%</span>
            </div>
            <div>
              <span className="type-label block text-[#6e655c]">xp</span>
              <span className="type-display text-5xl md:text-6xl text-[#e0a34a]">
                {prog?.xp ?? 0}
              </span>
            </div>
            <div>
              <span className="type-label block text-[#6e655c]">dias seguidos</span>
              <span className="type-display text-5xl md:text-6xl">{prog?.streak ?? 0}</span>
            </div>
          </div>
        </div>

        {/* instrumento — define o som da trilha inteira */}
        <div className="flex flex-wrap items-center gap-3 py-6">
          <span className="type-label text-[#6e655c]">seu instrumento</span>
          <div className="flex flex-wrap border border-[#332d27]">
            {INSTRUMENTOS.map((x, k) => (
              <button
                key={x.id}
                onClick={() => setSom(x.id)}
                className={`type-label px-4 py-2.5 transition-colors ${k > 0 ? 'border-l border-[#332d27]' : ''} ${
                  som === x.id
                    ? 'bg-[#e0a34a] text-[#12100e]'
                    : 'text-[#a69c90] hover:bg-[#f2ede6]/5 hover:text-[#f2ede6]'
                }`}
              >
                {x.nome}
              </button>
            ))}
          </div>
        </div>

        {/* resultado da última lição */}
        {resultado && (
          <div className="mb-8 border-l-2 border-[#6e8f5a] bg-[#6e8f5a]/10 p-5">
            <span className="type-display text-2xl text-[#6e8f5a]">Lição concluída.</span>
            <p className="mt-1 text-[#a69c90]">
              {resultado.acertos} de {resultado.total} de primeira · +{resultado.acertos * 10} xp
              {' · '}
              <button
                onClick={() => setResultado(null)}
                className="text-[#e0a34a] underline underline-offset-4"
              >
                ok
              </button>
            </p>
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-[auto_1fr]">
          {/* O BRAÇO */}
          <Caminho
            concluidas={concluidas}
            atualId={proxima?.licao.id ?? null}
            onEscolher={setEmAula}
          />

          {/* próximo passo + guias das unidades */}
          <div className="max-w-xl">
            {proxima ? (
              <div className="border border-[#e0a34a] bg-[#e0a34a]/5 p-6">
                <span className="type-label text-[#e0a34a]">seu próximo passo</span>
                <h2 className="type-display mt-2 text-3xl">{proxima.licao.titulo}</h2>
                <p className="mt-2 text-[#a69c90]">
                  unidade {proxima.unidade.n} · {proxima.unidade.titulo}
                </p>
                <button
                  onClick={() => setEmAula(proxima.licao.id)}
                  className="type-label mt-6 border border-[#e0a34a] bg-[#e0a34a] px-8 py-4 text-[#12100e]"
                >
                  começar · {proxima.licao.perguntas.length} perguntas
                </button>
              </div>
            ) : (
              <div className="border border-[#6e8f5a] bg-[#6e8f5a]/10 p-6">
                <span className="type-display text-2xl text-[#6e8f5a]">
                  Você chegou no fim do que existe.
                </span>
                <p className="mt-2 text-[#a69c90]">
                  As próximas unidades estão sendo escritas. Enquanto isso, as ferramentas
                  continuam abertas.
                </p>
              </div>
            )}

            <div className="mt-10 space-y-8">
              {UNIDADES.map((u) => (
                <div key={u.id} className="border-t border-[#332d27] pt-5">
                  <div className="flex items-baseline gap-3">
                    <span className="measure-no text-[#6e655c]">{u.n}</span>
                    <h3 className="type-display text-2xl">{u.titulo}</h3>
                  </div>
                  <p className="mt-2 text-[#a69c90]">{u.guia}</p>
                </div>
              ))}
              <p className="type-label border-t border-[#332d27] pt-5 text-[#6e655c]">
                {TODAS_LICOES.length} lições no ar · unidades 3 a 8 em escrita
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

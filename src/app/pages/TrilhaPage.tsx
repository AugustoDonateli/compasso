import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Caminho } from '../trilha/Caminho'
import { Sessao } from '../trilha/Sessao'
import {
  licaoPorId,
  licoesDe,
  progressoPct,
  proximaLicao,
  type TrilhaInstrumento,
  type Unidade,
} from '../../content/trilha'
import { award, getProgress, setStepDone } from '../../progress'
import {
  preloadDrumKit,
  preloadInstrument,
  type InstrumentSoundId,
} from '../../audio/instruments'
import type { UserProgress } from '../../storage'

/* ┃trilha┃ O caminho.
   Regra de design desta tela (da pesquisa, não de gosto): UMA COISA POR TELA.
   Aqui só existem o caminho e o próximo passo. Placar é uma linha discreta.
   O guia da unidade só aparece quando você toca nela — revelação progressiva.
   Tudo grande: o site tem que passar confiança, não densidade. */

const INSTRUMENTOS: Array<{ id: TrilhaInstrumento; nome: string }> = [
  { id: 'guitarra', nome: 'guitarra' },
  { id: 'violao', nome: 'violão' },
  { id: 'baixo', nome: 'baixo' },
  { id: 'bateria', nome: 'bateria' },
  { id: 'piano', nome: 'piano' },
  { id: 'violino', nome: 'violino' },
]

const SOM_KEY = 'compasso.instrumento'

/** Bateria não tem notas afinadas: nas perguntas de teoria que pedem nota,
 *  o baterista ouve piano. Todo o resto da trilha continua sendo dele. */
function somDeNotas(i: TrilhaInstrumento): InstrumentSoundId {
  return i === 'bateria' ? 'piano' : i
}

export function TrilhaPage() {
  const [prog, setProg] = useState<UserProgress | null>(null)
  const [emAula, setEmAula] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{ acertos: number; total: number } | null>(null)
  const [guia, setGuia] = useState<Unidade | null>(null)
  const [trocandoSom, setTrocandoSom] = useState(false)
  const [som, setSom] = useState<TrilhaInstrumento>(() => {
    const salvo = localStorage.getItem(SOM_KEY) as TrilhaInstrumento | null
    return INSTRUMENTOS.some((x) => x.id === salvo) ? salvo! : 'guitarra'
  })

  useEffect(() => {
    void getProgress().then(setProg)
  }, [])

  useEffect(() => {
    localStorage.setItem(SOM_KEY, som)
    preloadInstrument(somDeNotas(som))
    if (som === 'bateria') preloadDrumKit()
  }, [som])

  const concluidas = prog?.completed ?? []
  const proxima = proximaLicao(concluidas, som)
  const totalLicoes = licoesDe(som).length

  const concluir = useCallback(
    async (acertos: number, total: number) => {
      if (!emAula) return
      await setStepDone(emAula, true)
      if (acertos > 0) await award(acertos * 10)
      setProg(await getProgress())
      setResultado({ acertos, total })
      setEmAula(null)
    },
    [emAula],
  )

  if (emAula) {
    const alvo = licaoPorId(emAula, som)
    if (alvo) {
      return (
        <Sessao
          licao={alvo.licao}
          som={somDeNotas(som)}
          onConcluir={(a, t) => void concluir(a, t)}
          onSair={() => setEmAula(null)}
        />
      )
    }
  }

  const pct = progressoPct(concluidas, som)
  const nomeInstrumento = INSTRUMENTOS.find((x) => x.id === som)?.nome ?? som

  return (
    <div className="min-h-screen bg-[#12100e] text-[#f2ede6]">
      {/* uma linha só de contexto — nada de grade de placar competindo */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#221e1a] px-5 py-5 md:px-10">
        <Link to="/" className="type-label text-[#a69c90] transition-colors hover:text-[#e0a34a]">
          ← compasso
        </Link>
        <div className="flex items-center gap-6">
          <span className="type-label text-[#a69c90]">
            <span className="text-[#f2ede6]">{pct}%</span> da trilha
          </span>
          <span className="type-label text-[#a69c90]">
            <span className="text-[#e0a34a]">{prog?.xp ?? 0}</span> xp
          </span>
          <span className="type-label text-[#a69c90]">
            <span className="text-[#f2ede6]">{prog?.streak ?? 0}</span> dias
          </span>
          <button
            onClick={() => setTrocandoSom((v) => !v)}
            className="type-label border border-[#332d27] px-3 py-2 text-[#a69c90] transition-colors hover:border-[#e0a34a] hover:text-[#e0a34a]"
          >
            {nomeInstrumento} ▾
          </button>
        </div>
      </header>

      {/* trocar instrumento: escondido até pedir */}
      {trocandoSom && (
        <div className="flex flex-wrap gap-2 border-b border-[#221e1a] px-5 py-4 md:px-10">
          {INSTRUMENTOS.map((x) => (
            <button
              key={x.id}
              onClick={() => {
                setSom(x.id)
                setTrocandoSom(false)
              }}
              className={`type-label border px-4 py-3 transition-colors ${
                som === x.id
                  ? 'border-[#e0a34a] bg-[#e0a34a] text-[#12100e]'
                  : 'border-[#332d27] text-[#a69c90] hover:border-[#a69c90]'
              }`}
            >
              {x.nome}
            </button>
          ))}
        </div>
      )}

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-16">
        {/* resultado da última lição, se houver */}
        {resultado && (
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-l-4 border-[#6e8f5a] bg-[#6e8f5a]/10 p-6">
            <div>
              <span className="type-display text-2xl text-[#6e8f5a]">Lição concluída.</span>
              <p className="mt-1 text-[#a69c90]">
                {resultado.acertos} de {resultado.total} de primeira · +{resultado.acertos * 10} xp
              </p>
            </div>
            <button
              onClick={() => setResultado(null)}
              className="type-label border border-[#6e8f5a] px-5 py-3 text-[#6e8f5a]"
            >
              seguir
            </button>
          </div>
        )}

        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          {/* A ÚNICA COISA À DIREITA: o próximo passo, enorme */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-16">
            {proxima ? (
              <>
                <span className="type-label text-[#a69c90]">
                  unidade {proxima.unidade.n} · {proxima.unidade.titulo}
                </span>
                <h1
                  className="type-display mt-4 leading-[0.95]"
                  style={{ fontSize: 'clamp(2.75rem, 6vw, 4.5rem)', marginLeft: '-0.02em' }}
                >
                  {proxima.licao.titulo}
                </h1>
                <button
                  onClick={() => setEmAula(proxima.licao.id)}
                  className="type-label mt-10 w-full border-2 border-[#e0a34a] bg-[#e0a34a] px-10 py-6 text-base text-[#12100e] transition-transform hover:-translate-y-0.5 md:w-auto"
                >
                  começar · {proxima.licao.perguntas.length} perguntas
                </button>
                <button
                  onClick={() => setGuia(guia ? null : proxima.unidade)}
                  className="type-label mt-6 block text-[#a69c90] underline underline-offset-4 transition-colors hover:text-[#a69c90]"
                >
                  {guia ? 'esconder' : 'o que essa unidade ensina'}
                </button>
                {guia && (
                  <p className="mt-4 max-w-md border-l-2 border-[#332d27] pl-5 text-lg leading-relaxed text-[#a69c90]">
                    {guia.guia}
                  </p>
                )}
              </>
            ) : (
              <>
                <span className="type-label text-[#a69c90]">fim do caminho, por enquanto</span>
                <h1 className="type-display mt-4 text-4xl leading-tight md:text-5xl">
                  Você chegou no fim do que existe.
                </h1>
                <p className="mt-5 max-w-md text-lg text-[#a69c90]">
                  As próximas unidades estão sendo escritas. Enquanto isso, as ferramentas
                  continuam abertas.
                </p>
                <Link
                  to="/ouvido"
                  className="type-label mt-8 inline-block border-2 border-[#e0a34a] px-8 py-5 text-[#e0a34a]"
                >
                  treinar o ouvido
                </Link>
              </>
            )}
          </div>

          {/* O CAMINHO */}
          <div className="order-2 lg:order-1">
            <Caminho
              instrumento={som}
              concluidas={concluidas}
              atualId={proxima?.licao.id ?? null}
              onEscolher={setEmAula}
              onVerGuia={setGuia}
            />
            <p className="type-label mt-8 text-[#8a8075]">
              {totalLicoes} lições pra {nomeInstrumento} · mais vindo
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

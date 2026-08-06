import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'
import { Caminho } from '../trilha/Caminho'
import { Sessao } from '../trilha/Sessao'
import {
  licaoPorId,
  licoesDe,
  progressoPct,
  proximaLicao,
  type TipoTrilha,
  type TrilhaInstrumento,
  type Unidade,
} from '../../content/trilha'
import { award, getProgress, setStepDone } from '../../progress'
import { aplicarTimbre } from '../../design/timbre'
import { bancada } from '../../content/estudio'
import { somConquista } from '../../audio/feedback'
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
const TIPO_KEY = 'compasso.tipoTrilha'

/** Bateria não tem notas afinadas: nas perguntas de teoria que pedem nota,
 *  o baterista ouve piano. Todo o resto da trilha continua sendo dele. */
function somDeNotas(i: TrilhaInstrumento): InstrumentSoundId {
  return i === 'bateria' ? 'piano' : i
}

interface Resultado {
  acertos: number
  total: number
  xpAntes: number
  xpDepois: number
}

/** O fim da lição, que é onde a recompensa acontece.
 *
 *  Duas coisas diferentes podem ter acontecido, e elas merecem tratamento
 *  diferente: ou uma PEÇA da bancada foi destravada — e aí isso é o assunto —
 *  ou o xp andou em direção à próxima, e o que importa é ver a barra se mexer.
 *  Ver o preenchimento acontecer é o que dá sensação de avanço; uma barra que
 *  já aparece cheia não avança nada. */
function FimDaLicao({
  resultado,
  som,
  onSeguir,
}: {
  resultado: Resultado
  som: TrilhaInstrumento
  onSeguir: () => void
}) {
  const antes = bancada(resultado.xpAntes, som)
  const depois = bancada(resultado.xpDepois, som)
  const novas = depois.liberadas.filter((p) => !antes.liberadas.some((a) => a.id === p.id))
  const barra = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (novas.length) somConquista()
  }, [novas.length])

  useEffect(() => {
    if (!barra.current || !depois.proxima) return
    const anim = gsap.fromTo(
      barra.current,
      { scaleX: novas.length ? 0 : antes.fracao },
      { scaleX: depois.fracao, duration: 1.1, ease: 'power2.out', delay: 0.35 },
    )
    return () => {
      anim.kill()
    }
  }, [antes.fracao, depois.fracao, depois.proxima, novas.length])

  return (
    <div
      className="relevo-alto mb-10 border-l-2 bg-[#1b1815] p-6 md:p-8"
      style={{ borderLeftColor: novas.length ? 'var(--timbre)' : 'var(--ok)' }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <span
            className="type-display text-2xl md:text-3xl"
            style={{ color: novas.length ? 'var(--timbre)' : 'var(--ok)' }}
          >
            {novas.length ? 'Peça nova na bancada.' : 'Lição concluída.'}
          </span>
          <p className="mt-1 text-[#a69c90]">
            {resultado.acertos} de {resultado.total} de primeira ·{' '}
            <span className="aceso">+{resultado.acertos * 10} xp</span>
          </p>
        </div>
        <button
          onClick={onSeguir}
          className="type-label flex min-h-11 items-center border px-5 transition-colors"
          style={{ borderColor: 'var(--timbre)', color: 'var(--timbre)' }}
        >
          seguir
        </button>
      </div>

      {novas.map((p) => (
        <p key={p.id} className="mt-5">
          <span className="type-display text-2xl md:text-3xl">{p.nome}</span>
          <span className="ml-3 text-[#a69c90]">{p.faz}</span>
          {p.para && (
            <Link
              to={p.para}
              className="type-label ml-3 border-b transition-colors"
              style={{ borderColor: 'var(--timbre)', color: 'var(--timbre)' }}
            >
              abrir
            </Link>
          )}
        </p>
      ))}

      {/* pra onde o xp está indo. Sem isso o número sobe e não quer dizer nada. */}
      {depois.proxima && (
        <div className="mt-6 border-t border-[#332d27] pt-5">
          <span className="type-label text-[#8a8075]">
            próxima peça · {depois.proxima.nome}
          </span>
          <span className="mt-3 block h-px w-full bg-[#332d27]">
            <span
              ref={barra}
              className="block h-px origin-left"
              style={{ background: 'var(--timbre)', transform: 'scaleX(0)' }}
            />
          </span>
          <span className="type-label mt-2 block text-[#8a8075]">
            faltam <span className="aceso">{depois.falta}</span> xp · {depois.proxima.faz}
          </span>
        </div>
      )}
    </div>
  )
}

export function TrilhaPage() {
  const [prog, setProg] = useState<UserProgress | null>(null)
  const [emAula, setEmAula] = useState<string | null>(null)
  /* xpAntes viaja junto com o resultado porque a recompensa não é o número
     que ficou: é o número ANDANDO em direção à próxima peça da bancada. Sem
     guardar o valor anterior, a barra já apareceria cheia e a pessoa não veria
     avanço nenhum — que era o laço quebrado no meio. */
  const [resultado, setResultado] = useState<{
    acertos: number
    total: number
    xpAntes: number
    xpDepois: number
  } | null>(null)
  const [guia, setGuia] = useState<Unidade | null>(null)
  const [trocandoSom, setTrocandoSom] = useState(false)
  const [som, setSom] = useState<TrilhaInstrumento>(() => {
    const salvo = localStorage.getItem(SOM_KEY) as TrilhaInstrumento | null
    return INSTRUMENTOS.some((x) => x.id === salvo) ? salvo! : 'guitarra'
  })
  /** duas trilhas paralelas: o instrumento e a teoria. Um baterista que só
   *  quer bateria nunca esbarra em nota; quem quer harmonia tem o caminho. */
  const [tipo, setTipo] = useState<TipoTrilha>(
    () => (localStorage.getItem(TIPO_KEY) as TipoTrilha | null) ?? 'instrumento',
  )

  useEffect(() => {
    localStorage.setItem(TIPO_KEY, tipo)
  }, [tipo])

  useEffect(() => {
    void getProgress().then(setProg)
  }, [])

  useEffect(() => {
    localStorage.setItem(SOM_KEY, som)
    // trocar de instrumento repinta o site inteiro: a segunda cor é o timbre
    // de quem toca, não uma cor do produto
    aplicarTimbre(som)
    preloadInstrument(somDeNotas(som))
    if (som === 'bateria') preloadDrumKit()
  }, [som])

  const concluidas = prog?.completed ?? []
  const proxima = proximaLicao(concluidas, som, tipo)
  const totalLicoes = licoesDe(som, tipo).length

  const concluir = useCallback(
    async (acertos: number, total: number) => {
      if (!emAula) return
      const xpAntes = prog?.xp ?? 0
      await setStepDone(emAula, true)
      if (acertos > 0) await award(acertos * 10)
      const depois = await getProgress()
      setProg(depois)
      setResultado({ acertos, total, xpAntes, xpDepois: depois.xp })
      setEmAula(null)
    },
    [emAula, prog?.xp],
  )

  if (emAula) {
    const alvo = licaoPorId(emAula, som, tipo)
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

  const pct = progressoPct(concluidas, som, tipo)
  const nomeInstrumento = INSTRUMENTOS.find((x) => x.id === som)?.nome ?? som
  const rumo = bancada(prog?.xp ?? 0, som)

  return (
    <div className="min-h-screen pt-[var(--altura-nav)] bg-[#12100e] text-[#f2ede6]">
      {/* uma linha só de contexto — nada de grade de placar competindo */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#221e1a] px-5 py-5 md:px-10">
        <span />
        <div className="flex items-center gap-6">
          <span className="type-label text-[#a69c90]">
            <span className="text-[#f2ede6]">{pct}%</span> da trilha
          </span>
          <span className="type-label text-[#a69c90]">
            <span className="aceso">{prog?.xp ?? 0}</span> xp
          </span>
          <span className="type-label text-[#a69c90]">
            <span className="text-[#f2ede6]">{prog?.streak ?? 0}</span> dias
          </span>
          {/* pra onde o xp está indo, sempre à vista. Um número que sobe sem
              destino não é recompensa, é contador. */}
          {rumo.proxima && (
            <span className="type-label hidden text-[#8a8075] sm:inline">
              <span className="aceso">{rumo.falta}</span> xp pra {rumo.proxima.nome.toLowerCase()}
            </span>
          )}
          <button
            onClick={() => setTrocandoSom((v) => !v)}
            className="relevo type-label flex min-h-11 items-center border border-[#332d27] px-4 text-[#a69c90] transition-colors hover:border-[var(--timbre)] hover:text-[var(--timbre)]"
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
              /* o instrumento escolhido acende no PRÓPRIO timbre dele: você vê
                 a cor do baixo antes de escolher o baixo */
              data-timbre={x.id}
              className="relevo type-label flex min-h-11 items-center border px-4 transition-colors"
              style={
                som === x.id
                  ? { borderColor: 'var(--timbre)', background: 'var(--timbre)', color: '#12100e' }
                  : { borderColor: '#332d27', color: 'var(--timbre)' }
              }
            >
              {x.nome}
            </button>
          ))}
        </div>
      )}

      {/* qual trilha: o seu instrumento ou a teoria musical */}
      <div className="flex justify-center border-b border-[#221e1a] px-5 py-4 md:px-10">
        <div className="flex border border-[#332d27]">
          {(
            [
              { id: 'instrumento' as TipoTrilha, nome: nomeInstrumento },
              { id: 'teoria' as TipoTrilha, nome: 'teoria musical' },
            ]
          ).map((t, k) => (
            <button
              key={t.id}
              onClick={() => setTipo(t.id)}
              className={`type-label flex min-h-11 items-center px-6 transition-colors ${k > 0 ? 'border-l border-[#332d27]' : ''} ${
                tipo === t.id
                  ? 'bg-[#e0a34a] text-[#12100e]'
                  : 'text-[#a69c90] hover:bg-[#f2ede6]/5 hover:text-[#f2ede6]'
              }`}
            >
              {t.nome}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-16">
        {/* O MOMENTO. A lição acabou — e aqui a pessoa vê pra onde o xp foi.
            Antes era uma caixa verde dizendo "concluída", que informa e não
            recompensa: o xp subia e nada no site indicava o que ele estava
            destravando. É o laço quebrado no meio. */}
        {resultado && <FimDaLicao resultado={resultado} som={som} onSeguir={() => setResultado(null)} />}

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
                  className="relevo type-label mt-10 w-full border-2 border-[#e0a34a] bg-[#e0a34a] px-10 py-6 text-base text-[#12100e] transition-transform hover:-translate-y-0.5 md:w-auto"
                >
                  começar · {proxima.licao.perguntas.length} perguntas
                </button>
                <button
                  onClick={() => setGuia(guia ? null : proxima.unidade)}
                  className="type-label mt-6 flex min-h-11 items-center text-[#a69c90] underline underline-offset-4 transition-colors hover:text-[var(--timbre)]"
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
              tipo={tipo}
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

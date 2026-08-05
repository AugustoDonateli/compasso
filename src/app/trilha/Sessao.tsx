import { useCallback, useEffect, useRef, useState } from 'react'
import type { Licao, Pergunta } from '../../content/trilha'
import { Keyboard } from '../../tools/keyboard/Keyboard'
import { Fretboard } from '../../tools/fretboard/Fretboard'
import { TUNINGS } from '../../theory/fretboard'
import { midiToPc, noteSolfejo, spellPc, type PitchClass } from '../../theory/notes'
import { playMidi, type InstrumentSoundId } from '../../audio/instruments'
import { ensureAudio } from '../../audio/engine'
import { playClick } from '../../audio/harmonics'

/* O motor da sessão: recebe uma lição (dados) e a executa.
   Ele NÃO conhece nenhuma pergunta específica — só os cinco tipos.
   Sem vidas: errar nunca bloqueia. A pergunta errada volta no fim da
   lição (repetição espaçada curta), e a explicação sempre aparece. */

type Estado = 'respondendo' | 'certo' | 'errado'

interface Props {
  licao: Licao
  som: InstrumentSoundId
  onConcluir: (acertos: number, total: number) => void
  onSair: () => void
}

export function Sessao({ licao, som, onConcluir, onSair }: Props) {
  const [fila, setFila] = useState<Pergunta[]>(() => [...licao.perguntas])
  const [i, setI] = useState(0)
  const [estado, setEstado] = useState<Estado>('respondendo')
  const [escolha, setEscolha] = useState<number | null>(null)
  const [montado, setMontado] = useState<PitchClass[]>([])
  const [acertos, setAcertos] = useState(0)
  const [respondidas, setRespondidas] = useState(0)
  const [batidas, setBatidas] = useState<number[]>([])
  const [tocandoMetro, setTocandoMetro] = useState(false)
  const metroRef = useRef<number | null>(null)
  const inicioRef = useRef(0)

  const p = fila[i]
  const total = licao.perguntas.length

  useEffect(() => {
    return () => {
      if (metroRef.current) window.clearInterval(metroRef.current)
    }
  }, [])

  /* ---------- áudio da pergunta ---------- */
  const tocarPergunta = useCallback(
    (q: Pergunta) => {
      if (q.tipo === 'ouvir') {
        q.midis.forEach((m, k) =>
          window.setTimeout(() => void playMidi(som, m, q.junto ? 2.2 : 1.4), q.junto ? k * 12 : k * 620),
        )
      } else if (q.tipo === 'achar' && q.tocarMidi !== undefined) {
        void playMidi(som, q.tocarMidi, 1.6)
      }
    },
    [som],
  )

  useEffect(() => {
    if (p && estado === 'respondendo') {
      const t = window.setTimeout(() => tocarPergunta(p), 250)
      return () => window.clearTimeout(t)
    }
  }, [p, estado, tocarPergunta])

  /* ---------- avaliação ---------- */
  const registrar = (certo: boolean) => {
    setEstado(certo ? 'certo' : 'errado')
    setRespondidas((r) => r + 1)
    if (certo) setAcertos((a) => a + 1)
    else {
      // sem punição: a pergunta errada volta no fim da fila pra você tentar de novo
      setFila((f) => [...f, p])
    }
  }

  const avancar = () => {
    setEstado('respondendo')
    setEscolha(null)
    setMontado([])
    setBatidas([])
    if (i + 1 >= fila.length) onConcluir(acertos, total)
    else setI(i + 1)
  }

  /* ---------- tipo: tempo (bater no pulso) ---------- */
  const iniciarMetro = async () => {
    await ensureAudio()
    if (!p || p.tipo !== 'tempo') return
    const intervalo = 60000 / p.bpm
    setBatidas([])
    setTocandoMetro(true)
    let n = 0
    inicioRef.current = performance.now()
    playClick(true)
    metroRef.current = window.setInterval(() => {
      n += 1
      playClick(n % 4 === 0)
      if (n >= p.batidas + 2) {
        if (metroRef.current) window.clearInterval(metroRef.current)
        setTocandoMetro(false)
      }
    }, intervalo)
  }

  const bater = () => {
    if (!p || p.tipo !== 'tempo' || !tocandoMetro) return
    const t = performance.now() - inicioRef.current
    setBatidas((b) => [...b, t])
  }

  const avaliarTempo = () => {
    if (!p || p.tipo !== 'tempo') return
    const intervalo = 60000 / p.bpm
    // erro médio: distância de cada batida até a batida ideal mais próxima
    const erros = batidas.map((t) => Math.abs(t - Math.round(t / intervalo) * intervalo))
    const media = erros.length ? erros.reduce((a, b) => a + b, 0) / erros.length : Infinity
    registrar(erros.length >= p.batidas - 1 && media <= p.toleranciaMs)
  }

  /* ---------- montar ---------- */
  const alternarNota = (pc: PitchClass) => {
    if (estado !== 'respondendo' || !p || p.tipo !== 'montar') return
    void playMidi(som, 60 + pc, 1)
    setMontado((m) => (m.includes(pc) ? m.filter((x) => x !== pc) : [...m, pc]))
  }

  const conferirMontagem = () => {
    if (!p || p.tipo !== 'montar') return
    const certo = p.ordenado
      ? montado.length === p.alvo.length && montado.every((pc, k) => pc === p.alvo[k])
      : montado.length === p.alvo.length && p.alvo.every((pc) => montado.includes(pc))
    registrar(certo)
  }

  if (!p) return null

  const progresso = Math.round((respondidas / Math.max(fila.length, total)) * 100)

  return (
    <div className="min-h-screen bg-[#12100e] text-[#f2ede6]">
      {/* barra de progresso da lição */}
      <div className="flex items-center gap-4 px-5 pt-6 md:px-10">
        <button
          onClick={onSair}
          className="type-label text-[#6e655c] transition-colors hover:text-[#b2543c]"
        >
          sair
        </button>
        <div className="h-1.5 flex-1 bg-[#221e1a]">
          <div
            className="h-full bg-[#e0a34a] transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <span className="type-label text-[#6e655c]">
          {respondidas}/{fila.length}
        </span>
      </div>

      <main className="mx-auto max-w-3xl px-5 pb-32 pt-12 md:px-10">
        <span className="type-label text-[#6e655c]">{licao.titulo}</span>
        <h1 className="type-display mt-3 text-3xl leading-tight md:text-5xl">{p.enunciado}</h1>

        <div className="mt-10">
          {/* ESCOLHA e OUVIR: alternativas grandes */}
          {(p.tipo === 'escolha' || p.tipo === 'ouvir') && (
            <>
              {p.tipo === 'ouvir' && (
                <button
                  onClick={() => tocarPergunta(p)}
                  className="type-label mb-6 border border-[#e0a34a] px-5 py-3 text-[#e0a34a] transition-colors hover:bg-[#e0a34a]/10"
                >
                  ▶ ouvir de novo
                </button>
              )}
              <div className="grid gap-2 md:grid-cols-2">
                {p.alternativas.map((alt, k) => {
                  const revelado = estado !== 'respondendo'
                  const certa = k === p.correta
                  const minha = escolha === k
                  return (
                    <button
                      key={k}
                      disabled={revelado}
                      onClick={() => {
                        setEscolha(k)
                        registrar(certa)
                      }}
                      className={`min-h-16 border px-5 py-4 text-left text-lg transition-all ${
                        revelado && certa
                          ? 'border-[#6e8f5a] bg-[#6e8f5a] text-[#12100e]'
                          : minha
                            ? 'border-[#b2543c] bg-[#b2543c] text-[#f2ede6]'
                            : revelado
                              ? 'border-[#2a241f] text-[#4a423a]'
                              : 'border-[#4a423a] bg-[#1b1815] hover:-translate-y-0.5 hover:border-[#e0a34a] hover:text-[#e0a34a]'
                      }`}
                    >
                      {alt}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* MONTAR: teclado + confirmar */}
          {p.tipo === 'montar' && (
            <>
              <div className="mb-5 flex min-h-10 flex-wrap items-center gap-2">
                {montado.length === 0 ? (
                  <span className="type-label text-[#6e655c]">
                    toque as teclas {p.ordenado ? 'na ordem' : '(a ordem não importa)'}
                  </span>
                ) : (
                  montado.map((pc, k) => (
                    <span
                      key={k}
                      className="border border-[#e0a34a] px-3 py-1.5 font-mono text-sm text-[#e0a34a]"
                    >
                      {noteSolfejo(spellPc(pc))}
                    </span>
                  ))
                )}
              </div>
              <Keyboard
                enabledPcs={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                onPick={alternarNota}
                disabled={estado !== 'respondendo'}
              />
              {estado === 'respondendo' && (
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={conferirMontagem}
                    disabled={montado.length === 0}
                    className="type-label border border-[#e0a34a] bg-[#e0a34a] px-6 py-3 text-[#12100e] transition-opacity disabled:opacity-30"
                  >
                    conferir
                  </button>
                  <button
                    onClick={() => setMontado([])}
                    className="type-label border border-[#332d27] px-5 py-3 text-[#a69c90] hover:border-[#a69c90]"
                  >
                    limpar
                  </button>
                </div>
              )}
            </>
          )}

          {/* ACHAR: braço do instrumento */}
          {p.tipo === 'achar' && (
            <Fretboard
              tuning={TUNINGS[som === 'baixo' ? 'baixo' : som === 'violao' ? 'violao' : 'guitarra']}
              onPlay={(_s, _f, midi) => {
                void playMidi(som, midi)
                if (estado === 'respondendo') registrar(midiToPc(midi) === p.alvo)
              }}
              roleOf={estado !== 'respondendo' ? (pc) => (pc === p.alvo ? 'tonica' : 'fora') : undefined}
            />
          )}

          {/* TEMPO: bater junto */}
          {p.tipo === 'tempo' && (
            <div className="border border-[#332d27] bg-[#1b1815] p-8 text-center">
              <div className="type-display text-6xl text-[#e0a34a]">{p.bpm}</div>
              <div className="type-label mt-1 text-[#6e655c]">batidas por minuto</div>

              {!tocandoMetro && batidas.length === 0 && estado === 'respondendo' && (
                <button
                  onClick={() => void iniciarMetro()}
                  className="type-label mt-8 border border-[#e0a34a] bg-[#e0a34a] px-8 py-4 text-[#12100e]"
                >
                  ▶ começar
                </button>
              )}

              {tocandoMetro && (
                <button
                  onPointerDown={bater}
                  className="mt-8 h-32 w-full border-2 border-[#e0a34a] bg-[#e0a34a]/10 text-2xl text-[#e0a34a] transition-colors active:bg-[#e0a34a]/40"
                >
                  BATA AQUI · {batidas.length}
                </button>
              )}

              {!tocandoMetro && batidas.length > 0 && estado === 'respondendo' && (
                <button
                  onClick={avaliarTempo}
                  className="type-label mt-8 border border-[#e0a34a] bg-[#e0a34a] px-8 py-4 text-[#12100e]"
                >
                  ver resultado
                </button>
              )}

              <p className="type-label mt-6 text-[#6e655c]">
                {tocandoMetro
                  ? 'bata junto com o clique'
                  : 'você vai ouvir um clique — bata junto no botão'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* rodapé de veredito — sempre explica */}
      {estado !== 'respondendo' && (
        <div
          className={`fixed inset-x-0 bottom-0 border-t-2 px-5 py-6 md:px-10 ${
            estado === 'certo'
              ? 'border-[#6e8f5a] bg-[#6e8f5a]/10'
              : 'border-[#b2543c] bg-[#b2543c]/10'
          }`}
        >
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4">
            <div className="max-w-xl">
              <span
                className={`type-display text-2xl ${
                  estado === 'certo' ? 'text-[#6e8f5a]' : 'text-[#b2543c]'
                }`}
              >
                {estado === 'certo' ? 'Isso.' : 'Ainda não.'}
              </span>
              <p className="mt-1 text-[#a69c90]">{p.explica}</p>
              {estado === 'errado' && (
                <p className="type-label mt-2 text-[#6e655c]">
                  essa pergunta volta no fim da lição
                </p>
              )}
            </div>
            <button
              onClick={avancar}
              className="type-label border border-[#e0a34a] bg-[#e0a34a] px-8 py-4 text-[#12100e]"
            >
              continuar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

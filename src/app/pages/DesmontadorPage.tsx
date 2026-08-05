import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  duracaoEmTempos,
  MUSICAS,
  pcDoGrau,
  qualidadeDoGrau,
  qualidadeDoTrecho,
  romano,
  romanoDoTrecho,
  trechoNoTempo,
  type Musica,
} from '../../content/musicas'
import { Fretboard } from '../../tools/fretboard/Fretboard'
import { TUNINGS } from '../../theory/fretboard'
import { chordPcs, type NoteRole } from '../../theory/chords'
import { midiToName, noteSolfejo, spellPc, type PitchClass } from '../../theory/notes'
import { getInstrument, preloadInstrument } from '../../audio/instruments'
import { ensureAudio, Tone } from '../../audio/engine'

/* ┃ferramenta 03┃ Desmontador de músicas.
   A resposta direta pra dor nº2: "estudei a apostila e na hora de tocar não
   muda nada". Aqui a mesma sequência de graus que você viu na trilha aparece
   tocando dentro de uma música que você reconhece.

   Sem letra, sem melodia, sem áudio de gravação nenhuma: só a harmonia,
   tocada com os samples do próprio site. */

const GRAUS = [1, 2, 3, 4, 5, 6, 7]

export function DesmontadorPage() {
  const [musica, setMusica] = useState<Musica>(MUSICAS[0])
  const [tocando, setTocando] = useState(false)
  const [tempo, setTempo] = useState(0)
  const pararRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    preloadInstrument('guitarra')
    return () => pararRef.current?.()
  }, [])

  const trechoAtual = tocando ? trechoNoTempo(musica, tempo) : -1
  const grauAtual = trechoAtual >= 0 ? musica.progressao[trechoAtual].grau : null
  const pcAtual = grauAtual ? pcDoGrau(musica, grauAtual) : null
  const qualidadeAtual =
    trechoAtual >= 0 ? qualidadeDoTrecho(musica, musica.progressao[trechoAtual]) : null

  /** as notas do acorde que está soando — pra acender no braço */
  const notasDoAcorde = useMemo(
    () => (pcAtual !== null && qualidadeAtual ? chordPcs(pcAtual, qualidadeAtual) : []),
    [pcAtual, qualidadeAtual],
  )

  const roleOf = useMemo(() => {
    if (pcAtual === null) return undefined
    return (pc: PitchClass): NoteRole =>
      pc === pcAtual ? 'tonica' : notasDoAcorde.includes(pc) ? 'acorde' : 'fora'
  }, [pcAtual, notasDoAcorde])

  const parar = useCallback(() => {
    pararRef.current?.()
    pararRef.current = null
    setTocando(false)
    setTempo(0)
  }, [])

  const tocar = useCallback(async () => {
    if (tocando) {
      parar()
      return
    }
    await ensureAudio()
    const guitarra = await getInstrument('guitarra')
    const transport = Tone.getTransport()
    transport.bpm.value = musica.bpm

    const total = duracaoEmTempos(musica)
    let t = 0

    const id = transport.scheduleRepeat((time) => {
      const trecho = trechoNoTempo(musica, t)
      const inicioDoTrecho =
        musica.progressao.slice(0, trecho).reduce((s, x) => s + x.tempos, 0)

      // dedilha o acorde só quando ele entra, não a cada tempo
      if (t % total === inicioDoTrecho) {
        const grau = musica.progressao[trecho].grau
        const pcs = chordPcs(pcDoGrau(musica, grau), qualidadeDoTrecho(musica, musica.progressao[trecho]))
        let prev = 48 + pcs[0]
        const midis = pcs.map((pc, i) => {
          if (i === 0) return prev
          let m = prev - (prev % 12) + pc
          if (m <= prev) m += 12
          prev = m
          return m
        })
        midis.forEach((m, i) =>
          guitarra.triggerAttackRelease(midiToName(m), 1.8, time + i * 0.04, 0.8),
        )
      }
      t += 1
    }, '4n')

    transport.position = 0
    transport.start()
    setTocando(true)

    /* O VISUAL lê a posição do transporte a cada quadro, em vez de consumir
       uma fila agendada (Tone.Draw). Com a aba em segundo plano o rAF pausa;
       uma fila acumularia eventos vencidos que são descartados, e o destaque
       travaria ou pularia ao voltar. Lendo a posição, ele ressincroniza
       sozinho no primeiro quadro. Mesma lição da Groove Machine. */
    let raf = 0
    const desenhar = () => {
      raf = requestAnimationFrame(desenhar)
      if (transport.state !== 'started') return
      setTempo(Math.floor(transport.ticks / transport.PPQ))
    }
    raf = requestAnimationFrame(desenhar)

    pararRef.current = () => {
      cancelAnimationFrame(raf)
      transport.clear(id)
      transport.stop()
      transport.position = 0
    }
  }, [tocando, musica, parar])

  const trocar = (m: Musica) => {
    parar()
    setMusica(m)
  }

  return (
    <div className="min-h-screen bg-[#12100e] pt-14 text-[#f2ede6]">
      <header className="flex items-center justify-end px-5 py-5 md:px-10">
        <span className="type-label text-[#8a8075]">ferramenta 03</span>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24 md:px-10">
        <h1
          className="type-display leading-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginLeft: '-0.03em' }}
        >
          Desmontador
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[#a69c90]">
          Músicas famosas abertas por dentro: a teoria que faz elas funcionarem, o que cada
          instrumento está fazendo e{' '}
          <span className="text-[#e0a34a]">a história de como nasceram</span>.
        </p>

        {/* escolher a música */}
        <div className="mt-8 grid gap-px bg-[#332d27] sm:grid-cols-2 lg:grid-cols-3">
          {MUSICAS.map((m) => (
            <button
              key={m.id}
              onClick={() => trocar(m)}
              className={`p-5 text-left transition-colors ${
                musica.id === m.id ? 'bg-[#e0a34a]/10' : 'bg-[#12100e] hover:bg-[#1b1815]'
              }`}
            >
              <span
                className={`type-display block text-xl ${musica.id === m.id ? 'text-[#e0a34a]' : ''}`}
              >
                {m.titulo}
              </span>
              <span className="type-label mt-1 block text-[#a69c90]">{m.artista}</span>
              <span className="type-label mt-0.5 block text-[#8a8075]">
                {m.ano} · {m.genero}
              </span>
            </button>
          ))}
        </div>

        {/* o toca-discos */}
        <div className="mt-10 border border-[#332d27] bg-[#1b1815] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => void tocar()}
              className={`type-label border-2 px-8 py-5 transition-colors ${
                tocando
                  ? 'border-[#e0a34a] bg-[#e0a34a] text-[#12100e]'
                  : 'border-[#e0a34a] text-[#e0a34a] hover:bg-[#e0a34a]/10'
              }`}
            >
              {tocando ? '■ parar' : '▶ tocar a sequência'}
            </button>
            <span className="type-label text-[#8a8075]">
              {noteSolfejo(spellPc(musica.tonica))} {musica.modo} · ♩ = {musica.bpm}
            </span>
          </div>

          {/* a progressão em blocos, com o atual aceso */}
          <div className="mt-8 flex flex-wrap gap-2">
            {musica.progressao.map((t, i) => {
              const ativo = i === trechoAtual
              const pc = pcDoGrau(musica, t.grau)
              return (
                <div
                  key={i}
                  className={`min-w-24 flex-1 border px-4 py-5 text-center transition-all duration-150 ${
                    ativo
                      ? 'border-[#e0a34a] bg-[#e0a34a]/15'
                      : 'border-[#332d27] bg-[#12100e]'
                  }`}
                  style={{ flexGrow: t.tempos }}
                >
                  <span
                    className={`type-display block text-3xl ${ativo ? 'text-[#e0a34a]' : 'text-[#a69c90]'}`}
                  >
                    {romanoDoTrecho(musica, t)}
                  </span>
                  <span className="type-label mt-2 block text-[#8a8075]">
                    {noteSolfejo(spellPc(pc))}
                    {qualidadeDoTrecho(musica, t) === 'menor' ? 'm' : ''}
                  </span>
                  {/* acorde emprestado: é onde mora a mágica da música */}
                  {t.emprestado && (
                    <span className="type-label mt-2 block text-[#e0a34a]">emprestado</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* explica cada empréstimo, se houver */}
          {musica.progressao.some((t) => t.emprestado) && (
            <div className="mt-6 space-y-2 border-t border-[#332d27] pt-5">
              {musica.progressao.map(
                (t, i) =>
                  t.emprestado && (
                    <p key={i} className="text-[#a69c90]">
                      <span className="type-label mr-2 text-[#e0a34a]">
                        {romanoDoTrecho(musica, t)}
                      </span>
                      {t.emprestado.porque}
                    </p>
                  ),
              )}
            </div>
          )}
        </div>

        {/* o braço acendendo com o acorde que está soando */}
        <div className="mt-8">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
            <span className="type-label text-[#8a8075]">onde isso cai no braço</span>
            {grauAtual && (
              <span className="type-label text-[#e0a34a]">
                grau {romano(musica, grauAtual)} soando agora
              </span>
            )}
          </div>
          <div className="border border-[#332d27] bg-[#221e1a] p-3 md:p-5">
            <Fretboard tuning={TUNINGS.guitarra} roleOf={roleOf} />
          </div>
        </div>

        {/* A HISTÓRIA — como a música nasceu de verdade */}
        <section className="mt-14">
          <span className="type-label text-[#8a8075]">como nasceu</span>
          <h2 className="type-display mt-3 text-3xl md:text-4xl">A história</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#d5cec4]">
            {musica.historia}
          </p>
        </section>

        {/* A TEORIA — o truque que faz funcionar */}
        <section className="mt-12 border-l-2 border-[#e0a34a] pl-6">
          <span className="type-label text-[#e0a34a]">o truque</span>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#d5cec4]">{musica.teoria}</p>
        </section>

        {/* AS CAMADAS — como os instrumentos se combinam */}
        <section className="mt-14">
          <span className="type-label text-[#8a8075]">o que cada instrumento faz</span>
          <h2 className="type-display mt-3 text-3xl md:text-4xl">As camadas</h2>
          <div className="mt-6">
            {musica.camadas.map((c) => (
              <div
                key={c.instrumento}
                className="grid gap-x-8 gap-y-1 border-t border-[#332d27] py-5 last:border-b md:grid-cols-[10rem_1fr]"
              >
                <span className="type-label text-[#e0a34a]">{c.instrumento}</span>
                <p className="text-[#a69c90]">{c.faz}</p>
              </div>
            ))}
          </div>
        </section>

        {/* A LIÇÃO — o que você leva pro seu instrumento */}
        <section className="mt-12 border border-[#332d27] bg-[#1b1815] p-6 md:p-8">
          <span className="type-label text-[#e0a34a]">leve isso pro seu instrumento</span>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#f2ede6]">{musica.licao}</p>
        </section>

        {/* o campo harmônico inteiro, com os graus usados destacados */}
        <div className="mt-10 border-t border-[#332d27] pt-8">
          <span className="type-label text-[#8a8075]">
            os sete acordes da tonalidade — em destaque, os que essa sequência usa
          </span>
          <div className="mt-4 flex flex-wrap gap-2">
            {GRAUS.map((g) => {
              const usado = musica.progressao.some((t) => t.grau === g)
              const soando = grauAtual === g
              const pc = pcDoGrau(musica, g)
              return (
                <div
                  key={g}
                  className={`min-w-20 flex-1 border px-3 py-4 text-center transition-colors ${
                    soando
                      ? 'border-[#e0a34a] bg-[#e0a34a] text-[#12100e]'
                      : usado
                        ? 'border-[#e0a34a]/50 bg-[#e0a34a]/10'
                        : 'border-[#332d27] opacity-45'
                  }`}
                >
                  <span className="type-display block text-xl">{romano(musica, g)}</span>
                  <span className="type-label mt-1 block">
                    {noteSolfejo(spellPc(pc))}
                    {qualidadeDoGrau(musica, g) === 'menor' ? 'm' : ''}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="type-label mt-5 text-[#8a8075]">
            só harmonia · sem letra, sem melodia, tocado com os samples do site
          </p>
        </div>
      </main>
    </div>
  )
}

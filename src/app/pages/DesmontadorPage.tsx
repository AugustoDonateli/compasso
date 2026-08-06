import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  duracaoEmTempos,
  levadaParaUrl,
  linkDoOriginal,
  MUSICAS,
  PASSOS,
  pcDoGrau,
  pcDoTrecho,
  qualidadeDoGrau,
  qualidadeDoTrecho,
  romano,
  romanoDoTrecho,
  semOTruque,
  temTruque,
  trechoNoTempo,
  trocarAcorde,
  type Musica,
  type Trecho,
} from '../../content/musicas'
import { Fretboard } from '../../tools/fretboard/Fretboard'
import { TUNINGS } from '../../theory/fretboard'
import { chordPcs, type ChordQuality, type NoteRole } from '../../theory/chords'
import { midiToName, noteSolfejo, spellPc, type PitchClass } from '../../theory/notes'
import { getDrumKit, getInstrument, preloadDrumKit, preloadInstrument } from '../../audio/instruments'
import type { DrumPiece } from '../../audio/instruments'
import { ensureAudio, Tone } from '../../audio/engine'

/* ┃ferramenta 03┃ Desmontador de músicas.

   O QUE ESTAVA ERRADO: a ferramenta tocava quatro blocos de som e escrevia
   parágrafos. A lição do Creep chegava a dizer "toca a sequência com o quarto
   acorde maior e depois menor e sente a diferença" — mandando a pessoa
   experimentar por conta, tendo um tocador na tela. Isso é um vídeo com
   passos a mais.

   O QUE ELA FAZ AGORA, e que vídeo nenhum faz:
   1. toca com LEVADA e BATERIA, então soa como música e não como exercício
   2. as três pistas ligam e desligam AO VIVO — tira a harmonia e sobra o
      verso do Teen Spirit, que é literalmente baixo e bateria
   3. qualquer acorde é trocável no meio da execução: você ouve a teoria
      quebrar em vez de ler que ela existe
   4. um botão desliga o truque da música e devolve a versão óbvia dela */

const GRAUS = [1, 2, 3, 4, 5, 6, 7]
const PECAS: DrumPiece[] = ['chimbal', 'caixa', 'tom', 'bumbo']
/* Só as três tríades do campo harmônico. ChordQuality conhece sétimas e
   aumentado, mas o editor existe pra ensinar a diferença que se ouve de
   primeira — maior soa aberto, menor soa fechado — e uma lista de nove opções
   afogaria justamente isso. */
const QUALIDADES = ['maior', 'menor', 'diminuto'] as const satisfies readonly ChordQuality[]
const NOME_DA_QUALIDADE: Record<(typeof QUALIDADES)[number], string> = {
  maior: 'maior',
  menor: 'menor',
  diminuto: 'dim',
}

type Pistas = { harmonia: boolean; baixo: boolean; bateria: boolean }
const TODAS: Pistas = { harmonia: true, baixo: true, bateria: true }

const NOME_DA_PISTA: Record<keyof Pistas, string> = {
  harmonia: 'harmonia',
  baixo: 'baixo',
  bateria: 'bateria',
}

export function DesmontadorPage() {
  const [musica, setMusica] = useState<Musica>(MUSICAS[0])
  const [progressao, setProgressao] = useState<Trecho[]>(MUSICAS[0].progressao)
  const [pistas, setPistas] = useState<Pistas>(TODAS)
  const [fator, setFator] = useState(1) // 0,5 a 1 do andamento original
  const [tocando, setTocando] = useState(false)
  const [trechoTocando, setTrechoTocando] = useState(-1)
  const [editando, setEditando] = useState<number | null>(null)
  const [semAudio, setSemAudio] = useState(false)
  const pararRef = useRef<(() => void) | null>(null)

  /* Refs espelhando o estado: o callback agendado no transporte captura o
     valor do momento em que foi criado. Sem isso, desligar o baixo ou trocar
     um acorde só faria efeito depois de parar e tocar de novo — e mexer
     enquanto toca é a ferramenta inteira. */
  const pistasRef = useRef(pistas)
  pistasRef.current = pistas
  const progRef = useRef(progressao)
  progRef.current = progressao
  const musicaRef = useRef(musica)
  musicaRef.current = musica

  useEffect(() => {
    preloadInstrument(musica.som)
    preloadInstrument('baixo')
    preloadDrumKit()
  }, [musica.som])

  useEffect(() => () => pararRef.current?.(), [])

  // o andamento acompanha o cursor sem interromper o que está tocando
  useEffect(() => {
    if (tocando) Tone.getTransport().bpm.value = Math.round(musica.bpm * fator)
  }, [fator, tocando, musica.bpm])

  const editado = useMemo(
    () =>
      progressao.length !== musica.progressao.length ||
      progressao.some((t, i) => {
        const o = musica.progressao[i]
        return (
          t.grau !== o.grau ||
          (t.alteracao ?? 0) !== (o.alteracao ?? 0) ||
          qualidadeDoTrecho(musica, t) !== qualidadeDoTrecho(musica, o)
        )
      }),
    [progressao, musica],
  )

  const trechoAtual = tocando ? trechoTocando : -1
  const trechoVisivel = editando ?? (trechoAtual >= 0 ? trechoAtual : -1)
  const trechoEmFoco = trechoVisivel >= 0 ? (progressao[trechoVisivel] ?? null) : null
  const grauAtual = trechoEmFoco?.grau ?? null
  // pcDoTrecho, não pcDoGrau: o ♭VII de Eduardo e Mônica acenderia a nota
  // errada no braço se a alteração fosse ignorada aqui
  const pcAtual = trechoEmFoco ? pcDoTrecho(musica, trechoEmFoco) : null
  const qualidadeAtual =
    trechoVisivel >= 0 && progressao[trechoVisivel]
      ? qualidadeDoTrecho(musica, progressao[trechoVisivel])
      : null

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
    setTrechoTocando(-1)
  }, [])

  const tocar = useCallback(async () => {
    if (tocando) {
      parar()
      return
    }
    /* Se o navegador não liberou o áudio, falhe À VISTA. Antes o botão virava
       "parar", nada soava e nada andava — que é indistinguível de bug e foi
       exatamente como o defeito do contexto suspenso chegou até aqui. */
    if (!(await ensureAudio())) {
      setSemAudio(true)
      return
    }
    setSemAudio(false)
    const m = musicaRef.current
    const [harmonia, baixo, kit] = await Promise.all([
      getInstrument(m.som),
      getInstrument('baixo'),
      getDrumKit(),
    ])
    const transport = Tone.getTransport()
    transport.bpm.value = Math.round(m.bpm * fator)

    const totalPassos = duracaoEmTempos(m) * 4
    // piano ataca junto; instrumento de corda é dedilhado, e é esse atraso de
    // milissegundos entre as cordas que faz soar tocado em vez de sintetizado
    const arpejo = m.som === 'piano' ? 0 : 0.028
    let passo = 0
    let ultimoTrecho = -1

    const id = transport.scheduleRepeat((time) => {
      const p = passo % totalPassos
      const noCompasso = p % PASSOS
      const trecho = trechoNoTempo(m, Math.floor(p / 4))
      const t = progRef.current[trecho]
      const ligadas = pistasRef.current
      if (!t) {
        passo += 1
        return
      }

      /* O DESTAQUE SAI DAQUI, do relógio do áudio — não de um laço de
         animação lendo a posição do transporte.

         Era assim antes e travava: `requestAnimationFrame` não roda em toda
         situação (aba oculta, janela não composta, economia de bateria), e
         quando ele não roda o `setTempo` nunca acontece. O áudio seguia
         trocando de acorde e a tela ficava presa no primeiro pra sempre — o
         defeito que o Augusto viu. O relógio do áudio, esse, nunca para.

         O agendamento tem ~0,1s de antecedência, então o acorde acende um
         piscar antes de soar. Num acorde que dura segundos, ninguém percebe —
         e é infinitamente melhor que não acender nunca. */
      if (trecho !== ultimoTrecho) {
        ultimoTrecho = trecho
        setTrechoTocando(trecho)
      }

      const pc = pcDoTrecho(m, t)

      if (ligadas.harmonia && m.levada.includes(noCompasso)) {
        const pcs = chordPcs(pc, qualidadeDoTrecho(m, t))
        // empilha as notas subindo a partir da fundamental, como a mão faz
        let anterior = 48 + pcs[0]
        const midis = pcs.map((n, i) => {
          if (i === 0) return anterior
          let x = anterior - (anterior % 12) + n
          if (x <= anterior) x += 12
          anterior = x
          return x
        })
        const seg16 = 60 / (m.bpm * fator) / 4
        const dur = Math.max(0.28, (PASSOS / m.levada.length) * seg16 * 0.9)
        midis.forEach((x, i) =>
          harmonia.triggerAttackRelease(midiToName(x), dur, time + i * arpejo, 0.75),
        )
      }

      // o baixo faz o que baixo de música pop faz: a fundamental, no chão
      if (ligadas.baixo && (noCompasso === 0 || noCompasso === 8)) {
        baixo.triggerAttackRelease(midiToName(36 + pc), '4n', time, 0.9)
      }

      if (ligadas.bateria) {
        for (const peca of PECAS) {
          if (m.bateria[peca][noCompasso]) kit.player(peca).start(time)
        }
      }

      passo += 1
    }, '16n')

    transport.position = 0
    transport.start()
    setTocando(true)

    pararRef.current = () => {
      transport.clear(id)
      transport.stop()
      transport.position = 0
    }
  }, [tocando, parar, fator])

  const trocar = (m: Musica) => {
    parar()
    setMusica(m)
    setProgressao(m.progressao)
    setPistas(TODAS)
    setEditando(null)
    setFator(1)
  }

  const alternarPista = (p: keyof Pistas) => setPistas((v) => ({ ...v, [p]: !v[p] }))

  const link = linkDoOriginal(musica)

  return (
    <div className="min-h-screen bg-[#12100e] pt-[var(--altura-nav)] text-[#f2ede6]">
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
          Músicas famosas abertas por dentro — e{' '}
          <span className="text-[#e0a34a]">mexíveis</span>. Desligue um instrumento, troque um
          acorde, ouça a teoria quebrar.
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

        {/* A MESA */}
        <div className="relevo-alto mt-10 border border-[#332d27] bg-[#1b1815] p-5 md:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => void tocar()}
              className={`relevo type-label flex min-h-14 items-center border-2 px-8 transition-colors ${
                tocando
                  ? 'border-[#e0a34a] bg-[#e0a34a] text-[#12100e]'
                  : 'border-[#e0a34a] text-[#e0a34a] hover:bg-[#e0a34a]/10'
              }`}
            >
              {tocando ? '■ parar' : '▶ tocar'}
            </button>

            {/* devagar é onde a pessoa consegue acompanhar — e isso não é
                enfeite, é a diferença entre ouvir e conseguir tocar junto */}
            <label className="flex min-w-44 flex-1 items-center gap-3">
              <span className="type-label whitespace-nowrap text-[#8a8075]">
                {Math.round(musica.bpm * fator)} bpm
              </span>
              <input
                type="range"
                min={50}
                max={100}
                value={Math.round(fator * 100)}
                onChange={(e) => setFator(Number(e.target.value) / 100)}
                className="h-11 flex-1 accent-[var(--timbre)]"
                aria-label="andamento"
              />
            </label>

            <span className="type-label text-[#8a8075]">
              {noteSolfejo(spellPc(musica.tonica))} {musica.modo}
            </span>
          </div>

          {semAudio && (
            <p className="mt-4 border-l-2 border-[#b2543c] pl-4 text-[#b2543c]">
              O navegador não liberou o áudio. Toque na página uma vez e aperte tocar de novo.
            </p>
          )}

          {/* AS PISTAS — o coração da coisa. Ligam e desligam tocando. */}
          <div className="mt-7 border-t border-[#332d27] pt-6">
            <span className="type-label text-[#8a8075]">
              as pistas · desligue uma e ouça o que sobra
            </span>
            {/* Dito na cara: um kit de quatro peças numa grade de 16 passos não
                segura cross-stick, chimbal aberto, flam, ghost note nem
                subdivisão ternária. Chamar isso de transcrição seria mentira, e
                quem toca bateria ouve a mentira na primeira volta. */}
            <p className="mt-2 max-w-2xl text-sm text-[#8a8075]">
              a bateria aqui é a levada do <span className="text-[#a69c90]">estilo</span>, não
              transcrição da gravação — o kit tem quatro peças e a grade tem 16 passos, então
              cross-stick, chimbal aberto e virada ficam de fora.{' '}
              <Link
                to={levadaParaUrl(musica)}
                className="border-b border-[#332d27] text-[var(--timbre)] transition-colors hover:border-[var(--timbre)]"
              >
                abra na groove machine e conserte
              </Link>
              .
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {(Object.keys(NOME_DA_PISTA) as Array<keyof Pistas>).map((p) => {
                const on = pistas[p]
                return (
                  <button
                    key={p}
                    onClick={() => alternarPista(p)}
                    aria-pressed={on}
                    className={`relevo type-label flex min-h-11 items-center gap-3 border px-5 transition-all ${
                      on ? 'led' : ''
                    }`}
                    style={{
                      borderColor: on ? 'var(--timbre)' : '#332d27',
                      color: on ? 'var(--timbre)' : '#8a8075',
                      background: on ? 'color-mix(in srgb, var(--timbre) 10%, transparent)' : 'transparent',
                    }}
                  >
                    <span
                      className="block h-1.5 w-1.5 rounded-full transition-colors"
                      style={{ background: on ? 'var(--timbre)' : '#332d27' }}
                      aria-hidden
                    />
                    {p === 'harmonia' ? musica.som : NOME_DA_PISTA[p]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* A PROGRESSÃO — clicável */}
          <div className="mt-7 border-t border-[#332d27] pt-6">
            <span className="type-label text-[#8a8075]">
              a sequência · toque num acorde pra trocar
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {progressao.map((t, i) => {
                const soando = i === trechoAtual
                const aberto = i === editando
                const pc = pcDoTrecho(musica, t)
                const mudou =
                  musica.progressao[i] &&
                  (t.grau !== musica.progressao[i].grau ||
                    qualidadeDoTrecho(musica, t) !==
                      qualidadeDoTrecho(musica, musica.progressao[i]))
                return (
                  <button
                    key={i}
                    onClick={() => setEditando(aberto ? null : i)}
                    className="relevo min-w-24 flex-1 border px-4 py-5 text-center transition-all duration-150"
                    style={{
                      flexGrow: t.tempos,
                      borderColor: soando || aberto ? 'var(--timbre)' : '#332d27',
                      background: soando
                        ? 'color-mix(in srgb, var(--timbre) 16%, transparent)'
                        : '#12100e',
                    }}
                  >
                    <span
                      className="type-display block text-3xl"
                      style={{ color: soando || aberto ? 'var(--timbre)' : '#a69c90' }}
                    >
                      {romanoDoTrecho(musica, t)}
                    </span>
                    <span className="type-label mt-2 block text-[#8a8075]">
                      {noteSolfejo(spellPc(pc))}
                      {qualidadeDoTrecho(musica, t) === 'menor'
                        ? 'm'
                        : qualidadeDoTrecho(musica, t) === 'diminuto'
                          ? '°'
                          : ''}
                    </span>
                    {mudou ? (
                      <span className="type-label mt-2 block text-[#b2543c]">trocado</span>
                    ) : t.emprestado ? (
                      <span className="type-label mt-2 block text-[#e0a34a]">emprestado</span>
                    ) : null}
                  </button>
                )
              })}
            </div>

            {/* o editor do acorde escolhido */}
            {editando !== null && progressao[editando] && (
              <div className="mt-4 border border-[#332d27] bg-[#12100e] p-4 md:p-5">
                <span className="type-label text-[#8a8075]">
                  acorde {editando + 1} · escolha o grau e a qualidade
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {GRAUS.map((g) => (
                    <button
                      key={g}
                      onClick={() =>
                        setProgressao((pr) =>
                          trocarAcorde(pr, editando, g, qualidadeDoGrau(musica, g), qualidadeDoGrau(musica, g)),
                        )
                      }
                      className="type-label flex min-h-11 min-w-11 items-center justify-center border px-3 transition-colors"
                      style={{
                        borderColor:
                          progressao[editando].grau === g ? 'var(--timbre)' : '#332d27',
                        color: progressao[editando].grau === g ? 'var(--timbre)' : '#a69c90',
                      }}
                    >
                      {romano(musica, g)}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {QUALIDADES.map((q) => (
                    <button
                      key={q}
                      onClick={() =>
                        setProgressao((pr) =>
                          trocarAcorde(
                            pr,
                            editando,
                            pr[editando].grau,
                            q,
                            qualidadeDoGrau(musica, pr[editando].grau),
                          ),
                        )
                      }
                      className="type-label flex min-h-11 items-center border px-4 transition-colors"
                      style={{
                        borderColor:
                          qualidadeDoTrecho(musica, progressao[editando]) === q
                            ? 'var(--timbre)'
                            : '#332d27',
                        color:
                          qualidadeDoTrecho(musica, progressao[editando]) === q
                            ? 'var(--timbre)'
                            : '#a69c90',
                      }}
                    >
                      {NOME_DA_QUALIDADE[q]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              {temTruque(musica) && (
                <button
                  onClick={() => {
                    setProgressao(editado ? musica.progressao : semOTruque(musica))
                    setEditando(null)
                  }}
                  className="type-label flex min-h-11 items-center border border-[#e0a34a] px-5 text-[#e0a34a] transition-colors hover:bg-[#e0a34a]/10"
                >
                  {editado ? 'devolver o truque' : 'ouvir sem o truque'}
                </button>
              )}
              {editado && (
                <button
                  onClick={() => {
                    setProgressao(musica.progressao)
                    setEditando(null)
                  }}
                  className="type-label flex min-h-11 items-center border border-[#332d27] px-5 text-[#a69c90] transition-colors hover:text-[#f2ede6]"
                >
                  voltar ao original
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ouvir a gravação de verdade: sem isso não dá pra comparar nada */}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="type-label mt-6 inline-flex min-h-11 items-center border-b border-[#332d27] text-[#a69c90] transition-colors hover:border-[#e0a34a] hover:text-[#e0a34a]"
        >
          ouvir o original de {musica.artista} no youtube ↗
        </a>

        {/* o braço acendendo com o acorde */}
        <div className="mt-8">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
            <span className="type-label text-[#8a8075]">onde isso cai no braço</span>
            {grauAtual && (
              <span className="type-label" style={{ color: 'var(--timbre)' }}>
                {noteSolfejo(spellPc(pcAtual!))}
                {qualidadeAtual === 'menor' ? 'm' : qualidadeAtual === 'diminuto' ? '°' : ''} ·
                grau {romanoDoTrecho(musica, trechoEmFoco!)}
              </span>
            )}
          </div>
          <div className="border border-[#332d27] bg-[#221e1a] p-3 md:p-5">
            <Fretboard tuning={TUNINGS.guitarra} roleOf={roleOf} />
          </div>
        </div>

        {/* A HISTÓRIA */}
        <section className="mt-14">
          <span className="type-label text-[#8a8075]">como nasceu</span>
          <h2 className="type-display mt-3 text-3xl md:text-4xl">A história</h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#d5cec4]">
            {musica.historia}
          </p>
        </section>

        {/* O TRUQUE */}
        <section className="mt-12 border-l-2 border-[#e0a34a] pl-6">
          <span className="type-label text-[#e0a34a]">o truque</span>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#d5cec4]">{musica.teoria}</p>
          {temTruque(musica) && (
            <p className="type-label mt-4 text-[#8a8075]">
              o botão &ldquo;ouvir sem o truque&rdquo; lá em cima devolve a versão óbvia — é a
              diferença que importa
            </p>
          )}
        </section>

        {/* AS CAMADAS — agora cada uma liga e desliga */}
        <section className="mt-14">
          <span className="type-label text-[#8a8075]">o que cada instrumento faz</span>
          <h2 className="type-display mt-3 text-3xl md:text-4xl">As camadas</h2>
          <div className="mt-6">
            {musica.camadas.map((c) => {
              const p = c.pista
              const on = p ? pistas[p] : null
              return (
                <div
                  key={c.instrumento}
                  className="grid gap-x-8 gap-y-2 border-t border-[#332d27] py-5 last:border-b md:grid-cols-[12rem_1fr]"
                >
                  <div>
                    <span className="type-label block text-[#e0a34a]">{c.instrumento}</span>
                    {p && (
                      <button
                        onClick={() => alternarPista(p)}
                        aria-pressed={!!on}
                        className="type-label mt-2 flex min-h-11 items-center gap-2 text-left transition-colors"
                        style={{ color: on ? 'var(--timbre)' : '#8a8075' }}
                      >
                        <span
                          className={`block h-1.5 w-1.5 rounded-full ${on ? 'led' : ''}`}
                          style={{ background: on ? 'var(--timbre)' : '#332d27' }}
                          aria-hidden
                        />
                        {on ? 'tocando' : 'desligado'}
                      </button>
                    )}
                  </div>
                  <p className="text-[#a69c90]">{c.faz}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* A LIÇÃO */}
        <section className="relevo mt-12 border border-[#332d27] bg-[#1b1815] p-6 md:p-8">
          <span className="type-label text-[#e0a34a]">leve isso pro seu instrumento</span>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#f2ede6]">{musica.licao}</p>
        </section>

        {/* o campo harmônico inteiro */}
        <div className="mt-10 border-t border-[#332d27] pt-8">
          <span className="type-label text-[#8a8075]">
            os sete acordes da tonalidade — em destaque, os que essa sequência usa
          </span>
          <div className="mt-4 flex flex-wrap gap-2">
            {GRAUS.map((g) => {
              const usado = progressao.some((t) => t.grau === g)
              const soando = grauAtual === g
              const pc = pcDoGrau(musica, g)
              return (
                <div
                  key={g}
                  className="min-w-20 flex-1 border px-3 py-4 text-center transition-colors"
                  style={{
                    borderColor: soando || usado ? 'var(--timbre)' : '#332d27',
                    background: soando ? 'var(--timbre)' : 'transparent',
                    color: soando ? '#12100e' : undefined,
                    opacity: usado || soando ? 1 : 0.45,
                  }}
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
            harmonia, levada e bateria tocadas com os samples do site · sem letra e sem melodia
          </p>
        </div>
      </main>
    </div>
  )
}

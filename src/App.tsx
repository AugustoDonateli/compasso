import { useEffect, useMemo, useRef, useState } from 'react'
import { Hero } from './app/Hero'
import { Preloader } from './app/Preloader'
import { getTheme, toggleTheme, type Theme } from './design/theme'
import { startFaviconMetronome } from './design/favicon'
import { attachGlobalUnlock } from './audio/engine'
import { useLenisGsap } from './motion/useLenisGsap'
import { useLineReveal } from './motion/useLineReveal'
import { ensureAudio, Tone } from './audio/engine'
import { harmonicField } from './theory/harmonicField'
import { parseNote, pcOf, midiToFreq } from './theory/notes'
import { chordPcs, type ChordQuality } from './theory/chords'

/* Compasso — a página é uma partitura.
   Seções são compassos numerados, divisores são barras de compasso,
   rótulos são indicações de andamento. O scroll é o playhead. */

// Som provisório (Fase 2 traz samples reais)
let synth: Tone.PolySynth | null = null
async function playChord(rootPc: number, quality: ChordQuality) {
  await ensureAudio()
  synth ??= new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.25, sustain: 0.15, release: 0.9 },
    volume: -10,
  }).toDestination()
  const pcs = chordPcs(rootPc as never, quality)
  let prev = 48 + pcs[0]
  const midis = pcs.map((pc, i) => {
    if (i === 0) return prev
    let m = prev - (prev % 12) + pc
    if (m <= prev) m += 12
    prev = m
    return m
  })
  synth.triggerAttackRelease(midis.map(midiToFreq), 0.6)
}

/* ---------- peças da partitura ---------- */

function Barline({ measure, label, tempo }: { measure: number; label: string; tempo?: string }) {
  return (
    <div className="barline px-5 py-10 md:px-10">
      <span className="measure-no">{measure}</span>
      <span className="type-label text-ink-muted">{label}</span>
      {tempo && <span className="type-label ml-auto hidden text-ink-muted md:inline">{tempo}</span>}
    </div>
  )
}

const NOTE_STRIP = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si']

function Marquee() {
  const cycle = [...NOTE_STRIP, ...NOTE_STRIP]
  return (
    <div className="overflow-hidden border-y border-line py-5" aria-hidden>
      <div className="marquee-track">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-baseline">
            {cycle.map((n, i) => (
              <span key={i} className="flex items-baseline">
                <span className="type-display px-6 text-4xl text-ink-2 md:text-5xl">{n}</span>
                <span className="font-mono text-brass">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ┃2┃ As três dores — por que o Compasso existe.
   Cada dor na voz de quem aprende (Fraunces, grande), cada resposta
   como o site respondendo (corpo, com latão). Baseado em pesquisa real:
   falta de ordem, teoria longe do instrumento, sobrecarga que desanima. */
const DORES = [
  {
    marca: 'A',
    dor: '“Eu quero aprender, mas não sei por onde começar.”',
    resposta:
      'Informação é o que não falta — ordem é o que falta. O Compasso é um caminho com sequência: você sempre sabe qual é o próximo passo.',
  },
  {
    marca: 'B',
    dor: '“Estudei a apostila, mas na hora de tocar não muda nada.”',
    resposta:
      'Teoria longe do instrumento não gruda. Aqui, cada conceito soa e se toca na hora — você aprende com os dedos, não só com os olhos.',
  },
  {
    marca: 'C',
    dor: '“É coisa demais. Eu desanimo antes de chegar em algum lugar.”',
    resposta:
      'Um passo de cada vez, no seu andamento. Vitórias pequenas e visíveis todo dia — porque é isso que faz alguém continuar, não talento.',
  },
]

function Dor({ marca, dor, resposta, invert }: (typeof DORES)[0] & { invert: boolean }) {
  const ref = useRef<HTMLParagraphElement | null>(null)
  useLineReveal(ref)
  return (
    <div className={`py-14 md:w-[72%] md:py-20 ${invert ? 'md:ml-auto' : ''}`}>
      <div className="mb-5 flex items-center gap-4">
        <span className="flex h-8 w-8 items-center justify-center border border-line font-mono text-sm text-ink-muted">
          {marca}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <p ref={ref} className="type-display text-3xl leading-tight text-ink md:text-5xl">
        {dor}
      </p>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
        {resposta.split('. ').map((s, i, arr) => (
          <span key={i}>
            {i === arr.length - 1 ? (
              <span className="text-brass">{s}</span>
            ) : (
              s + '. '
            )}
          </span>
        ))}
      </p>
    </div>
  )
}

function Manifesto() {
  return (
    <section
      className="staff-lines px-5 py-16 md:px-10 md:py-24"
      style={{ backgroundPosition: '0 3rem' }}
    >
      <p className="type-label mb-4 text-ink-muted">
        três coisas fazem todo mundo desistir — o compasso existe contra as três
      </p>
      {DORES.map((d, i) => (
        <Dor key={d.marca} {...d} invert={i % 2 === 1} />
      ))}
    </section>
  )
}

/* ┃3┃ O campo harmônico como UM COMPASSO DE VERDADE:
   sete tempos entre barras de compasso. Nada de caixinhas. */
function FieldMeasure() {
  const field = useMemo(() => harmonicField(parseNote('C'), 'maior'), [])
  const [playing, setPlaying] = useState<number | null>(null)
  const headRef = useRef<HTMLHeadingElement | null>(null)
  useLineReveal(headRef)

  return (
    <section className="bg-[#161310] py-24 md:py-36">
      <div className="px-5 md:px-10">
        <div className="mb-6 md:mb-8">
          <span className="type-label text-[#6e655c]">prova, não promessa — toca aí embaixo</span>
        </div>
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6 md:mb-24">
          <div className="max-w-2xl">
            <h2
              ref={headRef}
              className="type-display text-4xl leading-tight text-[#f2ede6] md:text-6xl"
            >
              Dentro de Dó maior moram sete&nbsp;acordes
            </h2>
            <p className="mt-6 max-w-xl text-lg text-[#a69c90]">
              É a família de onde saem as músicas que você conhece. Clica em qualquer grau — isso é
              o que o Compasso quer dizer com <span className="text-[#e0a34a]">tocar a teoria</span>.
            </p>
          </div>
          <span className="type-label text-[#6e655c]">campo harmônico · ♩ = 92</span>
        </div>

        {/* o compasso: barra pesada abre, sete tempos, barra pesada fecha */}
        <div className="flex items-stretch overflow-x-auto">
          <span className="w-[3px] shrink-0 bg-[#a69c90]" />
          <span className="ml-[3px] w-px shrink-0 bg-[#a69c90]/60" />
          {field.map((d, i) => (
            <button
              key={d.degree}
              onClick={() => {
                void playChord(pcOf(d.root), d.quality)
                setPlaying(d.degree)
              }}
              className={`group relative min-w-20 flex-1 px-2 py-10 text-center transition-colors duration-300 md:py-14 ${
                playing === d.degree ? 'bg-[#e0a34a]/10' : 'hover:bg-[#f2ede6]/[0.03]'
              } ${i > 0 ? 'border-l border-[#332d27]' : ''}`}
            >
              <span
                className={`type-display block text-3xl transition-colors md:text-5xl ${
                  playing === d.degree
                    ? 'text-[#e0a34a]'
                    : d.degree === 1
                      ? 'text-[#f2ede6]'
                      : 'text-[#a69c90] group-hover:text-[#f2ede6]'
                }`}
              >
                {d.roman}
              </span>
              <span className="mt-3 block font-mono text-xs text-[#6e655c] group-hover:text-[#a69c90] md:text-sm">
                {d.symbol}
              </span>
            </button>
          ))}
          <span className="mr-[3px] w-px shrink-0 bg-[#a69c90]/60" />
          <span className="w-[3px] shrink-0 bg-[#a69c90]" />
        </div>

        <p className="type-label mt-10 text-[#6e655c]">
          {playing
            ? `você tocou o grau ${field[playing - 1].roman} (${field[playing - 1].symbol}) — junta ele com o V e o vi e você já toca metade do pop`
            : 'sem cadastro, sem aula em vídeo, sem pdf. o instrumento é a página.'}
        </p>
      </div>
    </section>
  )
}

/* ┃4┃ O programa do concerto: o que vem — cada peça responde uma dor */
const PROGRAM = [
  {
    n: '01',
    title: 'O braço',
    desc: 'a guitarra e o baixo na tela: toca a casa, ouve a nota, vê a escala acender',
    tempo: 'em ensaio',
  },
  {
    n: '02',
    title: 'Groove machine',
    desc: 'monta a levada e a partitura se escreve sozinha — leitura de ritmo sem sentir',
    tempo: 'em ensaio',
  },
  {
    n: '03',
    title: 'Desmontador',
    desc: 'abre uma música que você ama e vê a teoria trabalhando por dentro dela',
    tempo: 'em ensaio',
  },
  {
    n: '04',
    title: 'Ouvido',
    desc: 'treina reconhecer nota e intervalo de ouvido — o superpoder de todo músico',
    tempo: 'em ensaio',
  },
]

function Program() {
  return (
    <section className="px-5 py-24 md:px-10 md:py-32">
      <div className="mb-6 md:ml-[22%]">
        <span className="type-label text-ink-muted">programa · construído em público</span>
      </div>
      <div className="mb-14 md:ml-[22%]">
        <p className="max-w-lg text-lg text-ink-2">
          O Compasso está sendo montado peça por peça, como um show sendo ensaiado. Isso aqui é o
          que sobe ao palco em seguida:
        </p>
      </div>
      <div>
        {PROGRAM.map((item) => (
          <div
            key={item.n}
            className="group flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-line py-7 transition-colors last:border-b hover:bg-raised md:gap-x-12"
          >
            <span className="font-mono text-sm text-ink-muted">{item.n}</span>
            <h3 className="type-display text-3xl text-ink transition-transform duration-300 group-hover:translate-x-2 md:text-5xl">
              {item.title}
            </h3>
            <p className="text-ink-2 md:ml-auto md:max-w-xs md:text-right">{item.desc}</p>
            <span className="type-label w-full text-right text-brass md:w-auto">{item.tempo}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* Rodapé: ritornello — volta do começo, como toda música */
function Footer({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <footer className="flex min-h-[70vh] flex-col justify-between overflow-hidden bg-[#12100e] px-5 pt-24 md:px-10">
      <div className="flex items-baseline justify-between">
        <span className="type-label text-[#6e655c]">‖: volta amanhã — sempre tem um próximo passo :‖</span>
        <button
          onClick={onToggle}
          className="type-label text-[#a69c90] transition-colors hover:text-[#e0a34a]"
        >
          tema · {theme === 'dark' ? 'escuro' : 'claro'}
        </button>
      </div>

      <div className="pb-6">
        <div
          className="type-display whitespace-nowrap text-[#f2ede6]"
          style={{
            fontSize: 'clamp(4rem, 19vw, 20rem)',
            lineHeight: 0.85,
            marginLeft: '-0.04em',
          }}
        >
          Compasso
        </div>
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-[#332d27] pt-5">
          <span className="type-label text-[#6e655c]">
            teoria musical · feito à mão · sem pressa
          </span>
          <span className="font-mono text-xs text-[#6e655c]">♩ = você que dita</span>
        </div>
      </div>
    </footer>
  )
}

function App() {
  useLenisGsap()
  const [theme, setThemeState] = useState<Theme>(getTheme)
  const [, setReady] = useState(false)

  // primeiro gesto destrava o áudio; o favicon pulsa no andamento
  useEffect(() => {
    const detachUnlock = attachGlobalUnlock()
    const stopFavicon = startFaviconMetronome()
    return () => {
      detachUnlock()
      stopFavicon()
    }
  }, [])

  return (
    <div className="min-h-screen bg-base text-ink">
      <Preloader onDone={() => setReady(true)} />
      <Hero />
      <Barline measure={2} label="as três dores" tempo="andante" />
      <Manifesto />
      <Marquee />
      <Barline measure={3} label="prova: toca a teoria" tempo="moderato" />
      <FieldMeasure />
      <Barline measure={4} label="o que vem" tempo="allegro" />
      <Program />
      <Footer theme={theme} onToggle={() => setThemeState(toggleTheme())} />
    </div>
  )
}

export default App

import { useMemo, useRef, useState } from 'react'
import { Hero } from './app/Hero'
import { Preloader } from './app/Preloader'
import { getTheme, toggleTheme, type Theme } from './design/theme'
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

/* ┃2┃ O manifesto — tipografia enorme revelada linha a linha */
function Manifesto() {
  const ref = useRef<HTMLParagraphElement | null>(null)
  useLineReveal(ref)
  return (
    <section className="staff-lines px-5 py-24 md:px-10 md:py-36" style={{ backgroundPosition: '0 3rem' }}>
      <div className="md:ml-[22%] md:max-w-3xl">
        <p ref={ref} className="type-display text-3xl leading-tight md:text-5xl">
          A teoria está espalhada por mil vídeos e apostilas. Aqui ela mora num lugar só — e em vez
          de ler sobre música, você toca nela.
        </p>
        <p className="type-label mt-10 text-ink-muted">
          feito por um baterista aprendendo cordas — pra quem está no primeiro mês e não sabe o que
          praticar hoje
        </p>
      </div>
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
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6 md:mb-24">
          <h2
            ref={headRef}
            className="type-display max-w-xl text-4xl leading-tight text-[#f2ede6] md:text-6xl"
          >
            Um compasso de Dó&nbsp;maior
          </h2>
          <span className="type-label text-[#6e655c]">toca aí · sete graus · ♩ = 92</span>
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
            ? `grau ${field[playing - 1].roman} · ${field[playing - 1].symbol} — a mesma família de acordes de metade das músicas que você conhece`
            : 'cada tonalidade carrega sete acordes de família. clica num grau pra ouvir.'}
        </p>
      </div>
    </section>
  )
}

/* ┃4┃ O programa do concerto: o que vem */
const PROGRAM = [
  { n: '01', title: 'O braço', desc: 'guitarra e baixo interativos, corda que vibra', tempo: 'em ensaio' },
  { n: '02', title: 'Groove machine', desc: 'monte levadas, leia ritmo sem perceber', tempo: 'em ensaio' },
  { n: '03', title: 'Desmontador', desc: 'a teoria por dentro das músicas que você ama', tempo: 'em ensaio' },
  { n: '04', title: 'Ouvido', desc: 'reconheça notas e intervalos de verdade', tempo: 'em ensaio' },
]

function Program() {
  return (
    <section className="px-5 py-24 md:px-10 md:py-32">
      <div className="mb-14 md:ml-[22%]">
        <span className="type-label text-ink-muted">programa</span>
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
        <span className="type-label text-[#6e655c]">‖: do início :‖</span>
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

  return (
    <div className="min-h-screen bg-base text-ink">
      <Preloader onDone={() => setReady(true)} />
      <Hero />
      <Barline measure={2} label="por que existe" tempo="andante" />
      <Manifesto />
      <Marquee />
      <Barline measure={3} label="um gosto do instrumento" tempo="moderato · toca" />
      <FieldMeasure />
      <Barline measure={4} label="programa" tempo="allegro · em breve" />
      <Program />
      <Footer theme={theme} onToggle={() => setThemeState(toggleTheme())} />
    </div>
  )
}

export default App

import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Hero } from './Hero'
import { Preloader } from './Preloader'
import { getTheme, toggleTheme, type Theme } from '../design/theme'
import { useLineReveal } from '../motion/useLineReveal'
import { ensureAudio } from '../audio/engine'
import { getInstrument } from '../audio/instruments'
import { harmonicField } from '../theory/harmonicField'
import { parseNote, pcOf, midiToName } from '../theory/notes'
import { chordPcs, type ChordQuality } from '../theory/chords'

/* Compasso — a página é uma partitura.
   Seções são compassos numerados, divisores são barras de compasso.
   O scroll é o playhead. */

// Acorde dedilhado na guitarra REAL (samples), com leve stagger de palhetada
async function playChord(rootPc: number, quality: ChordQuality) {
  await ensureAudio()
  const guitar = await getInstrument('guitarra')
  const pcs = chordPcs(rootPc as never, quality)
  let prev = 48 + pcs[0]
  const midis = pcs.map((pc, i) => {
    if (i === 0) return prev
    let m = prev - (prev % 12) + pc
    if (m <= prev) m += 12
    prev = m
    return m
  })
  midis.forEach((m, i) => {
    guitar.triggerAttackRelease(midiToName(m), 1.6, `+${i * 0.045}`, 0.85)
  })
}

/* ---------- peças da partitura ---------- */

/* Divisor de seção. Sem andamento em italiano: jargão decorativo contradiz
   a própria tese do site (dor C). A metáfora só aparece onde significa algo. */
function Barline({ measure, label }: { measure: number; label: string }) {
  return (
    <div className="barline px-5 py-10 md:px-10">
      <span className="measure-no">{measure}</span>
      <span className="type-label whitespace-nowrap text-ink-muted">{label}</span>
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
          <span className="type-label text-[#6e655c]">o nome disso é campo harmônico</span>
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

/* ┃4┃ O que vem — uma metáfora só, dita uma vez, e a lista limpa */
const PROGRAM: Array<{ n: string; title: string; desc: string; to?: string }> = [
  {
    n: '01',
    title: 'O braço',
    desc: 'a guitarra e o baixo na tela: toca a casa, ouve a nota, vê a escala acender',
    to: '/braco',
  },
  {
    n: '02',
    title: 'Groove machine',
    desc: 'monta a levada e a partitura se escreve sozinha — leitura de ritmo sem sentir',
    to: '/groove',
  },
  {
    n: '03',
    title: 'Desmontador',
    desc: 'abre uma música que você ama e vê a teoria trabalhando por dentro dela',
  },
  {
    n: '04',
    title: 'Ouvido',
    desc: 'treina reconhecer nota e intervalo de ouvido — o superpoder de todo músico',
  },
]

function Program() {
  const headRef = useRef<HTMLHeadingElement | null>(null)
  useLineReveal(headRef)
  return (
    <section className="px-5 py-24 md:px-10 md:py-32">
      <div className="mb-16 md:mb-20 md:ml-[22%] md:max-w-2xl">
        <h2 ref={headRef} className="type-display text-4xl leading-tight md:text-6xl">
          Quatro ferramentas em construção
        </h2>
        <p className="mt-6 max-w-xl text-lg text-ink-2">
          O Compasso está sendo feito peça por peça, e em público. Nada aqui é promessa vaga — é o
          que já está desenhado, na ordem em que fica pronto.
        </p>
      </div>
      <div>
        {PROGRAM.map((item) => {
          const row = (
            <>
              <span className="font-mono text-sm text-ink-muted">{item.n}</span>
              <h3 className="type-display text-3xl text-ink transition-transform duration-300 group-hover:translate-x-1 md:text-4xl">
                {item.title}
                {item.to && <span className="ml-4 text-brass">→</span>}
              </h3>
              <p className="col-start-2 max-w-md text-ink-2 md:col-start-3">
                {item.desc}
                {!item.to && (
                  <span className="type-label mt-1 block text-ink-muted">em construção</span>
                )}
              </p>
            </>
          )
          const rowClass =
            'group grid grid-cols-[2rem_1fr] items-baseline gap-x-4 gap-y-3 border-t border-line py-8 transition-colors last:border-b hover:bg-raised md:grid-cols-[3rem_16rem_1fr] md:gap-x-10 md:py-10'
          return item.to ? (
            <Link key={item.n} to={item.to} className={rowClass}>
              {row}
            </Link>
          ) : (
            <div key={item.n} className={rowClass}>
              {row}
            </div>
          )
        })}
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

export function HomePage() {
  const [theme, setThemeState] = useState<Theme>(getTheme)
  const [, setReady] = useState(false)

  return (
    <div className="min-h-screen bg-base text-ink">
      <Preloader onDone={() => setReady(true)} />
      <Hero />
      <Barline measure={2} label="por que este site existe" />
      <Manifesto />
      <Marquee />
      <Barline measure={3} label="veja funcionando agora" />
      <FieldMeasure />
      <Barline measure={4} label="o que vem por aí" />
      <Program />
      <Footer theme={theme} onToggle={() => setThemeState(toggleTheme())} />
    </div>
  )
}

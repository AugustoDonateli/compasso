import { useMemo, useState } from 'react'
import { Hero } from './app/Hero'
import { getTheme, toggleTheme, type Theme } from './design/theme'
import { useLenisGsap } from './motion/useLenisGsap'
import { ensureAudio, Tone } from './audio/engine'
import { harmonicField } from './theory/harmonicField'
import { parseNote, noteSolfejo, noteId, pcOf, midiToFreq } from './theory/notes'
import { spellScale } from './theory/scales'
import { chordPcs, type ChordQuality } from './theory/chords'

/* Fase 0: página de amostra do sistema de design.
   Não é o site — é a prova de que a fundação (tokens, temas, fontes,
   theory/, audio/, motion/) funciona de ponta a ponta. */

// Som provisório de fundação (Fase 2 traz os samples reais — Salamander etc.)
let synth: Tone.PolySynth | null = null
async function playChord(rootPc: number, quality: ChordQuality) {
  await ensureAudio()
  synth ??= new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.25, sustain: 0.15, release: 0.9 },
    volume: -10,
  }).toDestination()
  // empilha o acorde a partir da 3ª oitava, sempre subindo, pra soar como acorde e não cluster
  const pcs = chordPcs(rootPc as never, quality)
  let prev = 48 + pcs[0] // C3 + fundamental
  const midis = pcs.map((pc, i) => {
    if (i === 0) return prev
    let m = prev - (prev % 12) + pc
    if (m <= prev) m += 12
    prev = m
    return m
  })
  synth.triggerAttackRelease(midis.map(midiToFreq), 0.6)
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="type-label border border-line px-3 py-2 text-ink-2 transition-colors hover:border-brass hover:text-brass"
    >
      tema: {theme === 'dark' ? 'escuro' : 'claro'}
    </button>
  )
}

function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex items-center gap-3 border border-line p-2">
      <span
        className="block h-8 w-8 shrink-0 border border-line"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <span className="font-mono text-xs text-ink">{name}</span>
    </div>
  )
}

/** Codificação por intensidade — a régua oficial do Compasso pra notas */
const ROLE_STYLE: Record<string, string> = {
  tonica: 'bg-panel-brass text-[#12100e] font-bold',
  acorde: 'bg-panel-brass/60 text-[#12100e]',
  escala: 'bg-panel-brass/25 text-panel-ink',
  fora: 'bg-transparent text-panel-ink-2/50',
}

function App() {
  useLenisGsap()
  const [theme, setThemeState] = useState<Theme>(getTheme)
  const field = useMemo(() => harmonicField(parseNote('C'), 'maior'), [])
  const cMajor = useMemo(() => spellScale(parseNote('C'), 'maior'), [])
  const [lastPlayed, setLastPlayed] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-base text-ink">
      <Hero />

      {/* Cabeçalho — assimétrico de propósito */}
      <header className="flex items-end justify-between border-b border-line px-6 pb-4 pt-8 md:px-12">
        <div>
          <div className="type-label mb-2 text-ink-muted">sistema de design · fundação</div>
          <h2 className="type-display text-4xl md:text-6xl">O sistema</h2>
        </div>
        <ThemeToggle theme={theme} onToggle={() => setThemeState(toggleTheme())} />
      </header>

      <main className="px-6 py-10 md:px-12">
        {/* Grid assimétrico: 2/3 + 1/3 */}
        <div className="grid gap-10 md:grid-cols-3">
          {/* Tipografia */}
          <section className="md:col-span-2">
            <h2 className="type-label mb-4 text-ink-muted">tipografia</h2>
            <p className="type-display text-2xl leading-snug md:text-4xl">
              Teoria que vira som, som que vira gesto.
            </p>
            <p className="mt-4 max-w-prose text-ink-2">
              Fraunces no display, com os eixos expressivos ligados. Space Grotesk no corpo do
              texto — nada de Inter. E números e notas em Space Mono, como serigrafia de
              equipamento:{' '}
              <span className="font-mono text-brass">{cMajor.map(noteSolfejo).join(' · ')}</span>
            </p>
          </section>

          {/* Paleta */}
          <section>
            <h2 className="type-label mb-4 text-ink-muted">paleta</h2>
            <div className="grid grid-cols-2 gap-2">
              <Swatch name="base" cssVar="--bg-base" />
              <Swatch name="raised" cssVar="--bg-raised" />
              <Swatch name="latão" cssVar="--accent" />
              <Swatch name="hairline" cssVar="--border" />
              <Swatch name="ok · sálvia" cssVar="--ok" />
              <Swatch name="erro · terracota" cssVar="--err" />
            </div>
          </section>
        </div>

        {/* Painel-hardware: escuro nos DOIS temas, é seu próprio palco */}
        <section className="mt-14">
          <h2 className="type-label mb-4 text-ink-muted">
            painel-hardware · campo harmônico de dó maior · clique pra ouvir
          </h2>
          <div className="border border-panel-line bg-panel p-5 md:p-8">
            <div className="mb-5 flex items-baseline justify-between">
              <span className="font-mono text-sm text-panel-brass">CAMPO HARMÔNICO</span>
              <span className="type-label text-panel-ink-2">
                {lastPlayed ? `tocando: ${lastPlayed}` : 'dó maior · tríades'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 md:grid-cols-7">
              {field.map((d) => (
                <button
                  key={d.degree}
                  onClick={() => {
                    playChord(pcOf(d.root), d.quality)
                    setLastPlayed(`${d.symbol} · ${noteId(d.root)}`)
                  }}
                  className={`group flex min-h-14 flex-col items-center justify-center gap-1 border border-panel-line px-2 py-3 transition-colors hover:border-panel-brass ${
                    d.degree === 1 ? 'bg-panel-brass/15' : ''
                  }`}
                >
                  <span className="font-mono text-xs text-panel-ink-2 group-hover:text-panel-brass">
                    {d.roman}
                  </span>
                  <span className="text-lg font-medium text-panel-ink">{d.symbol}</span>
                </button>
              ))}
            </div>

            {/* Codificação por intensidade */}
            <div className="mt-6 border-t border-panel-line pt-5">
              <div className="type-label mb-3 text-panel-ink-2">
                codificação por intensidade — nunca arco-íris
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['tonica', 'tônica'],
                    ['acorde', 'nota do acorde'],
                    ['escala', 'nota da escala'],
                    ['fora', 'fora da escala'],
                  ] as const
                ).map(([role, label]) => (
                  <span
                    key={role}
                    className={`border border-panel-line px-3 py-1.5 font-mono text-xs ${ROLE_STYLE[role]}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sinais funcionais */}
        <section className="mt-14 grid gap-4 md:grid-cols-2">
          <div className="border-l-2 border-ok bg-raised p-4">
            <span className="type-label text-ok">acerto</span>
            <p className="mt-1 text-sm text-ink-2">
              Sálvia dessaturada — feedback sem gritar. Nada de verde-neon.
            </p>
          </div>
          <div className="border-l-2 border-err bg-raised p-4">
            <span className="type-label text-err">erro</span>
            <p className="mt-1 text-sm text-ink-2">
              Terracota, da mesma família quente do latão. Nada de vermelho puro.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-6 py-6 md:px-12">
        <span className="type-label text-ink-muted">
          compasso · fundação verificada · fase 1 a caminho
        </span>
      </footer>
    </div>
  )
}

export default App

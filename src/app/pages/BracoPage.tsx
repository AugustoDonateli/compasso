import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Fretboard } from '../../tools/fretboard/Fretboard'
import { useAcheANota } from '../../tools/fretboard/AcheANota'
import { TUNINGS, type InstrumentId } from '../../theory/fretboard'
import { SCALES, scalePcs, type ScaleId } from '../../theory/scales'
import { chordPcs, type ChordQuality, CHORDS, type NoteRole } from '../../theory/chords'
import { spellPc, noteSolfejo, type PitchClass } from '../../theory/notes'
import { playMidi, preloadInstrument } from '../../audio/instruments'

/* ┃ferramenta 01┃ O braço.
   Página-molde das ferramentas: ambientação escura de hardware,
   controles com cara de equipamento, o instrumento no centro. */

type Mode = 'explorar' | 'escala' | 'acorde' | 'jogo'

const TONICS: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const CHORD_CHOICES: ChordQuality[] = ['maior', 'menor', 'dominante7', 'maior7', 'menor7']

function ControlButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`type-label border px-3 py-2 transition-colors ${
        active
          ? 'border-[#e0a34a] bg-[#e0a34a]/10 text-[#e0a34a]'
          : 'border-[#332d27] text-[#a69c90] hover:border-[#a69c90]'
      }`}
    >
      {children}
    </button>
  )
}

export function BracoPage() {
  const [instrument, setInstrument] = useState<InstrumentId>('guitarra')
  const [mode, setMode] = useState<Mode>('explorar')
  const [tonic, setTonic] = useState<PitchClass>(0)
  const [scaleId, setScaleId] = useState<ScaleId>('pentatonica-menor')
  const [chordQ, setChordQ] = useState<ChordQuality>('maior')
  const [lastNote, setLastNote] = useState<string | null>(null)

  const tuning = TUNINGS[instrument]
  const game = useAcheANota(mode === 'jogo')

  useEffect(() => {
    preloadInstrument(instrument === 'violao' ? 'guitarra' : instrument)
    window.scrollTo(0, 0)
  }, [instrument])

  const roleOf = useMemo(() => {
    if (mode === 'escala') {
      const pcs = scalePcs(tonic, scaleId)
      return (pc: PitchClass): NoteRole | null =>
        pc === tonic ? 'tonica' : pcs.includes(pc) ? 'escala' : 'fora'
    }
    if (mode === 'acorde') {
      const pcs = chordPcs(tonic, chordQ)
      return (pc: PitchClass): NoteRole | null =>
        pc === tonic ? 'tonica' : pcs.includes(pc) ? 'acorde' : 'fora'
    }
    return undefined
  }, [mode, tonic, scaleId, chordQ])

  const onPlay = (_s: number, _f: number, midi: number) => {
    void playMidi(instrument === 'violao' ? 'guitarra' : instrument, midi)
    setLastNote(noteSolfejo(spellPc((((midi % 12) + 12) % 12) as PitchClass)))
    if (mode === 'jogo') game.answer(midi)
  }

  return (
    <div className="min-h-screen bg-[#171310] text-[#f2ede6]">
      {/* cabeçalho da ferramenta */}
      <header className="flex items-center justify-between px-5 pb-6 pt-6 md:px-10">
        <Link
          to="/"
          className="type-label text-[#a69c90] transition-colors hover:text-[#e0a34a]"
        >
          ← compasso
        </Link>
        <span className="type-label text-[#6e655c]">ferramenta 01</span>
      </header>

      <main className="px-5 pb-24 md:px-10">
        <div className="mb-10 max-w-2xl md:mb-14">
          <h1 className="type-display text-5xl md:text-7xl">O braço</h1>
          <p className="mt-4 max-w-xl text-lg text-[#a69c90]">
            {mode === 'jogo' ? (
              <>
                Ache <span className="text-[#e0a34a]">{game.challenge.label}</span> em qualquer
                corda.
              </>
            ) : (
              <>Toca qualquer casa — soa a nota de verdade, gravada de uma guitarra de verdade.</>
            )}
          </p>
        </div>

        {/* painel de controles, cara de equipamento */}
        <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-[#332d27] py-4">
          <div className="flex items-center gap-2">
            <span className="type-label mr-1 text-[#6e655c]">instrumento</span>
            <ControlButton active={instrument === 'guitarra'} onClick={() => setInstrument('guitarra')}>
              guitarra
            </ControlButton>
            <ControlButton active={instrument === 'baixo'} onClick={() => setInstrument('baixo')}>
              baixo
            </ControlButton>
          </div>

          <div className="flex items-center gap-2">
            <span className="type-label mr-1 text-[#6e655c]">modo</span>
            {(['explorar', 'escala', 'acorde', 'jogo'] as Mode[]).map((m) => (
              <ControlButton key={m} active={mode === m} onClick={() => setMode(m)}>
                {m === 'jogo' ? 'ache a nota' : m}
              </ControlButton>
            ))}
          </div>
        </div>

        {/* controles contextuais */}
        {(mode === 'escala' || mode === 'acorde') && (
          <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="type-label mr-2 text-[#6e655c]">tônica</span>
              {TONICS.map((pc) => (
                <ControlButton key={pc} active={tonic === pc} onClick={() => setTonic(pc)}>
                  {noteSolfejo(spellPc(pc))}
                </ControlButton>
              ))}
            </div>
            {mode === 'escala' ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="type-label mr-2 text-[#6e655c]">escala</span>
                {(Object.keys(SCALES) as ScaleId[]).map((id) => (
                  <ControlButton key={id} active={scaleId === id} onClick={() => setScaleId(id)}>
                    {SCALES[id].name}
                  </ControlButton>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="type-label mr-2 text-[#6e655c]">acorde</span>
                {CHORD_CHOICES.map((q) => (
                  <ControlButton key={q} active={chordQ === q} onClick={() => setChordQ(q)}>
                    {CHORDS[q].name}
                  </ControlButton>
                ))}
              </div>
            )}
          </div>
        )}

        {/* o instrumento */}
        <div
          className={`border p-3 transition-colors duration-500 md:p-6 ${
            game.feedback === 'acerto'
              ? 'border-[#6e8f5a] bg-[#6e8f5a]/5'
              : game.feedback === 'erro'
                ? 'border-[#b2543c] bg-[#b2543c]/5'
                : 'border-[#332d27] bg-[#221e1a]'
          }`}
        >
          <Fretboard
            tuning={tuning}
            roleOf={roleOf}
            onPlay={onPlay}
            labelAll={mode === 'explorar'}
          />
        </div>

        {/* linha de status */}
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
          <span className="type-label text-[#6e655c]">
            {mode === 'jogo'
              ? `${game.score.acertos}/${game.score.tentativas} · +${game.score.xp} xp`
              : lastNote
                ? `você tocou: ${lastNote}`
                : 'no celular, arrasta pro lado pra ver o braço inteiro'}
          </span>
          {(mode === 'escala' || mode === 'acorde') && (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[#e0a34a]" />
                <span className="type-label text-[#a69c90]">tônica</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[#e0a34a]/40" />
                <span className="type-label text-[#a69c90]">
                  {mode === 'escala' ? 'nota da escala' : 'nota do acorde'}
                </span>
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

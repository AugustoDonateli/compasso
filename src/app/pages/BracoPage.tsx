import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Fretboard } from '../../tools/fretboard/Fretboard'
import { useAcheANota } from '../../tools/fretboard/AcheANota'
import { TUNINGS, midiAt, positionsOf, type InstrumentId } from '../../theory/fretboard'
import { SCALES, scalePcs, type ScaleId } from '../../theory/scales'
import { chordPcs, type ChordQuality, CHORDS, type NoteRole } from '../../theory/chords'
import { midiToPc, noteId, noteSolfejo, spellPc, type PitchClass } from '../../theory/notes'
import { playMidi, preloadInstrument } from '../../audio/instruments'

/* ┃ferramenta 01┃ Mapa das notas.
   Regra desta página: NADA de parede de informação. O braço começa limpo,
   você descobre tocando, e cada modo se explica em uma linha de português. */

type Mode = 'descobrir' | 'escala' | 'acorde' | 'jogo'

const MODE_LABEL: Record<Mode, string> = {
  descobrir: 'descobrir',
  escala: 'ver uma escala',
  acorde: 'ver um acorde',
  jogo: 'jogo: ache a nota',
}

const MODE_HELP: Record<Mode, string> = {
  descobrir:
    'Toca em qualquer lugar do braço: você ouve a nota de verdade e o nome dela aparece. É assim que se decora o braço — tocando, não estudando tabela.',
  escala:
    'Escala é um conjunto de notas que combinam entre si. Escolhe uma nota-base e veja onde ela mora no braço: aceso forte é a nota-base, aceso fraco são as outras notas da escala.',
  acorde:
    'Acorde é um punhado de notas tocadas juntas. Aqui você vê onde estão as notas que formam esse acorde — todas as posições possíveis, não só o desenho decorado.',
  jogo: 'Ache a nota pedida em qualquer corda. Acertou fica verde, errou fica vermelho — e você ganha XP.',
}

const TONICS: PitchClass[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const CHORD_CHOICES: ChordQuality[] = ['maior', 'menor', 'dominante7', 'maior7', 'menor7']

function Chip({
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

/** A trilha abre a ferramenta pronta via link: /braco?modo=escala&tonica=7.
 *  Parâmetro inválido é simplesmente ignorado — link velho nunca quebra a página. */
const MODES: Mode[] = ['descobrir', 'escala', 'acorde', 'jogo']

export function BracoPage() {
  const [params] = useSearchParams()
  const paramMode = MODES.find((m) => m === params.get('modo'))
  const paramTonic = Number(params.get('tonica'))
  const paramScale = (Object.keys(SCALES) as ScaleId[]).find((s) => s === params.get('escala'))
  const paramInstrument = (['guitarra', 'baixo'] as InstrumentId[]).find(
    (i) => i === params.get('instrumento'),
  )

  const [instrument, setInstrument] = useState<InstrumentId>(paramInstrument ?? 'guitarra')
  const [mode, setMode] = useState<Mode>(paramMode ?? 'descobrir')
  const [tonic, setTonic] = useState<PitchClass>(
    Number.isInteger(paramTonic) && paramTonic >= 0 && paramTonic <= 11
      ? (paramTonic as PitchClass)
      : 9, // Lá: a pentatônica de Lá é a 1ª que todo mundo aprende
  )
  const [scaleId, setScaleId] = useState<ScaleId>(paramScale ?? 'pentatonica-menor')
  const [chordQ, setChordQ] = useState<ChordQuality>(
    CHORD_CHOICES.find((c) => c === params.get('acorde')) ?? 'maior',
  )
  const [showAllNames, setShowAllNames] = useState(false)
  const [tapped, setTapped] = useState<{ string: number; fret: number } | null>(null)
  const [readout, setReadout] = useState<string | null>(null)

  const soundId = instrument === 'violao' ? 'guitarra' : instrument
  const tuning = TUNINGS[instrument]
  const game = useAcheANota(mode === 'jogo')

  useEffect(() => {
    preloadInstrument(soundId)
  }, [soundId])

  useEffect(() => {
    setTapped(null)
    setReadout(null)
  }, [mode, instrument])

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

  const onPlay = (stringIndex: number, fret: number, midi: number) => {
    void playMidi(soundId, midi)
    setTapped({ string: stringIndex, fret })
    const pc = midiToPc(midi)
    const spelled = spellPc(pc)
    setReadout(`${noteSolfejo(spelled)} · ${noteId(spelled)}`)
    if (mode === 'jogo') game.answer(midi)
  }

  /** Ouvir a escala/acorde: é o que faz o conceito "clicar" pra quem começa */
  const listen = useCallback(() => {
    const pcs = mode === 'escala' ? scalePcs(tonic, scaleId) : chordPcs(tonic, chordQ)
    // sobe a partir da posição mais grave possível de cada nota
    const midis = pcs.map((pc, i) => {
      const pos = positionsOf(tuning, pc, 12)[0]
      const base = pos ? midiAt(tuning, pos.string, pos.fret) : 60
      return base + (i === 0 ? 0 : 0)
    })
    midis.sort((a, b) => a - b)
    midis.forEach((m, i) => {
      setTimeout(() => void playMidi(soundId, m, 1.1), i * (mode === 'escala' ? 260 : 60))
    })
  }, [mode, tonic, scaleId, chordQ, tuning, soundId])

  const contextual = mode === 'escala' || mode === 'acorde'

  return (
    <div className="min-h-screen pt-14 bg-[#171310] text-[#f2ede6]">
      <header className="flex items-center justify-between px-5 pb-6 pt-6 md:px-10">
        <span />
        <span className="type-label text-[#6e655c]">ferramenta 01</span>
      </header>

      <main className="px-5 pb-24 md:px-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="type-display text-5xl md:text-7xl">Mapa das notas</h1>
          <p className="mt-4 text-lg text-[#a69c90]">
            Onde cada nota mora na guitarra e no baixo — e como elas soam de verdade.
          </p>
        </div>

        {/* instrumento + modo */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[#332d27] pt-5">
          <div className="flex items-center gap-2">
            <span className="type-label mr-1 text-[#6e655c]">instrumento</span>
            <Chip active={instrument === 'guitarra'} onClick={() => setInstrument('guitarra')}>
              guitarra
            </Chip>
            <Chip active={instrument === 'baixo'} onClick={() => setInstrument('baixo')}>
              baixo
            </Chip>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-label mr-1 text-[#6e655c]">o que fazer</span>
            {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
              <Chip key={m} active={mode === m} onClick={() => setMode(m)}>
                {MODE_LABEL[m]}
              </Chip>
            ))}
          </div>
        </div>

        {/* a linha que explica — sempre presente */}
        <p className="mt-5 max-w-3xl border-l-2 border-[#e0a34a] pl-4 text-[#a69c90]">
          {mode === 'jogo' ? (
            <>
              Ache <span className="text-[#e0a34a]">{game.challenge.label}</span> em qualquer corda.{' '}
              {MODE_HELP.jogo}
            </>
          ) : (
            MODE_HELP[mode]
          )}
        </p>

        {/* controles do modo */}
        {contextual && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="type-label mr-2 w-full text-[#6e655c] md:w-auto">nota-base</span>
              {TONICS.map((pc) => (
                <Chip key={pc} active={tonic === pc} onClick={() => setTonic(pc)}>
                  {noteSolfejo(spellPc(pc))}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="type-label mr-2 w-full text-[#6e655c] md:w-auto">
                {mode === 'escala' ? 'escala' : 'tipo de acorde'}
              </span>
              {mode === 'escala'
                ? (Object.keys(SCALES) as ScaleId[]).map((id) => (
                    <Chip key={id} active={scaleId === id} onClick={() => setScaleId(id)}>
                      {SCALES[id].name}
                    </Chip>
                  ))
                : CHORD_CHOICES.map((q) => (
                    <Chip key={q} active={chordQ === q} onClick={() => setChordQ(q)}>
                      {CHORDS[q].name}
                    </Chip>
                  ))}
              <button
                onClick={listen}
                className="type-label ml-2 border border-[#e0a34a] px-4 py-2 text-[#e0a34a] transition-colors hover:bg-[#e0a34a]/10"
              >
                ▶ ouvir {mode === 'escala' ? 'a escala' : 'o acorde'}
              </button>
            </div>
          </div>
        )}

        {mode === 'descobrir' && (
          <label className="mt-6 flex w-fit cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={showAllNames}
              onChange={(e) => setShowAllNames(e.target.checked)}
              className="h-4 w-4 accent-[#e0a34a]"
            />
            <span className="type-label text-[#a69c90]">
              mostrar as notas naturais no braço (dó, ré, mi…)
            </span>
          </label>
        )}

        {/* o instrumento */}
        <div
          className={`mt-8 border p-3 transition-colors duration-500 md:p-6 ${
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
            tapped={tapped}
            labelMode={mode === 'descobrir' && showAllNames ? 'naturals' : 'none'}
          />
        </div>

        {/* leitura grande do que acabou de soar */}
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            {readout ? (
              <>
                <span className="type-label block text-[#6e655c]">você tocou</span>
                <span className="type-display text-4xl text-[#e0a34a] md:text-5xl">{readout}</span>
              </>
            ) : (
              <span className="type-label text-[#6e655c]">
                toca uma casa pra começar · no celular, arrasta o braço pro lado
              </span>
            )}
          </div>

          {mode === 'jogo' && (
            <span className="type-display text-3xl text-[#a69c90]">
              {game.score.acertos}/{game.score.tentativas}
              <span className="type-label ml-3 text-[#e0a34a]">+{game.score.xp} xp</span>
            </span>
          )}

          {contextual && (
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[#e0a34a]" />
                <span className="type-label text-[#a69c90]">
                  {noteSolfejo(spellPc(tonic))} · nota-base
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-[#e0a34a]/40" />
                <span className="type-label text-[#a69c90]">
                  {mode === 'escala' ? 'resto da escala' : 'resto do acorde'}
                </span>
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

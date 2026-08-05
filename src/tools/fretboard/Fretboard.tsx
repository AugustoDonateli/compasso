import { useCallback, useMemo, useRef } from 'react'
import { gsap } from '../../motion/useLenisGsap'
import { midiToPc, noteId, spellPc, type PitchClass } from '../../theory/notes'
import { midiAt, type Tuning } from '../../theory/fretboard'
import type { NoteRole } from '../../theory/chords'
import { cellCenterX, fretX, isDoubleMarker, MARKER_FRETS, stringWeight } from './math'

/* O braço reutilizável do Compasso.
   Desenhado com a fórmula real das casas — fotorrealismo fica na ambientação
   da página; AQUI mora a honestidade matemática. Puro: recebe afinação,
   função de destaque e callback de toque; não sabe nada de som ou jogo. */

export interface FretboardProps {
  tuning: Tuning
  /** papel de cada nota pro destaque por intensidade (null = sem destaque) */
  roleOf?: (pc: PitchClass, midi: number) => NoteRole | null
  /** toque numa casa: (corda, casa, midi). O pai decide o que soa. */
  onPlay?: (stringIndex: number, fret: number, midi: number) => void
  /** quanto texto mostrar. 'none' deixa o braço limpo — descobre-se tocando. */
  labelMode?: 'none' | 'naturals' | 'all'
  /** última casa tocada, destacada com anel (feedback do gesto) */
  tapped?: { string: number; fret: number } | null
}

// dimensões do desenho (viewBox — escala em qualquer tela)
const W = 1060
const NUT_X = 26
const BOARD_X = NUT_X
const BOARD_W = W - NUT_X - 8
const STRING_PAD = 22

const ROLE_FILL: Record<NoteRole, { fill: string; opacity: number; text: string }> = {
  tonica: { fill: '#e0a34a', opacity: 1, text: '#12100e' },
  acorde: { fill: '#e0a34a', opacity: 0.6, text: '#12100e' },
  escala: { fill: '#e0a34a', opacity: 0.25, text: '#f2ede6' },
  fora: { fill: 'transparent', opacity: 0, text: '#6e655c' },
}

/** notas naturais (sem sustenido/bemol) — o que se aprende primeiro */
const NATURAL_PCS = new Set([0, 2, 4, 5, 7, 9, 11])

export function Fretboard({
  tuning,
  roleOf,
  onPlay,
  labelMode = 'none',
  tapped = null,
}: FretboardProps) {
  const stringCount = tuning.openStrings.length
  const H = STRING_PAD * 2 + (stringCount - 1) * 34
  const frets = tuning.frets
  const stringRefs = useRef<(SVGPathElement | null)[]>([])

  // corda i (0 = grave) desenhada de baixo pra cima, como um braço de verdade
  const stringY = useCallback(
    (i: number) => H - STRING_PAD - (i * (H - STRING_PAD * 2)) / (stringCount - 1),
    [H, stringCount],
  )

  const fretXs = useMemo(
    () => Array.from({ length: frets + 1 }, (_, n) => BOARD_X + fretX(n, frets) * BOARD_W),
    [frets],
  )

  /** vibração: bezier com barriga no ponto da palhetada, amortecida */
  const pluckString = useCallback(
    (i: number, xNorm: number) => {
      const path = stringRefs.current[i]
      if (!path) return
      const y = stringY(i)
      const x0 = BOARD_X
      const x1 = BOARD_X + BOARD_W
      const xp = x0 + Math.max(0.08, Math.min(0.92, xNorm)) * BOARD_W
      const amp0 = 7
      const state = { t: 0 }
      gsap.to(state, {
        t: 1,
        duration: 0.7,
        ease: 'none',
        overwrite: true,
        onUpdate: () => {
          const a = amp0 * (1 - state.t) * Math.sin(state.t * 28)
          path.setAttribute('d', `M ${x0} ${y} Q ${xp} ${y + a} ${x1} ${y}`)
        },
        onComplete: () => path.setAttribute('d', `M ${x0} ${y} L ${x1} ${y}`),
      })
    },
    [stringY],
  )

  const handleTap = useCallback(
    (i: number, fret: number) => {
      const midi = midiAt(tuning, i, fret)
      pluckString(i, cellCenterX(fret, frets))
      onPlay?.(i, fret, midi)
    },
    [tuning, frets, onPlay, pluckString],
  )

  return (
    <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block"
        style={{ minWidth: 900, width: '100%' }}
        role="application"
        aria-label={`Braço de ${tuning.name}`}
      >
        {/* madeira do braço */}
        <rect x={BOARD_X} y={6} width={BOARD_W} height={H - 12} fill="#2a221c" rx={3} />
        {/* sombra sutil pra dar corpo */}
        <rect x={BOARD_X} y={6} width={BOARD_W} height={5} fill="#000" opacity={0.25} rx={3} />

        {/* capotraste */}
        <rect x={NUT_X - 7} y={4} width={7} height={H - 8} fill="#d8cfc0" rx={2} />

        {/* trastes */}
        {fretXs.slice(1).map((x, idx) => (
          <rect key={idx} x={x - 1.2} y={6} width={2.4} height={H - 12} fill="#8a7f73" rx={1.2} />
        ))}

        {/* marcadores */}
        {MARKER_FRETS.filter((f) => f <= frets).map((f) => {
          const cx = BOARD_X + cellCenterX(f, frets) * BOARD_W
          return isDoubleMarker(f) ? (
            <g key={f}>
              <circle cx={cx} cy={H / 2 - 26} r={4.5} fill="#4a4038" />
              <circle cx={cx} cy={H / 2 + 26} r={4.5} fill="#4a4038" />
            </g>
          ) : (
            <circle key={f} cx={cx} cy={H / 2} r={4.5} fill="#4a4038" />
          )
        })}

        {/* números das casas (embaixo, mono, discretos) */}
        {MARKER_FRETS.filter((f) => f <= frets).map((f) => (
          <text
            key={f}
            x={BOARD_X + cellCenterX(f, frets) * BOARD_W}
            y={H - 2}
            textAnchor="middle"
            fontSize={10}
            fontFamily="Space Mono, monospace"
            fill="#6e655c"
          >
            {f}
          </text>
        ))}

        {/* cordas (grave embaixo, grossa; aguda em cima, fina) */}
        {tuning.openStrings.map((_, i) => {
          const y = stringY(i)
          const w = 1.1 + stringWeight(i, stringCount) * 2.6
          return (
            <path
              key={i}
              ref={(el) => {
                stringRefs.current[i] = el
              }}
              d={`M ${BOARD_X} ${y} L ${BOARD_X + BOARD_W} ${y}`}
              stroke={stringWeight(i, stringCount) > 0.5 ? '#b8a88f' : '#d8cfc0'}
              strokeWidth={w}
              fill="none"
            />
          )
        })}

        {/* notas destacadas + zonas de toque */}
        {tuning.openStrings.map((_, i) => {
          const y = stringY(i)
          return Array.from({ length: frets + 1 }, (_, fret) => {
            const midi = midiAt(tuning, i, fret)
            const pc = midiToPc(midi)
            const role = roleOf?.(pc, midi) ?? null
            const cx =
              fret === 0 ? NUT_X - 14 : BOARD_X + cellCenterX(fret, frets) * BOARD_W
            const show = role !== null && role !== 'fora'
            const style = role ? ROLE_FILL[role] : null
            const isTapped = tapped?.string === i && tapped?.fret === fret
            const labelled =
              labelMode === 'all' || (labelMode === 'naturals' && NATURAL_PCS.has(pc))

            return (
              <g key={`${i}-${fret}`}>
                {show && style && (
                  <>
                    <circle cx={cx} cy={y} r={11} fill={style.fill} opacity={style.opacity} />
                    <text
                      x={cx}
                      y={y + 3.2}
                      textAnchor="middle"
                      fontSize={9}
                      fontFamily="Space Mono, monospace"
                      fontWeight={role === 'tonica' ? 700 : 400}
                      fill={style.text}
                    >
                      {noteId(spellPc(pc))}
                    </text>
                  </>
                )}
                {labelled && !show && (
                  <text
                    x={cx}
                    y={y + 3.2}
                    textAnchor="middle"
                    fontSize={8}
                    fontFamily="Space Mono, monospace"
                    fill="#a69c90"
                    opacity={0.5}
                  >
                    {noteId(spellPc(pc))}
                  </text>
                )}
                {/* o que você acabou de tocar: anel + nome, sempre visível */}
                {isTapped && (
                  <>
                    <circle
                      cx={cx}
                      cy={y}
                      r={12}
                      fill="none"
                      stroke="#f2ede6"
                      strokeWidth={1.6}
                    />
                    {!show && (
                      <text
                        x={cx}
                        y={y + 3.4}
                        textAnchor="middle"
                        fontSize={9.5}
                        fontFamily="Space Mono, monospace"
                        fontWeight={700}
                        fill="#f2ede6"
                      >
                        {noteId(spellPc(pc))}
                      </text>
                    )}
                  </>
                )}
                {/* zona de toque generosa (44px mínimo garantido pelo viewBox) */}
                <rect
                  x={fret === 0 ? 0 : BOARD_X + fretX(fret - 1, frets) * BOARD_W}
                  y={y - 16}
                  width={
                    fret === 0
                      ? NUT_X
                      : (fretX(fret, frets) - fretX(fret - 1, frets)) * BOARD_W
                  }
                  height={32}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onPointerDown={() => handleTap(i, fret)}
                />
              </g>
            )
          })
        })}
      </svg>
    </div>
  )
}

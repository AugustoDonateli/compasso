import { noteSolfejo, spellPc, type PitchClass } from '../../theory/notes'

/* Teclado de uma oitava — componente reutilizável.
   Responder "que nota é essa?" clicando numa TECLA em vez de num botão de
   texto: o gesto vira musical. A trilha e um futuro piano virtual herdam isso. */

const W = 700
const H = 210
const WHITE_W = W / 7
const BLACK_W = WHITE_W * 0.58
const BLACK_H = H * 0.62

const WHITE_PCS: PitchClass[] = [0, 2, 4, 5, 7, 9, 11]
/** pc do sustenido e o índice da tecla branca à esquerda dele */
const BLACK_KEYS: Array<{ pc: PitchClass; after: number }> = [
  { pc: 1, after: 0 },
  { pc: 3, after: 1 },
  { pc: 6, after: 3 },
  { pc: 8, after: 4 },
  { pc: 10, after: 5 },
]

export interface KeyboardProps {
  /** teclas que podem ser escolhidas; as demais ficam inertes */
  enabledPcs: PitchClass[]
  onPick: (pc: PitchClass) => void
  /** revelação: pinta a certa de sálvia e a errada de terracota */
  correctPc?: PitchClass | null
  wrongPc?: PitchClass | null
  disabled?: boolean
}

export function Keyboard({
  enabledPcs,
  onPick,
  correctPc = null,
  wrongPc = null,
  disabled = false,
}: KeyboardProps) {
  const state = (pc: PitchClass) => {
    if (correctPc === pc) return 'correct' as const
    if (wrongPc === pc) return 'wrong' as const
    if (!enabledPcs.includes(pc)) return 'inert' as const
    return 'idle' as const
  }

  const whiteFill = (pc: PitchClass) => {
    switch (state(pc)) {
      case 'correct':
        return '#6e8f5a'
      case 'wrong':
        return '#b2543c'
      case 'inert':
        return '#4a423a'
      default:
        return '#e8e0d4'
    }
  }

  const blackFill = (pc: PitchClass) => {
    switch (state(pc)) {
      case 'correct':
        return '#6e8f5a'
      case 'wrong':
        return '#b2543c'
      case 'inert':
        return '#17140f'
      default:
        return '#241f1a'
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full select-none"
      style={{ touchAction: 'manipulation' }}
      role="group"
      aria-label="Teclado — escolha a nota"
    >
      {/* teclas brancas */}
      {WHITE_PCS.map((pc, i) => {
        const active = enabledPcs.includes(pc) && !disabled
        return (
          <g key={pc}>
            <rect
              x={i * WHITE_W + 1}
              y={0}
              width={WHITE_W - 2}
              height={H}
              rx={2}
              fill={whiteFill(pc)}
              stroke="#12100e"
              strokeWidth={1.5}
              style={{ cursor: active ? 'pointer' : 'default' }}
              onPointerDown={() => active && onPick(pc)}
              className={active ? 'transition-colors duration-150 hover:brightness-95' : ''}
            />
            <text
              x={i * WHITE_W + WHITE_W / 2}
              y={H - 16}
              textAnchor="middle"
              fontSize={17}
              fontFamily="Space Mono, monospace"
              fill={
                state(pc) === 'correct' || state(pc) === 'wrong'
                  ? '#f2ede6'
                  : state(pc) === 'inert'
                    ? '#6e655c'
                    : '#3a322b'
              }
              pointerEvents="none"
            >
              {noteSolfejo(spellPc(pc))}
            </text>
          </g>
        )
      })}

      {/* teclas pretas por cima */}
      {BLACK_KEYS.map(({ pc, after }) => {
        const active = enabledPcs.includes(pc) && !disabled
        const x = (after + 1) * WHITE_W - BLACK_W / 2
        return (
          <g key={pc}>
            <rect
              x={x}
              y={0}
              width={BLACK_W}
              height={BLACK_H}
              rx={2}
              fill={blackFill(pc)}
              stroke="#12100e"
              strokeWidth={1.5}
              style={{ cursor: active ? 'pointer' : 'default' }}
              onPointerDown={() => active && onPick(pc)}
              className={active ? 'transition-colors duration-150 hover:brightness-125' : ''}
            />
            {(state(pc) === 'correct' || state(pc) === 'wrong') && (
              <text
                x={x + BLACK_W / 2}
                y={BLACK_H - 12}
                textAnchor="middle"
                fontSize={12}
                fontFamily="Space Mono, monospace"
                fill="#f2ede6"
                pointerEvents="none"
              >
                {noteSolfejo(spellPc(pc))}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

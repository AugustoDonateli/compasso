import { useMemo } from 'react'
import type { Pattern } from './patterns'
import { countLabel, STEPS } from './patterns'

/* A notação viva: enquanto você programa os passos, a partitura de bateria
   se escreve sozinha. É assim que se aprende a ler ritmo sem sentir.
   Notação de bateria real: chimbal = X acima da pauta, caixa no 3º espaço,
   tom no 4º, bumbo no 1º (embaixo). */

const W = 1060
const H = 150
const LEFT = 56 // espaço da clave/rotulos
const STAFF_TOP = 34
const LINE_GAP = 13

// posição vertical de cada peça (notação padrão de bateria)
const PIECE_Y: Record<string, number> = {
  chimbal: STAFF_TOP - LINE_GAP / 2, // acima da 5ª linha
  caixa: STAFF_TOP + LINE_GAP * 1.5, // 3º espaço
  tom: STAFF_TOP + LINE_GAP * 0.5, // 4º espaço
  bumbo: STAFF_TOP + LINE_GAP * 3.5, // 1º espaço
}

export function Notation({ pattern, playStep }: { pattern: Pattern; playStep: number | null }) {
  const colX = useMemo(
    () => Array.from({ length: STEPS }, (_, i) => LEFT + ((i + 0.5) * (W - LEFT - 8)) / STEPS),
    [],
  )

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-label="Partitura da levada">
      {/* 5 linhas da pauta */}
      {[0, 1, 2, 3, 4].map((l) => (
        <line
          key={l}
          x1={LEFT - 26}
          x2={W - 8}
          y1={STAFF_TOP + l * LINE_GAP}
          y2={STAFF_TOP + l * LINE_GAP}
          stroke="#332d27"
          strokeWidth={1}
        />
      ))}

      {/* barra de compasso no início e fim */}
      <line x1={LEFT - 26} x2={LEFT - 26} y1={STAFF_TOP} y2={STAFF_TOP + 4 * LINE_GAP} stroke="#a69c90" strokeWidth={2.5} />
      <line x1={W - 8} x2={W - 8} y1={STAFF_TOP} y2={STAFF_TOP + 4 * LINE_GAP} stroke="#a69c90" strokeWidth={2.5} />

      {/* fórmula de compasso 4/4 */}
      <text x={LEFT - 18} y={STAFF_TOP + LINE_GAP * 1.6} fontSize={17} fontFamily="Fraunces Variable, serif" fontWeight={600} fill="#a69c90">4</text>
      <text x={LEFT - 18} y={STAFF_TOP + LINE_GAP * 3.6} fontSize={17} fontFamily="Fraunces Variable, serif" fontWeight={600} fill="#a69c90">4</text>

      {/* separadores leves de tempo (a cada 4 semicolcheias) */}
      {[4, 8, 12].map((i) => (
        <line
          key={i}
          x1={LEFT + (i * (W - LEFT - 8)) / STEPS}
          x2={LEFT + (i * (W - LEFT - 8)) / STEPS}
          y1={STAFF_TOP - 8}
          y2={STAFF_TOP + 4 * LINE_GAP + 8}
          stroke="#221e1a"
          strokeWidth={1}
        />
      ))}

      {/* playhead */}
      {playStep !== null && (
        <rect
          x={colX[playStep] - (W - LEFT - 8) / STEPS / 2}
          y={STAFF_TOP - 16}
          width={(W - LEFT - 8) / STEPS}
          height={4 * LINE_GAP + 30}
          fill="#e0a34a"
          opacity={0.1}
        />
      )}

      {/* as notas — escritas na hora */}
      {Object.entries(pattern.steps).map(([piece, steps]) =>
        steps.map((on, i) => {
          if (!on) return null
          const x = colX[i]
          const y = PIECE_Y[piece]
          const hot = playStep === i
          const color = hot ? '#e0a34a' : '#f2ede6'
          return piece === 'chimbal' ? (
            <g key={`${piece}-${i}`} stroke={color} strokeWidth={1.8}>
              <line x1={x - 4.5} y1={y - 4.5} x2={x + 4.5} y2={y + 4.5} />
              <line x1={x - 4.5} y1={y + 4.5} x2={x + 4.5} y2={y - 4.5} />
            </g>
          ) : (
            <ellipse key={`${piece}-${i}`} cx={x} cy={y} rx={5.6} ry={4.4} fill={color} />
          )
        }),
      )}

      {/* contagem: 1 e & a 2 e & a... */}
      {colX.map((x, i) => (
        <text
          key={i}
          x={x}
          y={H - 10}
          textAnchor="middle"
          fontSize={11}
          fontFamily="Space Mono, monospace"
          fontWeight={i % 4 === 0 ? 700 : 400}
          fill={playStep === i ? '#e0a34a' : i % 4 === 0 ? '#a69c90' : '#8a8075'}
        >
          {countLabel(i)}
        </text>
      ))}

      {/* rótulos das peças à esquerda */}
      {Object.entries(PIECE_Y).map(([piece, y]) => (
        <text key={piece} x={2} y={y + 3} fontSize={8.5} fontFamily="Space Mono, monospace" fill="#8a8075">
          {piece}
        </text>
      ))}
    </svg>
  )
}

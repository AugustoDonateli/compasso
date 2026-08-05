import { useEffect, useRef } from 'react'
import { gsap } from '../../motion/useLenisGsap'
import { TODAS_LICOES, UNIDADES, licaoDesbloqueada } from '../../content/trilha'

/* O caminho é um BRAÇO VISTO DE CIMA, descendo a tela.
   Cada lição é um marcador de casa (aquelas bolinhas em 3, 5, 7, 9) e o fim
   de cada unidade é a MARCA DUPLA da 12ª casa. Subir o braço = evoluir.

   O espaçamento das casas usa a fórmula real — L × (1 − 2^(−n/12)) —
   então as casas apertam conforme descem, igual num instrumento de verdade.
   Isso é o oposto de um caminho genérico de bolinhas. */

const W = 320
const NECK_X = 60
const NECK_W = 200
const TOP = 40
const SCALE_LEN = 1400 // "comprimento de escala" virtual em px

/** distância do capotraste até a casa n, na proporção verdadeira */
function fretY(n: number): number {
  return TOP + SCALE_LEN * (1 - Math.pow(2, -n / 12))
}

interface Props {
  concluidas: string[]
  atualId: string | null
  onEscolher: (licaoId: string) => void
}

export function Caminho({ concluidas, atualId, onEscolher }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  // as casas entram de cima pra baixo quando a trilha aparece
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const marks = el.querySelectorAll('[data-mark]')
    const tween = gsap.from(marks, {
      opacity: 0,
      y: -14,
      duration: reduced ? 0.2 : 0.5,
      stagger: reduced ? 0 : 0.06,
      ease: 'power2.out',
    })
    return () => {
      tween.kill()
    }
  }, [])

  // cada lição ocupa uma casa; a última casa de cada unidade é a "12ª" (marca dupla)
  let casa = 0
  const nodes = TODAS_LICOES.map(({ unidade, licao }, i) => {
    casa += 1
    const ultimaDaUnidade = unidade.licoes[unidade.licoes.length - 1].id === licao.id
    const feita = concluidas.includes(licao.id)
    const aberta = licaoDesbloqueada(licao.id, concluidas)
    const atual = licao.id === atualId
    return { unidade, licao, i, casa, ultimaDaUnidade, feita, aberta, atual }
  })

  const altura = fretY(nodes.length + 1) + 90

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${altura}`}
      className="block w-full max-w-md"
      style={{ touchAction: 'manipulation' }}
      role="list"
      aria-label="Trilha do Compasso"
    >
      <defs>
        <linearGradient id="madeira" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1512" />
          <stop offset="45%" stopColor="#2a221c" />
          <stop offset="100%" stopColor="#171310" />
        </linearGradient>
      </defs>

      {/* o braço */}
      <rect x={NECK_X} y={TOP} width={NECK_W} height={altura - TOP - 20} fill="url(#madeira)" />
      {/* capotraste */}
      <rect x={NECK_X - 4} y={TOP - 7} width={NECK_W + 8} height={7} fill="#d8cfc0" rx={1} />

      {/* as seis cordas descendo */}
      {Array.from({ length: 6 }, (_, s) => {
        const x = NECK_X + 18 + (s * (NECK_W - 36)) / 5
        return (
          <line
            key={s}
            x1={x}
            y1={TOP - 7}
            x2={x}
            y2={altura - 20}
            stroke="#6e655c"
            strokeWidth={0.6 + s * 0.22}
            opacity={0.5}
          />
        )
      })}

      {/* trastes: um por lição, no espaçamento real */}
      {nodes.map(({ casa: c }) => (
        <line
          key={`t${c}`}
          x1={NECK_X}
          x2={NECK_X + NECK_W}
          y1={fretY(c)}
          y2={fretY(c)}
          stroke="#8a8075"
          strokeWidth={2}
        />
      ))}

      {/* as lições */}
      {nodes.map((n) => {
        const yTopo = fretY(n.casa - 1)
        const y = (yTopo + fretY(n.casa)) / 2 // centro da casa, como um marcador real
        const cx = NECK_X + NECK_W / 2
        const cor = n.feita ? '#e0a34a' : n.atual ? '#f2ede6' : '#4a423a'

        return (
          <g
            key={n.licao.id}
            data-mark
            role="listitem"
            aria-label={`${n.licao.titulo}${n.feita ? ' (concluída)' : n.aberta ? '' : ' (bloqueada)'}`}
            style={{ cursor: n.aberta ? 'pointer' : 'not-allowed' }}
            onPointerDown={() => n.aberta && onEscolher(n.licao.id)}
          >
            {/* área de toque generosa (mobile) */}
            <rect
              x={NECK_X}
              y={yTopo}
              width={NECK_W}
              height={fretY(n.casa) - yTopo}
              fill="transparent"
            />

            {/* marcador: duplo no fim da unidade, como a 12ª casa */}
            {n.ultimaDaUnidade ? (
              <>
                <circle cx={cx - 26} cy={y} r={11} fill={cor} opacity={n.aberta ? 1 : 0.45} />
                <circle cx={cx + 26} cy={y} r={11} fill={cor} opacity={n.aberta ? 1 : 0.45} />
              </>
            ) : (
              <circle cx={cx} cy={y} r={13} fill={cor} opacity={n.aberta ? 1 : 0.45} />
            )}

            {/* anel de "você está aqui" */}
            {n.atual && (
              <circle
                cx={cx}
                cy={y}
                r={22}
                fill="none"
                stroke="#e0a34a"
                strokeWidth={1.6}
                opacity={0.9}
              />
            )}

            {/* número da lição dentro do marcador */}
            {!n.ultimaDaUnidade && (
              <text
                x={cx}
                y={y + 4}
                textAnchor="middle"
                fontSize={12}
                fontFamily="Space Mono, monospace"
                fontWeight={700}
                fill={n.feita || n.atual ? '#12100e' : '#8a8075'}
                pointerEvents="none"
              >
                {n.i + 1}
              </text>
            )}

            {/* título ao lado do braço */}
            <text
              x={NECK_X + NECK_W + 12}
              y={y - 2}
              fontSize={12}
              fontFamily="Space Grotesk Variable, sans-serif"
              fill={n.aberta ? '#f2ede6' : '#6e655c'}
              pointerEvents="none"
            >
              {n.licao.titulo}
            </text>
            <text
              x={NECK_X + NECK_W + 12}
              y={y + 12}
              fontSize={9}
              fontFamily="Space Mono, monospace"
              fill="#6e655c"
              pointerEvents="none"
            >
              {n.feita ? 'concluída' : n.atual ? 'você está aqui' : n.aberta ? 'aberta' : 'travada'}
            </text>

            {/* rótulo da unidade à esquerda, na primeira lição dela */}
            {n.unidade.licoes[0].id === n.licao.id && (
              <text
                x={NECK_X - 10}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fontFamily="Space Mono, monospace"
                fill="#a69c90"
                pointerEvents="none"
              >
                U{n.unidade.n}
              </text>
            )}
          </g>
        )
      })}

      {/* quantas unidades existem, no pé do braço */}
      <text
        x={NECK_X + NECK_W / 2}
        y={altura - 4}
        textAnchor="middle"
        fontSize={9}
        fontFamily="Space Mono, monospace"
        fill="#4a423a"
      >
        {UNIDADES.length} unidades · mais vindo
      </text>
    </svg>
  )
}

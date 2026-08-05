import { useEffect, useRef } from 'react'
import { gsap } from '../../motion/useLenisGsap'
import { licaoDesbloqueada, licoesDe, type Unidade } from '../../content/trilha'
import type { InstrumentSoundId } from '../../audio/instruments'

/* O caminho é um BRAÇO VISTO DE CIMA, descendo a tela.
   Cada lição é um marcador de casa; o fim de unidade é a MARCA DUPLA da 12ª.

   O espaçamento usa a fórmula real — L × (1 − 2^(−n/12)) — então as casas
   apertam conforme descem, igual num instrumento de verdade.

   Tudo aqui é grande de propósito: marcadores, títulos e áreas de toque.
   A tela precisa passar confiança, e coisa pequena passa o contrário. */

const W = 460
const NECK_X = 34
const NECK_W = 150
const TOP = 44
const SCALE_LEN = 2600

function fretY(n: number): number {
  return TOP + SCALE_LEN * (1 - Math.pow(2, -n / 12))
}

interface Props {
  instrumento: InstrumentSoundId
  concluidas: string[]
  atualId: string | null
  onEscolher: (licaoId: string) => void
  onVerGuia: (u: Unidade) => void
}

export function Caminho({ instrumento, concluidas, atualId, onEscolher, onVerGuia }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const marks = el.querySelectorAll('[data-mark]')
    const tween = gsap.from(marks, {
      opacity: 0,
      y: -16,
      duration: reduced ? 0.2 : 0.55,
      stagger: reduced ? 0 : 0.07,
      ease: 'power2.out',
    })
    return () => {
      tween.kill()
    }
  }, [instrumento])

  const lista = licoesDe(instrumento)
  const nodes = lista.map(({ unidade, licao }, i) => ({
    unidade,
    licao,
    i,
    casa: i + 1,
    fimDeUnidade: unidade.licoes[unidade.licoes.length - 1].id === licao.id,
    inicioDeUnidade: unidade.licoes[0].id === licao.id,
    feita: concluidas.includes(licao.id),
    aberta: licaoDesbloqueada(licao.id, concluidas, instrumento),
    atual: licao.id === atualId,
  }))

  const altura = fretY(nodes.length + 1) + 40

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${altura}`}
      className="block w-full"
      style={{ touchAction: 'manipulation' }}
      role="list"
      aria-label="Trilha do Compasso"
    >
      <defs>
        <linearGradient id="madeira" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#191410" />
          <stop offset="45%" stopColor="#2c231c" />
          <stop offset="100%" stopColor="#15110e" />
        </linearGradient>
      </defs>

      <rect x={NECK_X} y={TOP} width={NECK_W} height={altura - TOP - 16} fill="url(#madeira)" />
      {/* capotraste */}
      <rect x={NECK_X - 5} y={TOP - 9} width={NECK_W + 10} height={9} fill="#d8cfc0" rx={1.5} />

      {/* cordas */}
      {Array.from({ length: 6 }, (_, s) => {
        const x = NECK_X + 14 + (s * (NECK_W - 28)) / 5
        return (
          <line
            key={s}
            x1={x}
            y1={TOP - 9}
            x2={x}
            y2={altura - 16}
            stroke="#6e655c"
            strokeWidth={0.7 + s * 0.24}
            opacity={0.45}
          />
        )
      })}

      {/* trastes */}
      {nodes.map(({ casa }) => (
        <line
          key={`t${casa}`}
          x1={NECK_X}
          x2={NECK_X + NECK_W}
          y1={fretY(casa)}
          y2={fretY(casa)}
          stroke="#8a8075"
          strokeWidth={2.5}
        />
      ))}

      {nodes.map((n) => {
        const yTopo = fretY(n.casa - 1)
        const yBase = fretY(n.casa)
        const y = (yTopo + yBase) / 2
        const cx = NECK_X + NECK_W / 2
        const cor = n.feita ? '#e0a34a' : n.atual ? '#f2ede6' : '#463d34'

        return (
          <g key={n.licao.id} data-mark role="listitem">
            {/* alvo de toque: a casa inteira */}
            <rect
              x={NECK_X}
              y={yTopo}
              width={W - NECK_X}
              height={yBase - yTopo}
              fill="transparent"
              style={{ cursor: n.aberta ? 'pointer' : 'not-allowed' }}
              onPointerDown={() => {
                if (!n.aberta) return
                onVerGuia(n.unidade)
                onEscolher(n.licao.id)
              }}
              aria-label={`${n.licao.titulo}${n.feita ? ', concluída' : n.aberta ? '' : ', travada'}`}
            />

            {/* marcador duplo no fim da unidade, como a 12ª casa */}
            {n.fimDeUnidade ? (
              <>
                <circle cx={cx - 30} cy={y} r={13} fill={cor} opacity={n.aberta ? 1 : 0.4} />
                <circle cx={cx + 30} cy={y} r={13} fill={cor} opacity={n.aberta ? 1 : 0.4} />
              </>
            ) : (
              <circle cx={cx} cy={y} r={17} fill={cor} opacity={n.aberta ? 1 : 0.4} />
            )}

            {n.atual && (
              <circle cx={cx} cy={y} r={28} fill="none" stroke="#e0a34a" strokeWidth={2} />
            )}

            {!n.fimDeUnidade && (
              <text
                x={cx}
                y={y + 6}
                textAnchor="middle"
                fontSize={16}
                fontFamily="Space Mono, monospace"
                fontWeight={700}
                fill={n.feita || n.atual ? '#12100e' : '#8a8075'}
                pointerEvents="none"
              >
                {n.i + 1}
              </text>
            )}

            {/* título grande ao lado */}
            <text
              x={NECK_X + NECK_W + 22}
              y={y + (n.inicioDeUnidade ? 2 : 6)}
              fontSize={19}
              fontFamily="Fraunces Variable, serif"
              fontWeight={560}
              fill={n.aberta ? '#f2ede6' : '#5a5148'}
              pointerEvents="none"
            >
              {n.licao.titulo}
            </text>
            {n.inicioDeUnidade && (
              <text
                x={NECK_X + NECK_W + 22}
                y={y + 20}
                fontSize={11}
                fontFamily="Space Mono, monospace"
                fill="#6e655c"
                pointerEvents="none"
              >
                unidade {n.unidade.n} · {n.unidade.titulo}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

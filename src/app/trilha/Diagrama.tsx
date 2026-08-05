/* Diagramas de ensino — desenhados, não fotografados.
 *
 *  Pra anatomia e posição, desenho ensina mais que foto: dá pra rotular, dá
 *  pra destacar só o que importa, acompanha o tema claro/escuro, escala em
 *  qualquer tela e não custa nada. Foto entra onde realismo importa
 *  (atmosfera, textura), não onde precisão importa. */

export type DiagramaId =
  | 'cordas-guitarra'
  | 'dedo-na-casa'
  | 'kit-bateria'
  | 'pegada-baqueta'
  | 'mao-piano'
  | 'dedos-numerados'
  | 'cordas-violino'
  | 'arco-cavalete'
  | 'cadeia-efeitos'

const TXT = '#a69c90'
const FORTE = '#f2ede6'
const LATAO = '#e0a34a'
const LINHA = '#4a423a'

function Rotulo({ x, y, children, anchor = 'middle' }: { x: number; y: number; children: string; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={13} fontFamily="Space Mono, monospace" fill={TXT}>
      {children}
    </text>
  )
}

/* ---------- guitarra ---------- */

function CordasGuitarra() {
  const nomes = ['mi', 'lá', 'ré', 'sol', 'si', 'mi']
  return (
    <svg viewBox="0 0 520 260" className="block w-full">
      <rect x={90} y={30} width={340} height={190} fill="#241d18" />
      <rect x={85} y={22} width={350} height={9} rx={2} fill="#d8cfc0" />
      <Rotulo x={260} y={16}>capotraste</Rotulo>
      {nomes.map((_, i) => {
        const y = 52 + i * 31
        return (
          <g key={i}>
            <line x1={90} y1={y} x2={430} y2={y} stroke={FORTE} strokeWidth={0.8 + i * 0.5} opacity={0.75} />
            <text x={78} y={y + 4} textAnchor="end" fontSize={14} fontFamily="Space Mono, monospace" fill={LATAO}>
              {nomes[nomes.length - 1 - i]}
            </text>
            <text x={444} y={y + 4} fontSize={12} fontFamily="Space Mono, monospace" fill={TXT}>
              {6 - i}ª
            </text>
          </g>
        )
      })}
      <Rotulo x={40} y={248} anchor="start">
        ↑ a 1ª é a mais FINA, embaixo quando você toca
      </Rotulo>
    </svg>
  )
}

function DedoNaCasa() {
  return (
    <svg viewBox="0 0 520 220" className="block w-full">
      <rect x={30} y={40} width={460} height={120} fill="#241d18" />
      {[30, 180, 330, 480].map((x, i) => (
        <rect key={i} x={x - 3} y={40} width={6} height={120} fill="#b9b0a3" />
      ))}
      <line x1={30} y1={100} x2={490} y2={100} stroke={FORTE} strokeWidth={2} />

      {/* certo */}
      <circle cx={310} cy={100} r={16} fill="#6e8f5a" />
      <text x={310} y={105} textAnchor="middle" fontSize={15} fontFamily="Space Mono, monospace" fill="#12100e">
        ✓
      </text>
      <Rotulo x={310} y={190}>logo ATRÁS do traste</Rotulo>

      {/* errado: em cima do traste */}
      <circle cx={480} cy={100} r={14} fill="#b2543c" opacity={0.85} />
      <text x={480} y={105} textAnchor="middle" fontSize={14} fontFamily="Space Mono, monospace" fill="#f2ede6">
        ✕
      </text>
      <Rotulo x={470} y={28} anchor="end">em cima: abafa</Rotulo>

      {/* errado: no meio */}
      <circle cx={245} cy={100} r={14} fill="#b2543c" opacity={0.55} />
      <Rotulo x={200} y={28} anchor="start">longe: chia</Rotulo>
    </svg>
  )
}

function CadeiaEfeitos() {
  const blocos = [
    { nome: 'guitarra', cor: LINHA },
    { nome: 'distorção', cor: LATAO },
    { nome: 'delay', cor: LINHA },
    { nome: 'reverb', cor: LINHA },
    { nome: 'amplificador', cor: LINHA },
  ]
  return (
    <svg viewBox="0 0 560 150" className="block w-full">
      {blocos.map((b, i) => {
        const x = 10 + i * 110
        return (
          <g key={i}>
            <rect x={x} y={45} width={92} height={52} fill="none" stroke={b.cor} strokeWidth={2} />
            <text x={x + 46} y={76} textAnchor="middle" fontSize={12} fontFamily="Space Mono, monospace" fill={b.cor === LATAO ? LATAO : FORTE}>
              {b.nome}
            </text>
            {i < blocos.length - 1 && (
              <line x1={x + 92} y1={71} x2={x + 110} y2={71} stroke={TXT} strokeWidth={1.5} markerEnd="url(#seta)" />
            )}
          </g>
        )
      })}
      <defs>
        <marker id="seta" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={TXT} />
        </marker>
      </defs>
      <Rotulo x={10} y={128} anchor="start">o sinal passa em ordem — trocar a ordem muda o som</Rotulo>
    </svg>
  )
}

/* ---------- bateria ---------- */

function KitBateria() {
  return (
    <svg viewBox="0 0 520 300" className="block w-full">
      {/* bumbo */}
      <ellipse cx={260} cy={215} rx={72} ry={58} fill="none" stroke={LATAO} strokeWidth={2.5} />
      <text x={260} y={220} textAnchor="middle" fontSize={14} fontFamily="Space Mono, monospace" fill={LATAO}>bumbo</text>
      {/* caixa */}
      <ellipse cx={155} cy={175} rx={42} ry={20} fill="none" stroke={LATAO} strokeWidth={2.5} />
      <text x={155} y={180} textAnchor="middle" fontSize={13} fontFamily="Space Mono, monospace" fill={LATAO}>caixa</text>
      {/* chimbal */}
      <ellipse cx={110} cy={95} rx={46} ry={11} fill="none" stroke={LATAO} strokeWidth={2.5} />
      <text x={110} y={78} textAnchor="middle" fontSize={13} fontFamily="Space Mono, monospace" fill={LATAO}>chimbal</text>
      {/* tons e prato, secundarios */}
      <ellipse cx={250} cy={135} rx={34} ry={16} fill="none" stroke={LINHA} strokeWidth={1.5} />
      <text x={250} y={140} textAnchor="middle" fontSize={11} fontFamily="Space Mono, monospace" fill={TXT}>tom</text>
      <ellipse cx={400} cy={100} rx={50} ry={12} fill="none" stroke={LINHA} strokeWidth={1.5} />
      <text x={400} y={85} textAnchor="middle" fontSize={11} fontFamily="Space Mono, monospace" fill={TXT}>prato</text>
      <Rotulo x={10} y={290} anchor="start">
        as três em destaque sustentam quase toda levada
      </Rotulo>
    </svg>
  )
}

function PegadaBaqueta() {
  return (
    <svg viewBox="0 0 520 200" className="block w-full">
      {/* certo: ponto de apoio adiantado, dedos soltos */}
      <line x1={40} y1={70} x2={230} y2={70} stroke="#c9a227" strokeWidth={7} strokeLinecap="round" />
      <circle cx={95} cy={70} r={13} fill="none" stroke="#6e8f5a" strokeWidth={2.5} />
      <Rotulo x={95} y={44}>polegar + indicador</Rotulo>
      <path d="M120 82 q20 14 44 8" stroke="#6e8f5a" strokeWidth={2} fill="none" />
      <text x={40} y={120} fontSize={13} fontFamily="Space Mono, monospace" fill="#6e8f5a">
        ✓ solto: a baqueta quica sozinha
      </text>

      {/* errado: agarrada na palma */}
      <line x1={290} y1={150} x2={480} y2={150} stroke="#8a7320" strokeWidth={7} strokeLinecap="round" />
      <rect x={330} y={134} width={62} height={32} rx={6} fill="none" stroke="#b2543c" strokeWidth={2.5} />
      <text x={290} y={192} fontSize={13} fontFamily="Space Mono, monospace" fill="#b2543c">
        ✕ apertada: mata o quique e cansa
      </text>
    </svg>
  )
}

/* ---------- piano ---------- */

function DedosNumerados() {
  return (
    <svg viewBox="0 0 520 200" className="block w-full">
      {[1, 2, 3, 4, 5].map((n, i) => {
        const x = 90 + i * 78
        const alturas = [70, 46, 36, 46, 62]
        return (
          <g key={n}>
            <rect x={x - 16} y={alturas[i]} width={32} height={150 - alturas[i]} rx={16} fill="none" stroke={n === 1 ? LATAO : LINHA} strokeWidth={2} />
            <text x={x} y={alturas[i] - 12} textAnchor="middle" fontSize={20} fontFamily="Space Mono, monospace" fontWeight={700} fill={n === 1 ? LATAO : FORTE}>
              {n}
            </text>
          </g>
        )
      })}
      <Rotulo x={90} y={180}>polegar = 1</Rotulo>
      <Rotulo x={402} y={180}>mindinho = 5</Rotulo>
      <Rotulo x={260} y={196}>vale igual nas duas mãos</Rotulo>
    </svg>
  )
}

function MaoPiano() {
  return (
    <svg viewBox="0 0 520 210" className="block w-full">
      {/* teclas */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={40 + i * 60} y={130} width={56} height={60} fill="none" stroke={LINHA} strokeWidth={1.5} />
      ))}
      {/* certo: arco */}
      <path d="M50 120 q100 -80 210 0" stroke="#6e8f5a" strokeWidth={3} fill="none" />
      <circle cx={155} cy={72} r={26} fill="none" stroke="#6e8f5a" strokeWidth={1.5} strokeDasharray="4 4" />
      <text x={40} y={40} fontSize={13} fontFamily="Space Mono, monospace" fill="#6e8f5a">
        ✓ curvada, como segurando uma bolha
      </text>
      {/* errado: chata */}
      <line x1={300} y1={122} x2={480} y2={122} stroke="#b2543c" strokeWidth={3} />
      <text x={300} y={40} fontSize={13} fontFamily="Space Mono, monospace" fill="#b2543c">
        ✕ esticada: perde controle
      </text>
      <Rotulo x={300} y={62} anchor="start">toca com a polpa, não a ponta</Rotulo>
    </svg>
  )
}

/* ---------- violino ---------- */

function CordasViolino() {
  const nomes = ['sol', 'ré', 'lá', 'mi']
  return (
    <svg viewBox="0 0 520 200" className="block w-full">
      <rect x={120} y={30} width={280} height={140} fill="#241d18" />
      {nomes.map((n, i) => {
        const x = 155 + i * 70
        return (
          <g key={n}>
            <line x1={x} y1={30} x2={x} y2={170} stroke={FORTE} strokeWidth={3 - i * 0.6} opacity={0.8} />
            <text x={x} y={22} textAnchor="middle" fontSize={15} fontFamily="Space Mono, monospace" fill={LATAO}>
              {n}
            </text>
          </g>
        )
      })}
      <Rotulo x={155} y={190}>mais grave</Rotulo>
      <Rotulo x={365} y={190}>mais aguda</Rotulo>
      <Rotulo x={30} y={105} anchor="start">de quinta</Rotulo>
      <Rotulo x={30} y={125} anchor="start">em quinta</Rotulo>
    </svg>
  )
}

function ArcoCavalete() {
  return (
    <svg viewBox="0 0 520 210" className="block w-full">
      {/* corda e cavalete */}
      <line x1={60} y1={100} x2={460} y2={100} stroke={LINHA} strokeWidth={2} />
      <rect x={250} y={82} width={10} height={36} fill={TXT} />
      <Rotulo x={255} y={72}>cavalete</Rotulo>
      {/* certo: paralelo */}
      <line x1={150} y1={60} x2={370} y2={60} stroke="#6e8f5a" strokeWidth={4} strokeLinecap="round" />
      <text x={60} y={40} fontSize={13} fontFamily="Space Mono, monospace" fill="#6e8f5a">
        ✓ paralelo ao cavalete
      </text>
      {/* errado: torto */}
      <line x1={150} y1={155} x2={370} y2={185} stroke="#b2543c" strokeWidth={4} strokeLinecap="round" />
      <text x={60} y={200} fontSize={13} fontFamily="Space Mono, monospace" fill="#b2543c">
        ✕ torto: escorrega e arranha
      </text>
    </svg>
  )
}

const MAPA: Record<DiagramaId, () => React.ReactElement> = {
  'cordas-guitarra': CordasGuitarra,
  'dedo-na-casa': DedoNaCasa,
  'cadeia-efeitos': CadeiaEfeitos,
  'kit-bateria': KitBateria,
  'pegada-baqueta': PegadaBaqueta,
  'dedos-numerados': DedosNumerados,
  'mao-piano': MaoPiano,
  'cordas-violino': CordasViolino,
  'arco-cavalete': ArcoCavalete,
}

export function Diagrama({ id }: { id: DiagramaId }) {
  const D = MAPA[id]
  if (!D) return null
  return (
    <div className="my-8 border border-[#332d27] bg-[#161310] p-4 md:p-6">
      <D />
    </div>
  )
}

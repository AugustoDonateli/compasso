import { Link } from 'react-router-dom'
import {
  proximaLicao,
  progressoPct,
  type TipoTrilha,
  type TrilhaInstrumento,
} from '../content/trilha'
import type { UserProgress } from '../storage'

/* O painel: o que quem JÁ conhece o site vê ao entrar.
   Ninguém assiste o comercial toda vez que abre o app. Quem já veio quer
   fazer — a lição de hoje, afinar o violão, cinco minutos de ouvido — e não
   deveria rolar duas telas e meia pra chegar lá.

   Continua sendo possível ver a landing: ela é bonita e é o que explica o
   site pra um amigo que receber o link. */

const ATALHOS = [
  { to: '/afinador', nome: 'Afinador', desc: 'o site ouve e diz se está afinado' },
  { to: '/ouvido', nome: 'Ouvido', desc: 'nota, intervalo e acorde de ouvido' },
  { to: '/braco', nome: 'Mapa das notas', desc: 'onde cada nota mora no braço' },
  { to: '/groove', nome: 'Groove machine', desc: 'monte a levada, veja a partitura' },
  { to: '/desmontador', nome: 'Desmontador', desc: 'a teoria por dentro das músicas que você conhece' },
]

interface Props {
  progresso: UserProgress
  instrumento: TrilhaInstrumento
  tipo: TipoTrilha
  onVerLanding: () => void
}

export function Painel({ progresso, instrumento, tipo, onVerLanding }: Props) {
  const proxima = proximaLicao(progresso.completed, instrumento, tipo)
  const pct = progressoPct(progresso.completed, instrumento, tipo)

  return (
    <div className="min-h-screen bg-base pt-20 text-ink">
      <main className="mx-auto max-w-5xl px-5 py-10 md:px-10 md:py-16">
        {/* uma linha de contexto, sem grade de placar competindo */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-line pb-6">
          <span className="type-label text-ink-2">
            <span className="text-brass">{progresso.xp}</span> xp
          </span>
          <span className="type-label text-ink-2">
            <span className="text-ink">{progresso.streak}</span>{' '}
            {progresso.streak === 1 ? 'dia seguido' : 'dias seguidos'}
          </span>
          <span className="type-label text-ink-2">
            <span className="text-ink">{pct}%</span> da trilha
          </span>
        </div>

        {/* A COISA PRINCIPAL: continuar de onde parou */}
        {proxima ? (
          <section className="py-12 md:py-16">
            <span className="type-label text-ink-2">
              seu próximo passo · unidade {proxima.unidade.n} · {proxima.unidade.titulo}
            </span>
            <h1
              className="type-display mt-4 leading-[0.95]"
              style={{ fontSize: 'clamp(2.75rem, 7vw, 5.5rem)', marginLeft: '-0.02em' }}
            >
              {proxima.licao.titulo}
            </h1>
            <Link
              to="/trilha"
              className="type-label mt-10 inline-block border-2 border-brass bg-brass px-10 py-6 text-base transition-transform hover:-translate-y-0.5"
              style={{ color: 'var(--bg-base)' }}
            >
              continuar · {proxima.licao.perguntas.length} perguntas
            </Link>
          </section>
        ) : (
          <section className="py-12 md:py-16">
            <span className="type-label text-ink-2">trilha completa</span>
            <h1 className="type-display mt-4 text-4xl leading-tight md:text-6xl">
              Você terminou tudo que existe.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-2">
              As próximas unidades estão sendo escritas. As ferramentas continuam aqui.
            </p>
          </section>
        )}

        {/* ferramentas, à mão */}
        <section className="border-t border-line pt-10">
          <span className="type-label text-ink-2">ferramentas</span>
          <div className="mt-6 grid gap-px bg-line sm:grid-cols-2">
            {ATALHOS.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group bg-base p-6 transition-colors hover:bg-raised md:p-8"
              >
                <h2 className="type-display text-2xl transition-transform duration-300 group-hover:translate-x-1 md:text-3xl">
                  {a.nome}
                </h2>
                <p className="mt-2 text-ink-2">{a.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <button
          onClick={onVerLanding}
          className="type-label mt-12 text-ink-2 underline underline-offset-4 transition-colors hover:text-brass"
        >
          conhecer o compasso ↓
        </button>
      </main>
    </div>
  )
}

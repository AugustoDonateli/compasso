import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import {
  proximaLicao,
  progressoPct,
  type TipoTrilha,
  type TrilhaInstrumento,
} from '../content/trilha'
import { bancada, type Peca } from '../content/estudio'
import { somConquista } from '../audio/feedback'
import type { UserProgress } from '../storage'

/* O painel: o que quem JÁ conhece o site vê ao entrar.
   Ninguém assiste o comercial toda vez que abre o app.

   REGRA DE COMPOSIÇÃO desta tela: um pico só. O título da próxima lição é a
   única coisa gritando; leitura de XP, bancada e ferramentas falam baixo pra
   ele existir. Quando tudo tem o mesmo peso, nada tem peso — era esse o
   defeito da versão anterior, não a falta de enfeite. */

const VISTAS_KEY = 'compasso.pecasVistas'

/** Quais peças a pessoa ainda não viu chegar. É isso que vira comemoração:
 *  a recompensa é uma coisa NOVA no site, não um número maior. */
function pecasNovas(liberadas: Peca[]): Peca[] {
  try {
    const vistas = new Set(JSON.parse(localStorage.getItem(VISTAS_KEY) ?? '[]') as string[])
    // primeiro acesso: as peças iniciais não são conquista, são o ponto de
    // partida. Comemorar elas ensinaria que a comemoração é barata.
    if (!localStorage.getItem(VISTAS_KEY)) {
      localStorage.setItem(VISTAS_KEY, JSON.stringify(liberadas.map((p) => p.id)))
      return []
    }
    const novas = liberadas.filter((p) => !vistas.has(p.id))
    if (novas.length) {
      localStorage.setItem(VISTAS_KEY, JSON.stringify(liberadas.map((p) => p.id)))
    }
    return novas
  } catch {
    return []
  }
}

interface Props {
  progresso: UserProgress
  instrumento: TrilhaInstrumento
  tipo: TipoTrilha
}

export function Painel({ progresso, instrumento, tipo }: Props) {
  const proxima = proximaLicao(progresso.completed, instrumento, tipo)
  const pct = progressoPct(progresso.completed, instrumento, tipo)
  const b = bancada(progresso.xp, instrumento)
  const [novas] = useState(() => pecasNovas(b.liberadas))
  const raiz = useRef<HTMLDivElement>(null)

  /* A entrada é encenada, não decorada: a leitura de cima chega primeiro
     (contexto), depois o título (o pico), depois a bancada em cascata. A ordem
     conta a hierarquia — o olho aprende o que importa vendo o que veio antes. */
  useEffect(() => {
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ defaults: { ease: 'power3.out' } })
      const escala = reduzido ? 0.3 : 1
      t.from('[data-leitura]', { y: 10, opacity: 0, duration: 0.5 * escala })
        .from('[data-pico]', { y: 26, opacity: 0, duration: 0.75 * escala }, '-=0.3')
        .from('[data-acao]', { y: 14, opacity: 0, duration: 0.5 * escala }, '-=0.45')
        .from(
          '[data-peca]',
          { y: 16, opacity: 0, duration: 0.45 * escala, stagger: 0.055 * escala },
          '-=0.3',
        )
    }, raiz)
    return () => ctx.revert()
  }, [])

  /* A barra da próxima peça enche a partir do zero: ver o preenchimento
     acontecer é o que dá a sensação de avanço. Um número já cheio não avança. */
  useEffect(() => {
    if (!b.proxima) return
    const el = raiz.current?.querySelector('[data-barra]')
    if (!el) return
    const anim = gsap.fromTo(
      el,
      { scaleX: 0 },
      { scaleX: b.fracao, duration: 1.1, ease: 'power2.out', delay: 0.5 },
    )
    return () => {
      anim.kill()
    }
  }, [b.proxima, b.fracao])

  useEffect(() => {
    if (novas.length) somConquista()
  }, [novas])

  return (
    <div ref={raiz} className="min-h-screen bg-base pt-[var(--altura-nav)] text-ink">
      <main className="mx-auto max-w-5xl px-5 py-10 md:px-10 md:py-16">
        {/* leitura de equipamento: mono, miúda, sem competir com nada */}
        <div
          data-leitura
          className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-line pb-6"
        >
          <span className="type-label text-ink-2">
            <span className="aceso">{progresso.xp}</span> xp
          </span>
          <span className="type-label text-ink-2">
            <span className="text-ink">{progresso.streak}</span>{' '}
            {progresso.streak === 1 ? 'dia seguido' : 'dias seguidos'}
          </span>
          <span className="type-label text-ink-2">
            <span className="text-ink">{pct}%</span> da trilha
          </span>
        </div>

        {/* comemoração: a peça nova chega antes de tudo, uma vez só */}
        {novas.length > 0 && (
          <div className="relevo-alto mt-8 border-l-2 border-[var(--timbre)] bg-raised p-6 md:p-8">
            <span className="type-label aceso">
              {novas.length === 1 ? 'peça nova na bancada' : `${novas.length} peças novas`}
            </span>
            {novas.map((p) => (
              <p key={p.id} className="mt-3 text-lg">
                <span className="type-display text-2xl md:text-3xl">{p.nome}</span>
                <span className="ml-3 text-ink-2">{p.faz}</span>
              </p>
            ))}
          </div>
        )}

        {/* O PICO */}
        {proxima ? (
          <section className="py-12 md:py-16">
            <span data-pico className="type-label block text-ink-2">
              seu próximo passo · unidade {proxima.unidade.n} · {proxima.unidade.titulo}
            </span>
            <h1
              data-pico
              className="type-display mt-4 leading-[0.95]"
              style={{ fontSize: 'clamp(2.75rem, 7vw, 5.5rem)', marginLeft: '-0.02em' }}
            >
              {proxima.licao.titulo}
            </h1>
            <Link
              data-acao
              to="/trilha"
              className="relevo type-label mt-10 inline-block border-2 border-brass bg-brass px-10 py-6 text-base transition-transform hover:-translate-y-0.5"
              style={{ color: 'var(--bg-base)' }}
            >
              continuar · {proxima.licao.perguntas.length} perguntas
            </Link>
          </section>
        ) : (
          <section className="py-12 md:py-16">
            <span data-pico className="type-label block text-ink-2">
              trilha completa
            </span>
            <h1 data-pico className="type-display mt-4 text-4xl leading-tight md:text-6xl">
              Você terminou tudo que existe.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-2">
              As próximas unidades estão sendo escritas. A bancada continua aqui.
            </p>
          </section>
        )}

        {/* A BANCADA */}
        <section className="border-t border-line pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <span className="type-label text-ink-2">sua bancada</span>
            <span className="type-label text-ink-muted">
              {b.liberadas.length} de {b.liberadas.length + (b.proxima ? 1 : 0)}
              {b.proxima ? '+' : ''} peças
            </span>
          </div>

          <div className="mt-6 grid gap-px bg-line sm:grid-cols-2">
            {b.liberadas.map((p) => {
              const conteudo = (
                <>
                  {/* o LED de painel: aceso porque a peça está em mãos */}
                  <span
                    className="led mt-2 block h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: 'var(--timbre)' }}
                    aria-hidden
                  />
                  <span>
                    <span className="type-display block text-2xl transition-transform duration-300 group-hover:translate-x-1 md:text-3xl">
                      {p.nome}
                    </span>
                    <span className="mt-1 block text-ink-2">{p.faz}</span>
                  </span>
                </>
              )
              return p.para ? (
                <Link
                  key={p.id}
                  data-peca
                  to={p.para}
                  className="group flex gap-4 bg-base p-6 transition-colors hover:bg-raised md:p-8"
                >
                  {conteudo}
                </Link>
              ) : (
                <div key={p.id} data-peca className="group flex gap-4 bg-base p-6 md:p-8">
                  {conteudo}
                </div>
              )
            })}

            {/* a próxima peça: presente na bancada, ainda apagada.
                Ver o lugar vazio é o que faz querer preencher. */}
            {b.proxima && (
              <div data-peca className="flex gap-4 bg-base p-6 md:p-8">
                <span
                  className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full bg-line"
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="type-display block text-2xl text-ink-muted md:text-3xl">
                    {b.proxima.nome}
                  </span>
                  <span className="mt-1 block text-ink-muted">{b.proxima.faz}</span>
                  <span className="mt-4 block h-px w-full bg-line">
                    <span
                      data-barra
                      className="block h-px origin-left"
                      style={{ background: 'var(--timbre)', transform: 'scaleX(0)' }}
                    />
                  </span>
                  <span className="type-label mt-2 block text-ink-muted">
                    faltam <span className="aceso">{b.falta}</span> xp
                  </span>
                </span>
              </div>
            )}
          </div>
        </section>

        <Link
          to="/abertura"
          className="type-label mt-12 inline-block text-ink-2 underline underline-offset-4 transition-colors hover:text-brass"
        >
          conhecer o compasso ↓
        </Link>
      </main>
    </div>
  )
}

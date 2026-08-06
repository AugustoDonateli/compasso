import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

/* A barra de navegação.
   Antes disso, estando no Afinador o único caminho pro Ouvido era voltar pra
   home e rolar — as ferramentas não se conversavam.

   Regra de design: no TOPO da landing ela fica invisível, pra não quebrar o
   cinema do herói. Assim que a pessoa rola, ela aparece. Em qualquer outra
   página nasce visível, porque ali ela é utilidade e não estorvo. */

const FERRAMENTAS = [
  { to: '/trilha', nome: 'trilha' },
  { to: '/ranking', nome: 'ranking' },
  { to: '/afinador', nome: 'afinador' },
  { to: '/ouvido', nome: 'ouvido' },
  { to: '/braco', nome: 'mapa das notas' },
  { to: '/desmontador', nome: 'desmontador' },
  { to: '/groove', nome: 'groove' },
  /* a abertura fica por último e é a única que não é ferramenta: de dentro de
     qualquer tela dá pra voltar pra apresentação. Antes ela era um estado
     escondido da home e quem já tinha progresso nunca mais chegava lá. */
  { to: '/abertura', nome: 'abertura' },
]

export function Nav() {
  const { pathname } = useLocation()
  const [visivel, setVisivel] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    /* Duas armadilhas que já morderam aqui:

       1. NÃO decidir pela rota. O painel mora na mesma rota da landing e não
          tem herói — esconder por rota fazia a barra sumir justo onde ela é
          mais útil. Quem manda é a presença de um herói na tela.

       2. NÃO usar o evento 'scroll' do window nem o gsap.ticker. Com o Lenis
          no meio, o evento nativo não chega de forma confiável; e o ticker
          depende de requestAnimationFrame, que não roda em toda situação.
          O ScrollTrigger é o caminho certo: ele já é atualizado pelo próprio
          callback de scroll do Lenis (ver motion/useLenisGsap), então está
          em sincronia por construção. */
    const sentinela = document.querySelector('[data-pos-heroi]')

    // sem sentinela = página sem herói (painel, ferramentas): barra sempre à vista
    if (!sentinela) {
      setVisivel(true)
      return
    }

    setVisivel(false)

    /* DOIS SINAIS INDEPENDENTES, de propósito.
       A falha que dói aqui é a barra NUNCA aparecer — a pessoa fica sem
       navegação. Então em vez de apostar num único mecanismo, qualquer um
       dos dois pode revelar a barra:

       1. IntersectionObserver na sentinela. A pergunta certa não é "ela está
          à vista?" (ela tem 1px, some assim que você passa) e sim "ela já
          ficou pra trás?" — o topo dela acima da tela.
       2. Um simples listener de scroll, como rede de segurança. */
    const revelarSe = (cond: boolean) => {
      if (cond) setVisivel(true)
    }

    const obs = new IntersectionObserver(
      ([e]) => setVisivel(e.boundingClientRect.top < 0),
      { threshold: 0 },
    )
    obs.observe(sentinela)

    const aoRolar = () =>
      revelarSe(sentinela.getBoundingClientRect().top < window.innerHeight * 0.4)
    window.addEventListener('scroll', aoRolar, { passive: true })

    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', aoRolar)
    }
  }, [pathname])

  useEffect(() => setMenuAberto(false), [pathname])

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${
        visivel
          ? 'translate-y-0 border-line bg-base/95 opacity-100 backdrop-blur'
          : 'pointer-events-none -translate-y-full opacity-0'
      }`}
    >
      {/* a barra reserva --altura-nav e as páginas descontam a MESMA variável.
          Dentro dela, cada alvo pode ter os 44px de dedo sem empurrar nada. */}
      <div className="flex min-h-[var(--altura-nav)] items-center justify-between px-5 md:px-10">
        <Link to="/" className="flex items-center gap-3 py-3" aria-label="Compasso, início">
          {/* a marca: as duas hastes da barra de compasso */}
          <span className="flex h-5 items-end gap-1">
            <span className="block h-5 w-[3px] bg-brass" />
            <span className="block h-5 w-[3px] bg-brass" />
          </span>
          <span className="type-label text-ink">compasso</span>
        </Link>

        {/* desktop: tudo à vista */}
        <div className="hidden items-center gap-1 md:flex">
          {FERRAMENTAS.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className={`type-label px-3 py-2 transition-colors ${
                pathname === f.to ? 'text-brass' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {f.nome}
            </Link>
          ))}
        </div>

        {/* mobile: menu, porque 5 links não cabem em 375px */}
        <button
          onClick={() => setMenuAberto((v) => !v)}
          className="type-label flex min-h-11 items-center border border-line px-4 text-ink-2 md:hidden"
          aria-expanded={menuAberto}
        >
          {menuAberto ? 'fechar' : 'menu'}
        </button>
      </div>

      {menuAberto && (
        <div className="border-t border-line md:hidden">
          {FERRAMENTAS.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className={`type-label block border-b border-line px-5 py-4 last:border-b-0 ${
                pathname === f.to ? 'text-brass' : 'text-ink-2'
              }`}
            >
              {f.nome}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap } from '../motion/useLenisGsap'

/* A barra de navegação.
   Antes disso, estando no Afinador o único caminho pro Ouvido era voltar pra
   home e rolar — as ferramentas não se conversavam.

   Regra de design: no TOPO da landing ela fica invisível, pra não quebrar o
   cinema do herói. Assim que a pessoa rola, ela aparece. Em qualquer outra
   página nasce visível, porque ali ela é utilidade e não estorvo. */

const FERRAMENTAS = [
  { to: '/trilha', nome: 'trilha' },
  { to: '/afinador', nome: 'afinador' },
  { to: '/ouvido', nome: 'ouvido' },
  { to: '/braco', nome: 'mapa das notas' },
  { to: '/groove', nome: 'groove' },
]

export function Nav() {
  const { pathname } = useLocation()
  const naLanding = pathname === '/'
  const [visivel, setVisivel] = useState(!naLanding)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    if (!naLanding) {
      setVisivel(true)
      return
    }
    /* IMPORTANTE: não dá pra usar o evento 'scroll' do window aqui. O Lenis
       intercepta a rolagem e o evento nativo simplesmente não dispara — a
       barra ficaria invisível pra sempre na landing. Como o Lenis é movido
       pelo gsap.ticker, ler a posição por ali é o único jeito garantido de
       estar em sincronia. */
    let ultimo = false
    const checar = () => {
      const deveAparecer = window.scrollY > window.innerHeight * 0.5
      if (deveAparecer !== ultimo) {
        ultimo = deveAparecer
        setVisivel(deveAparecer)
      }
    }
    checar()
    gsap.ticker.add(checar)
    return () => gsap.ticker.remove(checar)
  }, [naLanding])

  useEffect(() => setMenuAberto(false), [pathname])

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${
        visivel
          ? 'translate-y-0 border-line bg-base/95 opacity-100 backdrop-blur'
          : 'pointer-events-none -translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center justify-between px-5 py-3 md:px-10">
        <Link to="/" className="flex items-center gap-3" aria-label="Compasso, início">
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
          className="type-label border border-line px-3 py-2 text-ink-2 md:hidden"
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

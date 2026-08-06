import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  caixaDe,
  centro,
  paraTela,
  clipPath,
  OBJETOS_DESKTOP,
  OBJETOS_MOBILE,
  type ObjetoDoQuarto,
} from '../../content/quarto'
import { bancada } from '../../content/estudio'
import { instrumentoSalvo } from '../../design/timbre'
import { getProgress } from '../../progress'

/* O quarto interativo.

   DUAS COISAS DIFERENTES USAM A SILHUETA, e é importante não confundir:

   O CLIQUE usa o contorno exato, com `clip-path`. Precisa ser preciso, e como
   é invisível, borda dura não custa nada.

   A LUZ NÃO. A primeira versão recortava a foto na silhueta e clareava o
   recorte — e a borda dura entregava o truque na hora: dava pra ver que
   alguém tinha cortado a imagem. Luz de verdade não tem contorno, ela vaza.
   Então a luz mora numa CAIXA com folga em volta do objeto, clareia o que
   está embaixo com `backdrop-filter` e desbota nas pontas com uma máscara
   radial. É uma lâmpada acendendo, não um decalque.

   (E não são duas fotos sobrepostas: IA generativa não devolve o mesmo quarto
   duas vezes com só a luz mudada — seriam dois quartos parecidos e tudo
   escorregaria no cruzamento.) */

export interface Foto {
  padrao: string
  conjunto: string
  /** proporção do arquivo, pra desfazer o corte do object-cover */
  largura: number
  altura: number
}

interface Props {
  foto: Foto
  retrato: boolean
}

/** Tamanho real da área do quarto na tela. Sem isso não dá pra converter
 *  coordenada da foto em coordenada da tela. */
function useCaixa() {
  const ref = useRef<HTMLDivElement>(null)
  const [caixa, setCaixa] = useState({ largura: 0, altura: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () =>
      setCaixa({ largura: el.clientWidth, altura: el.clientHeight })
    medir()
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, caixa }
}

export function Quarto({ foto, retrato }: Props) {
  const objetos = retrato ? OBJETOS_MOBILE : OBJETOS_DESKTOP
  const [aceso, setAceso] = useState<string | null>(null)
  const [liberadas, setLiberadas] = useState<Set<string> | null>(null)
  const navegar = useNavigate()

  useEffect(() => {
    void getProgress().then((p) => {
      const b = bancada(p.xp, instrumentoSalvo())
      setLiberadas(new Set(b.liberadas.map((x) => x.id)))
    })
  }, [])

  /* O quarto vem COMPLETO, e o que ainda não é seu fica em silhueta apagada.
     Quarto vazio no primeiro acesso passa impressão de site inacabado — que é
     o oposto do que um amigo deveria sentir ao abrir o link. Vendo o objeto
     apagado, você sabe que ele existe e o que está perseguindo. */
  const disponivel = (o: ObjetoDoQuarto) =>
    !o.peca || liberadas === null || liberadas.has(o.peca)

  const meu = instrumentoSalvo()
  const visiveis = objetos.filter((o) => !o.so || o.so.includes(meu))

  const { ref, caixa } = useCaixa()
  const naTela = (forma: ObjetoDoQuarto['forma']) =>
    paraTela(forma, caixa, { largura: foto.largura, altura: foto.altura })

  return (
    <div ref={ref} className="relative h-screen overflow-hidden bg-[#0b0908]">
      {/* a foto, sangrando na tela inteira */}
      <img
        src={foto.padrao}
        srcSet={foto.conjunto}
        sizes="100vw"
        alt="Um quarto de quem toca música: bateria, guitarra na parede, toca-discos, fone na cama, caderno de música na mesa e um pedal no chão. Cada objeto abre uma ferramenta."
        className="h-screen w-full object-cover"
      />

      {/* o resto do quarto escurece quando um objeto acende */}
      <div
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-500"
        style={{ opacity: aceso ? 0.55 : 0 }}
      />

      {visiveis.map((o, i) => {
        const on = aceso === o.id
        const livre = disponivel(o)
        const naT = naTela(o.forma)
        const [cx, cy] = centro(naT)
        const cx100 = caixaDe(naT)
        return (
          <div key={o.id}>
            {/* A LUZ. Não é a foto recortada e clareada — isso deixava uma
                borda dura que entregava o truque. É uma lâmpada acendendo
                sobre o objeto: clareia o que está EMBAIXO (backdrop-filter) e
                desbota nas pontas com uma máscara radial. Nenhum contorno.

                Em repouso ela fica fraca e respirando devagar, cada objeto no
                seu tempo, pra que a penumbra tenha sete coisas vivas em vez de
                sete coisas apagadas. */}
            <div
              className={`pointer-events-none absolute transition-all duration-700 ${
                !on && livre ? 'anim-respira' : ''
              }`}
              style={{
                left: `${cx100.x * 100}%`,
                top: `${cx100.y * 100}%`,
                width: `${cx100.l * 100}%`,
                height: `${cx100.a * 100}%`,
                opacity: livre ? (on ? 1 : 0.5) : 0,
                animationDelay: `${i * 1.3}s`,
                backdropFilter: on
                  ? 'brightness(2.1) saturate(1.25)'
                  : 'brightness(1.35) saturate(1.08)',
                WebkitBackdropFilter: on ? 'brightness(2.1)' : 'brightness(1.35)',
                maskImage:
                  'radial-gradient(ellipse at center, #000 22%, rgba(0,0,0,0.55) 45%, transparent 72%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse at center, #000 22%, rgba(0,0,0,0.55) 45%, transparent 72%)',
              }}
            />

            {/* o calor da lâmpada por cima, no timbre de quem toca */}
            <div
              className="pointer-events-none absolute transition-opacity duration-700"
              style={{
                left: `${cx100.x * 100}%`,
                top: `${cx100.y * 100}%`,
                width: `${cx100.l * 100}%`,
                height: `${cx100.a * 100}%`,
                opacity: on ? 0.5 : 0,
                background:
                  'radial-gradient(ellipse at center, color-mix(in srgb, var(--timbre) 34%, transparent) 0%, transparent 68%)',
                mixBlendMode: 'screen',
              }}
            />

            {/* o rótulo só existe quando o objeto acende — no toque ele
                aparece junto, porque em tela sensível não há passar o mouse */}
            <span
              className="type-label pointer-events-none absolute -translate-x-1/2 whitespace-nowrap transition-opacity duration-300"
              style={{
                left: `${cx * 100}%`,
                top: `${cy * 100}%`,
                opacity: on ? 1 : 0,
                color: 'var(--timbre)',
                textShadow: '0 0 18px rgb(0 0 0 / 0.9)',
              }}
            >
              {livre ? o.nome : 'ainda não é seu'}
            </span>

            <button
              type="button"
              disabled={!livre}
              aria-label={o.nome}
              onMouseEnter={() => setAceso(o.id)}
              onMouseLeave={() => setAceso((v) => (v === o.id ? null : v))}
              onFocus={() => setAceso(o.id)}
              onBlur={() => setAceso((v) => (v === o.id ? null : v))}
              onClick={() => livre && navegar(o.para)}
              className="absolute inset-0 disabled:cursor-not-allowed"
              style={{ clipPath: clipPath(naT) }}
            />
          </div>
        )
      })}
    </div>
  )
}

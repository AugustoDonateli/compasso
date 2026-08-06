import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  centro,
  clipPath,
  OBJETOS_DESKTOP,
  OBJETOS_MOBILE,
  type ObjetoDoQuarto,
} from '../../content/quarto'
import { bancada } from '../../content/estudio'
import { instrumentoSalvo } from '../../design/timbre'
import { getProgress } from '../../progress'

/* O quarto interativo.

   COMO O BRILHO FUNCIONA, já que essa foi a primeira dúvida do Augusto: não
   são duas imagens sobrepostas. IA generativa não devolve o mesmo quarto duas
   vezes com só a luz mudada — seriam dois quartos parecidos e tudo escorrega
   no cruzamento.

   É a MESMA foto, uma vez só, recortada em silhueta com `clip-path` e
   clareada. Como a camada recortada tem exatamente o tamanho da foto de baixo,
   ela encaixa pixel a pixel. Sete silhuetas, uma imagem, e o halo pode usar o
   timbre do instrumento de quem está tocando.

   E `clip-path` também recorta o clique, então a área sensível é a silhueta do
   objeto, não um retângulo em volta dele. */

interface Props {
  foto: string
  retrato: boolean
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0908]">
      {/* a foto, sangrando na tela inteira */}
      <img
        src={foto}
        alt="Um quarto de quem toca música: bateria, guitarra na parede, toca-discos, fone na cama, caderno de música na mesa e um pedal no chão. Cada objeto abre uma ferramenta."
        className="h-screen w-full object-cover"
      />

      {/* o resto do quarto escurece quando um objeto acende */}
      <div
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-500"
        style={{ opacity: aceso ? 0.55 : 0 }}
      />

      {visiveis.map((o) => {
        const on = aceso === o.id
        const livre = disponivel(o)
        const [cx, cy] = centro(o.forma)
        return (
          <div key={o.id}>
            {/* a mesma foto, recortada na silhueta e clareada */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-500"
              style={{ clipPath: clipPath(o.forma), opacity: on ? 1 : livre ? 0.22 : 0 }}
            >
              <img
                src={foto}
                alt=""
                aria-hidden
                className="h-screen w-full object-cover"
                style={{
                  filter: on
                    ? 'brightness(1.75) saturate(1.15)'
                    : 'brightness(1.25) saturate(1.05)',
                }}
              />
            </div>

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
              style={{ clipPath: clipPath(o.forma) }}
            />
          </div>
        )
      })}
    </div>
  )
}

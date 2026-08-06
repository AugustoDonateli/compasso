import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Calibrador } from '../quarto/Calibrador'
import { Quarto } from '../quarto/Quarto'

/* ┃o quarto┃ O menu do Compasso.

   Uma foto de um quarto de quem toca. Cada objeto é uma ferramenta. Passa o
   mouse na bateria, ela acende; clica, cai no groove.

   `?calibrar` abre o modo de contorno, que é como as silhuetas dos objetos
   são desenhadas em cima da própria foto em vez de chutadas no código. */

/* WebP em vários tamanhos, e o navegador escolhe.
   O 4K bruto tem 5,7 MB de PNG — mandar isso pro celular de alguém seria
   entregar uma tela preta por dez segundos. Em WebP, a mesma imagem em
   resolução cheia dá 339 KB, e quem está num aparelho menor recebe 94 KB. */
/* Sem candidato de 900px aqui de propósito. A foto cobre a tela inteira,
   então numa janela de 1280px o navegador escolhia o arquivo de 900 e
   esticava — imagem amassada pra economizar 40 KB que ninguém pediu.
   Numa imagem de fundo em tela cheia, o menor candidato tem que ser grande
   o bastante pra tela mais comum, senão a economia vira defeito visível. */
const DESKTOP = {
  padrao: '/assets/img/quarto-desktop-1920.webp',
  conjunto:
    '/assets/img/quarto-desktop-1440.webp 1440w, /assets/img/quarto-desktop-1920.webp 1920w, /assets/img/quarto-desktop-2560.webp 2560w',
}
const MOBILE = {
  padrao: '/assets/img/quarto-mobile-1400.webp',
  conjunto:
    '/assets/img/quarto-mobile-900.webp 900w, /assets/img/quarto-mobile-1400.webp 1400w, /assets/img/quarto-mobile-2294.webp 2294w',
}

/** Qual foto usar. Não é só largura: a composição em pé é OUTRA foto, com
 *  os objetos empilhados, porque sete objetos legíveis num retrato de 375px
 *  não existem cortando a paisagem. */
function useRetrato(): boolean {
  const [retrato, setRetrato] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < window.innerHeight,
  )
  useEffect(() => {
    const medir = () => setRetrato(window.innerWidth < window.innerHeight)
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])
  return retrato
}

export function QuartoPage() {
  const [params] = useSearchParams()
  const retrato = useRetrato()
  const foto = retrato ? MOBILE : DESKTOP

  if (params.has('calibrar')) return <Calibrador foto={foto.padrao} />
  return <Quarto foto={foto} retrato={retrato} />
}

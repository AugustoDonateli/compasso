import type { TrilhaInstrumento } from './trilha'

/** O QUARTO — o menu do Compasso.
 *
 *  Ideia do Augusto, e a melhor que o site teve: em vez de uma barra com oito
 *  palavras do mesmo tamanho, o menu é a foto de um quarto de quem toca. Cada
 *  ferramenta é um OBJETO. Você passa o mouse na bateria, ela acende, clica e
 *  cai no groove.
 *
 *  Por que funciona: memória espacial ganha de lista. Você lembra que a
 *  bateria fica no canto direito; você não lembra que "groove" é o sétimo item
 *  de um menu.
 *
 *  A LUZ ESTÁ NO LUGAR "ERRADO" DE PROPÓSITO. Na foto, quem está iluminado é a
 *  cama e o abajur — o que não clica. Os instrumentos estão na penumbra. Em vez
 *  de clarear a foto (o que a transformaria em render de catálogo, que é
 *  exatamente a cara de IA que estamos evitando), os objetos ACENDEM SOZINHOS,
 *  fraco e devagar, em repouso. Você entra numa penumbra onde sete coisas
 *  respiram. O escuro virou vantagem. */

export interface ObjetoDoQuarto {
  id: string
  /** o que aparece quando o objeto acende */
  nome: string
  para: string
  /** silhueta em coordenadas NORMALIZADAS (0..1) sobre a imagem.
   *  Normalizada porque a mesma silhueta tem que servir pra qualquer
   *  resolução — e a imagem ainda vai ser regerada maior. */
  forma: Array<[number, number]>
  /** peça da bancada que destrava este objeto. Sem isso, sempre disponível. */
  peca?: string
  /** só faz sentido pra quem toca isto */
  so?: TrilhaInstrumento[]
}

/** A caixa que envolve a silhueta, com folga.
 *
 *  É ELA que recebe a luz, não a silhueta. Clarear exatamente o contorno
 *  produz uma borda dura que entrega o truque na hora — luz de verdade não
 *  tem contorno, ela vaza. A silhueta continua servindo pro clique, que
 *  precisa ser preciso; a luz usa a caixa com folga e desbota nas pontas. */
export function caixaDe(
  forma: Array<[number, number]>,
  folga = 0.45,
): { x: number; y: number; l: number; a: number } {
  const xs = forma.map((p) => p[0])
  const ys = forma.map((p) => p[1])
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const y0 = Math.min(...ys)
  const y1 = Math.max(...ys)
  const l = x1 - x0
  const a = y1 - y0
  return { x: x0 - l * folga, y: y0 - a * folga, l: l * (1 + folga * 2), a: a * (1 + folga * 2) }
}

/** O ponto onde o rótulo do objeto aparece: o centro da silhueta. */
export function centro(forma: Array<[number, number]>): [number, number] {
  const n = forma.length
  const soma = forma.reduce<[number, number]>((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0])
  return [soma[0] / n, soma[1] / n]
}

/** `polygon()` do CSS a partir da silhueta normalizada. */
export function clipPath(forma: Array<[number, number]>): string {
  return `polygon(${forma.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(', ')})`
}

/** Converte coordenada da FOTO em coordenada da TELA.
 *
 *  A foto cobre a tela com `object-cover`, que corta as bordas pra preencher.
 *  Numa janela mais quadrada que a foto, sobra imagem fora da tela dos dois
 *  lados. Então "50% da foto" não é "50% da tela" — e sem esta conta a área
 *  de clique da bateria fica em cima do tapete em qualquer monitor que não
 *  seja exatamente da proporção da imagem.
 *
 *  object-cover escala pelo maior fator e centraliza; é isso que a conta
 *  desfaz. */
export function paraTela(
  forma: Array<[number, number]>,
  caixa: { largura: number; altura: number },
  foto: { largura: number; altura: number },
): Array<[number, number]> {
  if (!caixa.largura || !caixa.altura) return forma
  const escala = Math.max(caixa.largura / foto.largura, caixa.altura / foto.altura)
  const vistaL = foto.largura * escala
  const vistaA = foto.altura * escala
  const sobraX = (caixa.largura - vistaL) / 2
  const sobraY = (caixa.altura - vistaA) / 2
  return forma.map(([x, y]) => [
    (sobraX + x * vistaL) / caixa.largura,
    (sobraY + y * vistaA) / caixa.altura,
  ])
}

/* As silhuetas nascem vazias e são preenchidas pelo modo de calibração
   (/quarto?calibrar): clicar em volta do objeto na própria foto e copiar o
   resultado. Chutar coordenada em cima de uma foto é o caminho mais rápido
   pra área de clique que não bate com o que se vê. */

/** Contornado pelo Augusto no calibrador, sobre a foto de desktop.
 *
 *  Os quatro últimos vieram com o nome trocado: ele contornou na ordem dele
 *  (caderno, vinil, foto, fone) e o calibrador rotulou pela ordem DELE. Cada
 *  forma foi conferida contra a posição real na foto antes de entrar aqui —
 *  a bateria vai de x 0,58 a 1,00, o caderno de 0,13 a 0,41, e por aí. */
export const OBJETOS_DESKTOP: ObjetoDoQuarto[] = [
  {
    id: 'bateria',
    nome: 'groove machine',
    para: '/groove',
    peca: 'groove',
    forma: [[0.6181, 0.7471], [0.6055, 0.7726], [0.5835, 0.7716], [0.5852, 0.7549], [0.5934, 0.7392], [0.6039, 0.7236], [0.6148, 0.7089], [0.6258, 0.6922], [0.6352, 0.6745], [0.6429, 0.6579], [0.6418, 0.5843], [0.6429, 0.551], [0.6429, 0.5206], [0.644, 0.4794], [0.644, 0.449], [0.6423, 0.4334], [0.6313, 0.4383], [0.6198, 0.4441], [0.6143, 0.4334], [0.617, 0.4137], [0.6506, 0.3981], [0.6725, 0.3892], [0.6423, 0.3598], [0.6346, 0.3422], [0.6418, 0.3216], [0.6528, 0.3147], [0.667, 0.3147], [0.6791, 0.3167], [0.6929, 0.3226], [0.6989, 0.3226], [0.7055, 0.3186], [0.7148, 0.3226], [0.7209, 0.3333], [0.7324, 0.3383], [0.7462, 0.3412], [0.7539, 0.35], [0.7621, 0.3588], [0.7687, 0.3667], [0.7736, 0.3775], [0.7731, 0.3912], [0.7665, 0.4], [0.7561, 0.4], [0.7346, 0.401], [0.7225, 0.401], [0.7143, 0.401], [0.7055, 0.4069], [0.6951, 0.4108], [0.6868, 0.4186], [0.678, 0.4265], [0.6736, 0.4559], [0.6791, 0.4686], [0.6901, 0.4657], [0.6978, 0.4647], [0.717, 0.4657], [0.7313, 0.4647], [0.7401, 0.4647], [0.7467, 0.4579], [0.7561, 0.452], [0.7681, 0.449], [0.7879, 0.452], [0.8033, 0.4559], [0.822, 0.4608], [0.8368, 0.4677], [0.8434, 0.4843], [0.8495, 0.4961], [0.8643, 0.501], [0.878, 0.5039], [0.894, 0.5069], [0.9115, 0.5137], [0.9236, 0.5128], [0.933, 0.502], [0.9324, 0.4785], [0.9297, 0.4559], [0.9165, 0.4441], [0.9039, 0.4363], [0.8984, 0.4167], [0.8775, 0.4147], [0.8555, 0.4098], [0.8407, 0.4049], [0.8368, 0.3902], [0.8511, 0.3784], [0.8775, 0.3706], [0.8923, 0.3637], [0.8973, 0.351], [0.9, 0.3373], [0.9154, 0.3304], [0.9286, 0.3314], [0.9357, 0.3432], [0.9429, 0.351], [0.9544, 0.3549], [0.9676, 0.3559], [0.9775, 0.3598], [0.9857, 0.3677], [0.9962, 0.3834], [0.9923, 0.3922], [0.9846, 0.3961], [0.9736, 0.3971], [0.9544, 0.402], [0.9407, 0.4049], [0.9346, 0.4088], [0.9374, 0.4186], [0.9511, 0.4235], [0.961, 0.4245], [0.9698, 0.4363], [0.9703, 0.452], [0.9676, 0.4853], [0.9665, 0.5098], [0.9632, 0.5706], [0.9654, 0.5912], [0.9714, 0.6187], [0.9769, 0.6422], [0.9835, 0.6638], [0.989, 0.6883], [0.9923, 0.7089], [0.994, 0.7206], [0.9962, 0.7491], [0.9995, 0.7696], [0.9989, 0.7902], [0.9984, 0.8118], [0.9973, 0.8285], [0.9929, 0.853], [0.9918, 0.8687], [0.9896, 0.8814], [0.983, 0.8814], [0.972, 0.8902], [0.961, 0.9069], [0.9566, 0.9285], [0.9511, 0.9598], [0.9412, 0.9716], [0.9319, 0.9667], [0.9313, 0.9393], [0.9308, 0.9255], [0.9176, 0.9157], [0.9017, 0.903], [0.8934, 0.8951], [0.8736, 0.904], [0.8615, 0.9079], [0.8511, 0.9157], [0.8319, 0.9167], [0.8258, 0.8951], [0.828, 0.8755], [0.8368, 0.8569], [0.8495, 0.8481], [0.8615, 0.8402], [0.8813, 0.8167], [0.8962, 0.802], [0.9165, 0.7736], [0.9165, 0.7402], [0.9209, 0.702], [0.9231, 0.6579], [0.9308, 0.6236], [0.9335, 0.5824], [0.9253, 0.5951], [0.917, 0.6206], [0.9072, 0.6451], [0.8901, 0.6441], [0.8736, 0.6363], [0.8654, 0.6343], [0.8599, 0.6638], [0.8637, 0.701], [0.8659, 0.7275], [0.8703, 0.7765], [0.8736, 0.7961], [0.8698, 0.8206], [0.8511, 0.8334], [0.8352, 0.8344], [0.8214, 0.8334], [0.8132, 0.8236], [0.8247, 0.7942], [0.8258, 0.7647], [0.8335, 0.7392], [0.833, 0.6873], [0.833, 0.649], [0.8302, 0.6294], [0.8143, 0.6147], [0.8006, 0.6089], [0.7824, 0.6049], [0.7753, 0.6069], [0.7786, 0.6167], [0.7852, 0.6245], [0.7945, 0.6549], [0.8006, 0.6755], [0.8071, 0.7157], [0.8088, 0.7353], [0.8099, 0.754], [0.8066, 0.7853], [0.8, 0.8167], [0.7956, 0.8373], [0.7841, 0.853], [0.7676, 0.8598], [0.7566, 0.8618], [0.7522, 0.8922], [0.7484, 0.901], [0.7396, 0.9098], [0.7313, 0.9118], [0.7198, 0.8991], [0.7236, 0.8804], [0.7253, 0.8647], [0.711, 0.8687], [0.6929, 0.8696], [0.6802, 0.8677], [0.6648, 0.8589], [0.6632, 0.8451], [0.6555, 0.8402], [0.6451, 0.8373], [0.6302, 0.8285], [0.6313, 0.8157], [0.6346, 0.7853], [0.6335, 0.7647], [0.6341, 0.7481], [0.6313, 0.7402], [0.6247, 0.7422]],
  },
  {
    id: 'guitarra',
    nome: 'mapa das notas',
    para: '/braco',
    peca: 'mapa',
    so: ['guitarra', 'violao', 'baixo', 'violino'],
    forma: [[0.4907, 0.0275], [0.5006, 0.0255], [0.5077, 0.0255], [0.5115, 0.0324], [0.5121, 0.05], [0.5099, 0.0637], [0.5099, 0.0784], [0.5143, 0.0863], [0.5181, 0.098], [0.5181, 0.102], [0.5082, 0.1186], [0.5066, 0.1333], [0.5082, 0.1579], [0.5088, 0.1853], [0.5082, 0.2118], [0.5093, 0.2422], [0.5082, 0.2628], [0.5071, 0.2833], [0.5104, 0.2814], [0.5115, 0.2745], [0.5148, 0.2696], [0.5214, 0.2677], [0.5297, 0.2735], [0.533, 0.2892], [0.5324, 0.3069], [0.5308, 0.3284], [0.5357, 0.3686], [0.5374, 0.3853], [0.5374, 0.4147], [0.5297, 0.4285], [0.5187, 0.4402], [0.5093, 0.4451], [0.5011, 0.4461], [0.4896, 0.4481], [0.4769, 0.4461], [0.4714, 0.4441], [0.4648, 0.4324], [0.4577, 0.4196], [0.4571, 0.3971], [0.4582, 0.3716], [0.4643, 0.3481], [0.467, 0.3275], [0.4621, 0.3039], [0.4582, 0.2784], [0.4588, 0.253], [0.4654, 0.2314], [0.4753, 0.2245], [0.4813, 0.2373], [0.4824, 0.253], [0.4863, 0.2618], [0.4868, 0.2412], [0.4879, 0.2079], [0.4874, 0.1726], [0.4879, 0.1412], [0.4863, 0.1245], [0.4797, 0.1128], [0.4808, 0.0647]],
  },
  {
    id: 'pedal',
    nome: 'afinador',
    para: '/afinador',
    peca: 'afinador',
    forma: [[0.5632, 0.902], [0.5692, 0.9157], [0.578, 0.9255], [0.5923, 0.9373], [0.6044, 0.9422], [0.6165, 0.9393], [0.628, 0.9334], [0.6341, 0.9255], [0.6418, 0.9147], [0.6451, 0.903], [0.6429, 0.8824], [0.6363, 0.8598], [0.6291, 0.8461], [0.6154, 0.8383], [0.6011, 0.8344], [0.5923, 0.8422], [0.5835, 0.854], [0.5758, 0.8647], [0.567, 0.8716], [0.5621, 0.8844]],
  },
  {
    id: 'caderno',
    nome: 'sua trilha',
    para: '/trilha',
    forma: [[0.1379, 0.7549], [0.1577, 0.751], [0.1758, 0.7481], [0.1918, 0.7432], [0.2066, 0.7383], [0.2187, 0.7343], [0.2308, 0.7314], [0.2445, 0.7314], [0.283, 0.7236], [0.3055, 0.7187], [0.3214, 0.7187], [0.3445, 0.7412], [0.3725, 0.7765], [0.3962, 0.7951], [0.4077, 0.8118], [0.4033, 0.8275], [0.3775, 0.8353], [0.3418, 0.8471], [0.2973, 0.8559], [0.2412, 0.8736], [0.2099, 0.8853], [0.1962, 0.8873], [0.1852, 0.8696], [0.1747, 0.8481], [0.156, 0.8196], [0.1363, 0.7843], [0.128, 0.7716]],
  },
  {
    id: 'vitrola',
    nome: 'desmontador',
    para: '/desmontador',
    peca: 'desmontador',
    forma: [[0.3978, 0.5441], [0.428, 0.5392], [0.4648, 0.5343], [0.478, 0.5373], [0.4918, 0.5461], [0.5082, 0.5618], [0.5181, 0.5785], [0.5148, 0.5922], [0.4835, 0.602], [0.4473, 0.6039], [0.4176, 0.6118], [0.4, 0.599], [0.389, 0.5883], [0.3813, 0.5775], [0.3896, 0.5647]],
  },
  {
    id: 'fotos',
    nome: 'a semana',
    para: '/ranking',
    peca: 'ranking',
    forma: [[0.1907, 0.1706], [0.1885, 0.1265], [0.1918, 0.0353], [0.2115, 0.0226], [0.2445, 0.0363], [0.2621, 0.0422], [0.2819, 0.0392], [0.2945, 0.0275], [0.3159, 0.0441], [0.3198, 0.0686], [0.3209, 0.0882], [0.3291, 0.0922], [0.3396, 0.0941], [0.3445, 0.1108], [0.3434, 0.1353], [0.3451, 0.1667], [0.3528, 0.1814], [0.3604, 0.1882], [0.3643, 0.2128], [0.3687, 0.2853], [0.367, 0.3412], [0.3467, 0.3324], [0.3209, 0.3324], [0.3022, 0.3284], [0.2879, 0.3255], [0.2874, 0.3059], [0.2797, 0.2981], [0.2714, 0.3069], [0.2753, 0.3333], [0.2753, 0.3647], [0.2714, 0.3794], [0.2555, 0.3843], [0.2401, 0.3834], [0.2242, 0.3784], [0.2225, 0.3608], [0.2231, 0.3294], [0.2247, 0.301], [0.2352, 0.2843], [0.2335, 0.2696], [0.2093, 0.2775], [0.1934, 0.2726], [0.1874, 0.25], [0.1874, 0.2206]],
  },
  {
    id: 'fone',
    nome: 'treino de ouvido',
    para: '/ouvido',
    peca: 'ouvido',
    forma: [[0.2247, 0.6589], [0.2335, 0.6481], [0.2412, 0.6373], [0.2456, 0.6245], [0.256, 0.6187], [0.2714, 0.6196], [0.2786, 0.6265], [0.2813, 0.6383], [0.2852, 0.6236], [0.2929, 0.6147], [0.3049, 0.6108], [0.3165, 0.6275], [0.3192, 0.6549], [0.3154, 0.6794], [0.3093, 0.6971], [0.2929, 0.701], [0.272, 0.7], [0.2566, 0.701], [0.2423, 0.6991], [0.2313, 0.6941], [0.2247, 0.6814]],
  },
]

export const OBJETOS_MOBILE: ObjetoDoQuarto[] = []

/** O catálogo do que cada objeto significa. Separado das silhuetas de
 *  propósito: isto aqui é decisão de produto e não muda quando a foto muda. */
export const PAPEIS: Array<Omit<ObjetoDoQuarto, 'forma'>> = [
  { id: 'bateria', nome: 'groove machine', para: '/groove', peca: 'groove' },
  {
    id: 'guitarra',
    nome: 'mapa das notas',
    para: '/braco',
    peca: 'mapa',
    so: ['guitarra', 'violao', 'baixo', 'violino'],
  },
  { id: 'pedal', nome: 'afinador', para: '/afinador', peca: 'afinador' },
  { id: 'vitrola', nome: 'desmontador', para: '/desmontador', peca: 'desmontador' },
  { id: 'fone', nome: 'treino de ouvido', para: '/ouvido', peca: 'ouvido' },
  { id: 'caderno', nome: 'sua trilha', para: '/trilha' },
  { id: 'fotos', nome: 'a semana', para: '/ranking', peca: 'ranking' },
]

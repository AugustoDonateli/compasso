import type { ChordQuality } from '../theory/chords'
import type { PitchClass } from '../theory/notes'
import type { DrumPiece, InstrumentSoundId } from '../audio/instruments'

/** O Desmontador — músicas famosas destrinchadas.
 *
 *  A resposta direta à dor nº2 do site: "estudei a apostila, mas na hora de
 *  tocar não muda nada". Aqui a teoria aparece dentro de uma música que a
 *  pessoa reconhece, junto com a história de como ela nasceu e o que cada
 *  instrumento está fazendo.
 *
 *  SOBRE DIREITOS: não há letra, melodia nem áudio de gravação nenhuma.
 *  Sequência de acordes é procedimento harmônico, não obra protegida — é
 *  exatamente por isso que tantas músicas diferentes usam a mesma. Citar
 *  título, artista e a história documentada é referência factual. Os acordes
 *  são tocados com os samples do próprio site.
 *
 *  E TUDO AQUI É PESQUISADO. História de composição não se chuta: um site
 *  que ensina não pode inventar fato. */

export interface Trecho {
  /** grau na tonalidade: 1 = I, 6 = vi */
  grau: number
  tempos: number
  /** quando o acorde não vem do campo harmônico, o que ele é de verdade */
  emprestado?: { qualidade: ChordQuality; porque: string }
}

export interface Camada {
  instrumento: string
  /** o que esse instrumento faz nessa música */
  faz: string
  /** qual pista tocável isso é, quando é uma delas. As três pistas podem ser
   *  ligadas e desligadas: é assim que "o que cada instrumento faz" deixa de
   *  ser parágrafo e vira coisa que você OUVE. */
  pista?: 'harmonia' | 'baixo' | 'bateria'
}

/** As 16 semicolcheias de um compasso 4/4, iguais às da Groove Machine. */
export const PASSOS = 16
export type Levada = Record<DrumPiece, boolean[]>

function pista(...ativos: number[]): boolean[] {
  const a = new Array<boolean>(PASSOS).fill(false)
  ativos.forEach((i) => {
    a[i] = true
  })
  return a
}

export interface Musica {
  id: string
  titulo: string
  artista: string
  ano: number
  /** de que gaveta ela é, pra pessoa se situar */
  genero: string
  tonica: PitchClass
  modo: 'maior' | 'menor'
  bpm: number
  progressao: Trecho[]
  /** quem carrega a harmonia — o Linkin Park abre no piano, não na guitarra */
  som: InstrumentSoundId
  /** em quais semicolcheias do compasso a harmonia ataca. É o que faltava:
   *  sem levada, quatro acordes viram quatro blocos de som e a música some. */
  levada: number[]
  /** a bateria, aproximação honesta pro kit de quatro peças */
  bateria: Levada
  /** o que procurar no YouTube pra ouvir o original. Busca em vez de link
   *  direto de propósito: id de vídeo quebra, busca não. */
  busca?: string
  /** como a música nasceu — fato documentado, nunca chute */
  historia: string
  /** o truque de teoria que faz ela funcionar */
  teoria: string
  /** como os instrumentos se combinam */
  camadas: Camada[]
  /** o que você leva pro seu instrumento */
  licao: string
}

export const GRAUS_MAIOR: ChordQuality[] = [
  'maior',
  'menor',
  'menor',
  'maior',
  'maior',
  'menor',
  'diminuto',
]
export const GRAUS_MENOR: ChordQuality[] = [
  'menor',
  'diminuto',
  'maior',
  'menor',
  'menor',
  'maior',
  'maior',
]

export const INTERVALO_DO_GRAU_MAIOR = [0, 2, 4, 5, 7, 9, 11]
export const INTERVALO_DO_GRAU_MENOR = [0, 2, 3, 5, 7, 8, 10]

export const MUSICAS: Musica[] = [
  {
    id: 'creep',
    titulo: 'Creep',
    artista: 'Radiohead',
    ano: 1992,
    genero: 'rock alternativo',
    tonica: 7, // sol maior
    modo: 'maior',
    bpm: 92,
    progressao: [
      { grau: 1, tempos: 4 },
      {
        grau: 3,
        tempos: 4,
        emprestado: {
          qualidade: 'maior',
          porque: 'o III deveria ser menor nessa tonalidade — vir maior é o que causa o arrepio',
        },
      },
      { grau: 4, tempos: 4 },
      {
        grau: 4,
        tempos: 4,
        emprestado: {
          qualidade: 'menor',
          porque: 'o mesmo IV, agora menor: emprestado da tonalidade menor, é o desabamento',
        },
      },
    ],
    som: 'guitarra',
    // lenta e sustentada: o acorde entra e fica. Duas batidas por compasso.
    levada: [0, 8],
    bateria: {
      chimbal: pista(0, 2, 4, 6, 8, 10, 12, 14),
      caixa: pista(4, 12),
      tom: pista(),
      bumbo: pista(0, 8),
    },
    historia:
      'O guitarrista Jonny Greenwood ODIAVA a música — achava "meio banguela" e disse que o adolescente enjoado dentro dele quis fazer o oposto de uma balada. Nos ensaios ele passou a estourar aquelas pancadas de guitarra distorcida antes do refrão, tentando estragar a gravação. Não estragou: virou o momento mais reconhecível da música. É o exemplo perfeito de que sabotagem e acidente fazem parte do processo criativo.',
    teoria:
      'A sequência sai da tonalidade duas vezes, de propósito. O segundo acorde deveria ser menor e vem MAIOR, criando um brilho estranho, quase bonito demais. Depois o quarto acorde toca duas vezes: primeiro maior, depois MENOR — a mesma nota-base, o clima virando do avesso. É sorrir e desabar em quatro acordes, e é por isso que ela nunca soa resolvida: toda volta recomeça o desconforto.',
    camadas: [
      {
        instrumento: 'guitarra base',
        faz: 'sustenta os quatro acordes limpos e lentos, quase parados',
        pista: 'harmonia',
      },
      {
        instrumento: 'guitarra de ataque',
        faz: 'fica calada a música inteira e explode em três pancadas distorcidas antes do refrão — o "sabotador" que virou assinatura',
      },
      {
        instrumento: 'baixo',
        faz: 'anda com a fundamental de cada acorde, sem enfeite, dando o chão',
        pista: 'baixo',
      },
      {
        instrumento: 'bateria',
        faz: 'quase nada no verso, entra inteira no refrão — o contraste é o arranjo',
        pista: 'bateria',
      },
    ],
    licao:
      'Trocar um acorde maior pelo menor de mesmo nome muda a emoção sem mudar a harmonia. Testa isso: toca a sequência com o quarto acorde maior e depois menor, e sente a diferença.',
  },
  {
    id: 'teen-spirit',
    titulo: 'Smells Like Teen Spirit',
    artista: 'Nirvana',
    ano: 1991,
    genero: 'grunge',
    tonica: 5, // fá menor
    modo: 'menor',
    bpm: 117,
    progressao: [
      { grau: 1, tempos: 4 },
      { grau: 4, tempos: 4 },
      { grau: 3, tempos: 4 },
      { grau: 6, tempos: 4 },
    ],
    som: 'guitarra',
    // power chord seco em cada tempo — é o que dá o peso
    levada: [0, 4, 8, 12],
    bateria: {
      chimbal: pista(0, 2, 4, 6, 8, 10, 12, 14),
      caixa: pista(4, 12),
      tom: pista(),
      bumbo: pista(0, 7, 8),
    },
    historia:
      'Kurt Cobain assumiu que estava tentando escrever uma música no estilo do Pixies — especificamente copiando o jeito deles de alternar entre baixinho e explosivo. Quando levou pra banda, ele tinha só o riff principal e a melodia do refrão; o resto nasceu ensaiando junto. A música que definiu uma geração começou como tentativa declarada de imitar outra banda.',
    teoria:
      'São quatro acordes que se repetem do começo ao fim, sem mudar NADA — nem no verso, nem no refrão. O que muda é só a intensidade. Isso derruba a ideia de que música boa precisa de harmonia complicada: aqui a mesma sequência sustenta a música inteira, e quem cria o drama é o arranjo.',
    camadas: [
      {
        instrumento: 'guitarra',
        faz: 'no verso toca quase abafada e limpa; no refrão, os mesmos acordes com distorção total. Mesmas notas, mundos diferentes',
        pista: 'harmonia',
      },
      {
        instrumento: 'baixo',
        faz: 'segura a fundamental e no verso fica praticamente sozinho com a bateria — desliga a harmonia aqui em cima e você ouve exatamente esse verso',
        pista: 'baixo',
      },
      {
        instrumento: 'bateria',
        faz: 'esse é o motor: chimbal fechado e contido no verso, prato aberto e tudo no refrão. Sem essa mudança, a música não existe',
        pista: 'bateria',
      },
    ],
    licao:
      'Dinâmica vale mais que harmonia complicada. Pega quatro acordes quaisquer e toca o mesmo trecho duas vezes: uma quase sussurrando, outra com tudo. Já é música.',
  },
  {
    id: 'boys-dont-cry',
    titulo: "Boys Don't Cry",
    artista: 'The Cure',
    ano: 1979,
    genero: 'pós-punk',
    tonica: 9, // lá maior
    modo: 'maior',
    bpm: 148,
    progressao: [
      { grau: 1, tempos: 4 },
      { grau: 2, tempos: 4 },
      { grau: 3, tempos: 4 },
      { grau: 4, tempos: 4 },
    ],
    som: 'guitarra',
    // arpejo tilintante em colcheias: é daí que vem o brilho
    levada: [0, 2, 4, 6, 8, 10, 12, 14],
    bateria: {
      chimbal: pista(0, 2, 4, 6, 8, 10, 12, 14),
      caixa: pista(4, 12),
      tom: pista(),
      bumbo: pista(0, 8, 10),
    },
    historia:
      'Robert Smith explicou que a música fala do que era ser um garoto inglês na época: "você é encorajado a não demonstrar emoção nenhuma". A letra é sobre um cara que perdeu alguém e disfarça rindo — e a música, propositalmente, é alegre e saltitante. O contraste é o recado.',
    teoria:
      'A sequência simplesmente SOBE os graus da escala, um atrás do outro. É a coisa mais direta que existe em harmonia, e é justamente isso que dá a sensação de leveza e movimento pra frente. A tristeza está só na letra: a música sorri o tempo todo. Contraste entre harmonia e conteúdo é uma ferramenta de composição, não um acidente.',
    camadas: [
      {
        instrumento: 'guitarra',
        faz: 'som limpo e tilintante, tocando arpejos curtos em vez de acordes cheios — é isso que dá o brilho',
        pista: 'harmonia',
      },
      {
        instrumento: 'baixo',
        faz: 'melódico e ativo, quase uma segunda melodia em vez de só marcar a raiz',
        pista: 'baixo',
      },
      {
        instrumento: 'bateria',
        faz: 'rápida e seca, empurrando a música pra frente sem peso nenhum',
        pista: 'bateria',
      },
    ],
    licao:
      'Nem toda música triste precisa soar triste. Experimenta escrever algo pesado por cima de uma harmonia alegre — o desencontro cria uma força que a tristeza óbvia não tem.',
  },
  {
    id: 'in-the-end',
    titulo: 'In the End',
    artista: 'Linkin Park',
    ano: 2000,
    genero: 'nu metal',
    tonica: 4, // mi menor
    modo: 'menor',
    bpm: 105,
    progressao: [
      { grau: 1, tempos: 4 },
      { grau: 3, tempos: 4 },
      { grau: 7, tempos: 4 },
      { grau: 4, tempos: 4 },
    ],
    som: 'piano',
    levada: [0, 4, 8, 12],
    // levada de hip hop: bumbo adiantado, caixa firme no 2 e no 4
    bateria: {
      chimbal: pista(0, 2, 4, 6, 8, 10, 12, 14),
      caixa: pista(4, 12),
      tom: pista(),
      bumbo: pista(0, 6, 10),
    },
    historia:
      'Mike Shinoda escreveu o riff de piano, os versos rimados e o miolo da melodia numa única sessão sozinho, num espaço de ensaio ruim em West Hollywood. E tem uma ironia registrada: Chester Bennington não gostava da música e não queria nem que ela entrasse no disco. Virou uma das músicas de rock mais tocadas da história.',
    teoria:
      'O truque do nu metal está na divisão de tarefas: a mesma progressão de quatro acordes sustenta um verso RIMADO, que é quase percussão falada, e um refrão CANTADO e melódico. Uma harmonia, duas funções vocais completamente diferentes. E ela abre com piano num gênero definido por guitarra pesada — foi isso que quebrou a expectativa.',
    camadas: [
      {
        instrumento: 'piano',
        faz: 'o riff de abertura, que é o gancho da música inteira e volta como assinatura',
        pista: 'harmonia',
      },
      { instrumento: 'guitarra', faz: 'fica fora do verso e entra pesada no refrão, criando o degrau de intensidade' },
      {
        instrumento: 'baixo',
        faz: 'dobra a fundamental com a guitarra, engrossando em vez de fazer linha própria',
        pista: 'baixo',
      },
      {
        instrumento: 'bateria',
        faz: 'levada de hip hop no verso e rock no refrão — a costura entre os dois mundos passa por ela',
        pista: 'bateria',
      },
    ],
    licao:
      'A mesma harmonia aguenta funções diferentes por cima. Toca essa sequência e experimenta: primeiro falando o ritmo por cima, depois cantando uma melodia. É a mesma base.',
  },
  {
    id: 'eduardo-e-monica',
    titulo: 'Eduardo e Mônica',
    artista: 'Legião Urbana',
    ano: 1986,
    genero: 'rock nacional',
    tonica: 2, // ré maior
    modo: 'maior',
    bpm: 128,
    progressao: [
      { grau: 1, tempos: 4 },
      { grau: 5, tempos: 4 },
      { grau: 6, tempos: 4 },
      { grau: 4, tempos: 4 },
    ],
    som: 'violao',
    levada: [0, 4, 6, 10, 12, 14],
    bateria: {
      chimbal: pista(0, 2, 4, 6, 8, 10, 12, 14),
      caixa: pista(4, 12),
      tom: pista(),
      bumbo: pista(0, 8),
    },
    historia:
      'A Mônica da letra foi inspirada numa amiga de verdade do Renato Russo, a Leonice — as manias que aparecem na letra são dela. E tem um motivo curioso pra música existir: como diziam muito que o Legião era pessimista demais, o Renato quis fazer algo pra cima de propósito. Saiu uma das músicas mais queridas do rock brasileiro.',
    teoria:
      'Ela usa a sequência de quatro acordes mais comum da música pop ocidental — a mesma que sustenta um número absurdo de sucessos no mundo inteiro. A prova de que originalidade não está na harmonia: o que faz essa música ser inconfundível é a letra em forma de história, com nome, rotina e detalhe. Harmonia comum, narrativa única.',
    camadas: [
      {
        instrumento: 'guitarra',
        faz: 'acordes abertos e batida constante, sem solo — ela serve a narrativa',
        pista: 'harmonia',
      },
      {
        instrumento: 'baixo',
        faz: 'linha simples e bem colada no bumbo, sustentando sem chamar atenção',
        pista: 'baixo',
      },
      {
        instrumento: 'bateria',
        faz: 'levada direta que empurra a história pra frente sem virada complicada',
        pista: 'bateria',
      },
      { instrumento: 'voz', faz: 'quase falada em partes, priorizando que a história seja entendida' },
    ],
    licao:
      'Se essa sequência sustenta uma música tão amada, ela sustenta a sua. Pega esses quatro acordes e escreve uma letra que conte uma história com nome e detalhe.',
  },
  {
    id: 'blues-12',
    titulo: 'O blues de 12 compassos',
    artista: 'forma tradicional',
    ano: 1900,
    genero: 'blues',
    tonica: 9, // lá
    modo: 'maior',
    bpm: 84,
    progressao: [
      { grau: 1, tempos: 16 },
      { grau: 4, tempos: 8 },
      { grau: 1, tempos: 8 },
      { grau: 5, tempos: 4 },
      { grau: 4, tempos: 4 },
      { grau: 1, tempos: 8 },
    ],
    som: 'guitarra',
    /* O suingue de verdade é ternário — a semicolcheia é dividida em três, não
       em quatro. A grade de 16 passos não representa isso, então aqui fica a
       aproximação em tempos e o texto avisa. Fingir que é igual seria ensinar
       errado, que é pior que ensinar menos. */
    levada: [0, 4, 8, 12],
    bateria: {
      chimbal: pista(0, 3, 4, 7, 8, 11, 12, 15),
      caixa: pista(4, 12),
      tom: pista(),
      bumbo: pista(0, 8),
    },
    busca: '12 bar blues shuffle',
    historia:
      'Não tem autor: é forma tradicional, construída coletivamente e passada adiante por gerações de músicos. É a estrutura de onde saiu o rock and roll inteiro — e por ser um acordo tácito entre músicos, você entra numa roda de blues em qualquer lugar do mundo sem combinar nada antes e toca junto.',
    teoria:
      'Doze compassos, três acordes — o I, o IV e o V — numa ordem fixa que todo mundo conhece de cor. É a prova de que forma compartilhada gera liberdade em vez de limitar: como a harmonia é previsível, o improviso por cima pode ser totalmente livre.',
    camadas: [
      {
        instrumento: 'guitarra',
        faz: 'alterna entre acompanhar e solar, geralmente revezando com os outros',
        pista: 'harmonia',
      },
      {
        instrumento: 'baixo',
        faz: 'faz a linha andante que dá o balanço característico do estilo',
        pista: 'baixo',
      },
      {
        instrumento: 'bateria',
        faz: 'a levada com subdivisão desigual — as notas não são iguais, e é isso que dá o suingue. O que toca aqui é uma aproximação: o suingue de verdade divide o tempo em três, e a grade de 16 passos só divide em quatro',
        pista: 'bateria',
      },
    ],
    licao:
      'Decore essa forma e você tem passaporte pra tocar com desconhecidos. É o mais próximo de uma língua franca que existe na música popular.',
  },
]

export function pcDoGrau(m: Musica, grau: number): PitchClass {
  const tab = m.modo === 'maior' ? INTERVALO_DO_GRAU_MAIOR : INTERVALO_DO_GRAU_MENOR
  return ((((m.tonica + tab[grau - 1]) % 12) + 12) % 12) as PitchClass
}

/** Qualidade do acorde: a do campo harmônico, ou a emprestada quando a
 *  música sai da tonalidade de propósito (é aí que mora a mágica). */
export function qualidadeDoTrecho(m: Musica, t: Trecho): ChordQuality {
  if (t.emprestado) return t.emprestado.qualidade
  return (m.modo === 'maior' ? GRAUS_MAIOR : GRAUS_MENOR)[t.grau - 1]
}

export function qualidadeDoGrau(m: Musica, grau: number): ChordQuality {
  return (m.modo === 'maior' ? GRAUS_MAIOR : GRAUS_MENOR)[grau - 1]
}

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
export function romanoDoTrecho(m: Musica, t: Trecho): string {
  const q = qualidadeDoTrecho(m, t)
  const base = ROMANOS[t.grau - 1]
  if (q === 'menor') return base.toLowerCase()
  if (q === 'diminuto') return base.toLowerCase() + '°'
  return base
}

export function romano(m: Musica, grau: number): string {
  const q = qualidadeDoGrau(m, grau)
  const base = ROMANOS[grau - 1]
  if (q === 'menor') return base.toLowerCase()
  if (q === 'diminuto') return base.toLowerCase() + '°'
  return base
}

export function duracaoEmTempos(m: Musica): number {
  return m.progressao.reduce((soma, t) => soma + t.tempos, 0)
}

/** Onde ouvir o original. Busca em vez de link direto porque id de vídeo
 *  morre e busca não — e a pessoa precisa ouvir a gravação de verdade pra
 *  comparar com o que o site toca. Não dá pra ensinar uma música que a pessoa
 *  não consegue ouvir. */
export function linkDoOriginal(m: Musica): string {
  const termo = m.busca ?? `${m.artista} ${m.titulo}`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(termo)}`
}

/** A versão sem o truque: os acordes emprestados voltam pro que o campo
 *  harmônico mandaria.
 *
 *  É ISTO que nenhum vídeo faz. Um vídeo te CONTA que o III maior do Creep é
 *  o que causa o arrepio; aqui você desliga e escuta o arrepio ir embora. A
 *  lição da música mandava "toca com o quarto acorde maior e depois menor e
 *  sente a diferença" — mandar a pessoa experimentar sozinha, tendo um
 *  tocador na tela, era a própria falha da ferramenta. */
export function semOTruque(m: Musica): Trecho[] {
  return m.progressao.map(({ grau, tempos }) => ({ grau, tempos }))
}

export function temTruque(m: Musica): boolean {
  return m.progressao.some((t) => t.emprestado)
}

/** Troca um acorde da sequência. O que sai é uma progressão nova, tocável na
 *  hora: mexer e ouvir no mesmo gesto é a coisa toda. */
export function trocarAcorde(
  progressao: Trecho[],
  indice: number,
  grau: number,
  qualidade: ChordQuality,
  qualidadeNatural: ChordQuality,
): Trecho[] {
  return progressao.map((t, i) => {
    if (i !== indice) return t
    const base: Trecho = { grau, tempos: t.tempos }
    // só marca como "fora da tonalidade" quando realmente está fora
    return qualidade === qualidadeNatural
      ? base
      : { ...base, emprestado: { qualidade, porque: 'você trocou este acorde' } }
  })
}

export function trechoNoTempo(m: Musica, tempo: number): number {
  const total = duracaoEmTempos(m)
  let t = ((tempo % total) + total) % total
  for (let i = 0; i < m.progressao.length; i++) {
    if (t < m.progressao[i].tempos) return i
    t -= m.progressao[i].tempos
  }
  return 0
}

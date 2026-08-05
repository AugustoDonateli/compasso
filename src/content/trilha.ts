import type { PitchClass } from '../theory/notes'
import type { InstrumentSoundId } from '../audio/instruments'

/** Quem a pessoa É na trilha — diferente de qual SOM o site toca.
 *  Bateria não tem notas afinadas, então não existe como sampler de altura;
 *  mas existe como identidade de quem estuda. Nas lições de teoria que pedem
 *  nota, o baterista ouve piano. */
export type TrilhaInstrumento = InstrumentSoundId | 'bateria'

/** A trilha do Compasso — o caminho que responde "o que eu pratico hoje?".
 *
 *  REGRA DE FUTURO: conteúdo é DADO, não código. O motor (caminho, sessão, XP)
 *  não conhece nenhuma pergunta específica — só os tipos. Reordenar a trilha,
 *  reescrever um enunciado ou criar um galho novo é mexer só neste arquivo.
 *
 *  COMO ESCREVER UMA PERGUNTA BOA (regras da pesquisa, não opinião):
 *  1. Escreva as alternativas ERRADAS primeiro. Se você escreve a certa antes,
 *     as outras viram variações fracas dela e não ensinam nada.
 *  2. Cada alternativa errada deve ser um ENGANO REAL que gente comete. Assim o
 *     erro revela QUAL confusão a pessoa tem — e a explicação corrige aquilo.
 *  3. Três alternativas boas valem mais que quatro com uma de enchimento.
 *  4. A explicação é a aula. Ela é obrigatória e ensina, não só confirma. */

/* ---------- tipos de pergunta ---------- */

interface Base {
  id: string
  /** a aula que aparece depois de responder — obrigatória */
  explica: string
}

/** Múltipla escolha conceitual. */
export interface QEscolha extends Base {
  tipo: 'escolha'
  enunciado: string
  alternativas: string[]
  correta: number
}

/** Ouvir e identificar. */
export interface QOuvir extends Base {
  tipo: 'ouvir'
  enunciado: string
  midis: number[]
  junto: boolean
  alternativas: string[]
  correta: number
}

/** Montar clicando as notas. RECORDAÇÃO — o tipo que mais fixa. */
export interface QMontar extends Base {
  tipo: 'montar'
  enunciado: string
  alvo: PitchClass[]
  ordenado: boolean
}

/** Achar no braço. Ou uma nota em qualquer lugar, ou uma posição exata. */
export interface QAchar extends Base {
  tipo: 'achar'
  enunciado: string
  alvo: PitchClass
  /** quando presente, exige a corda/casa exata (ex.: "toque a 5ª corda solta") */
  posicao?: { corda: number; casa: number }
  tocarMidi?: number
}

/** Bater no tempo — mede precisão em milissegundos. */
export interface QTempo extends Base {
  tipo: 'tempo'
  enunciado: string
  bpm: number
  batidas: number
  toleranciaMs: number
}

export type Pergunta = QEscolha | QOuvir | QMontar | QAchar | QTempo

/* ---------- estrutura ---------- */

export interface Licao {
  id: string
  titulo: string
  /** Explicação ANTES das perguntas — usar com parcimônia.
   *
   *  A pesquisa dá uma resposta precisa, não um "sempre" ou "nunca":
   *  - Chutar antes (efeito de pré-teste) melhora a retenção MESMO errando,
   *    porque expõe a lacuna e faz a pessoa prestar muito mais atenção na
   *    correção. Vale pra fato simples: nome de corda, ordem das notas.
   *  - MAS quando o conceito tem muitas partes interligadas, tentar antes
   *    sobrecarrega a memória de trabalho e o aprendizado piora. Aí explicar
   *    primeiro é comprovadamente melhor.
   *
   *  Regra deste arquivo: só ponha abertura se a lição tiver 3+ ideias que
   *  dependem uma da outra. Se for fato solto, deixe a pessoa chutar. */
  abertura?: { titulo: string; texto: string }
  perguntas: Pergunta[]
}

export interface Unidade {
  id: string
  n: number
  titulo: string
  /** o guia da unidade: o que você sai sabendo, numa frase */
  guia: string
  /** vazio = teoria universal. Senão, só aparece pra quem toca esses instrumentos. */
  paraInstrumentos?: TrilhaInstrumento[]
  licoes: Licao[]
}

const C4 = 60
const CORDAS: TrilhaInstrumento[] = ['guitarra', 'violao']

/* ============================================================
   U0 — SEU INSTRUMENTO (guitarra e violão)
   Vem antes de qualquer teoria: sem saber o nome das cordas e
   sem afinar, nada mais faz sentido.
   ============================================================ */

const U0_CORDAS: Unidade = {
  id: 'seu-instrumento-cordas',
  n: 0,
  titulo: 'Seu instrumento',
  guia: 'Sair daqui sabendo o nome das seis cordas de cor, afinando sozinho e tirando sua primeira nota limpa.',
  paraInstrumentos: CORDAS,
  licoes: [
    {
      id: 'seis-cordas',
      titulo: 'As seis cordas',
      perguntas: [
        {
          id: 'u0l1q1',
          tipo: 'escolha',
          enunciado: 'Qual é a 1ª corda da guitarra?',
          // engano real: quase todo iniciante chuta a mais grossa
          alternativas: [
            'a mais grossa, o mi grave',
            'a mais fina, o mi agudo',
            'a do meio, o ré',
          ],
          correta: 1,
          explica:
            'A 1ª é a MAIS FINA — o mi agudo, a que fica mais perto do chão quando você toca. A numeração vai do fino pro grosso, então a mais grossa é a 6ª. Esse é o engano mais comum de quem começa, e ele atrapalha na hora de ler cifra e tablatura.',
        },
        {
          id: 'u0l1q2',
          tipo: 'escolha',
          enunciado: 'Da 6ª corda pra 1ª, quais são os nomes?',
          alternativas: [
            'mi · lá · ré · sol · si · mi',
            'mi · si · sol · ré · lá · mi',
            'lá · ré · sol · dó · mi · lá',
          ],
          correta: 0,
          explica:
            'Mi, lá, ré, sol, si, mi — da mais grossa pra mais fina. Repare que a primeira e a última são as duas mi, com duas oitavas de diferença. A segunda alternativa é a mesma sequência ao contrário: é o erro de quem conta a partir da corda errada.',
        },
        {
          id: 'u0l1q3',
          tipo: 'achar',
          enunciado: 'Toque a 5ª corda solta — a corda lá.',
          alvo: 9,
          posicao: { corda: 1, casa: 0 },
          explica:
            'Essa é a 5ª corda, o lá. Ela é a referência de afinação do mundo inteiro: o lá que dá 440 hertz é o parente dela algumas oitavas acima.',
        },
        {
          id: 'u0l1q4',
          tipo: 'escolha',
          enunciado: 'Por que saber o nome das cordas de cor importa tanto?',
          alternativas: [
            'só importa pra quem vai estudar música clássica',
            'porque sem isso você não afina nem lê cifra e tablatura direito',
            'porque é a primeira coisa que perguntam em audição',
          ],
          correta: 1,
          explica:
            'Sem os nomes na ponta da língua você trava em duas coisas que acontecem todo dia: afinar e seguir uma tablatura. Muita gente pula essa etapa e vai direto pros acordes — funciona no começo, e depois cobra caro.',
        },
      ],
    },
    {
      id: 'afinar',
      titulo: 'Afinar sozinho',
      // 3 ideias interligadas (tensão, direção da tarraxa, referência entre
      // cordas) — a pesquisa diz pra explicar antes nesse caso
      abertura: {
        titulo: 'Como uma corda muda de altura',
        texto:
          'Afinar é controlar tensão. Apertar a tarraxa estica a corda e o som sobe; afrouxar faz descer. Só isso já resolve metade — a outra metade é saber qual é a nota certa, e pra isso a própria guitarra serve de referência: a casa 5 de uma corda dá exatamente a nota da corda seguinte solta.',
      },
      perguntas: [
        {
          id: 'u0l2q1',
          tipo: 'escolha',
          enunciado: 'Você aperta a tarraxa e a corda fica mais tensa. O que acontece com o som?',
          alternativas: ['fica mais grave', 'fica mais agudo', 'não muda, só o volume'],
          correta: 1,
          explica:
            'Mais tensão, som mais agudo. Menos tensão, mais grave. É a mesma física do braço: apertar a corda numa casa encurta a parte que vibra e sobe o som.',
        },
        {
          id: 'u0l2q2',
          tipo: 'escolha',
          enunciado: 'Sua corda está acima da nota. Qual é o jeito certo de corrigir?',
          // engano real: gente desce direto até a nota e a afinação escorrega
          alternativas: [
            'descer devagar até parar exatamente na nota',
            'descer abaixo da nota e depois subir de volta até ela',
            'apertar até estourar e recomeçar',
          ],
          correta: 1,
          explica:
            'Sempre chegue na nota SUBINDO. Se você só desce até ela, a corda fica com folga na tarraxa e escorrega de volta em poucos minutos. Descer um pouco além e subir de volta deixa a afinação firme.',
        },
        {
          id: 'u0l2q3',
          tipo: 'escolha',
          enunciado:
            'Sem afinador: você toca a 6ª corda na casa 5 e compara com a 5ª solta. O que deveria acontecer?',
          alternativas: [
            'as duas devem soar exatamente igual',
            'a da casa 5 deve soar um pouco mais aguda',
            'nada, cordas diferentes nunca dão a mesma nota',
          ],
          correta: 0,
          explica:
            'Idênticas. A casa 5 de uma corda dá a mesma nota da corda seguinte solta — é assim que se afina de ouvido sem aparelho nenhum. A única exceção é entre a 3ª e a 2ª corda, onde a referência é a casa 4.',
        },
      ],
    },
    {
      id: 'primeira-nota',
      titulo: 'A primeira nota limpa',
      perguntas: [
        {
          id: 'u0l3q1',
          tipo: 'escolha',
          enunciado: 'Onde o dedo deve apertar pra nota sair limpa, sem trastejar?',
          // engano real: apertar em cima do traste ou no meio da casa
          alternativas: [
            'exatamente em cima do traste de metal',
            'no meio da casa, bem longe do traste',
            'logo atrás do traste, quase encostando nele',
          ],
          correta: 2,
          explica:
            'Logo ATRÁS do traste, quase encostando. Em cima do metal a nota abafa; longe demais no meio da casa você precisa de muita força e a nota sai chiada. Perto do traste é onde sai limpo com pouco esforço — se está doendo muito, provavelmente é posição, não falta de força.',
        },
        {
          id: 'u0l3q2',
          tipo: 'escolha',
          enunciado: 'Você desceu uma casa no braço. Quanto o som mudou?',
          alternativas: ['um semitom', 'um tom', 'uma oitava'],
          correta: 0,
          explica:
            'Uma casa é sempre um semitom — o menor passo da música. Duas casas fazem um tom. Essa régua vale em qualquer corda e em qualquer lugar do braço.',
        },
        {
          id: 'u0l3q3',
          tipo: 'achar',
          enunciado: 'Toque um lá em qualquer lugar do braço.',
          alvo: 9,
          explica:
            'A mesma nota mora em vários lugares do braço, e todas essas posições são lá. Descobrir isso é o que solta você dos desenhos decorados.',
        },
      ],
    },
  ],
}

/* ============================================================
   U1 e U2 — TEORIA (valem pra qualquer instrumento)
   ============================================================ */

const U1: Unidade = {
  id: 'som-tem-nome',
  n: 1,
  titulo: 'O som tem nome',
  guia: 'Sair daqui sabendo nomear qualquer som que você toca — as sete notas, as cinco que faltavam e por que tudo se repete.',
  licoes: [
    {
      id: 'sete-notas',
      titulo: 'As sete notas',
      perguntas: [
        {
          id: 'u1l1q1',
          tipo: 'escolha',
          enunciado: 'Depois do si, qual nota vem?',
          alternativas: ['acaba a sequência e começa outra', 'dó, só que mais agudo', 'lá, voltando'],
          correta: 1,
          explica:
            'Volta pro dó, um degrau acima. As sete notas formam um ciclo que se repete pra sempre — música não é uma escada infinita de nomes novos, são sete que giram.',
        },
        {
          id: 'u1l1q2',
          tipo: 'ouvir',
          enunciado: 'Toquei dó e depois outra nota. Qual foi?',
          midis: [C4, C4 + 4],
          junto: false,
          alternativas: ['ré', 'mi', 'fá', 'sol'],
          correta: 1,
          explica:
            'Era mi — a terceira nota contando do dó. Esse salto é a base de quase todo acorde alegre que você já ouviu.',
        },
        {
          id: 'u1l1q3',
          tipo: 'montar',
          enunciado: 'Toque as sete notas naturais, do dó ao si, em ordem.',
          alvo: [0, 2, 4, 5, 7, 9, 11],
          ordenado: true,
          explica:
            'Essas são as sete naturais — as teclas brancas do piano. Todo o resto da teoria é construído em cima delas.',
        },
      ],
    },
    {
      id: 'doze-notas',
      titulo: 'As cinco que faltavam',
      abertura: {
        titulo: 'Por que 12 e não 14',
        texto:
          'Entre a maioria das notas cabe mais uma — o sustenido. Mas entre mi e fá, e entre si e dó, não cabe nada: elas já são vizinhas coladas. Sete naturais mais cinco sustenidos dão as 12 notas que existem. No braço, cada casa é uma delas.',
      },
      perguntas: [
        {
          id: 'u1l2q1',
          tipo: 'escolha',
          enunciado: 'Entre quais notas NÃO existe nada no meio?',
          // engano real: achar que toda nota tem sustenido entre ela e a seguinte
          alternativas: ['entre dó e ré', 'entre mi e fá', 'entre sol e lá'],
          correta: 1,
          explica:
            'Mi–fá já são vizinhas coladas, e si–dó também. Entre as outras cabe um sustenido. É por isso que são 12 notas no total e não 14 — e no braço isso aparece como duas casas seguidas sem pulo.',
        },
        {
          id: 'u1l2q2',
          tipo: 'montar',
          enunciado: 'Toque as cinco notas que ficam ENTRE as naturais.',
          alvo: [1, 3, 6, 8, 10],
          ordenado: false,
          explica:
            'São as teclas pretas: dó♯, ré♯, fá♯, sol♯ e lá♯. Sete naturais mais cinco: as 12 notas que existem na música ocidental.',
        },
        {
          id: 'u1l2q3',
          tipo: 'escolha',
          enunciado: 'Dó♯ e ré♭ são a mesma tecla. Por que dois nomes então?',
          alternativas: [
            'porque soam levemente diferente',
            'porque o nome depende da tonalidade da música',
            'porque um é usado no piano e o outro na guitarra',
          ],
          correta: 1,
          explica:
            'Mesmo som, nomes diferentes conforme o contexto. Numa música em ré maior você chama de dó♯; numa em lá bemol, de ré♭. O nome certo é o que deixa a escala com uma letra de cada — isso vai fazer muito sentido lá na frente.',
        },
      ],
    },
    {
      id: 'oitava',
      titulo: 'A oitava',
      perguntas: [
        {
          id: 'u1l3q1',
          tipo: 'ouvir',
          enunciado: 'Essas duas notas têm o mesmo nome?',
          midis: [C4, C4 + 12],
          junto: false,
          alternativas: ['sim, é a mesma nota mais aguda', 'não, são notas diferentes'],
          correta: 0,
          explica:
            'É a oitava: a mesma nota com o dobro da frequência. Soa tão parecido que a gente dá o mesmo nome pras duas — e é por isso que homem e mulher cantam "a mesma" melodia em alturas diferentes.',
        },
        {
          id: 'u1l3q2',
          tipo: 'ouvir',
          enunciado: 'E essas duas?',
          midis: [C4, C4 + 7],
          junto: true,
          alternativas: ['mesma nota, oitava diferente', 'notas diferentes'],
          correta: 1,
          explica:
            'Notas diferentes — é uma quinta, o intervalo mais "aberto" e estável que existe depois da oitava. Ela é a base do power chord de qualquer riff de rock.',
        },
      ],
    },
  ],
}

const U2: Unidade = {
  id: 'o-pulso',
  n: 2,
  titulo: 'O pulso',
  guia: 'Ritmo é o que mais faz gente desistir. Aqui você sente o pulso, entende o compasso e para de se perder na contagem.',
  licoes: [
    {
      id: 'tempo',
      titulo: 'O tempo',
      perguntas: [
        {
          id: 'u2l1q1',
          tipo: 'escolha',
          enunciado: 'O que é o "pulso" de uma música?',
          alternativas: [
            'a batida constante em que você bate o pé sem pensar',
            'a parte mais alta da música',
            'a velocidade em que o vocal canta',
          ],
          correta: 0,
          explica:
            'O pulso é a batida regular por baixo de tudo. Ele não muda quando a melodia fica corrida ou parada — e é nele que todo o resto do ritmo se pendura.',
        },
        {
          id: 'u2l1q2',
          tipo: 'tempo',
          enunciado: 'Sinta o pulso e bata junto: 8 batidas a 80 bpm.',
          bpm: 80,
          batidas: 8,
          toleranciaMs: 160,
          explica:
            'Manter o pulso constante é mais difícil do que parece — e é exatamente o que separa quem sabe os acordes de quem consegue tocar a música com outra pessoa.',
        },
      ],
    },
    {
      id: 'compasso',
      titulo: 'O compasso',
      perguntas: [
        {
          id: 'u2l2q1',
          tipo: 'escolha',
          enunciado: 'Num compasso 4/4, quantos tempos você conta antes de voltar pro 1?',
          alternativas: ['dois', 'quatro', 'oito'],
          correta: 1,
          explica:
            'Quatro: 1-2-3-4 e recomeça. O 4/4 é onde mora quase tudo que você escuta — rock, pop, funk, sertanejo. Por isso ele também é chamado de compasso comum.',
        },
        {
          id: 'u2l2q2',
          tipo: 'escolha',
          enunciado: 'Numa levada de rock básica, a caixa cai em quais tempos?',
          // engano real: achar que a caixa acompanha o bumbo no 1 e 3
          alternativas: ['no 1 e no 3, junto com o bumbo', 'no 2 e no 4', 'em todos os quatro'],
          correta: 1,
          explica:
            'Caixa no 2 e no 4 — é o "tá" que RESPONDE o bumbo, não que acompanha ele. Esse contratempo é a espinha do rock, do pop e do funk. Numa música, é onde a plateia bate palma.',
        },
        {
          id: 'u2l2q3',
          tipo: 'tempo',
          enunciado: 'Bata só no tempo 1 de cada compasso: 4 compassos a 90 bpm.',
          bpm: 90,
          batidas: 4,
          toleranciaMs: 180,
          explica:
            'Sentir onde o compasso recomeça é o que te deixa entrar na música na hora certa — e achar o lugar de volta quando se perde no meio.',
        },
      ],
    },
  ],
}

/* ============================================================
   U3 — PRIMEIROS ACORDES (guitarra e violão)
   ============================================================ */

const U3_CORDAS: Unidade = {
  id: 'primeiros-acordes',
  n: 3,
  titulo: 'Primeiros acordes',
  guia: 'Quatro acordes abrem milhares de músicas. Aqui você entende o que está tocando em vez de decorar desenho.',
  paraInstrumentos: CORDAS,
  licoes: [
    {
      id: 'o-que-e-acorde',
      titulo: 'O que é um acorde',
      abertura: {
        titulo: 'Três notas, uma emoção',
        texto:
          'Um acorde comum tem três notas: a fundamental, que dá o nome, e mais duas empilhadas em cima. A do meio decide tudo — um pouco mais aguda soa maior (alegre, aberto), meio tom abaixo soa menor (melancólico, fechado). Na guitarra você toca seis cordas, mas costuma estar repetindo essas mesmas três notas em oitavas diferentes.',
      },
      perguntas: [
        {
          id: 'u3l1q1',
          tipo: 'escolha',
          enunciado: 'O que faz um punhado de notas ser um "acorde"?',
          alternativas: [
            'serem tocadas ao mesmo tempo e combinarem entre si',
            'serem tocadas em cordas vizinhas',
            'serem sempre seis notas, uma por corda',
          ],
          correta: 0,
          explica:
            'Acorde é um conjunto de notas soando junto. Não importa quantas cordas você toca — um acorde de guitarra costuma repetir as mesmas 3 notas em oitavas diferentes.',
        },
        {
          id: 'u3l1q2',
          tipo: 'ouvir',
          enunciado: 'Esse acorde é maior ou menor?',
          midis: [C4, C4 + 3, C4 + 7],
          junto: true,
          alternativas: ['maior — soa aberto, alegre', 'menor — soa fechado, melancólico'],
          correta: 1,
          explica:
            'Menor. A diferença entre maior e menor é UMA nota, meio tom mais grave no meio do acorde — e ela muda completamente a emoção. Ouvir essa diferença é o superpoder mais útil que existe.',
        },
        {
          id: 'u3l1q3',
          tipo: 'montar',
          enunciado: 'Monte um acorde de dó maior: dó, mi e sol.',
          alvo: [0, 4, 7],
          ordenado: false,
          explica:
            'Dó–mi–sol: a fundamental, a terça e a quinta. Toda tríade maior segue esse mesmo desenho de distâncias, em qualquer tonalidade.',
        },
      ],
    },
    {
      id: 'mi-menor',
      titulo: 'Seu primeiro acorde',
      perguntas: [
        {
          id: 'u3l2q1',
          tipo: 'escolha',
          enunciado: 'Por que mi menor costuma ser o primeiro acorde ensinado?',
          alternativas: [
            'porque usa só dois dedos e deixa quatro cordas soltas',
            'porque é o acorde mais usado no rock',
            'porque não precisa afinar pra tocar ele',
          ],
          correta: 0,
          explica:
            'Dois dedos, e as outras quatro cordas soam soltas. É a melhor relação entre esforço e resultado — você tira som de acorde cheio já no primeiro dia, o que ajuda a não desistir na semana 3.',
        },
        {
          id: 'u3l2q2',
          tipo: 'escolha',
          enunciado: 'Seu acorde está chiando numa corda. Qual é a causa mais provável?',
          // enganos reais de quem começa
          alternativas: [
            'a guitarra está desafinada',
            'algum dedo está encostando de leve na corda vizinha',
            'você está batendo com muita força',
          ],
          correta: 1,
          explica:
            'Quase sempre é um dedo vizinho encostando sem querer. A solução é curvar mais os dedos e tocar a corda só com a ponta — não com a polpa deitada. Teste cada corda separada pra achar a culpada.',
        },
        {
          id: 'u3l2q3',
          tipo: 'escolha',
          enunciado: 'Trocar de acorde ainda demora muito. O que ajuda de verdade?',
          alternativas: [
            'tocar mais rápido pra forçar a mão',
            'praticar a troca devagar, no tempo, mesmo que soe feio',
            'esperar os dedos ficarem mais fortes sozinhos',
          ],
          correta: 1,
          explica:
            'Devagar e no tempo. A troca é memória de movimento, não força — e ela só vira automática se você repetir no ritmo, aceitando que soe ruim no começo. Acelerar antes da hora só grava o movimento errado.',
        },
      ],
    },
  ],
}

/* ============================================================
   BAIXO — mesmas cordas da guitarra, papel completamente outro
   ============================================================ */

const U0_BAIXO: Unidade = {
  id: 'seu-instrumento-baixo',
  n: 0,
  titulo: 'Seu instrumento',
  guia: 'Sair daqui sabendo as quatro cordas, entendendo por que o baixo existe numa banda e por que tocar menos é tocar melhor.',
  paraInstrumentos: ['baixo'],
  licoes: [
    {
      id: 'quatro-cordas',
      titulo: 'As quatro cordas',
      perguntas: [
        {
          id: 'b0l1q1',
          tipo: 'escolha',
          enunciado: 'Da mais grossa pra mais fina, quais são as cordas do baixo?',
          alternativas: ['mi · lá · ré · sol', 'sol · ré · lá · mi', 'mi · lá · ré · sol · si'],
          correta: 0,
          explica:
            'Mi, lá, ré, sol — exatamente as quatro cordas mais graves da guitarra, só que uma oitava abaixo. Quem já mexeu em guitarra já sabe metade do braço do baixo.',
        },
        {
          id: 'b0l1q2',
          tipo: 'achar',
          enunciado: 'Toque a 4ª corda solta — o mi grave.',
          alvo: 4,
          posicao: { corda: 0, casa: 0 },
          explica:
            'Essa é a nota mais grave do baixo padrão. É ela que sustenta a banda inteira: se o baixo some, a música fica sem chão.',
        },
        {
          id: 'b0l1q3',
          tipo: 'escolha',
          enunciado: 'Por que o baixo tem cordas mais grossas e um braço maior?',
          alternativas: [
            'pra aguentar mais volume no amplificador',
            'porque corda grossa e longa vibra mais devagar, e isso é o som grave',
            'porque é tocado com os dedos e não com palheta',
          ],
          correta: 1,
          explica:
            'Grave é vibração lenta. Corda mais grossa e mais comprida vibra mais devagar — é a mesma física da tarraxa, só que no tamanho do instrumento. Nada a ver com volume.',
        },
      ],
    },
    {
      id: 'papel-do-baixo',
      titulo: 'O que o baixo faz',
      abertura: {
        titulo: 'A ponte entre a harmonia e o ritmo',
        texto:
          'O baixo é o único instrumento que fica com um pé em cada lado: ele toca as notas da harmonia, mas no ritmo da bateria. Quando o baixo e o bumbo caem juntos, a banda soa unida. Quando eles brigam, tudo soa desmontado — mesmo com todos tocando as notas certas.',
      },
      perguntas: [
        {
          id: 'b0l2q1',
          tipo: 'escolha',
          enunciado: 'Numa banda, com quem o baixo precisa estar mais colado?',
          // engano real: baixista novato acompanha a guitarra e ignora o bumbo
          alternativas: [
            'com a guitarra, que faz a harmonia',
            'com o bumbo da bateria',
            'com o vocal, que carrega a melodia',
          ],
          correta: 1,
          explica:
            'Com o bumbo. Esse é o erro clássico de quem começa: seguir a guitarra e ignorar a bateria. Baixo e bumbo caindo juntos é o que faz a banda soar como uma coisa só.',
        },
        {
          id: 'b0l2q2',
          tipo: 'escolha',
          enunciado: 'Você já sabe várias notas. Numa música, o que costuma soar melhor?',
          // engano real: overplaying, tocar rápido pra mostrar serviço
          alternativas: [
            'encher com o máximo de notas que der',
            'poucas notas, sempre no lugar certo do tempo',
            'copiar exatamente o que a guitarra está fazendo',
          ],
          correta: 1,
          explica:
            'Menos é mais, de verdade. O trabalho do baixo é dar um chão em que os outros se apoiam — e chão cheio de buraco não sustenta ninguém. Tocar rápido impressiona outro baixista; tocar no lugar certo impressiona a banda inteira.',
        },
        {
          id: 'b0l2q3',
          tipo: 'tempo',
          enunciado: 'Trave com o pulso: 8 batidas a 84 bpm.',
          bpm: 84,
          batidas: 8,
          toleranciaMs: 150,
          explica:
            'Constância é a habilidade mais valiosa do baixista. Antes de qualquer escala, é isso que faz alguém te chamar pra tocar de novo.',
        },
      ],
    },
  ],
}

/* ============================================================
   BATERIA — o instrumento do Augusto, e onde o site tem vantagem
   ============================================================ */

const U0_BATERIA: Unidade = {
  id: 'seu-instrumento-bateria',
  n: 0,
  titulo: 'Seu instrumento',
  guia: 'Sair daqui conhecendo as peças que fazem uma levada, com a pegada solta e contando alto sem se perder.',
  paraInstrumentos: ['bateria'],
  licoes: [
    {
      id: 'partes-do-kit',
      titulo: 'As peças que importam',
      perguntas: [
        {
          id: 'd0l1q1',
          tipo: 'escolha',
          enunciado: 'Quais três peças sustentam quase toda levada de música popular?',
          alternativas: [
            'bumbo, caixa e chimbal',
            'os três tomes',
            'caixa, prato de ataque e prato de condução',
          ],
          correta: 0,
          explica:
            'Bumbo, caixa e chimbal. Tomes e pratos entram como tempero e viradas — mas o groove que faz a cabeça balançar sai desses três. Dá pra tocar milhares de músicas só com eles.',
        },
        {
          id: 'd0l1q2',
          tipo: 'escolha',
          enunciado: 'Você ainda não tem uma bateria. Dá pra estudar de verdade?',
          alternativas: [
            'não, sem o kit completo não tem como',
            'sim: um pad de estudo e um par de baquetas resolvem os primeiros meses',
            'só se você tiver pelo menos caixa e bumbo',
          ],
          correta: 1,
          explica:
            'Pad e baquetas bastam pra muita coisa. Pegada, rudimento, constância e leitura — tudo isso se treina sem kit. É o instrumento mais barato de começar a estudar e o mais caro de comprar.',
        },
      ],
    },
    {
      id: 'pegada',
      titulo: 'A pegada',
      abertura: {
        titulo: 'A baqueta trabalha, não você',
        texto:
          'A baqueta quica sozinha quando você deixa. Segura com o polegar e o indicador fazendo um ponto de apoio, e os outros dedos só acompanhando — solto o bastante pra ela voltar. Quem aperta forte demais mata o quique, passa a mover o braço inteiro em vez do pulso, cansa em dois minutos e ainda tira um som sufocado do instrumento.',
      },
      perguntas: [
        {
          id: 'd0l2q1',
          tipo: 'escolha',
          enunciado: 'Qual é o erro nº1 de quem está começando na bateria?',
          // engano real e documentado
          alternativas: [
            'segurar a baqueta apertado demais',
            'usar baqueta fina demais',
            'sentar longe demais do kit',
          ],
          correta: 0,
          explica:
            'Apertar demais. A baqueta precisa quicar, e o aperto mata o quique — aí você compensa com o braço, cansa rápido e o som sai abafado. Se sua mão dói depois de 10 minutos, quase sempre é aperto, não falta de força.',
        },
        {
          id: 'd0l2q2',
          tipo: 'escolha',
          enunciado: 'O que é tocar com dinâmica?',
          // engano real: bater tudo com a mesma força
          alternativas: [
            'tocar sempre bem forte pra a bateria aparecer',
            'variar a intensidade das batidas conforme a música pede',
            'tocar rápido nas partes agitadas',
          ],
          correta: 1,
          explica:
            'Dinâmica é variar o volume dentro da própria levada. Bater tudo com a mesma força é o que faz uma bateria soar robótica — e é um dos motivos de gravação de iniciante soar amadora mesmo com o ritmo certo.',
        },
        {
          id: 'd0l2q3',
          tipo: 'escolha',
          enunciado: 'Por que o metrônomo é tão insistido na bateria?',
          alternativas: [
            'porque bateria não tem melodia pra se guiar',
            'porque você é o relógio da banda inteira',
            'porque ajuda a decorar as levadas',
          ],
          correta: 1,
          explica:
            'Todo mundo se pendura no seu tempo. Um guitarrista fora do tempo atrapalha uma parte; um baterista fora do tempo derruba a música. Treinar sem metrônomo grava um tempo torto que depois custa muito pra desentortar.',
        },
      ],
    },
    {
      id: 'contagem',
      titulo: 'Contar alto',
      perguntas: [
        {
          id: 'd0l3q1',
          tipo: 'escolha',
          enunciado: 'Como se conta um compasso 4/4 dividido em colcheias?',
          alternativas: ['1 2 3 4 5 6 7 8', '1 e 2 e 3 e 4 e', '1 e & a 2 e & a'],
          correta: 1,
          explica:
            'Um "e" entre cada tempo: 1 e 2 e 3 e 4 e. Isso são 8 colcheias. Quando dividir mais ainda, em semicolcheias, vira 1 e & a — o que você já viu na Groove Machine.',
        },
        {
          id: 'd0l3q2',
          tipo: 'tempo',
          enunciado: 'Bata nos 4 tempos, contando alto: 8 batidas a 90 bpm.',
          bpm: 90,
          batidas: 8,
          toleranciaMs: 140,
          explica:
            'Contar em voz alta parece bobo e é a coisa que mais destrava iniciante. Enquanto você conta, não tem como se perder no compasso.',
        },
        {
          id: 'd0l3q3',
          tipo: 'escolha',
          enunciado: 'O que é um paradiddle?',
          alternativas: [
            'uma virada que fecha o refrão',
            'o padrão de mãos direita-esquerda-direita-direita, e depois invertido',
            'um jeito de afinar a caixa',
          ],
          correta: 1,
          explica:
            'É um rudimento: RLRR LRLL. Ele mistura toque simples e duplo e serve pra equilibrar as duas mãos — por isso é um dos primeiros que todo baterista aprende, junto com o toque simples e o duplo.',
        },
      ],
    },
  ],
}

const U3_BATERIA: Unidade = {
  id: 'primeira-levada',
  n: 3,
  titulo: 'Sua primeira levada',
  guia: 'Montar a levada que está na maioria das músicas que você escuta — e entender por que ela funciona.',
  paraInstrumentos: ['bateria'],
  licoes: [
    {
      id: 'rock-basico',
      titulo: 'O rock básico',
      perguntas: [
        {
          id: 'd3l1q1',
          tipo: 'escolha',
          enunciado: 'No rock básico, o chimbal toca em quais tempos?',
          alternativas: ['só no 1 e no 3', 'em todos os tempos, marcando o pulso', 'só quando a caixa não toca'],
          correta: 1,
          explica:
            'O chimbal marca o pulso o tempo todo — é o relógio que a banda ouve. O bumbo e a caixa conversam por baixo dele.',
        },
        {
          id: 'd3l1q2',
          tipo: 'escolha',
          enunciado: 'E a conversa entre bumbo e caixa, como funciona?',
          alternativas: [
            'bumbo no 1 e 3, caixa no 2 e 4',
            'bumbo e caixa sempre juntos',
            'caixa no 1 e 3, bumbo no 2 e 4',
          ],
          correta: 0,
          explica:
            'Bumbo nos tempos 1 e 3, caixa respondendo no 2 e 4. É pergunta e resposta — e é essa alternância que faz a cabeça balançar. A caixa no 2 e 4 é onde a plateia bate palma.',
        },
        {
          id: 'd3l1q3',
          tipo: 'tempo',
          enunciado: 'Bata só onde a caixa cairia — nos tempos 2 e 4: 4 batidas a 88 bpm.',
          bpm: 44,
          batidas: 4,
          toleranciaMs: 200,
          explica:
            'Sentir o contratempo sem contar é o que separa quem toca a levada de quem sente a levada. Agora vale abrir a Groove Machine e montar isso ouvindo.',
        },
      ],
    },
  ],
}

/* ============================================================
   PIANO — nota limpa desde o dia 1; a dificuldade é a mão
   ============================================================ */

const U0_PIANO: Unidade = {
  id: 'seu-instrumento-piano',
  n: 0,
  titulo: 'Seu instrumento',
  guia: 'Sair daqui com os dedos numerados, a mão no formato certo e as duas mãos achando o dó central.',
  paraInstrumentos: ['piano'],
  licoes: [
    {
      id: 'numeros-dos-dedos',
      titulo: 'Os números dos dedos',
      perguntas: [
        {
          id: 'p0l1q1',
          tipo: 'escolha',
          enunciado: 'No piano, qual dedo é o número 1?',
          // engano real: quem vem de violão numera o indicador como 1
          alternativas: ['o indicador', 'o polegar', 'depende da mão'],
          correta: 1,
          explica:
            'O polegar é sempre o 1, nas duas mãos. Quem já tocou violão estranha, porque lá o indicador é que é o 1 — trocar isso é confusão garantida ao ler partitura de piano.',
        },
        {
          id: 'p0l1q2',
          tipo: 'escolha',
          enunciado: 'Na mão esquerda, qual dedo é o 5?',
          alternativas: ['o polegar', 'o mindinho', 'o dedo médio'],
          correta: 1,
          explica:
            'O mindinho, igual na direita. A numeração é espelhada: os dois polegares são 1 e os dois mindinhos são 5, então os polegares ficam voltados um pro outro no centro do teclado.',
        },
      ],
    },
    {
      id: 'formato-da-mao',
      titulo: 'O formato da mão',
      abertura: {
        titulo: 'Como uma bolha na palma',
        texto:
          'Imagine segurar uma bolha de sabão sem estourar: os dedos ficam curvados, os nós das mãos formam uma cúpula e o pulso fica no nível das teclas. Toca-se com a PONTA do dedo, não com a polpa deitada. Isso não é firula de professor — é o que dá controle, deixa o som parelho e evita dor no pulso depois de meia hora.',
      },
      perguntas: [
        {
          id: 'p0l2q1',
          tipo: 'escolha',
          enunciado: 'Seus dedos ficam esticados e chatos nas teclas. Qual é o problema?',
          // engano real e documentado
          alternativas: [
            'nenhum, é questão de estilo',
            'você perde controle e os dedos fracos ficam ainda mais fracos',
            'só atrapalha em música clássica',
          ],
          correta: 1,
          explica:
            'Dedo chato tira o controle: você toca com a polpa em vez da ponta, o som sai desigual e o anelar e o mindinho — que já são os mais fracos — ficam quase inúteis. Curvar resolve mais que qualquer exercício de força.',
        },
        {
          id: 'p0l2q2',
          tipo: 'escolha',
          enunciado: 'Seu pulso cai abaixo do nível das teclas quando você toca. O que isso causa?',
          alternativas: [
            'tensão no tendão e menos independência dos dedos',
            'nada, desde que o som saia',
            'faz o som ficar mais suave',
          ],
          correta: 0,
          explica:
            'Pulso caído tensiona o tendão, trava a independência dos dedos e cobra a conta em dor mais tarde. Muitas vezes a causa é o banco: o cotovelo deve ficar no nível das teclas ou um pouco acima.',
        },
      ],
    },
    {
      id: 'do-central',
      titulo: 'O dó central',
      perguntas: [
        {
          id: 'p0l3q1',
          tipo: 'escolha',
          enunciado: 'Como achar o dó no teclado sem decorar nada?',
          alternativas: [
            'é a tecla branca logo à esquerda do grupo de DUAS pretas',
            'é a primeira tecla branca do teclado',
            'é a tecla branca no meio do grupo de TRÊS pretas',
          ],
          correta: 0,
          explica:
            'As pretas vêm em grupos de duas e de três. O dó é sempre a branca logo antes do grupo de duas — por isso dá pra achar de olho fechado, em qualquer teclado do mundo.',
        },
        {
          id: 'p0l3q2',
          tipo: 'montar',
          enunciado: 'Toque a posição de cinco dedos da mão direita: dó, ré, mi, fá, sol.',
          alvo: [0, 2, 4, 5, 7],
          ordenado: true,
          explica:
            'Polegar no dó e um dedo por tecla até o sol. Essa é a primeira posição que todo mundo aprende — e com ela já dá pra tocar melodia de verdade sem mover a mão do lugar.',
        },
        {
          id: 'p0l3q3',
          tipo: 'escolha',
          enunciado: 'Qual é a maior dificuldade que aparece depois no piano?',
          alternativas: [
            'alcançar as teclas mais agudas',
            'fazer as duas mãos tocarem coisas diferentes ao mesmo tempo',
            'decorar o nome das notas pretas',
          ],
          correta: 1,
          explica:
            'Independência das mãos. O piano é generoso no começo — aperta a tecla e sai uma nota afinada — e cobra depois, quando cada mão precisa de um ritmo próprio. Saber disso desde já evita achar que você "empacou".',
        },
      ],
    },
  ],
}

/* ============================================================
   VIOLINO — sem trastes: afinação é a dor nº1, e tensão é a causa
   ============================================================ */

const U0_VIOLINO: Unidade = {
  id: 'seu-instrumento-violino',
  n: 0,
  titulo: 'Seu instrumento',
  guia: 'Sair daqui com as quatro cordas na cabeça, o violino apoiado sem aperto e o arco tirando som limpo em vez de arranhado.',
  paraInstrumentos: ['violino'],
  licoes: [
    {
      id: 'cordas-soltas',
      titulo: 'As quatro cordas',
      perguntas: [
        {
          id: 'v0l1q1',
          tipo: 'escolha',
          enunciado: 'Da mais grave pra mais aguda, quais são as cordas do violino?',
          alternativas: ['sol · ré · lá · mi', 'mi · lá · ré · sol', 'dó · sol · ré · lá'],
          correta: 0,
          explica:
            'Sol, ré, lá, mi — de cinco em cinco. A terceira alternativa é a viola de arco, que é parecida mas começa no dó.',
        },
        {
          id: 'v0l1q2',
          tipo: 'ouvir',
          enunciado: 'Ouça as duas notas. Elas estão afinadas entre si?',
          midis: [67, 74],
          junto: true,
          alternativas: ['sim, é o intervalo entre duas cordas vizinhas', 'não, tem algo desafinado'],
          correta: 0,
          explica:
            'É uma quinta justa — a distância entre duas cordas vizinhas do violino. Reconhecer esse som é o que te deixa afinar sem aparelho, e é uma habilidade que violinista usa a vida inteira.',
        },
      ],
    },
    {
      id: 'segurar-sem-apertar',
      titulo: 'Segurar sem apertar',
      abertura: {
        titulo: 'Tensão é o inimigo número um',
        texto:
          'O violino se apoia na clavícula, com o queixo só descansando em cima — não mordendo. A mão esquerda fica livre pra tocar, não pra segurar o instrumento. Isso não é conforto: é afinação. Ombro subido, queixo apertado ou polegar espremido no braço travam a mão, e mão travada não acerta a nota. No violino, quase todo problema de som começa em algum músculo apertado.',
      },
      perguntas: [
        {
          id: 'v0l2q1',
          tipo: 'escolha',
          enunciado: 'Você aperta o queixo com força na queixeira. Qual é a consequência?',
          alternativas: [
            'nenhuma, é assim que se segura mesmo',
            'trava o pescoço e piora a afinação',
            'o som fica mais alto',
          ],
          correta: 1,
          explica:
            'Morder a queixeira cria tensão no pescoço e engessa o instrumento. Violino rígido em vez de equilibrado deixa a mão esquerda dura — e mão dura erra a nota. O peso da cabeça já basta pra segurar.',
        },
        {
          id: 'v0l2q2',
          tipo: 'escolha',
          enunciado: 'Como o dedo deve chegar na corda?',
          // engano real: torcer o dedo de lado
          alternativas: [
            'caindo de cima, como um martelinho',
            'deslizando de lado até achar a nota',
            'apertando com a polpa bem deitada',
          ],
          correta: 0,
          explica:
            'De cima, como martelinho, com a mão em arco. Quando o dedo torce de lado, a mão perde o formato aberto e os outros dedos ficam sem lugar — aí a afinação vira loteria a cada nota.',
        },
      ],
    },
    {
      id: 'o-arco',
      titulo: 'O arco',
      perguntas: [
        {
          id: 'v0l3q1',
          tipo: 'escolha',
          enunciado: 'Seu som está arranhado. Qual é a causa mais provável?',
          alternativas: [
            'a corda está velha',
            'você está apertando o arco de nervoso, com pressão irregular',
            'o violino é de qualidade baixa',
          ],
          correta: 1,
          explica:
            'Quase sempre é a mão direita apertada. Arco preso demais ou solto demais, com pressão que varia no meio da arcada, produz aquele som raspado. Polegar relaxado e dedos curvos resolvem mais que trocar de instrumento.',
        },
        {
          id: 'v0l3q2',
          tipo: 'escolha',
          enunciado: 'Em relação ao cavalete, como o arco deve andar?',
          alternativas: ['paralelo a ele', 'inclinado em diagonal', 'tanto faz, o som é igual'],
          correta: 0,
          explica:
            'Paralelo ao cavalete, sempre. Arco torto escorrega e muda o ponto de contato com a corda, e o som sai fino ou raspado. Manter o arco reto é o exercício que mais rende no primeiro mês.',
        },
        {
          id: 'v0l3q3',
          tipo: 'escolha',
          enunciado: 'Por que praticar cordas soltas antes de usar os dedos?',
          alternativas: [
            'porque é o que se cobra em prova',
            'pra cuidar só do arco e do som, sem se preocupar com afinação ao mesmo tempo',
            'porque os dedos precisam ganhar calo antes',
          ],
          correta: 1,
          explica:
            'Uma dificuldade por vez. Sem os dedos, a nota já sai afinada e você pode dedicar toda a atenção ao arco. Depois que o som estiver limpo, a mão esquerda entra num terreno bem mais fácil.',
        },
      ],
    },
  ],
}

/* ---------- montagem e consultas ---------- */

const TODAS_UNIDADES: Unidade[] = [
  U0_CORDAS,
  U0_BAIXO,
  U0_BATERIA,
  U0_PIANO,
  U0_VIOLINO,
  U1,
  U2,
  U3_CORDAS,
  U3_BATERIA,
]

/** A trilha de um instrumento: unidades universais + as do galho dele. */
export function trilhaDe(instrumento: TrilhaInstrumento): Unidade[] {
  return TODAS_UNIDADES.filter(
    (u) => !u.paraInstrumentos || u.paraInstrumentos.includes(instrumento),
  )
}

export function licoesDe(instrumento: TrilhaInstrumento) {
  return trilhaDe(instrumento).flatMap((u) => u.licoes.map((l) => ({ unidade: u, licao: l })))
}

export function licaoPorId(id: string, instrumento: TrilhaInstrumento) {
  return licoesDe(instrumento).find((x) => x.licao.id === id)
}

/** O próximo passo: a primeira lição não concluída. */
export function proximaLicao(concluidas: string[], instrumento: TrilhaInstrumento) {
  return licoesDe(instrumento).find((x) => !concluidas.includes(x.licao.id)) ?? null
}

export function licaoDesbloqueada(
  licaoId: string,
  concluidas: string[],
  instrumento: TrilhaInstrumento,
): boolean {
  const lista = licoesDe(instrumento)
  const i = lista.findIndex((x) => x.licao.id === licaoId)
  if (i <= 0) return true
  return concluidas.includes(lista[i - 1].licao.id)
}

export function progressoPct(concluidas: string[], instrumento: TrilhaInstrumento): number {
  const lista = licoesDe(instrumento)
  const feitas = lista.filter((x) => concluidas.includes(x.licao.id)).length
  return Math.round((feitas / lista.length) * 100)
}

export { TODAS_UNIDADES }

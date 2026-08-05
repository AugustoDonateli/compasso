import type { Unidade, TrilhaInstrumento } from './trilha'

/** AS TRILHAS DE INSTRUMENTO — só o instrumento, nada de teoria abstrata.
 *
 *  Um baterista não precisa saber o nome das sete notas pra tocar bateria.
 *  Cada trilha aqui é 100% do instrumento dela; quem quiser teoria musical
 *  escolhe a trilha de teoria, que existe à parte.
 *
 *  REGRA NOVA (corrigindo o rumo anterior): TODA lição ensina antes de
 *  perguntar. Chutar primeiro só se justifica quando a pessoa provavelmente
 *  já tem a intuição — por exemplo julgar se um acorde soa alegre ou triste.
 *  Fora isso, perguntar sem ensinar é adivinhação, não aprendizado. */

const CORDAS: TrilhaInstrumento[] = ['guitarra', 'violao']

/* ============================================================
   GUITARRA E VIOLÃO
   ============================================================ */

export const GUITARRA: Unidade[] = [
  {
    id: 'g-instrumento',
    n: 1,
    trilha: 'instrumento',
    paraInstrumentos: CORDAS,
    titulo: 'Seu instrumento',
    guia: 'As seis cordas de cor, afinando sozinho e a primeira nota saindo limpa.',
    licoes: [
      {
        id: 'g-cordas',
        titulo: 'As seis cordas',
        abertura: {
          titulo: 'Mi, lá, ré, sol, si, mi',
          texto:
            'Da mais grossa pra mais fina: mi, lá, ré, sol, si, mi. Repare que a primeira e a última são as duas mi, com duas oitavas de diferença. E a numeração é o contrário do que quase todo mundo chuta: a 1ª corda é a MAIS FINA, a que fica embaixo quando você toca. A mais grossa é a 6ª.',
          diagrama: 'cordas-guitarra',
        },
        perguntas: [
          {
            id: 'g1q1',
            tipo: 'escolha',
            enunciado: 'Qual é a 1ª corda?',
            alternativas: ['a mais grossa, o mi grave', 'a mais fina, o mi agudo', 'a do meio, o ré'],
            correta: 1,
            explica:
              'A mais fina. A numeração vai do fino pro grosso, então a mais grossa é a 6ª. Isso importa toda vez que você lê uma tablatura ou alguém diz "na terceira corda".',
          },
          {
            id: 'g1q2',
            tipo: 'escolha',
            enunciado: 'Da 6ª pra 1ª, qual é a sequência?',
            alternativas: ['mi · lá · ré · sol · si · mi', 'mi · si · sol · ré · lá · mi', 'lá · ré · sol · dó · mi · lá'],
            correta: 0,
            explica:
              'Mi, lá, ré, sol, si, mi. A segunda alternativa é a mesma coisa ao contrário — o erro de quem começa a contar pela corda errada.',
          },
          {
            id: 'g1q3',
            tipo: 'achar',
            enunciado: 'Toque a 5ª corda solta — o lá.',
            alvo: 9,
            posicao: { corda: 1, casa: 0 },
            explica:
              'Essa é a corda lá. Ela é parente do lá de 440 hertz, que é a referência de afinação usada no mundo inteiro.',
          },
        ],
      },
      {
        id: 'g-afinar',
        titulo: 'Afinar sozinho',
        abertura: {
          titulo: 'Afinar é controlar tensão',
          texto:
            'Apertar a tarraxa estica a corda e o som sobe; afrouxar faz descer. Pra saber qual é a nota certa, a própria guitarra serve de referência: a casa 5 de uma corda dá exatamente a nota da corda seguinte solta (a única exceção é entre a 3ª e a 2ª, onde é a casa 4). E sempre chegue na nota SUBINDO — se você só desce até ela, a corda fica com folga e escorrega em poucos minutos.',
        },
        perguntas: [
          {
            id: 'g2q1',
            tipo: 'escolha',
            enunciado: 'Você aperta a tarraxa. O que acontece com o som?',
            alternativas: ['fica mais grave', 'fica mais agudo', 'só muda o volume'],
            correta: 1,
            explica:
              'Mais tensão, som mais agudo. É a mesma física do braço: apertar a corda numa casa encurta a parte que vibra e sobe o som.',
          },
          {
            id: 'g2q2',
            tipo: 'escolha',
            enunciado: 'A corda está acima da nota. Qual é o jeito certo?',
            alternativas: [
              'descer devagar até parar exatamente na nota',
              'descer um pouco abaixo e subir de volta até ela',
              'apertar até estourar e recomeçar',
            ],
            correta: 1,
            explica:
              'Chegue subindo. Descendo até a nota a corda fica com folga na tarraxa e escorrega logo. Descer além e subir de volta deixa firme.',
          },
          {
            id: 'g2q3',
            tipo: 'escolha',
            enunciado: 'Toque a 6ª corda na casa 5 e a 5ª solta. Deveriam soar como?',
            alternativas: ['exatamente iguais', 'a da casa 5 um pouco mais aguda', 'nunca dão a mesma nota'],
            correta: 0,
            explica:
              'Idênticas — é assim que se afina de ouvido sem aparelho nenhum. E dá pra conferir isso agora no Afinador, que ouve seu instrumento de verdade.',
          },
        ],
      },
      {
        id: 'g-nota-limpa',
        titulo: 'A primeira nota limpa',
        abertura: {
          titulo: 'O dedo vai logo atrás do traste',
          texto:
            'Em cima do metal a nota abafa. No meio da casa, longe do traste, você precisa de muita força e a nota sai chiada. Logo atrás do traste, quase encostando nele, é onde sai limpo com pouco esforço. Se está doendo muito, quase sempre é posição — não falta de força.',
          diagrama: 'dedo-na-casa',
        },
        perguntas: [
          {
            id: 'g3q1',
            tipo: 'escolha',
            enunciado: 'Onde o dedo aperta pra nota sair limpa?',
            alternativas: ['em cima do traste', 'no meio da casa', 'logo atrás do traste'],
            correta: 2,
            explica:
              'Logo atrás, quase encostando. Essa mudança de meio centímetro resolve a maior parte do som chiado de quem está começando.',
          },
          {
            id: 'g3q2',
            tipo: 'escolha',
            enunciado: 'Você desceu uma casa. Quanto mudou o som?',
            alternativas: ['um semitom', 'um tom', 'uma oitava'],
            correta: 0,
            explica:
              'Uma casa é sempre um semitom — o menor passo que existe. Duas casas fazem um tom. Vale em qualquer corda e em qualquer lugar do braço.',
          },
          {
            id: 'g3q3',
            tipo: 'tocar',
            enunciado: 'Pegue a guitarra e toque um mi.',
            alvo: 4,
            alternativaNaTela: 'braco',
            explica:
              'O site ouviu você tocar. Esse ciclo — pedir, você tocar, conferir na hora — é o que assistir vídeo nunca dá.',
          },
        ],
      },
    ],
  },
  {
    id: 'g-acordes',
    n: 2,
    trilha: 'instrumento',
    paraInstrumentos: CORDAS,
    titulo: 'Primeiros acordes',
    guia: 'Quatro acordes abrem milhares de músicas. Aqui você entende o que está tocando em vez de decorar desenho.',
    licoes: [
      {
        id: 'g-o-que-e-acorde',
        titulo: 'O que é um acorde',
        abertura: {
          titulo: 'Notas soando juntas',
          texto:
            'Acorde é um punhado de notas tocadas ao mesmo tempo que combinam entre si. Na guitarra você toca até seis cordas, mas costuma estar repetindo as mesmas três notas em oitavas diferentes. A do meio decide o clima: um pouco mais aguda soa maior (aberto, alegre), meio tom abaixo soa menor (fechado, melancólico).',
        },
        perguntas: [
          {
            id: 'g4q1',
            tipo: 'ouvir',
            enunciado: 'Esse acorde é maior ou menor?',
            midis: [60, 63, 67],
            junto: true,
            alternativas: ['maior — aberto, alegre', 'menor — fechado, melancólico'],
            correta: 1,
            explica:
              'Menor. A diferença é UMA nota, meio tom mais grave no meio do acorde — e ela muda a emoção inteira.',
          },
          {
            id: 'g4q2',
            tipo: 'escolha',
            enunciado: 'Você toca 6 cordas num acorde. São 6 notas diferentes?',
            alternativas: ['sim, uma por corda', 'não, são 3 notas repetidas em oitavas diferentes'],
            correta: 1,
            explica:
              'Três notas, repetidas. É por isso que o mesmo acorde tem vários desenhos no braço: são jeitos diferentes de arrumar as mesmas notas.',
          },
        ],
      },
      {
        id: 'g-primeiro-acorde',
        titulo: 'Seu primeiro acorde',
        abertura: {
          titulo: 'Por que mi menor vem primeiro',
          texto:
            'Mi menor usa dois dedos e deixa quatro cordas soando soltas. É a melhor relação entre esforço e resultado que existe na guitarra: você tira som de acorde cheio já no primeiro dia. E isso importa mais do que parece — a semana 3 é quando a maioria desiste, e ter um som bonito saindo cedo é o que segura a pessoa.',
        },
        perguntas: [
          {
            id: 'g5q1',
            tipo: 'escolha',
            enunciado: 'Por que mi menor costuma ser o primeiro?',
            alternativas: [
              'usa só dois dedos e deixa quatro cordas soltas',
              'é o acorde mais usado no rock',
              'não precisa afinar pra tocar',
            ],
            correta: 0,
            explica:
              'Dois dedos e quatro cordas soltas: som cheio com esforço mínimo. É desenhado pra você não desistir.',
          },
          {
            id: 'g5q2',
            tipo: 'escolha',
            enunciado: 'Uma corda do acorde está chiando. Causa mais provável?',
            alternativas: [
              'a guitarra está desafinada',
              'um dedo vizinho está encostando nela',
              'você bateu com muita força',
            ],
            correta: 1,
            explica:
              'Quase sempre é dedo vizinho encostando. Curve mais os dedos e toque com a ponta, não com a polpa deitada. Teste corda por corda pra achar a culpada.',
          },
          {
            id: 'g5q3',
            tipo: 'escolha',
            enunciado: 'A troca de acorde ainda demora. O que ajuda de verdade?',
            alternativas: [
              'tocar mais rápido pra forçar a mão',
              'praticar a troca devagar, no tempo, mesmo soando feio',
              'esperar os dedos ficarem mais fortes',
            ],
            correta: 1,
            explica:
              'Devagar e no tempo. Troca é memória de movimento, não força — e só vira automática repetindo no ritmo. Acelerar antes da hora grava o movimento errado.',
          },
        ],
      },
    ],
  },
  {
    id: 'g-mao-direita',
    n: 3,
    trilha: 'instrumento',
    paraInstrumentos: CORDAS,
    titulo: 'A mão direita',
    guia: 'A mão que ninguém treina — e que é o que faz a música soar viva em vez de robótica.',
    licoes: [
      {
        id: 'g-ritmo-batida',
        titulo: 'A batida',
        abertura: {
          titulo: 'A mão nunca para',
          texto:
            'O segredo da batida não é acertar as cordas: é a mão continuar balançando pra baixo e pra cima sem parar, como um metrônomo. Quando você não quer que soe, a mão continua o movimento mas passa longe das cordas. Quem para a mão perde o tempo — e é por isso que a batida de iniciante soa travada mesmo com os acordes certos.',
        },
        perguntas: [
          {
            id: 'g6q1',
            tipo: 'escolha',
            enunciado: 'Numa batida, o que a mão direita faz nos momentos de silêncio?',
            alternativas: [
              'para e espera o próximo golpe',
              'continua o movimento, só não encosta nas cordas',
              'fica apoiada no corpo da guitarra',
            ],
            correta: 1,
            explica:
              'Continua balançando. O movimento constante é o que mantém o tempo no corpo — parar a mão é perder a referência e é a causa nº1 de batida travada.',
          },
          {
            id: 'g6q2',
            tipo: 'tempo',
            enunciado: 'Balance a mão no tempo: 8 batidas a 80 bpm.',
            bpm: 80,
            batidas: 8,
            toleranciaMs: 160,
            explica:
              'Constância na mão direita vale mais que velocidade. É ela que decide se a música vai soar dançante ou arrastada.',
          },
        ],
      },
      {
        id: 'g-dinamica',
        titulo: 'Dinâmica',
        abertura: {
          titulo: 'Nem toda batida tem o mesmo peso',
          texto:
            'Numa batida real, alguns golpes são fortes e outros quase de raspão. É essa diferença de peso que cria o balanço. Batendo tudo com a mesma força você toca as notas certas e mesmo assim soa como uma máquina — porque falta a respiração que a variação de intensidade dá.',
        },
        perguntas: [
          {
            id: 'g7q1',
            tipo: 'escolha',
            enunciado: 'Sua batida está certa mas soa robótica. O que provavelmente falta?',
            alternativas: [
              'velocidade',
              'variar a força entre os golpes',
              'acordes mais difíceis',
            ],
            correta: 1,
            explica:
              'Dinâmica. Marcar mais forte onde o compasso pede e aliviar no resto é o que transforma uma sequência de acordes em música.',
          },
        ],
      },
    ],
  },
  {
    id: 'g-som',
    n: 4,
    trilha: 'instrumento',
    paraInstrumentos: ['guitarra'],
    titulo: 'Seu som',
    guia: 'Captadores, distorção, delay e reverb — o que cada coisa faz e por que a ordem importa.',
    licoes: [
      {
        id: 'g-captadores',
        titulo: 'De onde vem o som',
        abertura: {
          titulo: 'O captador ouve a corda',
          texto:
            'A guitarra elétrica quase não faz som sozinha: quem escuta a corda vibrando é o captador, um ímã com fio enrolado que transforma vibração em eletricidade. Por isso a posição dele muda tudo — o captador perto do braço pega a parte mais gorda da vibração e soa quente e redondo; o perto da ponte pega a parte mais tensa e soa fino e agressivo.',
        },
        perguntas: [
          {
            id: 'g8q1',
            tipo: 'escolha',
            enunciado: 'Você troca pro captador do braço. O som fica como?',
            alternativas: [
              'mais quente e redondo',
              'mais fino e agressivo',
              'igual, só muda o volume',
            ],
            correta: 0,
            explica:
              'Mais quente e redondo. Perto do braço a corda vibra com mais amplitude, e o captador escuta isso. Por isso solo melódico costuma sair no captador do braço e riff pesado no da ponte.',
          },
        ],
      },
      {
        id: 'g-efeitos',
        titulo: 'Distorção, delay e reverb',
        abertura: {
          titulo: 'Três coisas bem diferentes',
          texto:
            'DISTORÇÃO empurra o sinal além do que ele aguenta e o som "quebra" — é o que dá peso ao rock. DELAY é eco: repete o que você tocou depois de um tempo. REVERB simula o ambiente, como se você estivesse tocando numa sala ou numa igreja. E a ordem importa: distorcer um eco soa sujo e confuso; ecoar um som já distorcido soa limpo e organizado. Por isso a distorção quase sempre vem primeiro.',
          diagrama: 'cadeia-efeitos',
        },
        perguntas: [
          {
            id: 'g9q1',
            tipo: 'escolha',
            enunciado: 'O que o delay faz?',
            alternativas: [
              'engrossa o som fazendo ele quebrar',
              'repete o que você tocou depois de um tempo',
              'simula o ambiente de uma sala',
            ],
            correta: 1,
            explica:
              'Delay é eco: repete o que você tocou. Quem simula ambiente é o reverb, e quem faz o som quebrar é a distorção.',
          },
          {
            id: 'g9q2',
            tipo: 'escolha',
            enunciado: 'Por que a distorção costuma vir ANTES do delay na cadeia?',
            alternativas: [
              'porque é o pedal mais caro',
              'porque distorcer um eco deixa tudo sujo e embolado',
              'não importa, dá no mesmo',
            ],
            correta: 1,
            explica:
              'Distorcendo o eco, cada repetição vira mais sujeira e o som embola. Distorcendo primeiro e ecoando depois, as repetições saem limpas e definidas.',
          },
          {
            id: 'g9q3',
            tipo: 'escolha',
            enunciado: 'Seu som ao vivo some no meio da banda. O que costuma ser o problema?',
            alternativas: [
              'falta distorção',
              'excesso de reverb e graves',
              'a guitarra é ruim',
            ],
            correta: 1,
            explica:
              'Reverb demais espalha o som e ele perde definição; grave demais briga com o baixo e o bumbo. Guitarra que "aparece" na banda costuma ter menos efeito, não mais.',
          },
        ],
      },
    ],
  },
]

/* ============================================================
   BAIXO
   ============================================================ */

export const BAIXO: Unidade[] = [
  {
    id: 'b-instrumento',
    n: 1,
    trilha: 'instrumento',
    paraInstrumentos: ['baixo'],
    titulo: 'Seu instrumento',
    guia: 'As quatro cordas, por que elas são grossas assim e o que o baixo faz numa banda.',
    licoes: [
      {
        id: 'b-cordas',
        titulo: 'As quatro cordas',
        abertura: {
          titulo: 'Mi, lá, ré, sol',
          texto:
            'Da mais grossa pra mais fina: mi, lá, ré, sol — exatamente as quatro cordas mais graves da guitarra, uma oitava abaixo. Elas são grossas e o braço é comprido porque grave é vibração lenta: corda mais pesada e mais longa vibra mais devagar. Nada a ver com volume.',
        },
        perguntas: [
          {
            id: 'b1q1',
            tipo: 'escolha',
            enunciado: 'Da mais grossa pra mais fina, quais são?',
            alternativas: ['mi · lá · ré · sol', 'sol · ré · lá · mi', 'mi · lá · ré · sol · si'],
            correta: 0,
            explica:
              'Mi, lá, ré, sol. Quem já mexeu em guitarra já conhece metade do braço do baixo — são as mesmas quatro cordas graves.',
          },
          {
            id: 'b1q2',
            tipo: 'tocar',
            enunciado: 'Pegue o baixo e toque um lá.',
            alvo: 9,
            alternativaNaTela: 'braco',
            explica:
              'O site ouviu. Esse ciclo de pedir, você tocar e ele conferir na hora é a razão de estudar aqui em vez de assistir alguém explicar.',
          },
        ],
      },
      {
        id: 'b-papel',
        titulo: 'O que o baixo faz',
        abertura: {
          titulo: 'Um pé na harmonia, outro no ritmo',
          texto:
            'O baixo é o único instrumento com um pé em cada lado: ele toca as notas da harmonia, mas no ritmo da bateria. Quando o baixo e o bumbo caem juntos, a banda soa como uma coisa só; quando brigam, tudo soa desmontado — mesmo com todo mundo tocando as notas certas. É por isso que o baixista escuta a bateria, não a guitarra.',
        },
        perguntas: [
          {
            id: 'b2q1',
            tipo: 'escolha',
            enunciado: 'Com quem o baixo precisa estar mais colado?',
            alternativas: ['com a guitarra', 'com o bumbo da bateria', 'com o vocal'],
            correta: 1,
            explica:
              'Com o bumbo. Seguir a guitarra e ignorar a bateria é o erro clássico de quem começa no baixo.',
          },
          {
            id: 'b2q2',
            tipo: 'escolha',
            enunciado: 'Numa música, o que costuma soar melhor?',
            alternativas: [
              'encher com o máximo de notas',
              'poucas notas, sempre no lugar certo do tempo',
              'copiar o que a guitarra faz',
            ],
            correta: 1,
            explica:
              'Menos é mais. O baixo é o chão em que os outros pisam — e chão cheio de buraco não sustenta. Tocar rápido impressiona outro baixista; tocar no lugar certo impressiona a banda.',
          },
          {
            id: 'b2q3',
            tipo: 'tempo',
            enunciado: 'Trave com o pulso: 8 batidas a 84 bpm.',
            bpm: 84,
            batidas: 8,
            toleranciaMs: 150,
            explica:
              'Constância é a habilidade mais valiosa do baixista — mais que qualquer escala. É ela que faz alguém te chamar pra tocar de novo.',
          },
        ],
      },
    ],
  },
  {
    id: 'b-tecnica',
    n: 2,
    trilha: 'instrumento',
    paraInstrumentos: ['baixo'],
    titulo: 'A mão direita',
    guia: 'Dedo ou palheta, e a habilidade que quase ninguém treina: calar as cordas que não deveriam soar.',
    licoes: [
      {
        id: 'b-dedo-palheta',
        titulo: 'Dedo ou palheta',
        abertura: {
          titulo: 'Duas ferramentas, dois sons',
          texto:
            'Tocar com os dedos (normalmente indicador e médio, alternando) dá um som mais redondo e encorpado — é o padrão no soul, no samba, no jazz. Palheta dá ataque mais definido e agressivo, com cada nota começando de forma marcada — é comum no rock e no punk. Nenhum é melhor: são cores diferentes.',
        },
        perguntas: [
          {
            id: 'b3q1',
            tipo: 'escolha',
            enunciado: 'Qual a principal diferença entre tocar com dedo e com palheta?',
            alternativas: [
              'palheta é pra iniciante, dedo é pra avançado',
              'dedo soa mais redondo, palheta tem ataque mais definido',
              'com palheta não dá pra tocar rápido',
            ],
            correta: 1,
            explica:
              'São cores diferentes, não níveis. Muito baixista profissional usa os dois, escolhendo conforme a música pede.',
          },
        ],
      },
      {
        id: 'b-abafar',
        titulo: 'Calar o que não deve soar',
        abertura: {
          titulo: 'Silêncio também é técnica',
          texto:
            'No baixo, as cordas graves continuam ressoando depois que você toca — e essa sobra suja tudo. Abafar é usar a lateral dos dedos da mão direita e a palma da esquerda pra calar as cordas que não estão em uso. É uma habilidade invisível: ninguém percebe quando está lá, mas todo mundo ouve a bagunça quando falta.',
        },
        perguntas: [
          {
            id: 'b4q1',
            tipo: 'escolha',
            enunciado: 'Seu baixo soa embolado mesmo tocando as notas certas. Causa provável?',
            alternativas: [
              'as cordas anteriores continuam ressoando',
              'o amplificador está com volume baixo',
              'você está tocando devagar demais',
            ],
            correta: 0,
            explica:
              'Sobra de ressonância. No grave a nota demora a morrer, e duas notas se sobrepondo viram lama. Abafar é o que limpa isso.',
          },
        ],
      },
    ],
  },
]

/* ============================================================
   BATERIA — zero teoria de altura. Só bateria.
   ============================================================ */

export const BATERIA: Unidade[] = [
  {
    id: 'd-instrumento',
    n: 1,
    trilha: 'instrumento',
    paraInstrumentos: ['bateria'],
    titulo: 'Seu instrumento',
    guia: 'As peças que fazem uma levada, a pegada solta e a contagem em voz alta.',
    licoes: [
      {
        id: 'd-pecas',
        titulo: 'As peças que importam',
        abertura: {
          titulo: 'Três peças fazem quase tudo',
          texto:
            'Bumbo, caixa e chimbal sustentam quase toda levada de música popular. Tons e pratos entram como tempero e viradas, mas o groove que faz a cabeça balançar sai desses três. Dá pra tocar milhares de músicas só com eles — e dá pra começar a estudar sem kit nenhum: um pad e um par de baquetas resolvem os primeiros meses.',
          diagrama: 'kit-bateria',
        },
        perguntas: [
          {
            id: 'd1q1',
            tipo: 'escolha',
            enunciado: 'Quais três peças sustentam quase toda levada?',
            alternativas: ['bumbo, caixa e chimbal', 'os três tomes', 'caixa e os dois pratos'],
            correta: 0,
            explica:
              'Bumbo, caixa e chimbal. É a base de praticamente todo rock, pop, funk e sertanejo que você já ouviu.',
          },
          {
            id: 'd1q2',
            tipo: 'escolha',
            enunciado: 'Sem kit em casa, dá pra estudar de verdade?',
            alternativas: [
              'não, sem o kit não tem como',
              'sim: pad e baquetas resolvem os primeiros meses',
              'só se tiver pelo menos caixa e bumbo',
            ],
            correta: 1,
            explica:
              'Pegada, rudimento, constância e leitura se treinam num pad. A bateria é o instrumento mais barato de começar a estudar e o mais caro de comprar.',
          },
        ],
      },
      {
        id: 'd-pegada',
        titulo: 'A pegada',
        abertura: {
          titulo: 'A baqueta trabalha, não você',
          texto:
            'A baqueta quica sozinha quando você deixa. Segure com o polegar e o indicador fazendo um ponto de apoio, e os outros dedos só acompanhando — solto o bastante pra ela voltar. Apertar forte mata o quique: aí você compensa movendo o braço inteiro, cansa em dois minutos e ainda tira um som sufocado do instrumento. Se sua mão dói depois de dez minutos, é aperto, não falta de força.',
          diagrama: 'pegada-baqueta',
        },
        perguntas: [
          {
            id: 'd2q1',
            tipo: 'escolha',
            enunciado: 'Qual é o erro nº1 de quem começa?',
            alternativas: ['segurar a baqueta apertado demais', 'usar baqueta fina', 'sentar longe do kit'],
            correta: 0,
            explica:
              'Apertar demais. A baqueta precisa quicar, e o aperto mata o quique — o resto dos problemas vem daí.',
          },
          {
            id: 'd2q2',
            tipo: 'escolha',
            enunciado: 'O que é tocar com dinâmica?',
            alternativas: [
              'tocar sempre forte pra a bateria aparecer',
              'variar a intensidade conforme a música pede',
              'tocar rápido nas partes agitadas',
            ],
            correta: 1,
            explica:
              'Variar o volume dentro da própria levada. Bater tudo igual é o que faz uma bateria soar robótica mesmo com o ritmo certo.',
          },
        ],
      },
      {
        id: 'd-contagem',
        titulo: 'Contar alto',
        abertura: {
          titulo: 'Um "e" entre cada tempo',
          texto:
            'Um compasso de quatro tempos dividido em colcheias se conta assim: 1 e 2 e 3 e 4 e. São 8 golpes. Dividindo mais ainda, em semicolcheias, vira 1 e & a 2 e & a — 16 golpes. Contar em voz alta parece bobo e é a coisa que mais destrava iniciante: enquanto você conta, não tem como se perder no compasso.',
        },
        perguntas: [
          {
            id: 'd3q1',
            tipo: 'escolha',
            enunciado: 'Como se conta um compasso dividido em colcheias?',
            alternativas: ['1 2 3 4 5 6 7 8', '1 e 2 e 3 e 4 e', '1 e & a 2 e & a'],
            correta: 1,
            explica:
              'Um "e" entre cada tempo. A terceira alternativa é a divisão em semicolcheias, que vem depois.',
          },
          {
            id: 'd3q2',
            tipo: 'tempo',
            enunciado: 'Bata nos 4 tempos, contando alto: 8 batidas a 90 bpm.',
            bpm: 90,
            batidas: 8,
            toleranciaMs: 140,
            explica:
              'Você é o relógio da banda. Um guitarrista fora do tempo atrapalha uma parte; um baterista fora do tempo derruba a música inteira.',
          },
        ],
      },
    ],
  },
  {
    id: 'd-levada',
    n: 2,
    trilha: 'instrumento',
    paraInstrumentos: ['bateria'],
    titulo: 'Sua primeira levada',
    guia: 'A levada que está na maioria das músicas que você escuta — e por que ela funciona.',
    licoes: [
      {
        id: 'd-rock',
        titulo: 'O rock básico',
        abertura: {
          titulo: 'Pergunta e resposta',
          texto:
            'O chimbal marca o pulso o tempo todo — é o relógio que a banda escuta. Por baixo dele, bumbo e caixa conversam: bumbo nos tempos 1 e 3, caixa respondendo no 2 e 4. Essa alternância é o que faz a cabeça balançar. A caixa no 2 e no 4 é exatamente onde a plateia bate palma.',
        },
        perguntas: [
          {
            id: 'd4q1',
            tipo: 'escolha',
            enunciado: 'O chimbal toca quando?',
            alternativas: ['só no 1 e no 3', 'o tempo todo, marcando o pulso', 'só quando a caixa não toca'],
            correta: 1,
            explica: 'O tempo todo. Ele é o relógio — o bumbo e a caixa conversam por baixo dele.',
          },
          {
            id: 'd4q2',
            tipo: 'escolha',
            enunciado: 'Bumbo e caixa caem onde?',
            alternativas: ['bumbo no 1 e 3, caixa no 2 e 4', 'sempre juntos', 'caixa no 1 e 3, bumbo no 2 e 4'],
            correta: 0,
            explica:
              'Bumbo no 1 e 3, caixa respondendo no 2 e 4. É pergunta e resposta, e é onde a plateia bate palma.',
          },
          {
            id: 'd4q3',
            tipo: 'tempo',
            enunciado: 'Bata só onde a caixa cai — nos tempos 2 e 4: 4 batidas.',
            bpm: 44,
            batidas: 4,
            toleranciaMs: 200,
            explica:
              'Sentir o contratempo sem contar é o que separa quem toca a levada de quem sente a levada. Agora vale abrir a Groove Machine e montar isso ouvindo.',
          },
        ],
      },
    ],
  },
  {
    id: 'd-viradas',
    n: 3,
    trilha: 'instrumento',
    paraInstrumentos: ['bateria'],
    titulo: 'Viradas e independência',
    guia: 'Como sair da levada e voltar sem se perder — e por que os membros parecem não obedecer.',
    licoes: [
      {
        id: 'd-virada',
        titulo: 'A virada',
        abertura: {
          titulo: 'Virada é pontuação, não solo',
          texto:
            'A virada marca a passagem de uma parte pra outra — fim de refrão, entrada de estrofe. Ela ocupa o espaço de um compasso ou meio, e o mais importante não é o que você toca no meio: é voltar pro tempo 1 no lugar exato. Uma virada simples que cai certo vale infinitamente mais que uma complicada que desmonta a música.',
        },
        perguntas: [
          {
            id: 'd5q1',
            tipo: 'escolha',
            enunciado: 'O que mais importa numa virada?',
            alternativas: [
              'ser rápida e cheia de notas',
              'voltar pro tempo 1 no lugar exato',
              'usar todos os tomes',
            ],
            correta: 1,
            explica:
              'Voltar no lugar. Virada é pontuação: serve pra avisar que algo vai mudar. Se ela atrasa a volta, a banda inteira tropeça.',
          },
          {
            id: 'd5q2',
            tipo: 'escolha',
            enunciado: 'Você se perde no meio da virada. O que costuma resolver?',
            alternativas: [
              'tocar mais devagar e continuar contando',
              'decorar viradas mais longas',
              'parar de usar o chimbal',
            ],
            correta: 0,
            explica:
              'Devagar e contando. A contagem é o corrimão: enquanto ela continua na cabeça, você sabe onde está mesmo saindo da levada.',
          },
        ],
      },
      {
        id: 'd-independencia',
        titulo: 'Independência',
        abertura: {
          titulo: 'Cada membro numa tarefa',
          texto:
            'Independência é conseguir que mão direita, mão esquerda e pé façam coisas diferentes ao mesmo tempo. Ela não vem de força nem de talento: vem de repetição lenta até o movimento virar automático e não precisar mais de atenção. O caminho é sempre o mesmo — comece com duas partes juntas, deixe automático, e só então acrescente a terceira.',
        },
        perguntas: [
          {
            id: 'd6q1',
            tipo: 'escolha',
            enunciado: 'Como se constrói independência entre os membros?',
            alternativas: [
              'exercícios de força na mão',
              'juntar duas partes, deixar automático, e só então somar a terceira',
              'tocar tudo junto o mais rápido possível',
            ],
            correta: 1,
            explica:
              'Uma camada por vez. Tentar as três de uma vez sobrecarrega e não fixa nenhuma — a sensação de "meu corpo não obedece" quase sempre é isso.',
          },
        ],
      },
    ],
  },
  {
    id: 'd-som',
    n: 4,
    trilha: 'instrumento',
    paraInstrumentos: ['bateria'],
    titulo: 'O som do kit',
    guia: 'Afinação de pele, abafamento e os tipos de prato — por que dois kits iguais soam diferente.',
    licoes: [
      {
        id: 'd-afinacao',
        titulo: 'Afinar a pele',
        abertura: {
          titulo: 'Bateria também afina',
          texto:
            'Muita gente nem sabe que bateria se afina. As porcas em volta da pele controlam a tensão, e elas precisam estar parelhas entre si — senão a pele vibra torto e o som fica com aquele "uóim" desagradável. Mais tensão dá som mais agudo e curto; menos tensão dá grave e longo. E um pedaço de fita ou uma manta por cima abafa o excesso de ressonância.',
        },
        perguntas: [
          {
            id: 'd7q1',
            tipo: 'escolha',
            enunciado: 'A pele está com as porcas desiguais. O que acontece?',
            alternativas: [
              'nada, desde que esteja apertada',
              'a pele vibra torto e o som sai com um zumbido desafinado',
              'a pele estoura na hora',
            ],
            correta: 1,
            explica:
              'Vibra torto. Afinar a bateria é sobretudo deixar a tensão parelha em volta da pele inteira — só depois vem escolher se está aguda ou grave.',
          },
          {
            id: 'd7q2',
            tipo: 'escolha',
            enunciado: 'Você aperta mais a pele. O som fica como?',
            alternativas: ['mais agudo e mais curto', 'mais grave e mais longo', 'só mais alto'],
            correta: 0,
            explica:
              'Mais agudo e mais curto. É a mesma física da corda: mais tensão, vibração mais rápida.',
          },
        ],
      },
      {
        id: 'd-pratos',
        titulo: 'Os pratos',
        abertura: {
          titulo: 'Cada prato tem uma função',
          texto:
            'O chimbal marca o tempo e é o mais controlável — dá pra tocar fechado, entreaberto ou aberto. O prato de condução (ride) faz o papel do chimbal em partes mais abertas, com som mais espalhado e definido. O de ataque (crash) não marca tempo: ele pontua, marcando a entrada de uma parte nova. Usar crash como marcação é um dos erros que mais denuncia iniciante.',
        },
        perguntas: [
          {
            id: 'd8q1',
            tipo: 'escolha',
            enunciado: 'Pra que serve o prato de ataque (crash)?',
            alternativas: [
              'marcar o tempo no lugar do chimbal',
              'pontuar a entrada de uma parte nova',
              'substituir a caixa nas viradas',
            ],
            correta: 1,
            explica:
              'Pontuar. Ele é exclamação, não vírgula — usá-lo como marcação constante deixa a música cansativa e embolada.',
          },
        ],
      },
    ],
  },
]

/* ============================================================
   PIANO
   ============================================================ */

export const PIANO: Unidade[] = [
  {
    id: 'p-instrumento',
    n: 1,
    trilha: 'instrumento',
    paraInstrumentos: ['piano'],
    titulo: 'Seu instrumento',
    guia: 'Dedos numerados, mão no formato certo e as duas mãos achando o dó central.',
    licoes: [
      {
        id: 'p-dedos',
        titulo: 'Os números dos dedos',
        abertura: {
          titulo: 'Polegar é 1, nas duas mãos',
          texto:
            'No piano os dedos têm números: polegar 1, indicador 2, médio 3, anelar 4, mindinho 5 — e vale igual nas duas mãos. Quem vem do violão estranha, porque lá o indicador é que é o 1. Essa numeração aparece em toda partitura de piano, dizendo qual dedo usar em cada nota.',
          diagrama: 'dedos-numerados',
        },
        perguntas: [
          {
            id: 'p1q1',
            tipo: 'escolha',
            enunciado: 'Qual dedo é o número 1?',
            alternativas: ['o indicador', 'o polegar', 'depende da mão'],
            correta: 1,
            explica:
              'O polegar, nas duas mãos. Trocar isso é confusão garantida na hora de ler partitura — e é o tropeço clássico de quem vem do violão.',
          },
          {
            id: 'p1q2',
            tipo: 'escolha',
            enunciado: 'Na mão esquerda, qual é o 5?',
            alternativas: ['o polegar', 'o mindinho', 'o médio'],
            correta: 1,
            explica:
              'O mindinho, igual na direita. A numeração é espelhada: os dois polegares são 1 e ficam voltados um pro outro no centro do teclado.',
          },
        ],
      },
      {
        id: 'p-mao',
        titulo: 'O formato da mão',
        abertura: {
          titulo: 'Como segurar uma bolha',
          texto:
            'Imagine segurar uma bolha de sabão sem estourar: dedos curvados, nós das mãos formando uma cúpula, pulso no nível das teclas. Toca-se com a PONTA do dedo, não com a polpa deitada. Isso não é firula: dedo esticado tira o controle e deixa o anelar e o mindinho quase inúteis, e pulso caído tensiona o tendão e cobra a conta em dor. Muitas vezes a causa é o banco — o cotovelo deve ficar no nível das teclas ou pouco acima.',
          diagrama: 'mao-piano',
        },
        perguntas: [
          {
            id: 'p2q1',
            tipo: 'escolha',
            enunciado: 'Seus dedos ficam esticados nas teclas. Qual o problema?',
            alternativas: [
              'nenhum, é questão de estilo',
              'perde controle e os dedos fracos ficam ainda mais fracos',
              'só atrapalha em música clássica',
            ],
            correta: 1,
            explica:
              'Dedo chato toca com a polpa, o som sai desigual e o anelar e o mindinho — já os mais fracos — ficam quase inúteis. Curvar resolve mais que exercício de força.',
          },
          {
            id: 'p2q2',
            tipo: 'escolha',
            enunciado: 'Seu pulso cai abaixo do nível das teclas. O que isso causa?',
            alternativas: ['tensão no tendão e menos independência', 'nada', 'som mais suave'],
            correta: 0,
            explica:
              'Tensão e travamento — e dor mais tarde. Antes de mudar a mão, cheque a altura do banco: o cotovelo deve ficar no nível das teclas ou pouco acima.',
          },
        ],
      },
      {
        id: 'p-do-central',
        titulo: 'O dó central',
        abertura: {
          titulo: 'Ache o dó de olho fechado',
          texto:
            'As teclas pretas vêm em grupos de duas e de três. O dó é sempre a branca logo ANTES do grupo de duas — por isso dá pra achar sem contar, em qualquer teclado do mundo. Com o polegar direito no dó e um dedo por tecla, você tem a posição de cinco dedos: dó, ré, mi, fá, sol.',
        },
        perguntas: [
          {
            id: 'p3q1',
            tipo: 'escolha',
            enunciado: 'Como achar o dó sem decorar?',
            alternativas: [
              'é a branca logo antes do grupo de DUAS pretas',
              'é a primeira branca do teclado',
              'é a branca no meio do grupo de TRÊS pretas',
            ],
            correta: 0,
            explica:
              'Logo antes do grupo de duas. Esse é o mapa que te orienta em qualquer teclado, de qualquer tamanho.',
          },
          {
            id: 'p3q2',
            tipo: 'tocar',
            enunciado: 'Vá até o teclado e toque um dó.',
            alvo: 0,
            alternativaNaTela: 'teclado',
            explica:
              'O site ouviu a nota sair do seu instrumento. Ele não perguntou se você sabe onde fica o dó: conferiu se você tocou.',
          },
        ],
      },
    ],
  },
  {
    id: 'p-maos',
    n: 2,
    trilha: 'instrumento',
    paraInstrumentos: ['piano'],
    titulo: 'As duas mãos',
    guia: 'A dificuldade que faz todo pianista achar que empacou — e o caminho pra sair dela.',
    licoes: [
      {
        id: 'p-independencia',
        titulo: 'Independência das mãos',
        abertura: {
          titulo: 'Uma mão de cada vez, sempre',
          texto:
            'O piano é generoso no começo: aperta a tecla e sai uma nota afinada. A conta chega depois, quando cada mão precisa de um ritmo próprio. E a solução nunca é tentar mais forte — é separar: toque a mão esquerda sozinha até virar automática, depois a direita, e só então junte, devagar. Quem junta antes de cada mão estar automática fica meses no mesmo lugar.',
        },
        perguntas: [
          {
            id: 'p4q1',
            tipo: 'escolha',
            enunciado: 'A mão esquerda atrapalha a direita. O que fazer?',
            alternativas: [
              'insistir com as duas juntas até sair',
              'deixar cada mão automática separada e só então juntar devagar',
              'tocar mais rápido pra o corpo pegar o jeito',
            ],
            correta: 1,
            explica:
              'Separar. Enquanto uma mão ainda exige atenção, não sobra atenção pra outra. Automatizar cada uma é o que libera espaço na cabeça.',
          },
          {
            id: 'p4q2',
            tipo: 'escolha',
            enunciado: 'A mão esquerda normalmente faz o quê numa música popular?',
            alternativas: [
              'a melodia principal',
              'a base: notas graves e acordes que sustentam',
              'nada, é só apoio visual',
            ],
            correta: 1,
            explica:
              'A base. A esquerda faz o papel do baixo e da harmonia, e a direita fica com a melodia. Entender essa divisão já organiza metade do trabalho.',
          },
        ],
      },
      {
        id: 'p-pedal',
        titulo: 'O pedal',
        abertura: {
          titulo: 'O pedal liga as notas, não aumenta o volume',
          texto:
            'O pedal da direita levanta os abafadores e deixa as cordas continuarem soando depois que você solta a tecla. Serve pra ligar um acorde ao próximo sem buraco no meio. O erro clássico é segurar o pedal o tempo todo: aí as notas de um acorde se misturam com as do próximo e vira uma sopa. A regra prática é trocar o pedal no momento em que o acorde muda.',
        },
        perguntas: [
          {
            id: 'p5q1',
            tipo: 'escolha',
            enunciado: 'Pra que serve o pedal da direita?',
            alternativas: [
              'aumentar o volume',
              'deixar as notas continuarem soando depois de soltar a tecla',
              'deixar o som mais abafado',
            ],
            correta: 1,
            explica:
              'Sustentar. Ele levanta os abafadores e as cordas seguem vibrando — o que liga um acorde no outro sem buraco.',
          },
          {
            id: 'p5q2',
            tipo: 'escolha',
            enunciado: 'Seu som está virando uma sopa embolada. Provável causa?',
            alternativas: [
              'pedal segurado sem trocar quando o acorde muda',
              'você está tocando fraco demais',
              'as teclas estão sujas',
            ],
            correta: 0,
            explica:
              'Pedal parado. Ao trocar de acorde, troque o pedal: solta e pisa de novo, quase junto com a nota nova. É isso que limpa o som.',
          },
        ],
      },
    ],
  },
]

/* ============================================================
   VIOLINO — a dor nº1 é afinação, e a causa é tensão
   ============================================================ */

export const VIOLINO: Unidade[] = [
  {
    id: 'v-instrumento',
    n: 1,
    trilha: 'instrumento',
    paraInstrumentos: ['violino'],
    titulo: 'Seu instrumento',
    guia: 'As quatro cordas, o violino apoiado sem aperto e o arco tirando som limpo.',
    licoes: [
      {
        id: 'v-cordas',
        titulo: 'As quatro cordas',
        abertura: {
          titulo: 'Sol, ré, lá, mi — de quinta em quinta',
          texto:
            'Da mais grave pra mais aguda: sol, ré, lá, mi. A distância entre cada corda vizinha é sempre a mesma — uma quinta. Reconhecer esse som é o que te deixa afinar sem aparelho nenhum, e é uma habilidade que violinista usa a vida inteira.',
          diagrama: 'cordas-violino',
        },
        perguntas: [
          {
            id: 'v1q1',
            tipo: 'escolha',
            enunciado: 'Da mais grave pra mais aguda, quais são as cordas?',
            alternativas: ['sol · ré · lá · mi', 'mi · lá · ré · sol', 'dó · sol · ré · lá'],
            correta: 0,
            explica:
              'Sol, ré, lá, mi. A terceira alternativa é a viola de arco — parecida, mas começa no dó.',
          },
          {
            id: 'v1q2',
            tipo: 'tocar',
            enunciado: 'Passe o arco na corda lá solta e segure a nota.',
            alvo: 9,
            alternativaNaTela: 'teclado',
            explica:
              'O site conferiu se a nota saiu afinada. No violino, sem trastes, isso é tudo — ter alguém conferindo a cada nota é a diferença entre criar o ouvido certo e gravar o errado.',
          },
        ],
      },
      {
        id: 'v-segurar',
        titulo: 'Segurar sem apertar',
        abertura: {
          titulo: 'Tensão é o inimigo número um',
          texto:
            'O violino se apoia na clavícula, com o queixo apenas descansando em cima — não mordendo. A mão esquerda fica livre pra tocar, não pra segurar o instrumento. Isso não é conforto, é afinação: ombro subido, queixo apertado ou polegar espremido no braço travam a mão, e mão travada não acerta a nota. No violino, quase todo problema de som começa em algum músculo apertado.',
        },
        perguntas: [
          {
            id: 'v2q1',
            tipo: 'escolha',
            enunciado: 'Você aperta o queixo com força. Qual a consequência?',
            alternativas: ['nenhuma, é assim mesmo', 'trava o pescoço e piora a afinação', 'o som fica mais alto'],
            correta: 1,
            explica:
              'Engessa o instrumento e endurece a mão esquerda — e mão dura erra a nota. O peso da cabeça já basta pra segurar.',
          },
          {
            id: 'v2q2',
            tipo: 'escolha',
            enunciado: 'Como o dedo deve chegar na corda?',
            alternativas: [
              'caindo de cima, como um martelinho',
              'deslizando de lado até achar a nota',
              'apertando com a polpa deitada',
            ],
            correta: 0,
            explica:
              'De cima, com a mão em arco. Quando o dedo torce de lado, a mão perde o formato e os outros dedos ficam sem lugar — aí a afinação vira loteria.',
          },
        ],
      },
      {
        id: 'v-arco',
        titulo: 'O arco',
        abertura: {
          titulo: 'Paralelo ao cavalete, sem apertar',
          texto:
            'O arco anda sempre paralelo ao cavalete. Torto, ele escorrega e muda o ponto de contato com a corda, e o som sai fino ou raspado. E a mão direita precisa estar relaxada: polegar solto, dedos curvos. Apertar o arco de nervoso, ou variar a pressão no meio da arcada, é a causa mais comum daquele som arranhado.',
          diagrama: 'arco-cavalete',
        },
        perguntas: [
          {
            id: 'v3q1',
            tipo: 'escolha',
            enunciado: 'Seu som está arranhado. Causa mais provável?',
            alternativas: [
              'a corda está velha',
              'a mão direita está apertada, com pressão irregular',
              'o violino é de qualidade baixa',
            ],
            correta: 1,
            explica:
              'Quase sempre é a mão direita. Polegar relaxado e pressão constante resolvem mais que trocar de instrumento.',
          },
          {
            id: 'v3q2',
            tipo: 'escolha',
            enunciado: 'Por que praticar cordas soltas antes de usar os dedos?',
            alternativas: [
              'porque é o que se cobra em prova',
              'pra cuidar só do arco e do som, sem se preocupar com afinação junto',
              'porque os dedos precisam de calo',
            ],
            correta: 1,
            explica:
              'Uma dificuldade por vez. Sem os dedos a nota já sai afinada, e toda a atenção fica no arco. Depois a mão esquerda entra num terreno bem mais fácil.',
          },
        ],
      },
    ],
  },
  {
    id: 'v-afinacao',
    n: 2,
    trilha: 'instrumento',
    paraInstrumentos: ['violino'],
    titulo: 'Afinação',
    guia: 'A dor nº1 de quem toca um instrumento sem trastes — e como treinar isso de verdade.',
    licoes: [
      {
        id: 'v-ouvido-guia',
        titulo: 'O ouvido é o traste',
        abertura: {
          titulo: 'Você não vê a nota, você ouve',
          texto:
            'Na guitarra o traste garante a altura. No violino, quem garante é o seu ouvido — e por isso afinação não é acidente, é habilidade treinável. O caminho é sempre comparar: toque a nota e compare com a corda solta vizinha, ou com uma referência. Com o tempo o dedo passa a cair no lugar sozinho, mas isso só acontece se você estiver conferindo a cada nota, e não repetindo torto.',
        },
        perguntas: [
          {
            id: 'v4q1',
            tipo: 'escolha',
            enunciado: 'Por que a afinação é o problema central do violino?',
            alternativas: [
              'porque as cordas desafinam muito rápido',
              'porque não há trastes: a altura depende de onde seu dedo cai',
              'porque o arco desafina a nota',
            ],
            correta: 1,
            explica:
              'Sem trastes, um milímetro de diferença já muda a nota. Por isso violinista treina ouvido desde o primeiro dia — não é matéria avançada, é sobrevivência.',
          },
          {
            id: 'v4q2',
            tipo: 'escolha',
            enunciado: 'Você repete uma passagem 50 vezes sem conferir a afinação. O que acontece?',
            alternativas: [
              'melhora naturalmente pela repetição',
              'você grava o erro e fica mais difícil corrigir depois',
              'não muda nada',
            ],
            correta: 1,
            explica:
              'Repetição grava o que você fez, certo ou errado. Praticar sem conferir é ensinar o erro pro corpo — e desaprender custa muito mais que aprender.',
          },
        ],
      },
    ],
  },
  {
    id: 'v-arco-golpes',
    n: 3,
    trilha: 'instrumento',
    paraInstrumentos: ['violino'],
    titulo: 'Golpes de arco',
    guia: 'O arco é a sua voz: os mesmos dedos com arcadas diferentes viram músicas diferentes.',
    licoes: [
      {
        id: 'v-legato-staccato',
        titulo: 'Ligado ou destacado',
        abertura: {
          titulo: 'A mesma nota, dois caracteres',
          texto:
            'Legato é tocar ligado: as notas emendam sem interrupção, muitas vezes várias na mesma arcada. Staccato é destacado: cada nota curta, com silêncio entre elas. É o arco que decide isso, não a mão esquerda — e é por isso que dizem que no violino a mão direita é quem canta. Duas pessoas tocando as mesmas notas com arcadas diferentes fazem músicas com emoções opostas.',
        },
        perguntas: [
          {
            id: 'v5q1',
            tipo: 'escolha',
            enunciado: 'Qual mão decide se a música soa ligada ou destacada?',
            alternativas: ['a esquerda, que aperta as notas', 'a direita, que conduz o arco', 'as duas igualmente'],
            correta: 1,
            explica:
              'A direita. A esquerda escolhe QUAL nota; a direita decide COMO ela soa — e é aí que mora a expressão.',
          },
        ],
      },
    ],
  },
]

export const TRILHAS_DE_INSTRUMENTO: Unidade[] = [
  ...GUITARRA,
  ...BAIXO,
  ...BATERIA,
  ...PIANO,
  ...VIOLINO,
]

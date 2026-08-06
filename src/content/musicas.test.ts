import { describe, expect, it } from 'vitest'
import {
  duracaoEmTempos,
  linkDoOriginal,
  MUSICAS,
  PASSOS,
  pcDoGrau,
  qualidadeDoGrau,
  romano,
  romanoDoTrecho,
  qualidadeDoTrecho,
  semOTruque,
  temTruque,
  trechoNoTempo,
  trocarAcorde,
} from './musicas'

describe('progressões', () => {
  it('ids únicos e campos preenchidos', () => {
    const ids = MUSICAS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const m of MUSICAS) {
      expect(m.titulo.length).toBeGreaterThan(3)
      // historia e teoria sao o que fazem a ferramenta ENSINAR, nao so tocar
      expect(m.historia.length).toBeGreaterThan(150)
      expect(m.teoria.length).toBeGreaterThan(150)
      expect(m.licao.length).toBeGreaterThan(60)
      expect(m.artista.length).toBeGreaterThan(2)
      expect(m.camadas.length).toBeGreaterThanOrEqual(3)
      expect(m.bpm).toBeGreaterThan(40)
      expect(m.bpm).toBeLessThan(200)
    }
  })

  it('graus válidos e durações positivas', () => {
    for (const m of MUSICAS) {
      expect(m.progressao.length).toBeGreaterThanOrEqual(3)
      for (const t of m.progressao) {
        expect(t.grau).toBeGreaterThanOrEqual(1)
        expect(t.grau).toBeLessThanOrEqual(7)
        expect(t.tempos).toBeGreaterThan(0)
      }
    }
  })

  it('a classe de altura de cada grau fica na faixa 0..11', () => {
    for (const m of MUSICAS) {
      for (const t of m.progressao) {
        const pc = pcDoGrau(m, t.grau)
        expect(pc).toBeGreaterThanOrEqual(0)
        expect(pc).toBeLessThanOrEqual(11)
      }
    }
  })

  it('em ré maior, o grau I é ré e o V é lá', () => {
    const m = MUSICAS.find((x) => x.id === 'eduardo-e-monica')!
    expect(m.tonica).toBe(2)
    expect(pcDoGrau(m, 1)).toBe(2) // ré
    expect(pcDoGrau(m, 5)).toBe(9) // lá
    expect(pcDoGrau(m, 6)).toBe(11) // si
    expect(pcDoGrau(m, 4)).toBe(7) // sol
  })

  it('a qualidade segue o campo harmônico: I maior, vi menor', () => {
    const m = MUSICAS.find((x) => x.id === 'eduardo-e-monica')!
    expect(qualidadeDoGrau(m, 1)).toBe('maior')
    expect(qualidadeDoGrau(m, 5)).toBe('maior')
    expect(qualidadeDoGrau(m, 6)).toBe('menor')
  })

  it('numa tonalidade menor, o i é menor e o VI é maior', () => {
    const m = MUSICAS.find((x) => x.id === 'in-the-end')!
    expect(qualidadeDoGrau(m, 1)).toBe('menor')
    expect(qualidadeDoGrau(m, 6)).toBe('maior')
  })

  it('acorde emprestado usa a qualidade dele, não a do campo harmônico', () => {
    // é onde mora a mágica: no Creep o III vem MAIOR (deveria ser menor) e
    // o IV volta MENOR. Se o site tocasse a qualidade do campo, perderia o
    // efeito inteiro da música.
    const creep = MUSICAS.find((x) => x.id === 'creep')!
    const terceiro = creep.progressao.find((t) => t.grau === 3)!
    expect(terceiro.emprestado).toBeDefined()
    expect(qualidadeDoGrau(creep, 3)).toBe('menor') // o que o campo diria
    expect(qualidadeDoTrecho(creep, terceiro)).toBe('maior') // o que a música faz
    expect(romanoDoTrecho(creep, terceiro)).toBe('III') // maiúsculo, porque é maior

    const quartoMenor = creep.progressao.filter((t) => t.grau === 4).find((t) => t.emprestado)!
    expect(qualidadeDoTrecho(creep, quartoMenor)).toBe('menor')
    expect(romanoDoTrecho(creep, quartoMenor)).toBe('iv')
  })

  it('todo empréstimo explica o porquê — senão vira curiosidade sem aula', () => {
    for (const m of MUSICAS) {
      for (const t of m.progressao) {
        if (t.emprestado) expect(t.emprestado.porque.length).toBeGreaterThan(30)
      }
    }
  })

  it('o algarismo romano mostra a qualidade pela caixa', () => {
    const maior = MUSICAS.find((x) => x.id === 'eduardo-e-monica')!
    expect(romano(maior, 1)).toBe('I')
    expect(romano(maior, 6)).toBe('vi')
    const menor = MUSICAS.find((x) => x.id === 'in-the-end')!
    expect(romano(menor, 1)).toBe('i')
    expect(romano(menor, 6)).toBe('VI')
  })
})

describe('linha do tempo', () => {
  const m = MUSICAS.find((x) => x.id === 'eduardo-e-monica')!

  it('duração é a soma dos trechos', () => {
    expect(duracaoEmTempos(m)).toBe(16)
  })

  it('cada trecho aparece na sua janela de tempo', () => {
    expect(trechoNoTempo(m, 0)).toBe(0)
    expect(trechoNoTempo(m, 3)).toBe(0)
    expect(trechoNoTempo(m, 4)).toBe(1)
    expect(trechoNoTempo(m, 8)).toBe(2)
    expect(trechoNoTempo(m, 15)).toBe(3)
  })

  it('a progressão dá a volta em loop', () => {
    expect(trechoNoTempo(m, 16)).toBe(0)
    expect(trechoNoTempo(m, 20)).toBe(1)
  })

  it('nenhuma música deixa buraco na linha do tempo', () => {
    for (const musica of MUSICAS) {
      const total = duracaoEmTempos(musica)
      for (let t = 0; t < total; t++) {
        const i = trechoNoTempo(musica, t)
        expect(i).toBeGreaterThanOrEqual(0)
        expect(i).toBeLessThan(musica.progressao.length)
      }
    }
  })
})

describe('o arranjo tocável', () => {
  it('toda música tem levada e bateria válidas', () => {
    // sem levada a música vira quatro blocos de som — que era exatamente o
    // defeito da versão anterior da ferramenta
    for (const m of MUSICAS) {
      expect(m.levada.length).toBeGreaterThan(0)
      for (const passo of m.levada) {
        expect(passo).toBeGreaterThanOrEqual(0)
        expect(passo).toBeLessThan(PASSOS)
      }
      expect(new Set(m.levada).size).toBe(m.levada.length)
      for (const peca of ['chimbal', 'caixa', 'tom', 'bumbo'] as const) {
        expect(m.bateria[peca]).toHaveLength(PASSOS)
      }
    }
  })

  it('a duração de toda música fecha em compassos inteiros', () => {
    // a levada se repete a cada compasso de 4/4; se a soma dos tempos não for
    // múltipla de 4, a batida escorrega em relação aos acordes a cada volta
    for (const m of MUSICAS) {
      expect(duracaoEmTempos(m) % 4).toBe(0)
    }
  })

  it('cada música tem pelo menos harmonia, baixo e bateria tocáveis', () => {
    for (const m of MUSICAS) {
      const pistas = m.camadas.map((c) => c.pista).filter(Boolean)
      expect(pistas).toContain('harmonia')
      expect(pistas).toContain('baixo')
      expect(pistas).toContain('bateria')
    }
  })

  it('o link do original leva pra uma busca com o nome certo', () => {
    const creep = MUSICAS.find((x) => x.id === 'creep')!
    const link = linkDoOriginal(creep)
    expect(link).toContain('youtube.com')
    expect(decodeURIComponent(link)).toContain('Radiohead')
    expect(decodeURIComponent(link)).toContain('Creep')
    // a forma tradicional não tem artista pesquisável, então usa a busca própria
    const blues = MUSICAS.find((x) => x.id === 'blues-12')!
    expect(decodeURIComponent(linkDoOriginal(blues))).not.toContain('forma tradicional')
  })
})

describe('desligar o truque', () => {
  const creep = MUSICAS.find((x) => x.id === 'creep')!

  it('o Creep tem truque; o Eduardo e Mônica não', () => {
    expect(temTruque(creep)).toBe(true)
    expect(temTruque(MUSICAS.find((x) => x.id === 'eduardo-e-monica')!)).toBe(false)
  })

  it('sem o truque, o III do Creep volta a ser menor e o iv volta a maior', () => {
    // é ISTO que nenhum vídeo faz: um vídeo CONTA que o III maior causa o
    // arrepio; aqui a pessoa desliga e ouve o arrepio ir embora
    const sem = semOTruque(creep)
    const terceiro = sem.find((t) => t.grau === 3)!
    expect(terceiro.emprestado).toBeUndefined()
    expect(qualidadeDoTrecho(creep, terceiro)).toBe('menor')
    for (const t of sem) expect(t.emprestado).toBeUndefined()
  })

  it('desligar o truque não mexe na duração de nenhum trecho', () => {
    // se mexesse, a sequência sairia do compasso e a comparação perderia sentido
    const sem = semOTruque(creep)
    expect(sem.map((t) => t.tempos)).toEqual(creep.progressao.map((t) => t.tempos))
  })

  it('não estraga o original', () => {
    semOTruque(creep)
    expect(creep.progressao.find((t) => t.grau === 3)!.emprestado).toBeDefined()
  })
})

describe('trocar um acorde', () => {
  const m = MUSICAS.find((x) => x.id === 'eduardo-e-monica')!

  it('troca só o acorde escolhido e mantém a duração', () => {
    const nova = trocarAcorde(m.progressao, 1, 4, 'maior', qualidadeDoGrau(m, 4))
    expect(nova[1].grau).toBe(4)
    expect(nova[1].tempos).toBe(m.progressao[1].tempos)
    expect(nova[0].grau).toBe(m.progressao[0].grau)
    expect(nova[3].grau).toBe(m.progressao[3].grau)
  })

  it('qualidade igual à do campo harmônico não vira empréstimo', () => {
    const nova = trocarAcorde(m.progressao, 0, 6, 'menor', qualidadeDoGrau(m, 6))
    expect(nova[0].emprestado).toBeUndefined()
    expect(qualidadeDoTrecho(m, nova[0])).toBe('menor')
  })

  it('qualidade fora do campo vira empréstimo e a ferramenta toca ela', () => {
    // trocar o vi menor por VI maior é a experiência que ensina o que
    // "emprestado" quer dizer — e o som TEM que mudar de verdade
    const nova = trocarAcorde(m.progressao, 2, 6, 'maior', qualidadeDoGrau(m, 6))
    expect(nova[2].emprestado).toBeDefined()
    expect(qualidadeDoTrecho(m, nova[2])).toBe('maior')
    expect(romanoDoTrecho(m, nova[2])).toBe('VI')
  })

  it('não estraga a progressão original', () => {
    const antes = JSON.stringify(m.progressao)
    trocarAcorde(m.progressao, 0, 7, 'diminuto', qualidadeDoGrau(m, 7))
    expect(JSON.stringify(m.progressao)).toBe(antes)
  })
})

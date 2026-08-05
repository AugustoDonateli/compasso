import { describe, expect, it } from 'vitest'
import {
  duracaoEmTempos,
  MUSICAS,
  pcDoGrau,
  qualidadeDoGrau,
  romano,
  romanoDoTrecho,
  qualidadeDoTrecho,
  trechoNoTempo,
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

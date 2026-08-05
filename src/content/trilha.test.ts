import { describe, expect, it } from 'vitest'
import {
  licaoDesbloqueada,
  licaoPorId,
  licoesDe,
  progressoPct,
  proximaLicao,
  TEORIA,
  TODAS_UNIDADES,
  trilhaDe,
  type TrilhaInstrumento,
} from './trilha'

const INSTRUMENTOS: TrilhaInstrumento[] = ['guitarra', 'violao', 'baixo', 'bateria', 'piano', 'violino']

describe('estrutura', () => {
  it('ids de unidade, lição e pergunta são únicos no site inteiro', () => {
    const u = TODAS_UNIDADES.map((x) => x.id)
    expect(new Set(u).size).toBe(u.length)
    const l = TODAS_UNIDADES.flatMap((x) => x.licoes.map((y) => y.id))
    expect(new Set(l).size).toBe(l.length)
    const q = TODAS_UNIDADES.flatMap((x) => x.licoes.flatMap((y) => y.perguntas.map((p) => p.id)))
    expect(new Set(q).size).toBe(q.length)
  })

  it('TODA lição ensina antes de perguntar', () => {
    // a regra corrigida: perguntar sem ensinar é adivinhação. Se uma lição
    // nova entrar sem abertura, este teste quebra de propósito.
    for (const u of TODAS_UNIDADES) {
      for (const l of u.licoes) {
        expect(l.abertura, `lição "${l.id}" não tem abertura`).toBeDefined()
        expect(l.abertura!.texto.length).toBeGreaterThan(120)
        expect(l.abertura!.titulo.length).toBeGreaterThan(5)
      }
    }
  })

  it('toda pergunta explica a resposta', () => {
    for (const u of TODAS_UNIDADES) {
      for (const l of u.licoes) {
        for (const p of l.perguntas) expect(p.explica.length).toBeGreaterThan(60)
      }
    }
  })

  it('alternativas: de 2 a 4, com índice válido e sem repetição', () => {
    for (const u of TODAS_UNIDADES) {
      for (const l of u.licoes) {
        for (const p of l.perguntas) {
          if (p.tipo === 'escolha' || p.tipo === 'ouvir') {
            expect(p.alternativas.length).toBeGreaterThanOrEqual(2)
            expect(p.alternativas.length).toBeLessThanOrEqual(4)
            expect(p.correta).toBeGreaterThanOrEqual(0)
            expect(p.correta).toBeLessThan(p.alternativas.length)
            expect(new Set(p.alternativas).size).toBe(p.alternativas.length)
          }
        }
      }
    }
  })

  it('a resposta certa não é sempre a primeira', () => {
    const idx = TODAS_UNIDADES.flatMap((u) =>
      u.licoes.flatMap((l) =>
        l.perguntas
          .filter((p) => p.tipo === 'escolha' || p.tipo === 'ouvir')
          .map((p) => (p as { correta: number }).correta),
      ),
    )
    expect(new Set(idx).size).toBeGreaterThan(1)
  })

  it('perguntas de montar têm alvo válido', () => {
    for (const u of TODAS_UNIDADES) {
      for (const l of u.licoes) {
        for (const p of l.perguntas) {
          if (p.tipo === 'montar') {
            expect(p.alvo.length).toBeGreaterThan(0)
            for (const pc of p.alvo) {
              expect(pc).toBeGreaterThanOrEqual(0)
              expect(pc).toBeLessThanOrEqual(11)
            }
          }
        }
      }
    }
  })

  it('toda pergunta de microfone tem saída pela tela', () => {
    for (const u of TODAS_UNIDADES) {
      for (const l of u.licoes) {
        for (const p of l.perguntas) {
          if (p.tipo === 'tocar') expect(['braco', 'teclado']).toContain(p.alternativaNaTela)
        }
      }
    }
  })
})

describe('as duas trilhas são independentes', () => {
  it('a trilha do instrumento NÃO tem teoria musical abstrata', () => {
    // era o problema: o baterista levava 9 lições de altura que não usa
    const idsDeTeoria = TEORIA.flatMap((u) => u.licoes.map((l) => l.id))
    for (const i of INSTRUMENTOS) {
      const ids = licoesDe(i, 'instrumento').map((x) => x.licao.id)
      for (const t of idsDeTeoria) expect(ids).not.toContain(t)
    }
  })

  it('a trilha de teoria é a mesma pra qualquer instrumento', () => {
    const base = licoesDe('guitarra', 'teoria').map((x) => x.licao.id)
    for (const i of INSTRUMENTOS) {
      expect(licoesDe(i, 'teoria').map((x) => x.licao.id)).toEqual(base)
    }
  })

  it('bateria não recebe nenhuma pergunta de altura', () => {
    const perguntas = licoesDe('bateria', 'instrumento').flatMap((x) => x.licao.perguntas)
    expect(perguntas.length).toBeGreaterThan(0)
    for (const p of perguntas) {
      expect(['ouvir', 'montar', 'achar', 'tocar']).not.toContain(p.tipo)
    }
  })

  it('cada instrumento vê só o galho dele', () => {
    const marcador: Record<string, string> = {
      guitarra: 'g-cordas',
      violao: 'g-cordas',
      baixo: 'b-cordas',
      bateria: 'd-pecas',
      piano: 'p-dedos',
      violino: 'v-cordas',
    }
    for (const i of INSTRUMENTOS) {
      const ids = licoesDe(i, 'instrumento').map((x) => x.licao.id)
      expect(ids).toContain(marcador[i])
      for (const [outro, id] of Object.entries(marcador)) {
        if (marcador[i] !== id && outro !== i) expect(ids).not.toContain(id)
      }
    }
  })

  it('todo instrumento tem trilha própria com tamanho decente', () => {
    for (const i of INSTRUMENTOS) {
      expect(licoesDe(i, 'instrumento').length).toBeGreaterThanOrEqual(4)
      expect(trilhaDe(i, 'instrumento').length).toBeGreaterThanOrEqual(2)
    }
  })

  it('só instrumento com casas usa pergunta de braço', () => {
    const comBraco = ['guitarra', 'violao', 'baixo']
    for (const i of INSTRUMENTOS) {
      const temAchar = licoesDe(i, 'instrumento').some((x) =>
        x.licao.perguntas.some((p) => p.tipo === 'achar'),
      )
      if (!comBraco.includes(i)) expect(temAchar).toBe(false)
    }
  })
})

describe('progressão', () => {
  const ids = licoesDe('guitarra', 'instrumento').map((x) => x.licao.id)

  it('próxima lição é a primeira não concluída', () => {
    expect(proximaLicao([], 'guitarra', 'instrumento')?.licao.id).toBe(ids[0])
    expect(proximaLicao([ids[0]], 'guitarra', 'instrumento')?.licao.id).toBe(ids[1])
    expect(proximaLicao([ids[0], ids[2]], 'guitarra', 'instrumento')?.licao.id).toBe(ids[1])
  })

  it('trilha concluída não tem próxima', () => {
    expect(proximaLicao(ids, 'guitarra', 'instrumento')).toBeNull()
  })

  it('desbloqueio é sequencial dentro da trilha', () => {
    expect(licaoDesbloqueada(ids[0], [], 'guitarra', 'instrumento')).toBe(true)
    expect(licaoDesbloqueada(ids[1], [], 'guitarra', 'instrumento')).toBe(false)
    expect(licaoDesbloqueada(ids[1], [ids[0]], 'guitarra', 'instrumento')).toBe(true)
  })

  it('progresso de uma trilha não conta na outra', () => {
    expect(progressoPct(ids, 'guitarra', 'instrumento')).toBe(100)
    expect(progressoPct(ids, 'guitarra', 'teoria')).toBe(0)
  })

  it('busca por id respeita a trilha', () => {
    expect(licaoPorId(ids[0], 'guitarra', 'instrumento')).toBeDefined()
    expect(licaoPorId(ids[0], 'guitarra', 'teoria')).toBeUndefined()
  })
})

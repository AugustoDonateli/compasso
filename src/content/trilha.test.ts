import { describe, expect, it } from 'vitest'
import {
  licaoDesbloqueada,
  licaoPorId,
  progressoPct,
  proximaLicao,
  TODAS_LICOES,
  UNIDADES,
} from './trilha'

describe('estrutura da trilha', () => {
  it('ids de unidade e lição são únicos', () => {
    const uIds = UNIDADES.map((u) => u.id)
    expect(new Set(uIds).size).toBe(uIds.length)
    const lIds = TODAS_LICOES.map((x) => x.licao.id)
    expect(new Set(lIds).size).toBe(lIds.length)
  })

  it('ids de pergunta são únicos no site inteiro', () => {
    const qIds = UNIDADES.flatMap((u) => u.licoes.flatMap((l) => l.perguntas.map((p) => p.id)))
    expect(new Set(qIds).size).toBe(qIds.length)
  })

  it('unidades numeradas em sequência e com guia', () => {
    UNIDADES.forEach((u, i) => {
      expect(u.n).toBe(i + 1)
      expect(u.guia.length).toBeGreaterThan(40)
    })
  })

  it('toda lição tem pelo menos duas perguntas', () => {
    for (const { licao } of TODAS_LICOES) {
      expect(licao.perguntas.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('TODA pergunta explica a resposta — o erro sempre vira aula', () => {
    for (const { licao } of TODAS_LICOES) {
      for (const p of licao.perguntas) {
        expect(p.explica.length).toBeGreaterThan(30)
      }
    }
  })

  it('perguntas de alternativa têm índice de resposta válido', () => {
    for (const { licao } of TODAS_LICOES) {
      for (const p of licao.perguntas) {
        if (p.tipo === 'escolha' || p.tipo === 'ouvir') {
          expect(p.alternativas.length).toBeGreaterThanOrEqual(2)
          expect(p.correta).toBeGreaterThanOrEqual(0)
          expect(p.correta).toBeLessThan(p.alternativas.length)
        }
      }
    }
  })

  it('perguntas de montar têm alvo válido (classes de altura 0..11)', () => {
    for (const { licao } of TODAS_LICOES) {
      for (const p of licao.perguntas) {
        if (p.tipo === 'montar') {
          expect(p.alvo.length).toBeGreaterThan(0)
          for (const pc of p.alvo) expect(pc).toBeGreaterThanOrEqual(0)
          for (const pc of p.alvo) expect(pc).toBeLessThanOrEqual(11)
        }
      }
    }
  })
})

describe('progressão', () => {
  const ids = TODAS_LICOES.map((x) => x.licao.id)

  it('próxima lição é a primeira não concluída', () => {
    expect(proximaLicao([])?.licao.id).toBe(ids[0])
    expect(proximaLicao([ids[0]])?.licao.id).toBe(ids[1])
    // buraco no meio: volta o que falta, não o seguinte ao último feito
    expect(proximaLicao([ids[0], ids[2]])?.licao.id).toBe(ids[1])
  })

  it('trilha inteira concluída não tem próxima', () => {
    expect(proximaLicao(ids)).toBeNull()
  })

  it('a primeira lição já nasce desbloqueada', () => {
    expect(licaoDesbloqueada(ids[0], [])).toBe(true)
  })

  it('lição só desbloqueia depois da anterior', () => {
    expect(licaoDesbloqueada(ids[1], [])).toBe(false)
    expect(licaoDesbloqueada(ids[1], [ids[0]])).toBe(true)
  })

  it('percentual de progresso', () => {
    expect(progressoPct([])).toBe(0)
    expect(progressoPct(ids)).toBe(100)
    expect(progressoPct(['inexistente'])).toBe(0)
  })

  it('busca por id devolve a unidade junto', () => {
    const found = licaoPorId(ids[0])
    expect(found?.unidade.n).toBe(1)
    expect(licaoPorId('nada')).toBeUndefined()
  })
})

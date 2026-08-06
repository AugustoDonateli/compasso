import { describe, expect, it } from 'vitest'
import { bancada, pecasDe, PECAS } from './estudio'

describe('a bancada', () => {
  it('começa com peça na mão, não vazia', () => {
    // uma bancada vazia no primeiro acesso ensina que o site é uma promessa;
    // com duas peças já em mãos, ensina que ele é um lugar
    const b = bancada(0, 'guitarra')
    expect(b.liberadas.length).toBeGreaterThanOrEqual(2)
  })

  it('não oferece afinador nem braço pra quem toca bateria', () => {
    const ids = pecasDe('bateria').map((p) => p.id)
    expect(ids).not.toContain('afinador')
    expect(ids).not.toContain('mapa')
  })

  it('a fração anda entre uma peça e a seguinte', () => {
    const a = bancada(0, 'guitarra')
    const meio = bancada(75, 'guitarra')
    const quase = bancada(149, 'guitarra')
    expect(a.fracao).toBe(0)
    expect(meio.fracao).toBeCloseTo(0.5, 1)
    expect(quase.fracao).toBeGreaterThan(0.9)
    expect(quase.fracao).toBeLessThan(1)
  })

  it('libera a peça exatamente no custo, nunca um xp depois', () => {
    expect(bancada(149, 'guitarra').liberadas.map((p) => p.id)).not.toContain('mapa')
    expect(bancada(150, 'guitarra').liberadas.map((p) => p.id)).toContain('mapa')
  })

  it('com tudo liberado não sobra próxima nem falta', () => {
    const tudo = Math.max(...PECAS.map((p) => p.custo))
    const b = bancada(tudo, 'guitarra')
    expect(b.proxima).toBeNull()
    expect(b.falta).toBe(0)
    expect(b.fracao).toBe(1)
  })

  it('o que falta é sempre o que falta de verdade', () => {
    const b = bancada(120, 'guitarra')
    expect(b.proxima?.custo).toBe(150)
    expect(b.falta).toBe(30)
  })

  it('nenhum instrumento fica sem caminho até a última peça', () => {
    // um instrumento cujas peças exclusivas somem poderia travar a progressão
    for (const i of ['guitarra', 'violao', 'baixo', 'piano', 'violino', 'bateria'] as const) {
      const custos = pecasDe(i).map((p) => p.custo)
      expect(custos.length).toBeGreaterThanOrEqual(5)
      expect(Math.max(...custos)).toBe(2500)
    }
  })
})

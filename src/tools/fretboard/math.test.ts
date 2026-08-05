import { describe, expect, it } from 'vitest'
import { cellCenterX, fretX, isDoubleMarker } from './math'

describe('fretboard math', () => {
  it('a 12ª casa fica exatamente na metade da corda', () => {
    // em corda inteira (sem normalizar), 12ª casa = metade do comprimento
    const raw = (n: number) => 1 - Math.pow(2, -n / 12)
    expect(raw(12)).toBeCloseTo(0.5, 10)
  })

  it('casas apertam conforme sobem (espaçamento decrescente)', () => {
    const total = 22
    for (let n = 2; n <= total; n++) {
      const prev = fretX(n - 1, total) - fretX(n - 2, total)
      const curr = fretX(n, total) - fretX(n - 1, total)
      expect(curr).toBeLessThan(prev)
    }
  })

  it('normalização: última casa em 1, capotraste em 0', () => {
    expect(fretX(0, 22)).toBe(0)
    expect(fretX(22, 22)).toBeCloseTo(1, 10)
  })

  it('centro da célula fica entre as casas vizinhas', () => {
    const total = 22
    expect(cellCenterX(5, total)).toBeGreaterThan(fretX(4, total))
    expect(cellCenterX(5, total)).toBeLessThan(fretX(5, total))
    expect(cellCenterX(0, total)).toBe(0)
  })

  it('marcadores duplos só na 12 e 24', () => {
    expect(isDoubleMarker(12)).toBe(true)
    expect(isDoubleMarker(24)).toBe(true)
    expect(isDoubleMarker(7)).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { countLabel, emptyPattern, PRESETS, STEPS, toggleStep } from './patterns'

describe('groove patterns', () => {
  it('todo preset tem 16 passos em todas as pistas', () => {
    for (const p of PRESETS) {
      for (const lane of Object.values(p.steps)) {
        expect(lane).toHaveLength(STEPS)
      }
    }
  })

  it('toggle liga e desliga sem mutar o original', () => {
    const p = emptyPattern()
    const on = toggleStep(p, 'bumbo', 0)
    expect(on.steps.bumbo[0]).toBe(true)
    expect(p.steps.bumbo[0]).toBe(false) // original intacto
    const off = toggleStep(on, 'bumbo', 0)
    expect(off.steps.bumbo[0]).toBe(false)
  })

  it('contagem: 1 e & a 2 e & a...', () => {
    expect(countLabel(0)).toBe('1')
    expect(countLabel(1)).toBe('e')
    expect(countLabel(2)).toBe('&')
    expect(countLabel(3)).toBe('a')
    expect(countLabel(4)).toBe('2')
    expect(countLabel(12)).toBe('4')
  })

  it('rock básico: caixa no 2 e no 4', () => {
    const rock = PRESETS.find((p) => p.name === 'rock básico')!
    expect(rock.steps.caixa[4]).toBe(true) // tempo 2
    expect(rock.steps.caixa[12]).toBe(true) // tempo 4
  })
})

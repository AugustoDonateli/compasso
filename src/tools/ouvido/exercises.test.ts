import { describe, expect, it } from 'vitest'
import {
  generate,
  isCorrect,
  REGISTER_SHIFT,
  transposeQuestion,
  type ExerciseKind,
  type Level,
} from './exercises'

/** rand determinístico pra testes */
function seq(values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length]
}

/** kinds que respondem por alternativa (braço responde tocando no instrumento) */
const KINDS: ExerciseKind[] = ['nota', 'intervalo', 'acorde']
const LEVELS: Level[] = ['facil', 'completo']

describe('exercícios de ouvido', () => {
  it('a resposta correta está sempre entre as alternativas', () => {
    for (const kind of KINDS) {
      for (const level of LEVELS) {
        for (let i = 0; i < 40; i++) {
          const q = generate(kind, level)
          expect(q.options.some((o) => o.id === q.answerId)).toBe(true)
          expect(isCorrect(q, q.answerId)).toBe(true)
        }
      }
    }
  })

  it('nota: toca a referência dó antes da nota mistério', () => {
    const q = generate('nota', 'facil', seq([0]))
    expect(q.midis).toHaveLength(2)
    expect(q.midis[0]).toBe(60) // dó central como âncora
    expect(q.together).toBe(false)
  })

  it('intervalo: duas notas, distância bate com a resposta', () => {
    for (let i = 0; i < 30; i++) {
      const q = generate('intervalo', 'completo')
      expect(q.midis).toHaveLength(2)
      expect(q.midis[1] - q.midis[0]).toBe(Number(q.answerId))
    }
  })

  it('acorde: soa junto e sobe (sem cluster)', () => {
    for (let i = 0; i < 30; i++) {
      const q = generate('acorde', 'completo')
      expect(q.together).toBe(true)
      expect(q.midis.length).toBeGreaterThanOrEqual(3)
      for (let k = 1; k < q.midis.length; k++) {
        expect(q.midis[k]).toBeGreaterThan(q.midis[k - 1])
      }
    }
  })

  it('nível fácil oferece menos alternativas que o completo', () => {
    for (const kind of KINDS) {
      expect(generate(kind, 'facil').options.length).toBeLessThan(
        generate(kind, 'completo').options.length,
      )
    }
  })

  it('fácil de acorde só tem maior e menor', () => {
    const q = generate('acorde', 'facil')
    expect(q.options.map((o) => o.id).sort()).toEqual(['maior', 'menor'])
  })

  it('toda pergunta explica a resposta', () => {
    for (const kind of [...KINDS, 'braco' as ExerciseKind]) {
      expect(generate(kind, 'completo').explanation.length).toBeGreaterThan(10)
    }
  })
})

describe('braço: ouvido -> instrumento', () => {
  it('soa uma nota só e a resposta é a classe de altura', () => {
    for (let i = 0; i < 30; i++) {
      const q = generate('braco', 'completo')
      expect(q.midis).toHaveLength(1)
      expect(q.options).toHaveLength(0) // responde-se tocando no braço
      expect(q.midis[0] % 12).toBe(Number(q.answerId))
    }
  })

  it('nível fácil só pede notas naturais', () => {
    const naturais = [0, 2, 4, 5, 7, 9, 11]
    for (let i = 0; i < 40; i++) {
      expect(naturais).toContain(Number(generate('braco', 'facil').answerId))
    }
  })
})

describe('registro por instrumento', () => {
  it('baixo desce duas oitavas, guitarra uma', () => {
    expect(REGISTER_SHIFT.piano).toBe(0)
    expect(REGISTER_SHIFT.guitarra).toBe(-12)
    expect(REGISTER_SHIFT.baixo).toBe(-24)
  })

  it('transpor muda a região mas não a resposta nem o intervalo', () => {
    const q = generate('intervalo', 'completo')
    const low = transposeQuestion(q, REGISTER_SHIFT.baixo)
    expect(low.answerId).toBe(q.answerId)
    expect(low.midis[1] - low.midis[0]).toBe(q.midis[1] - q.midis[0])
    expect(low.midis[0]).toBe(q.midis[0] - 24)
  })

  it('transpor 0 devolve a mesma pergunta', () => {
    const q = generate('acorde', 'facil')
    expect(transposeQuestion(q, 0)).toBe(q)
  })
})

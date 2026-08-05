import { describe, expect, it } from 'vitest'
import { juntar } from './perfil'
import type { UserProgress } from '../storage/types'

function p(over: Partial<UserProgress> = {}): UserProgress {
  return { xp: 0, streak: 0, lastActiveDate: null, completed: [], settings: {}, ...over }
}

/** A regra mais importante da sincronização: NUNCA perder progresso.
 *  Se algum destes testes quebrar, alguém vai abrir o site e ver dias de
 *  estudo terem sumido — o pior defeito possível num site feito pra você
 *  não desistir. */
describe('juntar local e remoto', () => {
  it('mantém as lições dos DOIS lados', () => {
    const r = juntar(p({ completed: ['a', 'b'] }), p({ completed: ['b', 'c'] }))
    expect(r.completed.sort()).toEqual(['a', 'b', 'c'])
  })

  it('não duplica lição que existe nos dois', () => {
    const r = juntar(p({ completed: ['a'] }), p({ completed: ['a'] }))
    expect(r.completed).toEqual(['a'])
  })

  it('fica com o maior XP, venha de onde vier', () => {
    expect(juntar(p({ xp: 300 }), p({ xp: 120 })).xp).toBe(300)
    expect(juntar(p({ xp: 120 }), p({ xp: 300 })).xp).toBe(300)
  })

  it('fica com a maior sequência de dias', () => {
    expect(juntar(p({ streak: 7 }), p({ streak: 2 })).streak).toBe(7)
  })

  it('fica com a data de atividade mais recente', () => {
    const r = juntar(p({ lastActiveDate: '2026-08-01' }), p({ lastActiveDate: '2026-08-05' }))
    expect(r.lastActiveDate).toBe('2026-08-05')
  })

  it('aparelho novo e vazio não apaga o progresso do servidor', () => {
    // o caso que mais dói: abrir no PC pela primeira vez
    const r = juntar(p(), p({ xp: 500, streak: 9, completed: ['a', 'b', 'c'] }))
    expect(r.xp).toBe(500)
    expect(r.streak).toBe(9)
    expect(r.completed).toHaveLength(3)
  })

  it('servidor vazio não apaga o que foi estudado sem rede', () => {
    const r = juntar(p({ xp: 200, completed: ['x'] }), p())
    expect(r.xp).toBe(200)
    expect(r.completed).toEqual(['x'])
  })

  it('juntar é comutativo no que importa', () => {
    const a = p({ xp: 100, streak: 3, completed: ['a'] })
    const b = p({ xp: 250, streak: 1, completed: ['b'] })
    const ab = juntar(a, b)
    const ba = juntar(b, a)
    expect(ab.xp).toBe(ba.xp)
    expect(ab.streak).toBe(ba.streak)
    expect(ab.completed.sort()).toEqual(ba.completed.sort())
  })
})

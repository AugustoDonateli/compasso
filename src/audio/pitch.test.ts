import { describe, expect, it } from 'vitest'
import {
  detectarFrequencia,
  estaAfinado,
  freqParaNota,
  notaParaFreq,
  rms,
} from './pitch'

const SR = 44100

/** Onda sintética: dá pra testar o afinador sem microfone nenhum. */
function onda(freq: number, dur = 0.2, amp = 0.5, harmonicos = 0): Float32Array {
  const n = Math.floor(SR * dur)
  const buf = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / SR
    let v = Math.sin(2 * Math.PI * freq * t)
    // corda real não é senoide pura: tem harmônicos por cima
    for (let h = 2; h <= harmonicos + 1; h++) {
      v += Math.sin(2 * Math.PI * freq * h * t) / h
    }
    buf[i] = v * amp
  }
  return buf
}

function ruido(amp = 0.5): Float32Array {
  const buf = new Float32Array(SR * 0.2)
  for (let i = 0; i < buf.length; i++) buf[i] = (Math.random() * 2 - 1) * amp
  return buf
}

describe('detecção de altura', () => {
  it('acerta o lá 440 com precisão melhor que 1 Hz', () => {
    const f = detectarFrequencia(onda(440), SR)
    expect(f).not.toBeNull()
    expect(Math.abs(f! - 440)).toBeLessThan(1)
  })

  it('acerta as seis cordas soltas da guitarra', () => {
    // mi2 lá2 ré3 sol3 si3 mi4
    const cordas = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63]
    for (const alvo of cordas) {
      const f = detectarFrequencia(onda(alvo, 0.3), SR)
      expect(f).not.toBeNull()
      // menos de 1% de erro é muito melhor que o ouvido humano precisa
      expect(Math.abs(f! - alvo) / alvo).toBeLessThan(0.01)
    }
  })

  it('acerta o mi grave do baixo (41Hz) e o registro agudo do violino', () => {
    const grave = detectarFrequencia(onda(41.2, 0.4), SR)
    expect(grave).not.toBeNull()
    expect(Math.abs(grave! - 41.2) / 41.2).toBeLessThan(0.02)

    const agudo = detectarFrequencia(onda(1567.98, 0.2), SR)
    expect(agudo).not.toBeNull()
    expect(Math.abs(agudo! - 1567.98) / 1567.98).toBeLessThan(0.02)
  })

  it('funciona com harmônicos — corda de verdade não é senoide pura', () => {
    const f = detectarFrequencia(onda(196, 0.3, 0.5, 4), SR)
    expect(f).not.toBeNull()
    // o risco aqui é detectar um harmônico em vez da fundamental
    expect(Math.abs(f! - 196) / 196).toBeLessThan(0.02)
  })

  it('devolve null no silêncio, em vez de inventar nota', () => {
    expect(detectarFrequencia(new Float32Array(4096), SR)).toBeNull()
    expect(detectarFrequencia(onda(440, 0.2, 0.001), SR)).toBeNull()
  })

  it('não confunde ruído com nota', () => {
    // ruído branco não tem período, então não deve virar frequência estável
    const leituras = Array.from({ length: 5 }, () => detectarFrequencia(ruido(), SR))
    const validas = leituras.filter((f): f is number => f !== null)
    if (validas.length > 1) {
      // se detectou algo, ao menos não deve concordar consigo mesmo
      const espalhamento = Math.max(...validas) - Math.min(...validas)
      expect(espalhamento).toBeGreaterThan(5)
    }
  })

  it('rms mede o volume', () => {
    expect(rms(new Float32Array(1000))).toBe(0)
    expect(rms(onda(440, 0.1, 0.5))).toBeGreaterThan(0.3)
  })
})

describe('frequência para nota', () => {
  it('lá 440 é o midi 69, afinado', () => {
    const l = freqParaNota(440)
    expect(l.midi).toBe(69)
    expect(l.cents).toBe(0)
  })

  it('dó central é o midi 60', () => {
    expect(freqParaNota(261.63).midi).toBe(60)
  })

  it('cents indicam pra que lado corrigir', () => {
    // um pouco abaixo do lá: cents negativos, precisa subir
    expect(freqParaNota(435).cents).toBeLessThan(0)
    // um pouco acima: positivos, precisa descer
    expect(freqParaNota(445).cents).toBeGreaterThan(0)
  })

  it('meio semitom acima dá ~50 cents', () => {
    const meio = 440 * Math.pow(2, 0.5 / 12)
    expect(Math.abs(freqParaNota(meio).cents)).toBeGreaterThanOrEqual(49)
  })

  it('ida e volta entre nota e frequência bate', () => {
    for (const midi of [40, 45, 55, 60, 69, 76, 88]) {
      const f = notaParaFreq(midi)
      expect(freqParaNota(f).midi).toBe(midi)
      expect(freqParaNota(f).cents).toBe(0)
    }
  })

  it('tolerância de afinação é ±5 cents, o padrão de afinador', () => {
    expect(estaAfinado(0)).toBe(true)
    expect(estaAfinado(-5)).toBe(true)
    expect(estaAfinado(6)).toBe(false)
    expect(estaAfinado(-30)).toBe(false)
  })
})

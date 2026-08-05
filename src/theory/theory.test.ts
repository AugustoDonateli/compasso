import { describe, expect, it } from 'vitest'
import {
  midiToFreq,
  midiToName,
  nameToMidi,
  noteName,
  noteSolfejo,
  parseNote,
  pcOf,
} from './notes'
import { intervalBetween, intervalBetweenMidi } from './intervals'
import { scalePcs, spellScale } from './scales'
import { chordPcs, chordSymbol, noteRole } from './chords'
import { harmonicField } from './harmonicField'
import { midiAt, pcAt, positionsOf, TUNINGS } from './fretboard'

describe('notes', () => {
  it('converte nome <-> MIDI', () => {
    expect(nameToMidi('C4')).toBe(60)
    expect(nameToMidi('A4')).toBe(69)
    expect(nameToMidi('E2')).toBe(40)
    expect(midiToName(69)).toBe('A4')
  })

  it('lá 440', () => {
    expect(midiToFreq(69)).toBe(440)
    expect(midiToFreq(57)).toBe(220)
  })

  it('solfejo brasileiro', () => {
    expect(noteSolfejo(parseNote('C'))).toBe('Dó')
    expect(noteSolfejo(parseNote('F#'))).toBe('Fá♯')
    expect(noteSolfejo(parseNote('Bb'))).toBe('Si♭')
  })
})

describe('intervals', () => {
  it('nomes brasileiros', () => {
    expect(intervalBetween(pcOf(parseNote('C')), pcOf(parseNote('E'))).name).toBe('terça maior')
    expect(intervalBetween(pcOf(parseNote('C')), pcOf(parseNote('G'))).name).toBe('quinta justa')
    expect(intervalBetween(pcOf(parseNote('E')), pcOf(parseNote('C'))).name).toBe('sexta menor')
  })

  it('oitava justa via MIDI', () => {
    expect(intervalBetweenMidi(60, 72).name).toBe('oitava justa')
  })
})

describe('scales — grafia correta', () => {
  it('Fá# maior tem Mi# (não Fá natural)', () => {
    const names = spellScale(parseNote('F#'), 'maior').map(noteName)
    expect(names).toEqual(['F♯', 'G♯', 'A♯', 'B', 'C♯', 'D♯', 'E♯'])
  })

  it('Láb maior usa bemóis (não Dó#)', () => {
    const names = spellScale(parseNote('Ab'), 'maior').map(noteName)
    expect(names).toEqual(['A♭', 'B♭', 'C', 'D♭', 'E♭', 'F', 'G'])
  })

  it('Lá menor natural: só naturais', () => {
    const names = spellScale(parseNote('A'), 'menor-natural').map(noteName)
    expect(names).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })

  it('Lá menor harmônica levanta o 7º grau: Sol#', () => {
    const names = spellScale(parseNote('A'), 'menor-harmonica').map(noteName)
    expect(names[6]).toBe('G♯')
  })

  it('pentatônica menor de Lá', () => {
    const names = spellScale(parseNote('A'), 'pentatonica-menor').map(noteName)
    expect(names).toEqual(['A', 'C', 'D', 'E', 'G'])
  })

  it('pitch classes de Sol maior', () => {
    expect(scalePcs(pcOf(parseNote('G')), 'maior')).toEqual([7, 9, 11, 0, 2, 4, 6])
  })
})

describe('chords', () => {
  it('tríades básicas', () => {
    expect(chordPcs(pcOf(parseNote('C')), 'maior')).toEqual([0, 4, 7])
    expect(chordPcs(pcOf(parseNote('A')), 'menor')).toEqual([9, 0, 4])
  })

  it('cifras', () => {
    expect(chordSymbol(parseNote('C'), 'maior')).toBe('C')
    expect(chordSymbol(parseNote('A'), 'menor7')).toBe('Am7')
    expect(chordSymbol(parseNote('F#'), 'meio-diminuto')).toBe('F♯m7(♭5)')
    expect(chordSymbol(parseNote('Bb'), 'maior7')).toBe('B♭7M')
  })

  it('papel da nota (codificação por intensidade)', () => {
    const cPc = pcOf(parseNote('C'))
    const inC = (pc: number) => scalePcs(cPc, 'maior').includes(pc as never)
    expect(noteRole(0, cPc, 'maior', inC)).toBe('tonica')
    expect(noteRole(4, cPc, 'maior', inC)).toBe('acorde') // Mi
    expect(noteRole(2, cPc, 'maior', inC)).toBe('escala') // Ré
    expect(noteRole(1, cPc, 'maior', inC)).toBe('fora') // Dó#
  })
})

describe('harmonicField', () => {
  it('campo de Dó maior (tríades)', () => {
    const field = harmonicField(parseNote('C'), 'maior')
    expect(field.map((d) => d.symbol)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°'])
    expect(field.map((d) => d.roman)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'])
  })

  it('campo de Lá menor natural (tríades)', () => {
    const field = harmonicField(parseNote('A'), 'menor-natural')
    expect(field.map((d) => d.symbol)).toEqual(['Am', 'B°', 'C', 'Dm', 'Em', 'F', 'G'])
  })

  it('campo de Sol maior com tétrades: V7 é D7', () => {
    const field = harmonicField(parseNote('G'), 'maior', true)
    expect(field[4].symbol).toBe('D7')
    expect(field[0].symbol).toBe('G7M')
    expect(field[6].symbol).toBe('F♯m7(♭5)')
  })
})

describe('fretboard', () => {
  it('casa 5 da corda mais grave da guitarra é Lá', () => {
    const g = TUNINGS.guitarra
    expect(midiAt(g, 0, 5)).toBe(nameToMidi('A2'))
    expect(pcAt(g, 0, 5)).toBe(9) // Lá
  })

  it('cordas soltas da guitarra', () => {
    const g = TUNINGS.guitarra
    expect(g.openStrings.map((m) => midiToName(m))).toEqual(['E2', 'A2', 'D3', 'G3', 'B3', 'E4'])
  })

  it('afinação relativa: casa 5 = próxima corda solta (exceto Sol->Si, casa 4)', () => {
    const g = TUNINGS.guitarra
    expect(midiAt(g, 0, 5)).toBe(g.openStrings[1])
    expect(midiAt(g, 1, 5)).toBe(g.openStrings[2])
    expect(midiAt(g, 2, 5)).toBe(g.openStrings[3])
    expect(midiAt(g, 3, 4)).toBe(g.openStrings[4])
    expect(midiAt(g, 4, 5)).toBe(g.openStrings[5])
  })

  it('posições de Lá no baixo até a casa 12', () => {
    const positions = positionsOf(TUNINGS.baixo, 9, 12)
    expect(positions).toContainEqual({ string: 0, fret: 5 })
    expect(positions).toContainEqual({ string: 1, fret: 0 })
    expect(positions).toContainEqual({ string: 1, fret: 12 })
    expect(positions).toContainEqual({ string: 2, fret: 7 })
  })

  it('valida limites', () => {
    expect(() => midiAt(TUNINGS.guitarra, 6, 0)).toThrow()
    expect(() => midiAt(TUNINGS.guitarra, 0, 23)).toThrow()
  })
})

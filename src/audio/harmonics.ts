import { Tone, isAudioUnlocked } from './engine'

/** Os harmônicos do glissando do herói: conforme a câmera viaja pelo braço,
 *  cada "traste" cruzado solta um harmônico de corda, como passar o dedo
 *  numa harpa. Notas da pentatônica menor de Mi — a escala da guitarra. */

const NOTES = ['E2', 'G2', 'A2', 'B2', 'D3', 'E3', 'G3', 'A3', 'B3', 'D4', 'E4', 'G4', 'A4']

let pluck: Tone.PolySynth | null = null
let reverb: Tone.Reverb | null = null

function ensureInstrument(): Tone.PolySynth {
  if (!pluck) {
    reverb = new Tone.Reverb({ decay: 2.8, wet: 0.45 }).toDestination()
    pluck = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.002, decay: 0.6, sustain: 0, release: 1.4 },
      volume: -18, // sussurro, não solo
    }).connect(reverb)
  }
  return pluck
}

/** Toca o harmônico do traste i (0..12). Silencioso se o áudio não destravou. */
export function playFretHarmonic(i: number): void {
  if (!isAudioUnlocked()) return
  const note = NOTES[Math.max(0, Math.min(NOTES.length - 1, i))]
  ensureInstrument().triggerAttackRelease(note, 0.4)
}

/** Click de metrônomo (count-in). Agudo no tempo 1, grave nos demais. */
export function playClick(accent: boolean): void {
  if (!isAudioUnlocked()) return
  const synth = ensureInstrument()
  synth.triggerAttackRelease(accent ? 'A5' : 'A4', 0.05)
}

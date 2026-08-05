import { Tone, ensureAudio } from './engine'
import { midiToName } from '../theory/notes'

/** Registry de instrumentos REAIS do Compasso.
 *
 *  Regra de futuro: toda ferramenta pede som por aqui — getInstrument(id).
 *  A groove machine vai adicionar 'bateria', o treino de ouvido 'piano',
 *  e nada mais no site precisa mudar. Samples self-hosted (domínio público,
 *  tonejs-instruments), carregados sob demanda e cacheados. */

export type InstrumentSoundId = 'guitarra' | 'baixo' | 'piano'

/** nota -> arquivo (o Tone.Sampler preenche as notas faltantes por pitch-shift) */
const SAMPLE_MAPS: Record<InstrumentSoundId, Record<string, string>> = {
  guitarra: {
    'C#2': 'Cs2.mp3',
    E2: 'E2.mp3',
    'F#2': 'Fs2.mp3',
    A2: 'A2.mp3',
    C3: 'C3.mp3',
    'D#3': 'Ds3.mp3',
    'F#3': 'Fs3.mp3',
    A3: 'A3.mp3',
    C4: 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F#4': 'Fs4.mp3',
    A4: 'A4.mp3',
    C5: 'C5.mp3',
    'D#5': 'Ds5.mp3',
    'F#5': 'Fs5.mp3',
    A5: 'A5.mp3',
    C6: 'C6.mp3',
  },
  // piano: tom limpo, o padrão pra treino de ouvido (intervalo fica nítido)
  piano: {
    C3: 'C3.mp3',
    'D#3': 'Ds3.mp3',
    'F#3': 'Fs3.mp3',
    A3: 'A3.mp3',
    C4: 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F#4': 'Fs4.mp3',
    A4: 'A4.mp3',
    C5: 'C5.mp3',
    'D#5': 'Ds5.mp3',
    'F#5': 'Fs5.mp3',
    A5: 'A5.mp3',
    C6: 'C6.mp3',
  },
  baixo: {
    'C#1': 'Cs1.mp3',
    E1: 'E1.mp3',
    G1: 'G1.mp3',
    'A#1': 'As1.mp3',
    'C#2': 'Cs2.mp3',
    E2: 'E2.mp3',
    G2: 'G2.mp3',
    'A#2': 'As2.mp3',
    'C#3': 'Cs3.mp3',
    E3: 'E3.mp3',
    G3: 'G3.mp3',
    'A#3': 'As3.mp3',
    'C#4': 'Cs4.mp3',
    E4: 'E4.mp3',
    G4: 'G4.mp3',
    'A#4': 'As4.mp3',
    'C#5': 'Cs5.mp3',
  },
}

const cache = new Map<InstrumentSoundId, Promise<Tone.Sampler>>()

export function getInstrument(id: InstrumentSoundId): Promise<Tone.Sampler> {
  let entry = cache.get(id)
  if (!entry) {
    entry = new Promise((resolve, reject) => {
      const sampler = new Tone.Sampler({
        urls: SAMPLE_MAPS[id],
        baseUrl: `/assets/audio/${id}/`,
        release: 0.6,
        onload: () => resolve(sampler),
        onerror: (e) => reject(e),
      }).toDestination()
    })
    cache.set(id, entry)
  }
  return entry
}

/** Pré-carrega sem tocar (chamar ao entrar na página da ferramenta) */
export function preloadInstrument(id: InstrumentSoundId): void {
  void getInstrument(id).catch(() => cache.delete(id))
}

/* ---------- bateria (não-afinada: Players, não Sampler) ---------- */

export type DrumPiece = 'bumbo' | 'caixa' | 'chimbal' | 'tom'

const DRUM_FILES: Record<DrumPiece, string> = {
  bumbo: 'kick.mp3',
  caixa: 'snare.mp3',
  chimbal: 'hihat.mp3',
  tom: 'tom1.mp3',
}

let kitPromise: Promise<Tone.Players> | null = null

export function getDrumKit(): Promise<Tone.Players> {
  if (!kitPromise) {
    kitPromise = new Promise((resolve, reject) => {
      const players = new Tone.Players(DRUM_FILES, {
        baseUrl: '/assets/audio/bateria/',
        onload: () => resolve(players),
        onerror: (e) => {
          kitPromise = null
          reject(e)
        },
      }).toDestination()
    })
  }
  return kitPromise
}

export function preloadDrumKit(): void {
  void getDrumKit().catch(() => {})
}

/** Toca uma nota MIDI no instrumento. Destrava o áudio se preciso. */
export async function playMidi(
  id: InstrumentSoundId,
  midi: number,
  duration = 1.2,
  velocity = 0.9,
): Promise<void> {
  await ensureAudio()
  const sampler = await getInstrument(id)
  sampler.triggerAttackRelease(midiToName(midi), duration, undefined, velocity)
}

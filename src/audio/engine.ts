import * as Tone from 'tone'

/** Camada de áudio do Compasso.
 *
 *  Regra dos navegadores (especialmente iOS): áudio só toca depois de um
 *  gesto do usuário. Todo caminho de som passa por ensureAudio() —
 *  o primeiro toque/clique destrava o contexto uma vez e pronto. */

let unlocked = false

export async function ensureAudio(): Promise<void> {
  if (unlocked) return
  await Tone.start()
  unlocked = true
}

export function isAudioUnlocked(): boolean {
  return unlocked
}

/** Volume master (dB). Ponto único pra um futuro controle de volume na UI. */
export function setMasterVolume(db: number): void {
  Tone.getDestination().volume.value = db
}

export { Tone }

import * as Tone from 'tone'

/** Camada de áudio do Compasso.
 *
 *  Regra dos navegadores (especialmente iOS): áudio só toca depois de um
 *  gesto do usuário. Todo caminho de som passa por ensureAudio() —
 *  o primeiro toque/clique destrava o contexto uma vez e pronto. */

let unlocked = false
const unlockListeners = new Set<() => void>()

export async function ensureAudio(): Promise<void> {
  if (unlocked) return
  await Tone.start()
  unlocked = true
  unlockListeners.forEach((fn) => fn())
  unlockListeners.clear()
}

export function isAudioUnlocked(): boolean {
  return unlocked
}

/** Registra callback pra quando o áudio destravar (ou chama já, se destravado) */
export function onAudioUnlock(fn: () => void): void {
  if (unlocked) fn()
  else unlockListeners.add(fn)
}

/** Escuta o primeiro gesto real da página inteira e destrava o áudio.
 *  Chamar uma vez no App. wheel/scroll NÃO contam como gesto pros navegadores. */
export function attachGlobalUnlock(): () => void {
  const handler = () => {
    void ensureAudio()
  }
  window.addEventListener('pointerdown', handler, { once: true, passive: true })
  window.addEventListener('keydown', handler, { once: true })
  return () => {
    window.removeEventListener('pointerdown', handler)
    window.removeEventListener('keydown', handler)
  }
}

/** Volume master (dB). Ponto único pra um futuro controle de volume na UI. */
export function setMasterVolume(db: number): void {
  Tone.getDestination().volume.value = db
}

export { Tone }

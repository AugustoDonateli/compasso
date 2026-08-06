import * as Tone from 'tone'

/** Camada de áudio do Compasso.
 *
 *  Regra dos navegadores (especialmente iOS): áudio só toca depois de um
 *  gesto do usuário. Todo caminho de som passa por ensureAudio() —
 *  o primeiro toque/clique destrava o contexto uma vez e pronto.
 *
 *  DEFEITO CORRIGIDO EM 2026-08-06 (travava o site inteiro):
 *  isto aqui guardava `unlocked = true` logo depois de `await Tone.start()`,
 *  sem conferir se o contexto tinha REALMENTE retomado. `Tone.start()` resolve
 *  mesmo quando o navegador recusa — e aí a trava ficava ligada pra sempre:
 *  toda chamada seguinte devolvia na hora sem tentar de novo, o contexto
 *  seguia suspenso, o relógio do Tone nunca andava, e QUALQUER coisa no tempo
 *  parava. O desmontador tocava o primeiro acorde e congelava nele; o playhead
 *  da groove machine nunca aparecia. O sintoma parecia bug de cada ferramenta;
 *  a causa era uma só, aqui.
 *
 *  A regra agora: a verdade é o estado do contexto, nunca um booleano nosso. */

const unlockListeners = new Set<() => void>()

/** O que o navegador diz — não o que a gente gostaria. */
export function estadoDoAudio(): AudioContextState {
  return Tone.getContext().state as AudioContextState
}

export function isAudioUnlocked(): boolean {
  return estadoDoAudio() === 'running'
}

function avisarQuemEsperava(): void {
  unlockListeners.forEach((fn) => fn())
  unlockListeners.clear()
}

/** Destrava o áudio. Devolve se o contexto está mesmo tocando.
 *
 *  Pode ser chamada quantas vezes quiser: enquanto o contexto não estiver
 *  rodando, ela TENTA DE NOVO. Era a ausência dessa segunda chance que
 *  transformava uma falha momentânea em site mudo pra sempre. */
export async function ensureAudio(): Promise<boolean> {
  if (isAudioUnlocked()) return true
  try {
    await Tone.start()
  } catch {
    // sem gesto válido ainda, ou o navegador recusou: a próxima chamada tenta
    return false
  }
  const ok = isAudioUnlocked()
  if (ok) avisarQuemEsperava()
  return ok
}

/** Registra callback pra quando o áudio destravar (ou chama já, se destravado) */
export function onAudioUnlock(fn: () => void): void {
  if (isAudioUnlocked()) fn()
  else unlockListeners.add(fn)
}

/** Escuta gestos reais da página e destrava o áudio.
 *  wheel/scroll NÃO contam como gesto pros navegadores.
 *
 *  Sem `once`: continua ouvindo até o contexto estar de fato tocando. Com
 *  `once`, uma única tentativa frustrada — a mais provável de todas, porque é
 *  a primeira — deixava o site sem som pelo resto da visita. */
export function attachGlobalUnlock(): () => void {
  const eventos = ['pointerdown', 'keydown', 'touchend'] as const

  const remover = () => {
    eventos.forEach((e) => window.removeEventListener(e, handler))
  }

  const handler = () => {
    void ensureAudio().then((ok) => {
      if (ok) remover()
    })
  }

  eventos.forEach((e) => window.addEventListener(e, handler, { passive: true }))
  return remover
}

/** Volume master (dB). Ponto único pra um futuro controle de volume na UI. */
export function setMasterVolume(db: number): void {
  Tone.getDestination().volume.value = db
}

export { Tone }

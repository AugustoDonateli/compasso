import { Tone, isAudioUnlocked } from './engine'

/** Os sons de feedback do Compasso.
 *
 *  Regra da pesquisa de som em interface: o sinal de acerto tem que
 *  recompensar em MENOS DE UM SEGUNDO e sair de cena. Ataque rápido, cauda
 *  curta — se o som se arrasta, ele borra na pergunta seguinte.
 *
 *  E aqui eles são SINTETIZADOS, não sampleados de um banco de efeitos: num
 *  site de música o feedback deve ser musical. O acerto é um intervalo
 *  consonante subindo; o erro é uma segunda menor, o intervalo mais tenso
 *  que existe — mas tocada baixinho e curta, porque punir não é o objetivo.
 *  É o mesmo princípio da paleta: terracota em vez de vermelho puro. */

let sintetizador: Tone.PolySynth | null = null

function instrumento(): Tone.PolySynth {
  if (!sintetizador) {
    sintetizador = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.004, decay: 0.18, sustain: 0, release: 0.25 },
      volume: -14,
    }).toDestination()
  }
  return sintetizador
}

/** Acerto: terça maior subindo pra quinta. Aberto, resolvido, rápido. */
export function somAcerto(): void {
  if (!isAudioUnlocked()) return
  const s = instrumento()
  const agora = Tone.now()
  s.triggerAttackRelease('C5', 0.12, agora)
  s.triggerAttackRelease('E5', 0.12, agora + 0.075)
  s.triggerAttackRelease('G5', 0.3, agora + 0.15)
}

/** Erro: segunda menor, o intervalo mais tenso — mas baixa e curta.
 *  Informa que errou sem soar como punição. */
export function somErro(): void {
  if (!isAudioUnlocked()) return
  const s = instrumento()
  const agora = Tone.now()
  s.triggerAttackRelease(['B3', 'C4'], 0.22, agora, 0.5)
}

/** Lição concluída: o acorde inteiro, dedilhado. Vale mais que o acerto
 *  isolado — a recompensa precisa escalar com a conquista. */
export function somConquista(): void {
  if (!isAudioUnlocked()) return
  const s = instrumento()
  const agora = Tone.now()
  ;['C5', 'E5', 'G5', 'C6'].forEach((n, i) =>
    s.triggerAttackRelease(n, i === 3 ? 0.7 : 0.2, agora + i * 0.07),
  )
}

/** Sequência mantida: um pinguinho agudo, quase subliminar. */
export function somSequencia(): void {
  if (!isAudioUnlocked()) return
  instrumento().triggerAttackRelease('E6', 0.08, Tone.now(), 0.35)
}

import { useCallback, useEffect, useState } from 'react'
import { midiToPc, noteSolfejo, noteId, spellPc, type PitchClass } from '../../theory/notes'
import { award } from '../../progress'

/* Modo jogo: o site pede uma nota, você acha no braço.
   Padrão de exercício do Compasso: gera desafio → recebe resposta →
   feedback sálvia/terracota → award() no progresso. O treino de ouvido
   vai seguir exatamente este molde. */

export interface Challenge {
  pc: PitchClass
  label: string
}

function randomChallenge(): Challenge {
  const pc = Math.floor(Math.random() * 12) as PitchClass
  const spelled = spellPc(pc)
  return { pc, label: `${noteSolfejo(spelled)} (${noteId(spelled)})` }
}

export function useAcheANota(active: boolean) {
  const [challenge, setChallenge] = useState<Challenge>(randomChallenge)
  const [feedback, setFeedback] = useState<'acerto' | 'erro' | null>(null)
  const [score, setScore] = useState({ acertos: 0, tentativas: 0, xp: 0 })

  useEffect(() => {
    if (active) {
      setChallenge(randomChallenge())
      setFeedback(null)
      setScore({ acertos: 0, tentativas: 0, xp: 0 })
    }
  }, [active])

  const answer = useCallback(
    (midi: number) => {
      if (!active) return
      const correct = midiToPc(midi) === challenge.pc
      setFeedback(correct ? 'acerto' : 'erro')
      setScore((s) => ({
        acertos: s.acertos + (correct ? 1 : 0),
        tentativas: s.tentativas + 1,
        xp: s.xp + (correct ? 10 : 0),
      }))
      if (correct) {
        void award(10)
        // próxima nota depois do feedback respirar
        setTimeout(() => {
          setChallenge(randomChallenge())
          setFeedback(null)
        }, 900)
      } else {
        setTimeout(() => setFeedback(null), 700)
      }
    },
    [active, challenge],
  )

  return { challenge, feedback, score, answer }
}

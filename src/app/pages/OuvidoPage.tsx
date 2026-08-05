import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  generate,
  isCorrect,
  type ExerciseKind,
  type Level,
  type Question,
} from '../../tools/ouvido/exercises'
import { playMidi, preloadInstrument } from '../../audio/instruments'
import { award } from '../../progress'

/* ┃ferramenta 04┃ Treino de ouvido.
   A ferramenta de 5 minutos por dia — a "academia" do músico.
   Mesmo molde de exercício do jogo do braço: gera → responde →
   feedback sálvia/terracota → award(). A trilha vai apontar pra cá. */

const KIND_LABEL: Record<ExerciseKind, string> = {
  nota: 'que nota é essa?',
  intervalo: 'que intervalo é esse?',
  acorde: 'que acorde é esse?',
}

const KIND_HELP: Record<ExerciseKind, string> = {
  nota: 'Toca um dó de referência e depois a nota mistério. Sua tarefa: dizer qual é. Isso constrói a memória de altura.',
  intervalo:
    'Intervalo é a distância entre duas notas. Reconhecer isso de ouvido é o que te deixa tirar música sem tabela.',
  acorde:
    'Maior soa aberto e alegre; menor soa fechado e melancólico. Ouvir essa diferença é o superpoder mais útil que existe.',
}

export function OuvidoPage() {
  const [kind, setKind] = useState<ExerciseKind>('acorde')
  const [level, setLevel] = useState<Level>('facil')
  const [question, setQuestion] = useState<Question>(() => generate('acorde', 'facil'))
  const [answered, setAnswered] = useState<string | null>(null)
  const [score, setScore] = useState({ acertos: 0, tentativas: 0, xp: 0 })
  const [streak, setStreak] = useState(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    preloadInstrument('piano')
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const playQuestion = useCallback((q: Question) => {
    q.midis.forEach((m, i) => {
      const delay = q.together ? i * 12 : i * 620
      window.setTimeout(() => void playMidi('piano', m, q.together ? 2.2 : 1.4), delay)
    })
  }, [])

  /** Cancela a próxima pergunta agendada. Sem isso, trocar de treino logo
   *  após responder deixava o temporizador antigo sobrescrever a pergunta
   *  nova com uma do tipo anterior (cabeçalho e alternativas divergiam). */
  const cancelPending = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const nextQuestion = useCallback(
    (k: ExerciseKind = kind, l: Level = level) => {
      cancelPending()
      const q = generate(k, l)
      setQuestion(q)
      setAnswered(null)
      window.setTimeout(() => playQuestion(q), 220)
    },
    [kind, level, playQuestion, cancelPending],
  )

  const answer = (id: string) => {
    if (answered) return
    setAnswered(id)
    const correct = isCorrect(question, id)
    setScore((s) => ({
      acertos: s.acertos + (correct ? 1 : 0),
      tentativas: s.tentativas + 1,
      xp: s.xp + (correct ? 15 : 0),
    }))
    setStreak((s) => (correct ? s + 1 : 0))
    if (correct) void award(15)
    timerRef.current = window.setTimeout(() => nextQuestion(), correct ? 1300 : 2400)
  }

  const changeKind = (k: ExerciseKind) => {
    if (k === kind) return
    cancelPending()
    setKind(k)
    setScore({ acertos: 0, tentativas: 0, xp: 0 })
    setStreak(0)
    nextQuestion(k, level)
  }

  const changeLevel = (l: Level) => {
    if (l === level) return
    cancelPending()
    setLevel(l)
    nextQuestion(kind, l)
  }

  return (
    <div className="min-h-screen bg-[#171310] text-[#f2ede6]">
      <header className="flex items-center justify-between px-5 pb-6 pt-6 md:px-10">
        <Link to="/" className="type-label text-[#a69c90] transition-colors hover:text-[#e0a34a]">
          ← compasso
        </Link>
        <span className="type-label text-[#6e655c]">ferramenta 04</span>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-24 md:px-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="type-display text-5xl md:text-7xl">Ouvido</h1>
          <p className="mt-4 text-lg text-[#a69c90]">
            Cinco minutos por dia treinando aqui muda mais o seu ouvido que uma hora de teoria no
            papel.
          </p>
        </div>

        {/* treino + nível */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-[#332d27] py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-label mr-1 text-[#6e655c]">treino</span>
            {(Object.keys(KIND_LABEL) as ExerciseKind[]).map((k) => (
              <button
                key={k}
                onClick={() => changeKind(k)}
                className={`type-label border px-3 py-2 transition-colors ${
                  kind === k
                    ? 'border-[#e0a34a] bg-[#e0a34a]/10 text-[#e0a34a]'
                    : 'border-[#332d27] text-[#a69c90] hover:border-[#a69c90]'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="type-label mr-1 text-[#6e655c]">nível</span>
            {(['facil', 'completo'] as Level[]).map((l) => (
              <button
                key={l}
                onClick={() => changeLevel(l)}
                className={`type-label border px-3 py-2 transition-colors ${
                  level === l
                    ? 'border-[#e0a34a] bg-[#e0a34a]/10 text-[#e0a34a]'
                    : 'border-[#332d27] text-[#a69c90] hover:border-[#a69c90]'
                }`}
              >
                {l === 'facil' ? 'fácil' : 'completo'}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 max-w-2xl border-l-2 border-[#e0a34a] pl-4 text-[#a69c90]">
          {KIND_HELP[kind]}
        </p>

        {/* o exercício */}
        <div
          className={`mt-8 border p-6 transition-colors duration-300 md:p-10 ${
            answered === null
              ? 'border-[#332d27] bg-[#221e1a]'
              : isCorrect(question, answered)
                ? 'border-[#6e8f5a] bg-[#6e8f5a]/5'
                : 'border-[#b2543c] bg-[#b2543c]/5'
          }`}
        >
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="type-display text-2xl text-[#f2ede6] md:text-3xl">
              {KIND_LABEL[kind]}
            </h2>
            <button
              onClick={() => playQuestion(question)}
              className="type-label border border-[#e0a34a] px-5 py-3 text-[#e0a34a] transition-colors hover:bg-[#e0a34a]/10"
            >
              ▶ ouvir de novo
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {question.options.map((o) => {
              const isAnswer = o.id === question.answerId
              const chosen = answered === o.id
              const reveal = answered !== null
              return (
                <button
                  key={o.id}
                  onClick={() => answer(o.id)}
                  disabled={reveal}
                  className={`min-h-12 border px-4 py-3 text-base transition-colors ${
                    reveal && isAnswer
                      ? 'border-[#6e8f5a] bg-[#6e8f5a]/20 text-[#f2ede6]'
                      : chosen
                        ? 'border-[#b2543c] bg-[#b2543c]/20 text-[#f2ede6]'
                        : reveal
                          ? 'border-[#332d27] text-[#6e655c]'
                          : 'border-[#332d27] text-[#a69c90] hover:border-[#e0a34a] hover:text-[#e0a34a]'
                  }`}
                >
                  {o.label}
                </button>
              )
            })}
          </div>

          {/* explicação depois de responder — o exercício vira aula */}
          <p
            className={`mt-7 text-lg transition-opacity duration-300 ${
              answered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {answered && (
              <>
                <span
                  className={isCorrect(question, answered) ? 'text-[#6e8f5a]' : 'text-[#b2543c]'}
                >
                  {isCorrect(question, answered) ? 'isso! ' : 'quase — '}
                </span>
                <span className="text-[#a69c90]">{question.explanation}</span>
              </>
            )}
          </p>
        </div>

        {/* placar */}
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
          <span className="type-label text-[#6e655c]">
            {score.tentativas === 0
              ? 'clica em ouvir de novo se não pegou'
              : `${score.acertos} de ${score.tentativas}`}
          </span>
          <div className="flex items-baseline gap-6">
            {streak >= 3 && (
              <span className="type-label text-[#e0a34a]">🔥 {streak} seguidas</span>
            )}
            <span className="type-label text-[#e0a34a]">+{score.xp} xp</span>
          </div>
        </div>
      </main>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  generate,
  isCorrect,
  REGISTER_SHIFT,
  transposeQuestion,
  type ExerciseKind,
  type Level,
  type Question,
} from '../../tools/ouvido/exercises'
import { Keyboard } from '../../tools/keyboard/Keyboard'
import { Fretboard } from '../../tools/fretboard/Fretboard'
import { playMidi, preloadInstrument, type InstrumentSoundId } from '../../audio/instruments'
import { useWaveformCanvas } from '../../audio/useAnalyser'
import { award } from '../../progress'
import { midiToPc, type PitchClass } from '../../theory/notes'
import { TUNINGS } from '../../theory/fretboard'

/* ┃ferramenta 04┃ Treino de ouvido.
   O exercício acontece num PALCO: onda sonora real no topo, pergunta em
   tipografia grande, e a resposta se dá no instrumento (teclado) quando faz
   sentido. Nada de caixinha com botõezinhos. */

const KIND_LABEL: Record<ExerciseKind, string> = {
  nota: 'nota',
  intervalo: 'intervalo',
  acorde: 'acorde',
  braco: 'ache no braço',
}

const KIND_PROMPT: Record<ExerciseKind, string> = {
  nota: 'Que nota é essa?',
  intervalo: 'Que intervalo é esse?',
  acorde: 'Que acorde é esse?',
  braco: 'Ache essa nota no braço.',
}

const KIND_HELP: Record<ExerciseKind, string> = {
  nota: 'Toca um dó de referência e depois a nota mistério. Responde tocando a tecla — o gesto é o mesmo do instrumento.',
  intervalo:
    'Intervalo é a distância entre duas notas. Reconhecer isso de ouvido é o que te faz tirar música sem procurar cifra.',
  acorde:
    'Maior soa aberto e alegre; menor soa fechado e melancólico. Ouvir essa diferença é o superpoder mais útil que existe.',
  braco:
    'A ponte entre ouvido e instrumento: você ouve a nota e acha ela no braço. Vale qualquer casa que dê aquela nota — e existem várias.',
}

const SOUND_LABEL: Record<InstrumentSoundId, string> = {
  piano: 'piano',
  guitarra: 'guitarra',
  violao: 'violão',
  baixo: 'baixo',
  violino: 'violino',
}

/** todos os sons servem pra ouvir; o braço só pra instrumento com casas */
const SOUNDS_ALL: InstrumentSoundId[] = ['piano', 'guitarra', 'violao', 'baixo', 'violino']
const SOUNDS_FRETTED: InstrumentSoundId[] = ['guitarra', 'violao', 'baixo']

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ id: T; label: string }>
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="type-label text-[#6e655c]">{label}</span>
      <div className="flex border border-[#332d27]">
        {options.map((o, i) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`type-label px-4 py-2.5 transition-colors ${i > 0 ? 'border-l border-[#332d27]' : ''} ${
              value === o.id
                ? 'bg-[#e0a34a] text-[#12100e]'
                : 'text-[#a69c90] hover:bg-[#f2ede6]/5 hover:text-[#f2ede6]'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** A trilha abre o treino pronto via link: /ouvido?treino=acorde&nivel=facil.
 *  Parâmetro inválido é ignorado — link velho nunca quebra a página. */
const KINDS: ExerciseKind[] = ['nota', 'intervalo', 'acorde', 'braco']

export function OuvidoPage() {
  const [params] = useSearchParams()
  const initialKind = KINDS.find((k) => k === params.get('treino')) ?? 'acorde'
  const initialLevel: Level = params.get('nivel') === 'completo' ? 'completo' : 'facil'
  const initialSound =
    (['piano', 'guitarra', 'baixo'] as InstrumentSoundId[]).find(
      (s) => s === params.get('som'),
    ) ?? 'piano'

  const [kind, setKind] = useState<ExerciseKind>(initialKind)
  const [level, setLevel] = useState<Level>(initialLevel)
  const [sound, setSound] = useState<InstrumentSoundId>(initialSound)
  const [question, setQuestion] = useState<Question>(() => generate(initialKind, initialLevel))
  const [answered, setAnswered] = useState<string | null>(null)
  const [score, setScore] = useState({ acertos: 0, tentativas: 0, xp: 0 })
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const timerRef = useRef<number | null>(null)
  const waveRef = useWaveformCanvas('#e0a34a')

  /** o braço é de corda: no piano não faz sentido, então o modo força guitarra */
  const effectiveSound: InstrumentSoundId =
    kind === 'braco' && sound === 'piano' ? 'guitarra' : sound

  useEffect(() => {
    preloadInstrument(effectiveSound)
  }, [effectiveSound])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const playQuestion = useCallback(
    (q: Question) => {
      // toca no registro do instrumento escolhido
      const shifted = transposeQuestion(q, REGISTER_SHIFT[effectiveSound] ?? 0)
      shifted.midis.forEach((m, i) => {
        const delay = shifted.together ? i * 12 : i * 620
        window.setTimeout(() => void playMidi(effectiveSound, m, shifted.together ? 2.4 : 1.5), delay)
      })
    },
    [effectiveSound],
  )

  /** Cancela a próxima pergunta agendada — sem isso, trocar de treino logo
   *  após responder deixava o temporizador antigo sobrescrever a pergunta nova. */
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
    setStreak((s) => {
      const next = correct ? s + 1 : 0
      setBest((b) => Math.max(b, next))
      return next
    })
    if (correct) void award(15)
    timerRef.current = window.setTimeout(() => nextQuestion(), correct ? 1250 : 2500)
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

  const changeSound = (s: InstrumentSoundId) => {
    if (s === sound) return
    cancelPending()
    setSound(s)
    setAnswered(null)
  }

  const verdict = answered ? (isCorrect(question, answered) ? 'acerto' : 'erro') : null
  const pct = score.tentativas > 0 ? Math.round((score.acertos / score.tentativas) * 100) : null

  return (
    <div className="min-h-screen bg-[#12100e] text-[#f2ede6]">
      <header className="flex items-center justify-between px-5 pb-6 pt-6 md:px-10">
        <Link to="/" className="type-label text-[#a69c90] transition-colors hover:text-[#e0a34a]">
          ← compasso
        </Link>
        <span className="type-label text-[#6e655c]">ferramenta 04</span>
      </header>

      <main className="px-5 pb-24 md:px-10">
        {/* cabeçalho editorial: título grande à esquerda, placar grande à direita */}
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[#332d27] pb-8">
          <div className="max-w-lg">
            <h1
              className="type-display leading-none"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 7rem)', marginLeft: '-0.03em' }}
            >
              Ouvido
            </h1>
            <p className="mt-4 text-lg text-[#a69c90]">
              Cinco minutos por dia aqui mudam mais o seu ouvido que uma hora de teoria no papel.
            </p>
          </div>

          <div className="flex items-end gap-10">
            <div>
              <span className="type-label block text-[#6e655c]">acertos</span>
              <span className="type-display text-5xl md:text-6xl">
                {score.acertos}
                <span className="text-2xl text-[#6e655c]">/{score.tentativas}</span>
              </span>
            </div>
            <div>
              <span className="type-label block text-[#6e655c]">sequência</span>
              <span
                className={`type-display text-5xl md:text-6xl ${streak >= 3 ? 'text-[#e0a34a]' : ''}`}
              >
                {streak}
              </span>
            </div>
            {pct !== null && (
              <div className="hidden md:block">
                <span className="type-label block text-[#6e655c]">precisão</span>
                <span className="type-display text-5xl md:text-6xl">{pct}%</span>
              </div>
            )}
          </div>
        </div>

        {/* controles */}
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4 py-6">
          <Segmented
            label="treino"
            value={kind}
            onChange={changeKind}
            options={(Object.keys(KIND_LABEL) as ExerciseKind[]).map((k) => ({
              id: k,
              label: KIND_LABEL[k],
            }))}
          />
          <Segmented
            label="nível"
            value={level}
            onChange={changeLevel}
            options={[
              { id: 'facil' as Level, label: 'fácil' },
              { id: 'completo' as Level, label: 'completo' },
            ]}
          />
          <Segmented
            label="som"
            value={effectiveSound}
            onChange={changeSound}
            options={(kind === 'braco' ? SOUNDS_FRETTED : SOUNDS_ALL).map((s) => ({
              id: s,
              label: SOUND_LABEL[s],
            }))}
          />
          <p className="max-w-md text-sm text-[#6e655c]">{KIND_HELP[kind]}</p>
        </div>

        {/* O PALCO */}
        <div
          className={`border transition-colors duration-500 ${
            verdict === 'acerto'
              ? 'border-[#6e8f5a]'
              : verdict === 'erro'
                ? 'border-[#b2543c]'
                : 'border-[#332d27]'
          }`}
        >
          {/* onda sonora real do que está soando */}
          <div className="relative h-20 overflow-hidden border-b border-[#332d27] bg-[#0d0b09]">
            <canvas
              ref={waveRef}
              width={1200}
              height={80}
              className="absolute inset-0 h-full w-full"
            />
            <button
              onClick={() => playQuestion(question)}
              className="absolute inset-y-0 right-0 flex items-center gap-3 border-l border-[#332d27] bg-[#12100e] px-6 text-[#e0a34a] transition-colors hover:bg-[#e0a34a] hover:text-[#12100e]"
            >
              <span className="text-xl">▶</span>
              <span className="type-label">ouvir de novo</span>
            </button>
          </div>

          <div className="bg-[#1b1815] p-6 md:p-10">
            {/* pergunta + veredito no mesmo lugar: a resposta substitui a pergunta */}
            <div className="mb-8 min-h-[4.5rem]">
              {verdict ? (
                <>
                  <span
                    className={`type-display text-3xl md:text-4xl ${
                      verdict === 'acerto' ? 'text-[#6e8f5a]' : 'text-[#b2543c]'
                    }`}
                  >
                    {verdict === 'acerto' ? 'Isso.' : 'Quase.'}
                  </span>
                  <p className="mt-2 max-w-2xl text-lg text-[#a69c90]">{question.explanation}</p>
                </>
              ) : (
                <h2 className="type-display text-3xl md:text-5xl">{KIND_PROMPT[kind]}</h2>
              )}
            </div>

            {/* a resposta acontece no instrumento quando faz sentido:
                braço pra corda, teclado pra nota, botões pro resto */}
            {kind === 'braco' ? (
              <Fretboard
                tuning={
                  TUNINGS[
                    effectiveSound === 'baixo'
                      ? 'baixo'
                      : effectiveSound === 'violao'
                        ? 'violao'
                        : 'guitarra'
                  ]
                }
                onPlay={(_s, _f, midi) => {
                  void playMidi(effectiveSound, midi)
                  if (!answered) answer(String(midiToPc(midi)))
                }}
                roleOf={
                  answered
                    ? (pc) => (pc === (Number(question.answerId) as PitchClass) ? 'tonica' : 'fora')
                    : undefined
                }
              />
            ) : kind === 'nota' ? (
              <div className="mx-auto max-w-3xl">
                <Keyboard
                  enabledPcs={question.options.map((o) => Number(o.id) as PitchClass)}
                  onPick={(pc) => answer(String(pc))}
                  correctPc={answered ? (Number(question.answerId) as PitchClass) : null}
                  wrongPc={
                    answered && !isCorrect(question, answered)
                      ? (Number(answered) as PitchClass)
                      : null
                  }
                  disabled={answered !== null}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {question.options.map((o) => {
                  const isAnswer = o.id === question.answerId
                  const chosen = answered === o.id
                  const reveal = answered !== null
                  return (
                    <button
                      key={o.id}
                      onClick={() => answer(o.id)}
                      disabled={reveal}
                      className={`min-h-16 border px-4 py-4 text-left text-lg transition-all duration-150 ${
                        reveal && isAnswer
                          ? 'border-[#6e8f5a] bg-[#6e8f5a] text-[#12100e]'
                          : chosen
                            ? 'border-[#b2543c] bg-[#b2543c] text-[#f2ede6]'
                            : reveal
                              ? 'border-[#2a241f] text-[#4a423a]'
                              : 'border-[#4a423a] bg-[#221e1a] text-[#f2ede6] hover:-translate-y-0.5 hover:border-[#e0a34a] hover:bg-[#e0a34a]/10 hover:text-[#e0a34a]'
                      }`}
                    >
                      {o.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4">
          <span className="type-label text-[#6e655c]">
            {score.tentativas === 0
              ? 'a onda acima mostra o som de verdade — clica em ouvir de novo quantas vezes quiser'
              : `melhor sequência: ${best}`}
          </span>
          <span className="type-label text-[#e0a34a]">+{score.xp} xp</span>
        </div>
      </main>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { getDrumKit, preloadDrumKit, type DrumPiece } from '../../audio/instruments'
import { setBpm, startSixteenthLoop } from '../../audio/transport'
import { Notation } from '../../tools/groove/Notation'
import {
  emptyPattern,
  LANES,
  PRESETS,
  STEPS,
  toggleStep,
  type Pattern,
} from '../../tools/groove/patterns'

/* ┃ferramenta 02┃ Groove machine.
   Sequenciador com cara de hardware + o diferencial: a partitura da levada
   se escrevendo ao vivo. Ritmo é a maior dificuldade documentada de quem
   começa — e aqui é o terreno do baterista. */

export function GroovePage() {
  const [pattern, setPattern] = useState<Pattern>(() => ({ ...PRESETS[0] }))
  const [playing, setPlaying] = useState(false)
  const [playStep, setPlayStep] = useState<number | null>(null)
  const [bpm, setBpmState] = useState(PRESETS[0].bpm)
  const stopRef = useRef<(() => void) | null>(null)
  const patternRef = useRef(pattern)
  patternRef.current = pattern

  useEffect(() => {
    preloadDrumKit()
    return () => {
      stopRef.current?.()
    }
  }, [])

  useEffect(() => {
    setBpm(bpm)
  }, [bpm])

  const togglePlay = useCallback(async () => {
    if (playing) {
      stopRef.current?.()
      stopRef.current = null
      setPlaying(false)
      setPlayStep(null)
      return
    }
    const kit = await getDrumKit()
    setBpm(bpm)
    stopRef.current = await startSixteenthLoop(
      (step, time) => {
        for (const { id } of LANES) {
          if (patternRef.current.steps[id][step]) {
            kit.player(id).start(time)
          }
        }
      },
      (step) => setPlayStep(step),
    )
    setPlaying(true)
  }, [playing, bpm])

  const loadPreset = (p: Pattern) => {
    setPattern({ ...p, steps: Object.fromEntries(Object.entries(p.steps).map(([k, v]) => [k, [...v]])) as Pattern['steps'] })
    setBpmState(p.bpm)
  }

  const tap = (laneId: DrumPiece, i: number) => {
    setPattern((p) => toggleStep(p, laneId, i))
    // toca a peça na hora, pra edição ser audível mesmo parado
    void getDrumKit().then((kit) => {
      if (!patternRef.current.steps[laneId][i]) kit.player(laneId).start()
    })
  }

  return (
    <div className="min-h-screen pt-[var(--altura-nav)] bg-[#171310] text-[#f2ede6]">
      <header className="flex items-center justify-between px-5 pb-6 pt-6 md:px-10">
        <span />
        <span className="type-label text-[#6e655c]">ferramenta 02</span>
      </header>

      <main className="px-5 pb-24 md:px-10">
        <div className="mb-10 max-w-2xl md:mb-12">
          <h1 className="type-display text-5xl md:text-7xl">Groove machine</h1>
          <p className="mt-4 max-w-xl text-lg text-[#a69c90]">
            Monta a levada nos passos — e repara embaixo: <span className="text-[#e0a34a]">a
            partitura se escreve sozinha</span> enquanto você cria.
          </p>
        </div>

        {/* transporte */}
        <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-[#332d27] py-4">
          <button
            onClick={() => void togglePlay()}
            className={`type-label border px-6 py-3 transition-colors ${
              playing
                ? 'border-[#e0a34a] bg-[#e0a34a] text-[#12100e]'
                : 'border-[#e0a34a] text-[#e0a34a] hover:bg-[#e0a34a]/10'
            }`}
          >
            {playing ? '■ parar' : '▶ tocar'}
          </button>

          <div className="flex items-center gap-3">
            <span className="type-label text-[#6e655c]">♩ =</span>
            <input
              type="range"
              min={60}
              max={160}
              value={bpm}
              onChange={(e) => setBpmState(Number(e.target.value))}
              className="w-36 accent-[#e0a34a]"
            />
            <span className="w-10 font-mono text-sm text-[#f2ede6]">{bpm}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="type-label mr-1 text-[#6e655c]">levadas</span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => loadPreset(p)}
                className={`type-label border px-3 py-2 transition-colors ${
                  pattern.name === p.name
                    ? 'border-[#e0a34a] bg-[#e0a34a]/10 text-[#e0a34a]'
                    : 'border-[#332d27] text-[#a69c90] hover:border-[#a69c90]'
                }`}
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={() => loadPreset(emptyPattern())}
              className="type-label border border-[#332d27] px-3 py-2 text-[#6e655c] transition-colors hover:border-[#b2543c] hover:text-[#b2543c]"
            >
              limpar
            </button>
          </div>
        </div>

        {/* a máquina */}
        <div className="border border-[#332d27] bg-[#221e1a] p-4 md:p-6">
          <div className="overflow-x-auto">
            <div style={{ minWidth: 640 }}>
              {LANES.map(({ id, name }) => (
                <div key={id} className="mb-2 flex items-center gap-2 last:mb-0">
                  <span className="type-label w-16 shrink-0 text-right text-[#a69c90]">{name}</span>
                  <div className="flex flex-1 gap-1">
                    {Array.from({ length: STEPS }, (_, i) => {
                      const on = pattern.steps[id][i]
                      const hot = playStep === i
                      return (
                        <button
                          key={i}
                          onClick={() => tap(id, i)}
                          aria-label={`${name}, passo ${i + 1}`}
                          className={`h-11 flex-1 border transition-colors duration-75 ${
                            i % 4 === 0 ? 'ml-1.5 first:ml-0' : ''
                          } ${
                            on
                              ? hot
                                ? 'border-[#f2ede6] bg-[#f2ede6]'
                                : 'border-[#e0a34a] bg-[#e0a34a]'
                              : hot
                                ? 'border-[#a69c90] bg-[#f2ede6]/10'
                                : 'border-[#332d27] bg-transparent hover:border-[#6e655c]'
                          }`}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* a notação viva */}
        <div className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="type-label text-[#6e655c]">a mesma levada, escrita</span>
            <span className="type-label text-[#6e655c]">{pattern.name}</span>
          </div>
          <div className="border border-[#332d27] bg-[#1b1815] p-4">
            <Notation pattern={pattern} playStep={playStep} />
          </div>
          <p className="type-label mt-4 text-[#6e655c]">
            x = chimbal · bola no meio = caixa · bola embaixo = bumbo · os números embaixo são a
            contagem: 1 e & a 2 e & a…
          </p>
        </div>
      </main>
    </div>
  )
}

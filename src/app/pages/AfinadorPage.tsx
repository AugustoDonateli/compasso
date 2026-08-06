import { useMemo, useState } from 'react'
import { useMicrophone } from '../../audio/useMicrophone'
import { estaAfinado, notaParaFreq } from '../../audio/pitch'
import { TUNINGS, type InstrumentId } from '../../theory/fretboard'
import { midiToName, midiToPc, noteSolfejo, spellPc } from '../../theory/notes'

/* ┃ferramenta 05┃ Afinador.
   A vantagem injusta do site: nenhum vídeo do YouTube consegue OUVIR você.
   E não é IA nem servidor — é autocorrelação rodando no seu navegador,
   com o áudio nunca saindo do aparelho. */

const AFINACOES: Array<{ id: InstrumentId | 'violino'; nome: string; midis: number[] }> = [
  { id: 'guitarra', nome: 'guitarra', midis: TUNINGS.guitarra.openStrings },
  { id: 'violao', nome: 'violão', midis: TUNINGS.violao.openStrings },
  { id: 'baixo', nome: 'baixo', midis: TUNINGS.baixo.openStrings },
  // sol3 ré4 lá4 mi5 — de quinta em quinta
  { id: 'violino', nome: 'violino', midis: [55, 62, 69, 76] },
]

/** Ponteiro: -50 a +50 cents mapeado pra 0–100% da barra */
function posicao(cents: number): number {
  return Math.max(0, Math.min(100, ((cents + 50) / 100) * 100))
}

export function AfinadorPage() {
  const { estado, leitura, ouvir, parar } = useMicrophone()
  const [instrumento, setInstrumento] = useState(0)
  const afinacao = AFINACOES[instrumento]

  /** Qual corda a pessoa está tentando afinar: a mais perto do que soou */
  const cordaAlvo = useMemo(() => {
    if (!leitura) return null
    let melhor = afinacao.midis[0]
    let menorDist = Infinity
    for (const m of afinacao.midis) {
      const d = Math.abs(m - leitura.midi)
      if (d < menorDist) {
        menorDist = d
        melhor = m
      }
    }
    return menorDist <= 4 ? melhor : null
  }, [leitura, afinacao])

  const afinado = leitura ? estaAfinado(leitura.cents) : false

  /* Três estados, três cores, e cada uma quer dizer uma coisa:
       sem sinal  → apagado, o mostrador está esperando
       soando     → o TIMBRE do instrumento, porque o som está acontecendo
       afinado    → sálvia, o sinal de "certo" que o site usa em toda parte
     A versão anterior usava latão pra "soando", que é a cor do site — então
     o mostrador nunca parecia estar reagindo a VOCÊ. */
  const cor = !leitura ? '#8a8075' : afinado ? 'var(--ok)' : 'var(--timbre)'

  return (
    <div
      /* a página inteira do afinador veste o timbre do instrumento escolhido
         AQUI, sem mexer no instrumento da trilha */
      data-timbre={afinacao.id}
      className="min-h-screen bg-[#12100e] pt-[var(--altura-nav)] text-[#f2ede6]"
    >
      <header className="flex items-center justify-between px-5 py-5 md:px-10">
        <span />
        <span className="type-label text-[#8a8075]">ferramenta 05</span>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 md:px-10">
        <h1
          className="type-display leading-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginLeft: '-0.03em' }}
        >
          Afinador
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[#a69c90]">
          Toque uma corda e o site <span className="text-[#e0a34a]">escuta</span>. O som não sai do
          seu aparelho — nada é gravado nem enviado.
        </p>

        {/* instrumento */}
        <div className="mt-8 flex w-full min-w-0 flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
          <span className="type-label text-[#8a8075]">instrumento</span>
          <div className="relevo flex max-w-full overflow-x-auto border border-[#332d27]">
            {AFINACOES.map((a, k) => (
              <button
                key={a.id}
                onClick={() => setInstrumento(k)}
                className={`type-label flex min-h-11 shrink-0 items-center px-4 transition-colors ${k > 0 ? 'border-l border-[#332d27]' : ''} ${
                  instrumento === k
                    ? 'bg-[#e0a34a] text-[#12100e]'
                    : 'text-[#a69c90] hover:bg-[#f2ede6]/5 hover:text-[#f2ede6]'
                }`}
              >
                {a.nome}
              </button>
            ))}
          </div>
        </div>

        {/* o mostrador: painel que SOBE da página (sombra fria + luz na aresta
            de cima), com a tela AFUNDADA dentro dele. Era uma borda de 1px. */}
        <div className="relevo-alto mt-10 border border-[#332d27] bg-[#1b1815] p-6 md:p-10">
          {estado !== 'ouvindo' ? (
            <div className="py-10 text-center">
              <p className="type-display text-2xl text-[#f2ede6] md:text-3xl">
                {estado === 'negado'
                  ? 'O navegador bloqueou o microfone.'
                  : estado === 'erro'
                    ? 'Não consegui abrir o microfone.'
                    : 'Pronto pra ouvir.'}
              </p>
              <p className="mx-auto mt-3 max-w-md text-[#a69c90]">
                {estado === 'negado'
                  ? 'Libere o microfone para este site nas permissões do navegador e tente de novo.'
                  : estado === 'erro'
                    ? 'Confira se algum outro programa está usando o microfone.'
                    : 'O navegador vai pedir permissão. O áudio fica só no seu aparelho.'}
              </p>
              <button
                onClick={() => void ouvir()}
                disabled={estado === 'pedindo'}
                className="relevo type-label mt-8 border-2 border-[#e0a34a] bg-[#e0a34a] px-10 py-5 text-[#12100e] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {estado === 'pedindo' ? 'pedindo permissão…' : '🎤 ligar o microfone'}
              </button>
            </div>
          ) : (
            <>
              {/* A TELA. Fundo mais escuro que o painel e sombra pra dentro:
                  é assim que um mostrador afundado se comporta. A nota EMITE
                  luz (o halo vaza pro entorno) em vez de estar pintada, e
                  quando afina o halo abre. É o único pico visual da página. */}
              <div
                className="relative overflow-hidden bg-[#0d0b09] px-4 py-8 text-center transition-shadow duration-300"
                style={{
                  boxShadow: leitura
                    ? `inset 0 2px 14px rgb(0 0 0 / 0.75), inset 0 0 ${afinado ? 90 : 60}px -20px ${cor}`
                    : 'inset 0 2px 14px rgb(0 0 0 / 0.75)',
                }}
              >
                <div
                  className={`type-display leading-none transition-colors duration-200 ${afinado ? 'anim-acerto' : ''}`}
                  style={{
                    fontSize: 'clamp(4rem, 14vw, 9rem)',
                    color: cor,
                    textShadow: leitura
                      ? `0 0 ${afinado ? 60 : 34}px color-mix(in srgb, ${cor} 55%, transparent)`
                      : 'none',
                  }}
                >
                  {leitura ? noteSolfejo(spellPc(midiToPc(leitura.midi))) : '—'}
                </div>
                <div className="type-label mt-2 text-[#a69c90]">
                  {leitura
                    ? `${midiToName(leitura.midi)} · ${leitura.freq.toFixed(1)} Hz`
                    : 'toque uma corda'}
                </div>

                {/* ponteiro de cents, dentro da tela */}
                <div className="relative mx-auto mt-8 h-16 max-w-md">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-[#332d27]" />
                  {/* a zona afinada ACENDE quando você entra nela: o alvo
                      responde, em vez de só existir parado */}
                  <div
                    className="absolute top-1/2 h-10 -translate-y-1/2 border-x transition-all duration-200"
                    style={{
                      left: `${posicao(-5)}%`,
                      width: `${posicao(5) - posicao(-5)}%`,
                      borderColor: afinado
                        ? 'var(--ok)'
                        : 'color-mix(in srgb, var(--ok) 40%, transparent)',
                      background: afinado
                        ? 'color-mix(in srgb, var(--ok) 22%, transparent)'
                        : 'color-mix(in srgb, var(--ok) 8%, transparent)',
                      boxShadow: afinado
                        ? '0 0 26px -4px color-mix(in srgb, var(--ok) 70%, transparent)'
                        : 'none',
                    }}
                  />
                  {/* centro */}
                  <div className="absolute left-1/2 top-1/2 h-12 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-[#a69c90]" />
                  {/* agulha: emite luz, não é um retângulo colorido */}
                  {leitura && (
                    <div
                      className="absolute top-1/2 h-16 w-1 -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
                      style={{
                        left: `${posicao(leitura.cents)}%`,
                        backgroundColor: cor,
                        boxShadow: `0 0 14px 1px color-mix(in srgb, ${cor} 70%, transparent)`,
                      }}
                    />
                  )}
                  <span className="type-label absolute left-0 top-0 text-[#8a8075]">baixo</span>
                  <span className="type-label absolute right-0 top-0 text-[#8a8075]">alto</span>
                </div>
              </div>

              <p className="mt-6 text-center text-lg" style={{ color: cor }}>
                {!leitura
                  ? ' '
                  : afinado
                    ? 'Afinado.'
                    : leitura.cents < 0
                      ? `${Math.abs(leitura.cents)} cents baixo — aperte a tarraxa`
                      : `${leitura.cents} cents alto — afrouxe e suba de volta`}
              </p>

              {/* cordas do instrumento */}
              <div className="mt-10 border-t border-[#332d27] pt-6">
                <span className="type-label text-[#8a8075]">cordas soltas · {afinacao.nome}</span>
                <div className="mt-4 flex flex-wrap gap-2">
                  {afinacao.midis.map((m, k) => {
                    const ativa = cordaAlvo === m
                    return (
                      <div
                        key={k}
                        /* a corda que você está afinando acende junto com o
                           mostrador — o painel inteiro reage a um gesto só */
                        className={`relevo flex min-w-20 flex-col items-center border px-4 py-3 transition-all duration-200 ${
                          ativa && afinado ? 'led' : ''
                        }`}
                        style={{
                          borderColor: ativa && afinado ? 'var(--ok)' : ativa ? 'var(--timbre)' : '#332d27',
                          background:
                            ativa && afinado
                              ? 'color-mix(in srgb, var(--ok) 16%, transparent)'
                              : ativa
                                ? 'color-mix(in srgb, var(--timbre) 12%, transparent)'
                                : 'transparent',
                        }}
                      >
                        <span className="type-display text-2xl">
                          {noteSolfejo(spellPc(midiToPc(m)))}
                        </span>
                        <span className="type-label mt-1 text-[#8a8075]">
                          {notaParaFreq(m).toFixed(1)} Hz
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={parar}
                className="type-label mt-8 border border-[#332d27] px-6 py-3 text-[#a69c90] transition-colors hover:border-[#b2543c] hover:text-[#b2543c]"
              >
                desligar o microfone
              </button>
            </>
          )}
        </div>

        <p className="type-label mt-6 text-[#8a8075]">
          detecção por autocorrelação · sem servidor, sem gravação, sem ia
        </p>
      </main>
    </div>
  )
}

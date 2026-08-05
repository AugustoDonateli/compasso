import { useEffect, useRef, useState } from 'react'
import { useMicrophone } from '../../audio/useMicrophone'
import { midiToPc, noteSolfejo, spellPc, type PitchClass } from '../../theory/notes'

/* A pergunta que só o Compasso consegue fazer.
   O site pede uma nota e OUVE se você tocou. Um vídeo não faz isso; um
   professor faz, mas custa caro e não atende às 23h.

   Aceita a nota em qualquer oitava e em qualquer posição do instrumento —
   o que importa é ter saído do instrumento, não onde você achou.

   Nunca prende ninguém: quem não tem microfone, está no ônibus ou não quer
   dar permissão tem uma saída ao lado. */

/** Quantas leituras seguidas certas até valer. Evita acerto por acidente
 *  quando o afinador passa de raspão pela nota certa. */
const LEITURAS_PARA_VALER = 6

interface Props {
  alvo: PitchClass
  onAcertou: () => void
  onDesistir: () => void
}

export function TocarNota({ alvo, onAcertou, onDesistir }: Props) {
  const { estado, leitura, ouvir, parar } = useMicrophone()
  const [progresso, setProgresso] = useState(0)
  const seguidasRef = useRef(0)
  const acertouRef = useRef(false)

  useEffect(() => {
    if (acertouRef.current) return
    const pc = leitura ? midiToPc(leitura.midi) : null
    if (pc === alvo) {
      seguidasRef.current += 1
      setProgresso(Math.min(1, seguidasRef.current / LEITURAS_PARA_VALER))
      if (seguidasRef.current >= LEITURAS_PARA_VALER) {
        acertouRef.current = true
        parar()
        onAcertou()
      }
    } else {
      seguidasRef.current = 0
      setProgresso(0)
    }
  }, [leitura, alvo, onAcertou, parar])

  const nomeAlvo = noteSolfejo(spellPc(alvo))
  const ouvindoAgora = leitura ? noteSolfejo(spellPc(midiToPc(leitura.midi))) : null
  const quase = progresso > 0 && progresso < 1

  return (
    <div className="border border-[#332d27] bg-[#1b1815] p-6 md:p-10">
      {estado !== 'ouvindo' ? (
        <div className="text-center">
          <p className="type-display text-2xl md:text-3xl">
            {estado === 'negado'
              ? 'O navegador bloqueou o microfone.'
              : estado === 'erro'
                ? 'Não consegui abrir o microfone.'
                : 'O site vai ouvir você tocar.'}
          </p>
          <p className="mx-auto mt-3 max-w-md text-[#a69c90]">
            {estado === 'negado' || estado === 'erro'
              ? 'Sem problema — dá pra responder pela tela também.'
              : 'Pega o instrumento. O áudio fica só no seu aparelho, nada é gravado.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {estado !== 'negado' && estado !== 'erro' && (
              <button
                onClick={() => void ouvir()}
                disabled={estado === 'pedindo'}
                className="type-label border-2 border-[#e0a34a] bg-[#e0a34a] px-8 py-5 text-[#12100e] disabled:opacity-50"
              >
                {estado === 'pedindo' ? 'pedindo permissão…' : '🎤 ligar o microfone'}
              </button>
            )}
            <button
              onClick={onDesistir}
              className="type-label border border-[#332d27] px-6 py-5 text-[#a69c90] transition-colors hover:border-[#a69c90]"
            >
              responder pela tela
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <span className="type-label text-[#a69c90]">toque no seu instrumento</span>
          <div
            className="type-display mt-3 leading-none transition-colors duration-200"
            style={{
              fontSize: 'clamp(3.5rem, 12vw, 7rem)',
              color: quase ? '#6e8f5a' : '#e0a34a',
            }}
          >
            {nomeAlvo}
          </div>

          {/* barra de confirmação: precisa segurar a nota, não passar de raspão */}
          <div className="mx-auto mt-8 h-2 w-full max-w-sm bg-[#221e1a]">
            <div
              className="h-full bg-[#6e8f5a] transition-all duration-100"
              style={{ width: `${progresso * 100}%` }}
            />
          </div>

          <p className="mt-5 min-h-7 text-lg text-[#a69c90]">
            {!leitura ? (
              'ouvindo…'
            ) : quase ? (
              <span className="text-[#6e8f5a]">isso — segura a nota</span>
            ) : (
              <>
                ouvi <span className="text-[#f2ede6]">{ouvindoAgora}</span> — não é essa
              </>
            )}
          </p>

          <button
            onClick={() => {
              parar()
              onDesistir()
            }}
            className="type-label mt-8 text-[#8a8075] underline underline-offset-4 transition-colors hover:text-[#a69c90]"
          >
            responder pela tela
          </button>
        </div>
      )}
    </div>
  )
}

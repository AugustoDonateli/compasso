import { useCallback, useEffect, useRef, useState } from 'react'
import { detectarFrequencia, freqParaNota, type Leitura } from './pitch'

/** O microfone do Compasso.
 *
 *  Privacidade: o áudio NUNCA sai do aparelho. Não há upload, não há servidor,
 *  não há gravação — o sinal entra, vira um número, e é descartado no quadro
 *  seguinte. Tudo acontece dentro do navegador.
 *
 *  O navegador exige gesto do usuário pra liberar o microfone, então quem
 *  chama isso precisa ser um clique. */

export type EstadoMic = 'parado' | 'pedindo' | 'ouvindo' | 'negado' | 'erro'

const TAMANHO_BUFFER = 2048
/** Média móvel: sem isso o ponteiro treme e ninguém consegue afinar */
const SUAVIZACAO = 5

export function useMicrophone() {
  const [estado, setEstado] = useState<EstadoMic>('parado')
  const [leitura, setLeitura] = useState<Leitura | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef(0)
  const historicoRef = useRef<number[]>([])

  const parar = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    void ctxRef.current?.close()
    ctxRef.current = null
    historicoRef.current = []
    setLeitura(null)
    setEstado('parado')
  }, [])

  const ouvir = useCallback(async () => {
    setEstado('pedindo')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // desligado de propósito: esses filtros são feitos pra VOZ e
          // deformam a nota de um instrumento
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      streamRef.current = stream

      const ctx = new AudioContext()
      ctxRef.current = ctx
      const fonte = ctx.createMediaStreamSource(stream)
      const analisador = ctx.createAnalyser()
      analisador.fftSize = TAMANHO_BUFFER
      fonte.connect(analisador)

      const buffer = new Float32Array(analisador.fftSize)
      setEstado('ouvindo')

      const loop = () => {
        rafRef.current = requestAnimationFrame(loop)
        analisador.getFloatTimeDomainData(buffer)
        const freq = detectarFrequencia(buffer, ctx.sampleRate)

        if (freq === null) {
          historicoRef.current = []
          setLeitura(null)
          return
        }

        const h = historicoRef.current
        h.push(freq)
        if (h.length > SUAVIZACAO) h.shift()
        // mediana em vez de média: uma leitura errada isolada não desloca o ponteiro
        const ordenado = [...h].sort((a, b) => a - b)
        const mediana = ordenado[Math.floor(ordenado.length / 2)]
        setLeitura(freqParaNota(mediana))
      }
      loop()
    } catch (e) {
      const negado = e instanceof DOMException && e.name === 'NotAllowedError'
      setEstado(negado ? 'negado' : 'erro')
    }
  }, [])

  useEffect(() => parar, [parar])

  return { estado, leitura, ouvir, parar }
}

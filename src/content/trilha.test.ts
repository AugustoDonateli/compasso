import { describe, expect, it } from 'vitest'
import {
  licaoDesbloqueada,
  licaoPorId,
  licoesDe,
  progressoPct,
  proximaLicao,
  TODAS_UNIDADES,
  trilhaDe,
} from './trilha'
import type { InstrumentSoundId } from '../audio/instruments'

const INSTRUMENTOS: InstrumentSoundId[] = ['guitarra', 'violao', 'baixo', 'piano', 'violino']

describe('estrutura da trilha', () => {
  it('ids de unidade, lição e pergunta são únicos no site inteiro', () => {
    const uIds = TODAS_UNIDADES.map((u) => u.id)
    expect(new Set(uIds).size).toBe(uIds.length)
    const lIds = TODAS_UNIDADES.flatMap((u) => u.licoes.map((l) => l.id))
    expect(new Set(lIds).size).toBe(lIds.length)
    const qIds = TODAS_UNIDADES.flatMap((u) => u.licoes.flatMap((l) => l.perguntas.map((p) => p.id)))
    expect(new Set(qIds).size).toBe(qIds.length)
  })

  it('toda lição tem pelo menos duas perguntas', () => {
    for (const u of TODAS_UNIDADES) {
      for (const l of u.licoes) expect(l.perguntas.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('TODA pergunta explica a resposta — o erro sempre vira aula', () => {
    for (const u of TODAS_UNIDADES) {
      for (const l of u.licoes) {
        for (const p of l.perguntas) expect(p.explica.length).toBeGreaterThan(60)
      }
    }
  })

  it('alternativas: pelo menos 2, no máximo 4, com índice válido', () => {
    for (const u of TODAS_UNIDADES) {
      for (const l of u.licoes) {
        for (const p of l.perguntas) {
          if (p.tipo === 'escolha' || p.tipo === 'ouvir') {
            expect(p.alternativas.length).toBeGreaterThanOrEqual(2)
            // "três boas valem mais que quatro com enchimento"
            expect(p.alternativas.length).toBeLessThanOrEqual(4)
            expect(p.correta).toBeGreaterThanOrEqual(0)
            expect(p.correta).toBeLessThan(p.alternativas.length)
          }
        }
      }
    }
  })

  it('nenhuma alternativa se repete dentro da mesma pergunta', () => {
    for (const u of TODAS_UNIDADES) {
      for (const l of u.licoes) {
        for (const p of l.perguntas) {
          if (p.tipo === 'escolha' || p.tipo === 'ouvir') {
            expect(new Set(p.alternativas).size).toBe(p.alternativas.length)
          }
        }
      }
    }
  })

  it('a resposta certa não é sempre a primeira (evita chutar por padrão)', () => {
    const indices = TODAS_UNIDADES.flatMap((u) =>
      u.licoes.flatMap((l) =>
        l.perguntas
          .filter((p) => p.tipo === 'escolha' || p.tipo === 'ouvir')
          .map((p) => (p as { correta: number }).correta),
      ),
    )
    expect(new Set(indices).size).toBeGreaterThan(1)
  })

  it('perguntas de montar têm alvo válido', () => {
    for (const u of TODAS_UNIDADES) {
      for (const l of u.licoes) {
        for (const p of l.perguntas) {
          if (p.tipo === 'montar') {
            expect(p.alvo.length).toBeGreaterThan(0)
            for (const pc of p.alvo) {
              expect(pc).toBeGreaterThanOrEqual(0)
              expect(pc).toBeLessThanOrEqual(11)
            }
          }
        }
      }
    }
  })
})

describe('galhos por instrumento', () => {
  it('cada instrumento vê o SEU galho e nenhum outro', () => {
    const esperado: Record<string, string> = {
      guitarra: 'seu-instrumento-cordas',
      violao: 'seu-instrumento-cordas',
      baixo: 'seu-instrumento-baixo',
      piano: 'seu-instrumento-piano',
      violino: 'seu-instrumento-violino',
    }
    for (const i of INSTRUMENTOS) {
      const ids = trilhaDe(i).map((u) => u.id)
      expect(ids).toContain(esperado[i])
      // nenhum galho de outro instrumento vazou
      for (const [outro, id] of Object.entries(esperado)) {
        if (esperado[i] !== id) expect(ids).not.toContain(outro === i ? '' : id)
      }
    }
  })

  it('todo instrumento começa pelo galho dele, antes da teoria', () => {
    for (const i of INSTRUMENTOS) {
      expect(trilhaDe(i)[0].n).toBe(0)
      expect(trilhaDe(i)[0].paraInstrumentos).toContain(i)
    }
  })

  it('todo instrumento vê a teoria universal', () => {
    for (const i of INSTRUMENTOS) {
      const ids = trilhaDe(i).map((u) => u.id)
      expect(ids).toContain('som-tem-nome')
      expect(ids).toContain('o-pulso')
    }
  })

  it('todo instrumento tem trilha navegável de tamanho decente', () => {
    for (const i of INSTRUMENTOS) {
      expect(licoesDe(i).length).toBeGreaterThanOrEqual(7)
    }
  })

  it('só instrumento de corda usa perguntas de braço', () => {
    const comBraco: InstrumentSoundId[] = ['guitarra', 'violao', 'baixo']
    for (const i of INSTRUMENTOS) {
      const temAchar = trilhaDe(i).some((u) =>
        u.licoes.some((l) => l.perguntas.some((p) => p.tipo === 'achar')),
      )
      if (!comBraco.includes(i)) expect(temAchar).toBe(false)
    }
  })

  it('aberturas existem, mas só onde o conceito tem muitas peças', () => {
    const comAbertura = TODAS_UNIDADES.flatMap((u) => u.licoes).filter((l) => l.abertura)
    const total = TODAS_UNIDADES.flatMap((u) => u.licoes).length
    expect(comAbertura.length).toBeGreaterThan(0)
    // se toda lição tivesse abertura, perderíamos o efeito de pré-teste
    expect(comAbertura.length).toBeLessThan(total / 2)
    for (const l of comAbertura) {
      expect(l.abertura!.texto.length).toBeGreaterThan(120)
    }
  })
})

describe('progressão', () => {
  const ids = licoesDe('guitarra').map((x) => x.licao.id)

  it('próxima lição é a primeira não concluída', () => {
    expect(proximaLicao([], 'guitarra')?.licao.id).toBe(ids[0])
    expect(proximaLicao([ids[0]], 'guitarra')?.licao.id).toBe(ids[1])
    // buraco no meio: volta o que falta, não o seguinte ao último feito
    expect(proximaLicao([ids[0], ids[2]], 'guitarra')?.licao.id).toBe(ids[1])
  })

  it('trilha inteira concluída não tem próxima', () => {
    expect(proximaLicao(ids, 'guitarra')).toBeNull()
  })

  it('primeira lição já nasce aberta; a seguinte só depois dela', () => {
    expect(licaoDesbloqueada(ids[0], [], 'guitarra')).toBe(true)
    expect(licaoDesbloqueada(ids[1], [], 'guitarra')).toBe(false)
    expect(licaoDesbloqueada(ids[1], [ids[0]], 'guitarra')).toBe(true)
  })

  it('percentual conta só as lições do instrumento escolhido', () => {
    expect(progressoPct([], 'guitarra')).toBe(0)
    expect(progressoPct(ids, 'guitarra')).toBe(100)
    // lições de corda não contam pro pianista
    expect(progressoPct(['seis-cordas'], 'piano')).toBe(0)
  })

  it('busca por id devolve a unidade junto', () => {
    expect(licaoPorId(ids[0], 'guitarra')?.unidade.n).toBe(0)
    expect(licaoPorId('nada', 'guitarra')).toBeUndefined()
  })
})

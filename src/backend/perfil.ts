import { supabase, garantirSessao, meuId } from './supabase'
import type { UserProgress } from '../storage/types'

/** Perfil e ranking. */

export interface Colocacao {
  apelido: string
  xp: number
  posicao: number
}

export async function meuApelido(): Promise<string | null> {
  const id = await meuId()
  if (!id) return null
  const { data } = await supabase.from('perfis').select('apelido').eq('id', id).maybeSingle()
  return data?.apelido ?? null
}

/** Define o apelido. Devolve erro legível quando já está em uso. */
export async function definirApelido(
  apelido: string,
  instrumento?: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const id = await meuId()
  if (!id) return { ok: false, erro: 'sem conexão com o servidor' }

  const limpo = apelido.trim().slice(0, 24)
  if (limpo.length < 2) return { ok: false, erro: 'o apelido precisa de pelo menos 2 letras' }

  const { error } = await supabase
    .from('perfis')
    .upsert({ id, apelido: limpo, instrumento }, { onConflict: 'id' })

  if (error) {
    // 23505 = violação de unicidade
    if (error.code === '23505') return { ok: false, erro: 'esse apelido já é de outra pessoa' }
    return { ok: false, erro: 'não consegui salvar agora' }
  }
  // garante a linha de progresso, pra somar_xp ter onde escrever
  await supabase.from('progresso').upsert({ perfil_id: id }, { onConflict: 'perfil_id' })
  return { ok: true }
}

/** O ranking da semana. Reinicia toda segunda — decisão da pesquisa:
 *  ranking eterno desanima quem chega depois. */
export async function rankingDaSemana(): Promise<Colocacao[]> {
  const s = await garantirSessao()
  if (!s) return []
  const { data, error } = await supabase.rpc('ranking_da_semana')
  if (error || !data) return []
  return data as Colocacao[]
}

/** Soma XP no servidor de forma atômica (total + semanal, numa transação). */
export async function somarXpRemoto(quantidade: number): Promise<void> {
  const s = await garantirSessao()
  if (!s) return
  await supabase.rpc('somar_xp', { quantidade })
}

/* ---------- sincronização do progresso ---------- */

/** Envia o progresso local pro servidor. */
export async function enviarProgresso(p: UserProgress): Promise<void> {
  const id = await meuId()
  if (!id) return
  await supabase.from('perfis').upsert({ id }, { onConflict: 'id' })
  await supabase.from('progresso').upsert(
    {
      perfil_id: id,
      xp: p.xp,
      streak: p.streak,
      ultimo_dia: p.lastActiveDate,
      licoes_concluidas: p.completed,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: 'perfil_id' },
  )
}

export async function baixarProgresso(): Promise<UserProgress | null> {
  const id = await meuId()
  if (!id) return null
  const { data } = await supabase
    .from('progresso')
    .select('xp, streak, ultimo_dia, licoes_concluidas')
    .eq('perfil_id', id)
    .maybeSingle()
  if (!data) return null
  return {
    xp: data.xp ?? 0,
    streak: data.streak ?? 0,
    lastActiveDate: data.ultimo_dia ?? null,
    completed: data.licoes_concluidas ?? [],
    settings: {},
  }
}

/** Junta local e remoto SEM PERDER NADA.
 *
 *  Essa é a regra mais importante da sincronização: se você estudou no
 *  celular sem rede e depois abre no PC, nenhum dos dois lados pode apagar o
 *  outro. Então lições concluídas viram união dos dois conjuntos, e XP e
 *  streak ficam com o maior valor. Perder progresso é o pior defeito
 *  possível num site que existe pra você não desistir. */
export function juntar(local: UserProgress, remoto: UserProgress): UserProgress {
  const concluidas = Array.from(new Set([...local.completed, ...remoto.completed]))
  const maisRecente =
    (local.lastActiveDate ?? '') >= (remoto.lastActiveDate ?? '')
      ? local.lastActiveDate
      : remoto.lastActiveDate
  return {
    xp: Math.max(local.xp, remoto.xp),
    streak: Math.max(local.streak, remoto.streak),
    lastActiveDate: maisRecente,
    completed: concluidas,
    settings: { ...remoto.settings, ...local.settings },
  }
}

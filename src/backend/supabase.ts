import { createClient, type Session } from '@supabase/supabase-js'

/** O backend do Compasso.
 *
 *  SOBRE ESTAS CHAVES ESTAREM NO CÓDIGO: a chave "publicável" é feita pra ser
 *  pública — ela vai pro navegador de qualquer jeito, em qualquer site que use
 *  Supabase. Quem protege os dados é o RLS no banco, não o segredo da chave:
 *  cada pessoa só consegue ler e escrever o próprio progresso, e do ranking só
 *  saem apelido e XP. A chave que precisa ficar em segredo (service role) não
 *  existe neste projeto.
 *
 *  SOBRE "SEM CADASTRO": a home promete isso e continua verdade. A sessão é
 *  ANÔNIMA — ninguém digita e-mail nem senha, e ela é criada em silêncio no
 *  primeiro acesso. O apelido só é pedido de quem QUISER aparecer no ranking. */

const URL = 'https://vyfdzxuwuldaqmgqqkfu.supabase.co'
const CHAVE_PUBLICAVEL = 'sb_publishable__eJQPNKJMjy19HRv4kDwZA_oN9aQ1Ne'

export const supabase = createClient(URL, CHAVE_PUBLICAVEL, {
  auth: { persistSession: true, autoRefreshToken: true },
})

let promessaDeSessao: Promise<Session | null> | null = null
let tentativas = 0

/* Por que um teto de tentativas: quando entrar falha, a tela chama de novo (o
   ranking pede sessão três vezes numa carga só). Se cada chamada tentasse
   entrar, um problema de configuração viraria uma rajada de requisições — e o
   Supabase limita entrada anônima a 30 por hora por IP, então a rajada
   bloquearia o site justamente na hora de consertar. Três tentativas cobrem
   uma oscilação de rede e param antes de virar tempestade. */
const MAX_TENTATIVAS = 3

/** Garante uma sessão anônima. Chamável quantas vezes quiser: só cria uma. */
export function garantirSessao(): Promise<Session | null> {
  if (!promessaDeSessao) {
    promessaDeSessao = (async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) return data.session
      tentativas += 1
      const { data: nova, error } = await supabase.auth.signInAnonymously()
      if (error) {
        // sem rede ou anônimo desativado: o site inteiro continua funcionando
        // no localStorage. Sincronizar é bônus, não requisito.
        if (tentativas < MAX_TENTATIVAS) promessaDeSessao = null
        return null
      }
      return nova.session
    })()
  }
  return promessaDeSessao
}

export async function meuId(): Promise<string | null> {
  const s = await garantirSessao()
  return s?.user.id ?? null
}

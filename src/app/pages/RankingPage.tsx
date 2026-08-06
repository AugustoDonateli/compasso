import { useCallback, useEffect, useState } from 'react'
import {
  definirApelido,
  meuApelido,
  rankingDaSemana,
  type Colocacao,
} from '../../backend/perfil'
import { getProgress, sincronizar } from '../../progress'
import { somConquista } from '../../audio/feedback'
import type { UserProgress } from '../../storage'

/* ┃ranking┃ A semana entre amigos.
   Decisões vindas da pesquisa de gamificação, não de gosto:
   - grupo pequeno motiva mais que ranking global
   - o ranking REINICIA toda segunda: ranking eterno desanima quem chega
     depois, porque a pessoa vê que nunca vai alcançar
   - ranking não pode ser o único motivador, então a tela também mostra o
     seu progresso pessoal, que independe dos outros */

function proximaSegunda(): string {
  const d = new Date()
  const faltam = (8 - (d.getDay() || 7)) % 7 || 7
  d.setDate(d.getDate() + faltam)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function RankingPage() {
  const [lista, setLista] = useState<Colocacao[] | null>(null)
  const [apelido, setApelido] = useState<string | null>(null)
  const [rascunho, setRascunho] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [prog, setProg] = useState<UserProgress | null>(null)

  const carregar = useCallback(async () => {
    const [r, a, p] = await Promise.all([rankingDaSemana(), meuApelido(), getProgress()])
    setLista(r)
    setApelido(a)
    setProg(p)
  }, [])

  useEffect(() => {
    void sincronizar().then(() => void carregar())
  }, [carregar])

  const salvar = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setSalvando(true)
    setErro(null)
    const r = await definirApelido(rascunho, localStorage.getItem('compasso.instrumento') ?? undefined)
    setSalvando(false)
    if (!r.ok) {
      setErro(r.erro)
      return
    }
    somConquista()
    setRascunho('')
    await carregar()
  }

  const euNaLista = lista?.find((c) => c.apelido === apelido) ?? null

  return (
    <div className="min-h-screen bg-[#12100e] pt-[var(--altura-nav)] text-[#f2ede6]">
      <header className="flex items-center justify-end px-5 py-5 md:px-10">
        <span className="type-label text-[#8a8075]">entre amigos</span>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 md:px-10">
        <h1
          className="type-display leading-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginLeft: '-0.03em' }}
        >
          A semana
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[#a69c90]">
          O ranking <span className="text-[#e0a34a]">zera toda segunda</span> — assim ninguém fica
          pra trás sem chance de alcançar.
        </p>
        <p className="type-label mt-3 text-[#8a8075]">próximo reinício: {proximaSegunda()}</p>

        {/* seu progresso pessoal: independe de qualquer outra pessoa */}
        {prog && (
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-y border-[#332d27] py-6">
            <div>
              <span className="type-label block text-[#8a8075]">seu xp total</span>
              <span className="type-display text-4xl text-[#e0a34a]">{prog.xp}</span>
            </div>
            <div>
              <span className="type-label block text-[#8a8075]">dias seguidos</span>
              <span className="type-display text-4xl">{prog.streak}</span>
            </div>
            <div>
              <span className="type-label block text-[#8a8075]">lições concluídas</span>
              <span className="type-display text-4xl">{prog.completed.length}</span>
            </div>
          </div>
        )}

        {/* entrar no ranking é opcional — o site promete "sem cadastro" */}
        {!apelido ? (
          <div className="mt-10 border border-[#332d27] bg-[#1b1815] p-6 md:p-8">
            <span className="type-label text-[#e0a34a]">entrar no ranking</span>
            <h2 className="type-display mt-3 text-2xl md:text-3xl">Escolha um apelido</h2>
            <p className="mt-3 max-w-lg text-[#a69c90]">
              Só isso. Nada de e-mail nem senha — o apelido serve só pra seus amigos te
              reconhecerem aqui. Sem apelido, você continua usando o site normalmente.
            </p>
            {/* form de verdade, não div com onKeyDown: no celular é isso que
                põe o botão "ir" no teclado em vez de uma tecla de enter que
                não faz nada */}
            <form onSubmit={(e) => void salvar(e)} className="mt-6 flex flex-wrap gap-3">
              <input
                value={rascunho}
                onChange={(e) => setRascunho(e.target.value)}
                placeholder="seu apelido"
                maxLength={24}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                className="min-w-48 flex-1 border border-[#332d27] bg-[#12100e] px-4 py-4 text-lg text-[#f2ede6] outline-none focus:border-[#e0a34a]"
              />
              <button
                type="submit"
                disabled={salvando || rascunho.trim().length < 2}
                className="type-label border-2 border-[#e0a34a] bg-[#e0a34a] px-8 py-4 text-[#12100e] transition-opacity disabled:opacity-40"
              >
                {salvando ? 'salvando…' : 'entrar'}
              </button>
            </form>
            {erro && <p className="mt-3 text-[#b2543c]">{erro}</p>}
          </div>
        ) : (
          <p className="type-label mt-8 text-[#8a8075]">
            você aparece como <span className="text-[#e0a34a]">{apelido}</span>
          </p>
        )}

        {/* o ranking */}
        <div className="mt-10">
          {lista === null ? (
            <p className="type-label text-[#8a8075]">carregando…</p>
          ) : lista.length === 0 ? (
            <div className="border border-[#332d27] p-6">
              <p className="text-lg text-[#a69c90]">
                Ninguém pontuou nesta semana ainda. Faça uma lição e você aparece aqui —{' '}
                <span className="text-[#e0a34a]">em primeiro</span>.
              </p>
            </div>
          ) : (
            <div>
              {lista.map((c) => {
                const souEu = c.apelido === apelido
                return (
                  <div
                    key={c.apelido}
                    className={`grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-t border-[#332d27] py-5 last:border-b ${
                      souEu ? 'bg-[#e0a34a]/10' : ''
                    }`}
                  >
                    <span
                      className={`type-display text-2xl ${
                        c.posicao === 1 ? 'text-[#e0a34a]' : 'text-[#8a8075]'
                      }`}
                    >
                      {c.posicao}
                    </span>
                    <span className={`text-lg ${souEu ? 'text-[#e0a34a]' : 'text-[#f2ede6]'}`}>
                      {c.apelido}
                      {souEu && <span className="type-label ml-3 text-[#8a8075]">você</span>}
                    </span>
                    <span className="type-display text-2xl">{c.xp}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* mesmo em último, a tela reconhece o esforço — a pesquisa é clara
            que destacar melhora pessoal mantém motivado quem não é o topo */}
        {euNaLista && euNaLista.posicao > 1 && (
          <p className="mt-8 border-l-2 border-[#e0a34a] pl-5 text-lg text-[#a69c90]">
            Você fez <span className="text-[#f2ede6]">{euNaLista.xp} xp</span> esta semana. Faltam{' '}
            <span className="text-[#e0a34a]">
              {(lista![euNaLista.posicao - 2]?.xp ?? euNaLista.xp) - euNaLista.xp + 1} xp
            </span>{' '}
            pra passar quem está na sua frente.
          </p>
        )}

        <p className="type-label mt-12 text-[#8a8075]">
          só apelido e xp ficam visíveis · seu progresso e o que você errou são privados
        </p>
      </main>
    </div>
  )
}

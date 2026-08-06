# Banco do Compasso

O esquema mora em `migrations/`, em ordem de data. É a cópia versionada do que
está no projeto `vyfdzxuwuldaqmgqqkfu` no Supabase — se o projeto lá se perder,
dá pra reconstruir tudo daqui.

## Como está desenhado

Três tabelas, e cada número tem **um dono só**:

| Onde | O quê | Quem escreve |
|---|---|---|
| `perfis` | apelido opcional, instrumento | a pessoa, só a própria linha |
| `progresso.xp` | XP **total** | o cliente, absoluto (`enviarProgresso`) |
| `xp_semanal.xp` | XP **da semana** | só `somar_xp()`, somando |

Essa separação não é detalhe: quando as duas coisas moravam na mesma coluna, o
total inflava sozinho a cada resposta (ver
`20260806002011_somar_xp_nao_mexe_no_total.sql`).

## O que protege os dados

- **RLS em todas as tabelas.** Leitura e escrita são sempre `auth.uid() = <id>`.
  Ninguém lista a tabela dos outros — nem o id de quem nunca escolheu apelido.
- **O ranking é a única exceção**, e passa por `ranking_da_semana()`, que é
  `security definer` e devolve exatamente três colunas: apelido, xp, posição.
- **`somar_xp()` nunca aceita id do cliente** — usa `auth.uid()` e recusa
  quantidade fora de 1–1000.
- **Nada é executável por `anon`.** No Postgres, `EXECUTE` nasce concedido a
  `PUBLIC` e `anon` herda dali, então a revogação é de `PUBLIC`.

## Configuração que não está aqui

Uma coisa vive só no painel e precisa continuar ligada:
**Authentication → Providers → Anonymous Sign-Ins**. Sem ela o login anônimo
volta `422 anonymous_provider_disabled` e o site cai pro modo só-localStorage
(funciona, mas não sincroniza nem entra no ranking).

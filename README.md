<div align="center">

# 🎸 Compasso

**Teoria musical que vira som e vira gesto.**

[![Acessar o site](https://img.shields.io/badge/acessar-compasso--gamma.vercel.app-111?style=for-the-badge&logo=vercel)](https://compasso-gamma.vercel.app)

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tone.js](https://img.shields.io/badge/Tone.js-000?style=flat-square)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)

<img src="public/assets/img/quarto-desktop-1440.webp" alt="O quarto, menu principal do Compasso" width="820">

</div>

---

## O que é

Um site para aprender música tocando, não decorando. Cada conceito de teoria aparece
no instrumento e sai no alto-falante na hora: você clica numa escala e ela acende no
braço do violão e toca.

O menu é um **quarto de músico**. Em vez de uma barra com oito palavras, cada
ferramenta é um objeto do quarto: passa o mouse na bateria, ela acende, clica e você
cai no groove. Memória espacial ganha de lista.

## Ferramentas

| | Ferramenta | O que faz |
|---|---|---|
| 🧭 | **Trilha** | Lições curtas em duas trilhas paralelas: a do seu instrumento e a de teoria. Toda lição ensina antes de perguntar. |
| 🎸 | **Braço** | Escalas, acordes e intervalos desenhados no braço e tocados em seguida. |
| 🥁 | **Groove** | Sequenciador de bateria para montar e ouvir ritmos. |
| 👂 | **Ouvido** | Treino de percepção: notas, intervalos e acordes, por nível de dificuldade. |
| 🧩 | **Desmontador** | Desmonta a harmonia de músicas conhecidas grau por grau (Legião Urbana, Radiohead, Nirvana, The Cure, Linkin Park). |
| 🎚️ | **Afinador** | Afinador pelo microfone, com ponteiro em cents. |
| 🏆 | **Ranking** | XP semanal e ranking entre quem estuda. |

## Como foi construído

- **Motor de teoria próprio** em `src/theory` (notas, intervalos, escalas, acordes,
  campo harmônico e braço), coberto por testes.
- **Áudio com Tone.js.** Instrumento de corda é dedilhado com milissegundos de atraso
  entre as cordas, que é o que faz soar tocado em vez de sintetizado.
- **Animação com GSAP e Lenis** para o quarto e as transições.
- **Supabase** guarda perfil, progresso e XP. Todas as tabelas têm RLS; o ranking passa
  por uma função `security definer` que devolve só apelido, XP e posição. O esquema
  versionado está em [`supabase/`](./supabase).
- **Links profundos que não quebram:** a trilha abre as ferramentas já configuradas
  (`/braco?modo=escala&tonica=7`), e parâmetro inválido é ignorado.

## Rodando localmente

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm test         # testes (Vitest)
npm run build    # build de produção
```

## Estrutura

```
src/
├── app/        páginas, o quarto e a trilha
├── audio/      instrumentos e síntese (Tone.js)
├── theory/     motor de teoria musical + testes
├── content/    lições, músicas e objetos do quarto
├── tools/      braço, groove, teclado e ouvido
├── backend/    cliente Supabase e sincronização
└── motion/     animações
supabase/       migrações do banco
```

## Sobre direitos

Nenhuma letra, melodia ou gravação é reproduzida. As músicas aparecem só como
referência (título, artista e a sequência de acordes).

---

<div align="center">

Feito por [Augusto Donateli](https://github.com/AugustoDonateli) · Cachoeiro de Itapemirim, ES

</div>

export type Theme = 'dark' | 'light'

const KEY = 'compasso.theme'

/** O script inline no index.html já aplicou o tema antes do primeiro paint;
 *  aqui é só leitura/troca em runtime. */
export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // sem storage (modo privado etc.) — o tema vale só pra sessão
  }
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { HomePage } from './app/HomePage'
import { BracoPage } from './app/pages/BracoPage'
import { GroovePage } from './app/pages/GroovePage'
import { OuvidoPage } from './app/pages/OuvidoPage'
import { TrilhaPage } from './app/pages/TrilhaPage'
import { AfinadorPage } from './app/pages/AfinadorPage'
import { attachGlobalUnlock } from './audio/engine'
import { startFaviconMetronome } from './design/favicon'
import { useLenisGsap } from './motion/useLenisGsap'

/* Casca do Compasso: tema, áudio, favicon, rolagem e rotas.
   Regra de futuro: cada ferramenta é uma rota — groove machine,
   desmontador e ouvido entram aqui como uma linha cada. */

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  useLenisGsap()

  // primeiro gesto destrava o áudio; o favicon pulsa no andamento
  useEffect(() => {
    const detachUnlock = attachGlobalUnlock()
    const stopFavicon = startFaviconMetronome()
    return () => {
      detachUnlock()
      stopFavicon()
    }
  }, [])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/braco" element={<BracoPage />} />
        <Route path="/groove" element={<GroovePage />} />
        <Route path="/ouvido" element={<OuvidoPage />} />
        <Route path="/trilha" element={<TrilhaPage />} />
        <Route path="/afinador" element={<AfinadorPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

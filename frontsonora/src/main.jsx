import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './index.css'
import Meusconvites from './pages/Meusconvites'
import Home from './pages/Home'
import Acesso from './pages/Acesso'
import Cadastro from './pages/Cadastro'
import Meuperfil from './pages/Meuperfil'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/meusconvites" element={<Meusconvites/>} />
        <Route path="/acesso" element={<Acesso/>} />
        <Route path="/cadastro" element={<Cadastro/>} />
        <Route path="/meuperfil" element={<Meuperfil/>} />
      </Routes>
    </Router>
  </StrictMode>,
)

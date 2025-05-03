import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './index.css'
import Meusconvites from './pages/perfil/Meusconvites'
import Home from './pages/Home'
import Acesso from './pages/login/Acesso'
import Cadastro from './pages/login/Cadastro'
import EsqueciSenha from './pages/login/EsqueciSenha';
import Meuperfil from './pages/perfil/Meuperfil.jsx'
import Notificacao from './pages/perfil/Notificacao'
import SobreNos from './pages/genericos/SobreNos'
import Termos from './pages/genericos/Termos'
import SelectorRole from "./pages/select-roles/Selector-Role.jsx";
import DetalhesEvento from "./pages/detalhes-evento/DetalhesEvento.jsx";
import Eventos from "./components/Eventos/eventos.jsx";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/meusconvites" element={<Meusconvites/>} />
        <Route path="/acesso" element={<Acesso/>} />
        <Route path="/cadastro" element={<Cadastro/>} />
        <Route path="/perfil" element={<Meuperfil/>} />
        <Route path="/roleSelector" element={<SelectorRole/>} />
        <Route path="/detalhes/:id" element={<DetalhesEvento/>} />
        <Route path="/esquecisenha" element={<EsqueciSenha/>} />
        <Route path="/notificacao" element={<Notificacao/>} />
        <Route path="/sobrenos" element={<SobreNos/>} />
        <Route path="/termos" element={<Termos/>} />
        
      </Routes>
    </Router>
  </StrictMode>,
)

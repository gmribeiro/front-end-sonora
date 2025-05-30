import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import Meusconvites from './pages/perfil/Meusconvites';
import Home from './pages/Home';
import Acesso from './pages/login/Acesso';
import Cadastro from './pages/login/Cadastro';
import EsqueciSenha from './pages/login/EsqueciSenha';
import Meuperfil from './pages/perfil/Meuperfil';
import Notificacao from './pages/perfil/Notificacao';
import SobreNos from './pages/genericos/SobreNos';
import Termos from './pages/genericos/Termos';
import ConfMusico from './pages/perfil/ConfMusico';
import ConfUsuario from './pages/perfil/ConfUsuario';
import Avaliacoes from "./components/Avaliacoes/Avaliacoes.jsx";
import Artista from "./pages/artistas/Artista.jsx";
import DetalhesEvento from "./pages/detalhes-evento/DetalhesEvento.jsx";
import EventosBuscaResultados from './components/EventosBuscaResultado/EventosBuscaResultado.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meusconvites" element={<Meusconvites />} />
        <Route path="/acesso" element={<Acesso />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/perfil" element={<Meuperfil />} />
        <Route path="/avaliacoes" element={<Avaliacoes/>} />
        <Route path="/artistas" element={<Artista/>} />
        <Route path="/detalhes/:id" element={<DetalhesEvento/>} />
        <Route path="/esquecisenha" element={<EsqueciSenha />} />
        <Route path="/notificacao" element={<Notificacao />} />
        <Route path="/sobrenos" element={<SobreNos />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/configuracoes-usuario" element={<ConfUsuario />} />
        <Route path="/configuracoes-musico" element={<ConfMusico />} />
        <Route path="/eventos/resultado-busca" element={<EventosBuscaResultados />} />
      </Routes>
    </Router>
  </StrictMode>,
);
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
import EmailRecoveryForm from "./pages/login/EmailRecoveryForm.jsx";
import App from './App.jsx'


let startApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render( <App />);
}

if (!window.cordova) {
    startApp();
} else {
    document.addEventListener('deviceready', startApp, false);
}

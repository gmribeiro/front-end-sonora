import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HeaderPerfil.css';

const HeaderPerfil = () => {
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/acesso'); // Redireciona para a página de acesso
  };

  const toggleNotificacoes = () => {
    setMostrarNotificacoes(!mostrarNotificacoes);
  };

  return (
    <header className="header-container">
      {/* Topo com logo */}
      <div className="cima">
        <Link className="link logo-link" to="/">
          <img src="/images/logosemfundo.png" alt="Logo" className="logo" />
        </Link>
      </div>

      {/* Botões no topo */}
      <div className="buttons-top">
        <button className="notification-button" onClick={toggleNotificacoes}>🔔</button>
        <button className="settings-button">⚙️</button>
        <button className="logout-button" onClick={handleLogout}>Sair da conta</button>
      </div>

      {/* Perfil */}
      <div className="profile-section">
        <div className="profile-image-container">
          <div className="profile-circle"></div>
        </div>
        <div className="profile-info">
          <h2 className="username">Nome de Usuário</h2>
          <span className="edit-name">✏️ Editar nome</span>
        </div>
      </div>

      {/* Telinha de Notificações */}
      {mostrarNotificacoes && (
        <div className="notificacoes-popup">
          <button className="fechar-notificacao" onClick={toggleNotificacoes}>X</button>
          <h3>Notificações</h3>
          <ul>
            <li>Evento novo perto de você!</li>
            <li>Seu artista favorito postou um show!</li>
            <li>Atualização no Sonora! 🌟</li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default HeaderPerfil;

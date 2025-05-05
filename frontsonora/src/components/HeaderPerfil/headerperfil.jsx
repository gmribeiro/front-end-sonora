import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HeaderPerfil.css';
import ProfileImage from './ProfileImage'; // componente novo
import { GoGear } from "react-icons/go";
import { MdNotifications } from "react-icons/md";

const HeaderPerfil = () => {
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/acesso');
  };

  const toggleNotificacoes = () => {
    setMostrarNotificacoes(!mostrarNotificacoes);
  };

  return (
    <header className="header-perfil-container">
      {/* Logo */}
      <div className="logo-wrapper">
        <Link to="/">
          <img src="/images/logosemfundo.png" alt="Logo Sonora" className="logo-img" />
        </Link>
      </div>

      {/* Botões de ação */}
      <div className="action-buttons">
        <button onClick={toggleNotificacoes} className="icon-button"><MdNotifications /></button>
        <Link to="/configuracoes-usuario" className="icon-button"><GoGear /></Link>
        <button onClick={handleLogout} className="logout-button">Sair da conta</button>
      </div>

      {/* Perfil */}
      <div className="profile-wrapper">
        <ProfileImage />
        <div className="profile-info">
          <h2 className="username">Nome de Usuário</h2>
        </div>
      </div>

      {/* Notificações */}
      {mostrarNotificacoes && (
        <div className="notificacoes-popup">
          <button className="fechar-notificacao" onClick={toggleNotificacoes}>X</button>
          <Link to="/perfil/notificacao">
            <h3>Notificações</h3>
          </Link>
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

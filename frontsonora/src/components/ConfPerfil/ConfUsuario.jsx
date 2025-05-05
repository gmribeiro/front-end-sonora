import React from 'react';
import './ConfPerfil.css';
import { Link, useNavigate } from 'react-router-dom';

const ConfUsuario = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/acesso');
  };

  return (
    <div className="tela-config">
      <div className="conf-usuario-header">
        <Link to="/" className="logo-link">
          <img src="/images/logosemfundo.png" alt="Logo" className="logo-small" />
        </Link>
        <h2 className="conf-title">Configurações da conta</h2>
        <div className="header-buttons">
          <button className="button-secondary" onClick={handleLogout}>Sair da conta</button>
          <button className="button-secondary">Alterar senha</button>
        </div>
      </div>

      {/* BOTÃO DE VOLTAR */}
      <div className="voltar-container">
      <Link to="/meuperfil" className="voltar-button">
      ← Voltar
        </Link>
      </div>

      <div className="conf-usuario-container">
        <div className="conf-usuario-section">
          <h3>Foto do perfil</h3>
          <div className="item">
            <div className="profile-placeholder">ALTERAR</div>
            <button className="button-primary">Alterar</button>
          </div>
        </div>

        <div className="conf-usuario-section">
          <h3>Nome de usuário</h3>
          <div className="item">
            <span>MariaSpinula</span>
            <button className="button-primary">Editar</button>
          </div>
        </div>

        <div className="conf-usuario-section">
          <h3>Email</h3>
          <div className="item">
            <span>MariaSpinula@gmail.com</span>
          </div>
        </div>

        <div className="conf-usuario-section">
          <h3>Telefone</h3>
          <div className="item">
            <span>19 99999-9999</span>
          </div>
        </div>

        <div className="conf-usuario-section">
          <h3>Idioma</h3>
          <div className="item">
            <span>Português</span>
            <button className="button-primary">Editar</button>
          </div>
        </div>

        <div className="conf-usuario-section">
          <h3>Notificações</h3>
          <div className="item">
            <span>Sim</span>
            <button className="button-primary">Editar</button>
          </div>
        </div>

        <div className="conf-usuario-section">
          <h3>Interação</h3>
          <div className="item">
            <span>Não</span>
            <button className="button-primary">Editar</button>
          </div>
        </div>

        <div className="conf-usuario-section">
          <h3>Privacidade</h3>
          <div className="item">
            <span>Perfil público</span>
            <button className="button-primary">Editar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfUsuario;

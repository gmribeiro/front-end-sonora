import React from 'react';
import './ConfPerfil.css';
import { Link } from 'react-router-dom';

const ConfMusico = () => {
  return (
    <div className="conf-usuario-container">
      <div className="conf-usuario-header">
        <Link to="/" className="logo-link">
          {/* Sua logo aqui */}
          <img src="/images/logosemfundo.png" alt="Logo" className="logo-small" />
        </Link>
        <h2>Configurações da conta</h2>
        <div className="header-buttons">
          <button className="button-secondary">Sair da conta</button>
          <button className="button-secondary">Alterar senha</button>
        </div>
      </div>

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
          <span>NomeDoMusico</span>
          <button className="button-primary">Editar</button>
        </div>
      </div>

      <div className="conf-usuario-section">
        <h3>Email</h3>
        <div className="item">
          <span>emailDoMusico@exemplo.com</span>
          {/* Sem botão de editar conforme a estrutura anterior */}
        </div>
      </div>

      <div className="conf-usuario-section">
        <h3>Telefone</h3>
        <div className="item">
          <span>(XX) XXXXX-XXXX</span>
          {/* Sem botão de editar conforme a estrutura anterior */}
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
  );
};

export default ConfMusico;
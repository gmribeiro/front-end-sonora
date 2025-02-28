import React from "react";
import "./HeaderPerfil.css";
import { Link } from "react-router-dom";

const HeaderPerfil = () => {
  return (
    <header className="header-container">
      {/* Logo */}
      <div className="cima">
        <Link className="link logo-link" to="/">
          <img src="../../public/logosemfundo.png" alt="Logo" className="logo" />
        </Link>
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
      
      {/* Botão de Logout */}
      <button className="logout-button">
        Sair da conta
      </button>
    </header>
  );
};

export default HeaderPerfil;
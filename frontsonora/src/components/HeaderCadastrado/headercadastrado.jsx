import React from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './headercadastrado.css';

function HeaderCadastrado() {
  return (
    <header className="header">
      <div className="header-left">
        <img 
          src="../images/logosemfundo.png" 
          alt="Logo" 
          className="logo"
          style={{ maxHeight: '60px' }}
        />
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar eventos, shows, teatros"
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <div className="divider"></div>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/meusconvites" className="nav-link">Meus Convites</Link>
        </nav>
        <Link to="/meuperfil" className="perfil-link">
          <FaUserCircle className="perfil-icon" />
          <span className="perfil-nome">MF_SPINULA</span>
        </Link>
        <Link to="/notificacao" className="perfil-link">
        <div className="icon-button">
          <FaBell className="search-icon" />
        </div>
        </Link>
      </div>
    </header>
  );
}

export default HeaderCadastrado;

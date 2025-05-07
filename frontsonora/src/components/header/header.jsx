import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-left">
      <Link to="/" className="logo">
        <img 
          src="../images/logosemfundo.png" 
          alt="Logo" 
          className="logo" 
          style={{ maxHeight: '60px' }}
        />
      </Link>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar eventos, shows, teatros, cursos"
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
        <Link to="/acesso" className="login-button">Entrar</Link>
      </div>
    </header>
  );
}

export default Header;
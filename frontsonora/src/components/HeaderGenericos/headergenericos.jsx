import React from 'react';
import { Link } from 'react-router-dom';
import './headergenericos.css';

function HeaderGenericos() {
  return (
    <header className="header-generic">
      <div className="header-left">
        <Link to="/" className="logo-link">
          <img 
            src="../images/logosemfundo.png" 
            alt="Logo" 
            className="logo" 
            style={{ maxHeight: '60px' }}
          />
        </Link>
      </div>

      <div className="header-right">
        <div className="divider"></div>
        <nav className="nav">
          <Link to="/" className="nav-link">
            <span>Home</span>
          </Link>
          <Link to="/sobrenos" className="nav-link">
            <span>Sobre Nós</span>
          </Link>
          <Link to="/termos" className="nav-link">
            <span>Termos de Uso</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default HeaderGenericos;
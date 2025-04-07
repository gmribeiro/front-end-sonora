import './headergenericos.css';
import { Link } from 'react-router-dom';
import React from 'react';

function HeaderGenericos() {
  return (
    <header>
      <div className="cima">
        <Link className="logo-link" to="/">
          <img src="/logosemfundo.png" alt="Logo" className="logo" />
        </Link>

        <nav className="links">
          <Link className="link" to="/">
            <span>Home</span>
            <div className="underline"></div>
          </Link>
          <Link className="link" to="/sobrenos">
            <span>Sobre Nós</span>
            <div className="underline"></div>
          </Link>
          <Link className="link" to="/termos">
            <span>Termos de Uso</span>
            <div className="underline"></div>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default HeaderGenericos;

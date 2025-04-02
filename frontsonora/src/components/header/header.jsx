import './header.css';
import { Link } from 'react-router-dom';
import React from 'react';

function Header() {
  return (
      <header>
        <div className='cima'>
          <Link className="link logo-link" to="/">
            <img src="/logosemfundo.png" alt="Logo" className="logo"/>
          </Link>

          <input type="search" name="search" className='search' placeholder='Encontre seu estilo favorito'/>

          <nav className='links'>
            <Link className='link' to="/">
              <span>HOME</span>
              <div className='underline'></div>
            </Link>
            <Link className='link' to="/MeusConvites">
              <span>MEUS CONVITES</span>
              <div className='underline'></div>
            </Link>
            <Link id='btn-entrar' to="/Acesso">
              <span>ENTRAR</span>
              <div className='underline'></div>
            </Link>
          </nav>
        </div>
      </header>
  );
}

export default Header;

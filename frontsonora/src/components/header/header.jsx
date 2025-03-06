import './header.css';
import { Link } from 'react-router-dom';
import React from 'react'

function Header() {
  return (
      <header>
        <div className='cima'>
          <Link className="link logo-link" to="/">
            <img src="/logosemfundo.png" alt="Logo" className="logo"/>
          </Link>

          <input type="search" name="search" className='search' placeholder='Encontre seu estilo favorito'/>

          <nav className='links'>
            <Link className='link' to="/">HOME</Link>
            <Link className='link' to="/MeusConvites">MEUS CONVITES</Link>
            <Link className='link' id='btn-cadastro' to="/Acesso">ENTRAR</Link>
          </nav>

        </div>
      </header>
  )
}

export default Header;

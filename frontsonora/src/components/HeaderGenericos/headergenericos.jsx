import './headergenericos.css'
import { Link } from 'react-router-dom';
import React from 'react';

function HeaderGenericos() {
  return (
      <header>
        <div className='cima'>
          <Link className="link logo-link" to="/">
            <img src="/logosemfundo.png" alt="Logo" className="logo"/>
          </Link>

          <nav className='links'>
            <Link className='link' to="/">
              <span>VOLTAR PARA A HOME</span>
              <div className='underline'></div>
            </Link>
          </nav>
        </div>
      </header>
  );
}

export default HeaderGenericos;

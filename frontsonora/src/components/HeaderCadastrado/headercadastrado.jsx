import './headercadastrado.css';
import { Link } from 'react-router-dom';
import React from 'react';
import { CgProfile } from "react-icons/cg";
import { MdNotifications } from "react-icons/md";

function HeaderCadastrado() {
  return (
      <header>
        <div className='cima'>
          <Link className="link logo-link" to="/">
            <img src="../images/logosemfundo.png" alt="Logo" className="logo"/>
          </Link>

          <input type="search" name="search" className='search' placeholder='Encontre seu estilo favorito'/>

          <nav className='links'>
            <Link className='link' to="/">HOME</Link>
            <Link className='link' to="/MeusConvites">MEUS CONVITES</Link>
            <div className="perfil">
            <div className="btn-notifications"><Link className='link' to="/notificacao"><MdNotifications size={28} /></Link></div>
              <Link className='link perfil-item' to="/Meuperfil">
                <CgProfile className="icone-perfil" />
                <span className='nome-perfil'>MF_SPINULA</span>
              </Link> 
            </div>
          </nav>
        </div>
      </header>
  );
}

export default HeaderCadastrado;

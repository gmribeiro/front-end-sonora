import './header.css';
import { Link } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import React from 'react'

function Header() {
  return (
      <header>
        <div className='cima'>
          <img src="../../public/logosemfundo.png" alt="" />
          <input type="search" name="search" className='search' placeholder='Encontre seu estilo favorito'/>

          <nav className='links'>
            <Link className='link' to="/">Home</Link>
            <Link className='link' to="/Meusconvites">Meus Convites</Link>
            <Link className='link' to="/Localizacao">Localização</Link>
            <Link className='link' to="/Cadastro">Cadastre-se</Link>
          </nav>

          <div className='div-cadastro'>
            <CgProfile className='icone'/>
          </div>

        </div>
      </header>
  )
}

export default Header
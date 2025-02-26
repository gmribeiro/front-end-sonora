import './header.css';
import { Link } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { IoLocationSharp } from "react-icons/io5";
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
            <div className='div-localizacao'>
              <Link className='link' to="/Localizacao">Localização</Link>
              <IoLocationSharp className='local'/>
            </div>
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
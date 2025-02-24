import './header.css'
import { Link } from 'react-router-dom';
import React from 'react'

function Header() {
  return (
      <header>
        <div className='cima'>
          <img src="../../public/logosemfundo.png" alt="" />
          <input type="search" name="search" className='search' placeholder='Encontre seu estilo favorito'/>

          <nav className='links'>
            <Link className='link' to="/">Home</Link>
            <Link className='link' to="/Eventos">Eventos</Link>
          </nav>
        </div>
      </header>
  )
}

export default Header
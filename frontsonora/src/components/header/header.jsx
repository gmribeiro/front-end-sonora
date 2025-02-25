import './header.css'

import React from 'react'

function Header() {
  return (
      <header>
        <div className='cima'>
          <img src="../../public/logosemfundo.png" alt="" />
          <input type="search" name="search" className='search' placeholder='Encontre seu estilo favorito'/>
        
        
        </div>
      </header>
  )
}

export default Header
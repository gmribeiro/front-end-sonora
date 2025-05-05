import HeaderCadastrado from '../../components/HeaderCadastrado/headercadastrado'
import Footer from '../../components/Footer/footer'
import '../css/global.css'
import React from 'react'
import useTitle from '../../hooks/useTitle.js';
import Eventos from '../../components/Eventos/eventos.jsx';

function Meusconvites() {
  useTitle('Meus Convites - Sonora');
  return (
    <>
        <HeaderCadastrado/>
      
        <Footer/>
    </>
  )
}

export default Meusconvites

import Header from '../../components/Header/header.jsx';
import Footer from '../../components/Footer/footer.jsx';
import '../css/global.css';
import React from 'react';
import Notificacao from '../../components/Notificacao/notificacao.jsx';
import useTitle from '../../hooks/useTitle.js';

function Meusconvites() {
  useTitle('Notificações - Sonora');
  return (
    <>
        <Header/>
        <Notificacao/>
    </>
  )
}

export default Meusconvites;

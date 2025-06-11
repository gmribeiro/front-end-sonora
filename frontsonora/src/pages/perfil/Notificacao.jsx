
import '../css/global.css';
import React from 'react';
import Notificacao from '../../components/Notificacao/notificacao.jsx';
import useTitle from '../../hooks/useTitle.js';
import Header from '../../components/header/header.jsx';

function Meusconvites() {
  useTitle('Notificações - Sonora');
  return (
    <>
        <Header />
        <Notificacao/>
    </>
  )
}

export default Meusconvites;

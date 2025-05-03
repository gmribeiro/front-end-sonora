import Header from '../components/Header/header';
import Footer from '../components/Footer/footer';
import Eventos from '../components/Eventos/eventos';
import Carrossel from '../components/Carrossel/carrossel.jsx';
import './css/global.css';
import React from 'react';
import useTitle from '../hooks/useTitle';

function Home() {
  useTitle('Início - Sonora');

  return (
    <>
      <Header />
      <Carrossel />
      <Eventos />
      <Footer />
    </>
  );
}

export default Home;


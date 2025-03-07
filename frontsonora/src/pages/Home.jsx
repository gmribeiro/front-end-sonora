import Header from '../components/Header/header'
import Footer from '../components/Footer/footer'
import Eventos from '../components/Eventos/eventos'
import Carrossel from '../components/Carrossel/carrossel.jsx'
import './css/global.css'
import React from 'react'

function Home() {
  return (
    <>
        <Header/>
        <Carrossel/>
        <Eventos/>
        <Footer/>
    </>
  )
}

export default Home

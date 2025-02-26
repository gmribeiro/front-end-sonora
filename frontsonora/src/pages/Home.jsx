import Header from '../components/Header/header'
import Footer from '../components/Footer/footer'
import Eventos from '../components/Eventos/eventos'
import './css/Home.css'
import React from 'react'

function Home() {
  return (
    <>
        <Header/>
        <Eventos/>
        <Footer/>
    </>
  )
}

export default Home

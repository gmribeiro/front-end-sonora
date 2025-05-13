import Header from '../components/Header/header';
import Footer from '../components/Footer/footer';
import Eventos from '../components/Eventos/eventos';
import Carrossel from '../components/Carrossel/carrossel.jsx';
import InfoEvento from '../components/InfoEvento/InfoEvento';
import './css/global.css';
import React, { useState } from 'react';
import useTitle from '../hooks/useTitle';
import { Routes, Route, useNavigate } from 'react-router-dom';

function Home() {
  useTitle('Início - Sonora');
  const [generoSelecionado, setGeneroSelecionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const eventos = [
    { id: 1, titulo: "Indaiatuba Pop Festival", local: "Indaiatuba", hora: "19:00", imagem: "../images/eventopop1.png", genero: "POP" },
    { id: 2, titulo: "Hit Parade Live", local: "Campinas", hora: "20:30", imagem: "../images/eventopop2.png", genero: "POP" },
    { id: 3, titulo: "Top 40 Experience", local: "São Paulo", hora: "22:00", imagem: "../images/eventopop3.png", genero: "POP" },
    { id: 4, titulo: "Sertanejo Universitário", local: "Campinas", hora: "21:00", imagem: "../images/sertanejo1.png", genero: "Sertanejo" },
    { id: 5, titulo: "Festa do Peão", local: "Barretos", hora: "18:00", imagem: "../images/sertanejo2.png", genero: "Sertanejo" },
    { id: 6, titulo: "Arraiá Country", local: "Ribeirão Preto", hora: "16:00", imagem: "../images/sertanejo3.png", genero: "Sertanejo" },
    { id: 7, titulo: "Festival Indie", local: "Jundiaí", hora: "17:00", imagem: "../images/indie1.png", genero: "Indie" },
    { id: 8, titulo: "Underground Sounds", local: "São Paulo", hora: "23:30", imagem: "../images/indie2.png", genero: "Indie" },
    { id: 9, titulo: "Alternative Night", local: "Campinas", hora: "20:00", imagem: "../images/indie3.png", genero: "Indie" },
    { id: 10, titulo: "Boom Bap Fest", local: "Campinas", hora: "20:00", imagem: "../images/rock1.png", genero: "Rock'n roll" },
    { id: 11, titulo: "Show Rock na Praça", local: "Campinas", hora: "14:30", imagem: "../images/rock2.png", genero: "Rock'n roll" },
    { id: 12, titulo: "Heavy Metal Night", local: "São Paulo", hora: "23:00", imagem: "../images/rock3.png", genero: "Rock'n roll" },
    { id: 13, titulo: "MPB ao Vivo", local: "Indaiatuba", hora: "18:30", imagem: "../images/mpb1.png", genero: "MPB" },
    { id: 14, titulo: "Noite de Samba e Choro", local: "São Paulo", hora: "19:30", imagem: "../images/mpb2.png", genero: "MPB" },
    { id: 15, titulo: "Bossa Nova Jazz", local: "Rio de Janeiro", hora: "21:00", imagem: "../images/mpb3.png", genero: "MPB" },
    { id: 16, titulo: "Circo Musical", local: "São Paulo", hora: "15:00", imagem: "../images/infantil1.png", genero: "Infantil" },
    { id: 17, titulo: "Show da Galinha Pintadinha", local: "Campinas", hora: "16:30", imagem: "../images/infantil2.png", genero: "Infantil" },
    { id: 18, titulo: "Festival Pequenos Artistas", local: "Indaiatuba", hora: "10:00", imagem: "../images/infantil3.png", genero: "Infantil" },
    { id: 19, titulo: "Sunset Eletrônico", local: "Indaiatuba", hora: "12:00", imagem: "../images/eletronica1.png", genero: "Eletrônica" },
    { id: 20, titulo: "Techno Waves", local: "Itupeva", hora: "23:00", imagem: "../images/eletronica2.png", genero: "Eletrônica" },
    { id: 21, titulo: "DJ Festival", local: "São Paulo", hora: "22:00", imagem: "../images/eletronica3.png", genero: "Eletrônica" },
    { id: 22, titulo: "Baile do Chapéu", local: "Osasco", hora: "20:00", imagem: "../images/funk1.png", genero: "Funk" },
    { id: 23, titulo: "Funk na Laje", local: "São Paulo", hora: "21:30", imagem: "../images/funk2.png", genero: "Funk" },
    { id: 24, titulo: "Bailão do Verão", local: "Santos", hora: "17:00", imagem: "../images/funk3.png", genero: "Funk" },
    { id: 25, titulo: "Sunset Reggae", local: "Ubatuba", hora: "16:00", imagem: "../images/reggae1.jpg", genero: "Reggae" },
    { id: 26, titulo: "Jam Session Reggae", local: "São Paulo", hora: "19:00", imagem: "../images/reggae2.jpg", genero: "Reggae" },
    { id: 27, titulo: "Dia da Jamaica", local: "Rio de Janeiro", hora: "14:00", imagem: "../images/reggae3.jpg", genero: "Reggae" },
    { id: 28, titulo: "Concerto de Outono", local: "São Paulo", hora: "20:00", imagem: "../images/classica1.png", genero: "Clássica" },
    { id: 29, titulo: "Noite de Ópera", local: "Campinas", hora: "19:30", imagem: "../images/classica2.png", genero: "Clássica" },
    { id: 30, titulo: "Orquestra Sinfônica", local: "Rio de Janeiro", hora: "18:00", imagem: "../images/classica3.png", genero: "Clássica" }
  ];

  const eventosFiltrados = generoSelecionado 
    ? eventos.filter(evento => evento.genero === generoSelecionado)
    : eventos;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [generoSelecionado]);

  return (
    <main className='body'>
      <Header />
      <Carrossel onGeneroSelecionado={setGeneroSelecionado} />
      
      <Routes>
        <Route path="/" element={
          <Eventos 
            eventosFiltrados={eventosFiltrados} 
            eventosCompletos={eventos}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        } />
        <Route path="/infoevento/:id" element={
          <InfoEvento 
            eventos={eventos} 
            onVoltar={() => navigate('/')} 
          />
        } />
      </Routes>
      
      <Footer />
    </main>
  );
}

export default Home;
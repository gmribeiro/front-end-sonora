
import Carrossel from '../components/Carrossel/carrossel.jsx';

import './css/global.css';
import { useState, useEffect } from 'react';
import useTitle from '../hooks/useTitle';
import { Routes, Route, useNavigate } from 'react-router-dom';
import api from '../api/index.js';
import Header from '../components/header/header.jsx';

import Eventos from '../components/Eventos/eventos.jsx';
import InfoEvento from '../components/InfoEvento/InfoEvento.jsx';
import Footer from '../components/Footer/footer.jsx';


function Home() {
  useTitle('Início - Sonora');
  const [generoSelecionado, setGeneroSelecionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventosCompletos, setEventosCompletos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await api.get('/eventos');
        const eventosRaw = response.data;

        const eventosMapeados = eventosRaw.map(evento => {
          const dataHoraCompleta = evento.dataHora;
          const hora = dataHoraCompleta ? dataHoraCompleta.split(' ')[1].substring(0, 5) : 'N/A';

          return {
            id: evento.idEvento,
            titulo: evento.nomeEvento,
            local: evento.localEvento ? evento.localEvento.local : 'Local não informado',
            hora: hora,
            imagem: evento.foto ? `eventos/${evento.idEvento}/image` : '/images/evento_padrao.png',
            genero: evento.generoMusical ? evento.generoMusical.nomeGenero : 'Não especificado'
          };
        });
        setEventosCompletos(eventosMapeados);
        setEventosFiltrados(eventosMapeados);

      } catch (error) {
        console.error('Erro ao carregar eventos do backend:', error);
      }
    };

    fetchEventos();
  }, []);

  const handleNovoEventoCadastrado = (novoEvento) => {
    setEventosCompletos(prevEventos => [novoEvento, ...prevEventos]);
    setEventosFiltrados(prevEventos => [novoEvento, ...prevEventos]);
    setCurrentPage(1);
  };

  const handleGeneroSelecionado = (genero) => {
    setGeneroSelecionado(genero);
  };

  useEffect(() => {
    setCurrentPage(1);
    if (generoSelecionado) {
      setEventosFiltrados(eventosCompletos.filter(evento => evento.genero === generoSelecionado));
    } else {
      setEventosFiltrados(eventosCompletos);
    }
  }, [generoSelecionado, eventosCompletos]);

  return (
      <main className='body'>
        <Header />
        <Carrossel onGeneroSelecionado={handleGeneroSelecionado} />

        <Routes>
          <Route path="/" element={
            <Eventos
                eventosFiltrados={eventosFiltrados}
                eventosCompletos={eventosCompletos}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                onEventoCadastrado={handleNovoEventoCadastrado}
            />
          } />
          <Route path="/detalhes/:id" element={
            <InfoEvento 
                eventos={eventosCompletos}
                onVoltar={() => navigate('/')}
            />
          } />
        </Routes>

        <Footer />
      </main>
  );
}

export default Home;
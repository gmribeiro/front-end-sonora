import Carrossel from '../components/Carrossel/carrossel.jsx';
import './css/global.css';
import { useState, useEffect, useCallback } from 'react';
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

  // --- Funções de Formatação de Data ---
  const formatDateTimeForUserDisplay = useCallback((backendDateTimeString) => {
    if (typeof backendDateTimeString !== 'string' || !backendDateTimeString) {
      return 'Data e hora não informadas';
    }

    let date;
    const parts = backendDateTimeString.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
    if (parts) {
      date = new Date(`${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}:${parts[6]}`);
    } else {
      date = new Date(backendDateTimeString);
    }

    if (isNaN(date.getTime())) {
      console.warn("[formatDateTimeForUserDisplay] Data ou formato inválido para exibição:", backendDateTimeString);
      return 'Data e hora inválidas';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }, []);

  // --- Nova Função: Verifica se a data do evento está no passado ---
  const isEventInPast = useCallback((backendDateTimeString) => {
    if (typeof backendDateTimeString !== 'string' || !backendDateTimeString) {
      return true; // Considerar inválido como no passado para não exibir
    }

    let eventDate;
    const parts = backendDateTimeString.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
    if (parts) {
      // Constrói a data no formato "YYYY-MM-DDTHH:MM:SS" para o construtor Date
      eventDate = new Date(`${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}:${parts[6]}`);
    } else {
      eventDate = new Date(backendDateTimeString);
    }

    if (isNaN(eventDate.getTime())) {
      console.warn("[isEventInPast] Data ou formato inválido para verificação:", backendDateTimeString);
      return true; // Considerar inválido como no passado
    }

    const now = new Date();
    // Comparar apenas a data para eventos que duram o dia todo, ou comparar com a hora atual se a hora for relevante
    return eventDate < now;
  }, []);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await api.get('/eventos');
        const eventosRaw = response.data;

        const eventosAtuais = eventosRaw.filter(evento => !isEventInPast(evento.dataHora));

        const eventosMapeados = eventosAtuais.map(evento => {
          const dataHoraFormatada = formatDateTimeForUserDisplay(evento.dataHora);

          return {
            id: evento.idEvento,
            titulo: evento.nomeEvento,
            local: evento.localEvento ? evento.localEvento.local : 'Local não informado',
            dataHora: dataHoraFormatada,
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
  }, [formatDateTimeForUserDisplay, isEventInPast]); // Adicione isEventInPast como dependência

  const handleGeneroSelecionado = useCallback((genero) => {
    setGeneroSelecionado(genero);
  }, []);

  const handleNovoEventoCadastrado = useCallback((novoEvento) => {
    // Antes de adicionar um novo evento, verifique se ele não está no passado
    if (!isEventInPast(novoEvento.dataHora)) {
      const eventoFormatado = {
        ...novoEvento,
        dataHora: formatDateTimeForUserDisplay(novoEvento.dataHora)
      };
      setEventosCompletos(prevEventos => [eventoFormatado, ...prevEventos]);
      setCurrentPage(1);
    } else {
      console.log("Novo evento cadastrado está no passado e não será exibido na home.");
    }
  }, [formatDateTimeForUserDisplay, isEventInPast]);

  useEffect(() => {
    setCurrentPage(1);
    if (generoSelecionado) {
      setEventosFiltrados(eventosCompletos.filter(evento => evento.genero === generoSelecionado));
    } else {
      setEventosFiltrados(eventosCompletos);
    }
  }, [generoSelecionado, eventosCompletos]);

  return (
      <main className="body">
        <Header />
        <Carrossel onGeneroSelecionado={handleGeneroSelecionado} />
        <Routes>
          <Route path="/" element={
            <Eventos
                eventosFiltrados={eventosFiltrados}
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
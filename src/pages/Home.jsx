import Carrossel from '../components/Carrossel/carrossel.jsx';
import './css/global.css';
import { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback
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
  const [eventosCompletos, setEventosCompletos] = useState([]); // Eventos brutos formatados
  const [eventosFiltrados, setEventosFiltrados] = useState([]); // Eventos filtrados pela categoria
  const navigate = useNavigate();

  // --- Funções de Formatação de Data ---
  // Esta função garante que a data seja exibida de forma amigável
  const formatDateTimeForUserDisplay = useCallback((backendDateTimeString) => {
    if (typeof backendDateTimeString !== 'string' || !backendDateTimeString) {
      return 'Data e hora não informadas';
    }

    let date;
    // Tenta parsear como "DD/MM/AAAA HH:MM:SS"
    const parts = backendDateTimeString.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
    if (parts) {
      // Constrói uma data no formato "YYYY-MM-DDTHH:MM:SS" para o construtor Date
      date = new Date(`${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}:${parts[6]}`);
    } else {
      // Tenta parsear qualquer outro formato que Date() aceite (ex: ISO 8601)
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
  }, []); // useCallback sem dependências, pois não usa estados/props do componente


  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await api.get('/eventos');
        const eventosRaw = response.data;

        const eventosMapeados = eventosRaw.map(evento => {
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
        setEventosFiltrados(eventosMapeados); // Inicialmente, todos os eventos são filtrados
      } catch (error) {
        console.error('Erro ao carregar eventos do backend:', error);
      }
    };

    fetchEventos();
  }, [formatDateTimeForUserDisplay]); // Adicione formatDateTimeForUserDisplay como dependência

  // Callback para o Carrossel
  const handleGeneroSelecionado = useCallback((genero) => {
    setGeneroSelecionado(genero);
  }, []);

  // Lida com o cadastro de um novo evento
  const handleNovoEventoCadastrado = useCallback((novoEvento) => {
    // Formata a data do novo evento antes de adicioná-lo
    const eventoFormatado = {
      ...novoEvento,
      dataHora: formatDateTimeForUserDisplay(novoEvento.dataHora) // Formata o novo evento
    };
    setEventosCompletos(prevEventos => [eventoFormatado, ...prevEventos]);
    // O useEffect abaixo cuidará de atualizar eventosFiltrados com base no generoSelecionado
    setCurrentPage(1); // Reinicia a paginação
  }, [formatDateTimeForUserDisplay]);


  // Efeito para filtrar eventos quando o gênero selecionado ou os eventos completos mudam
  useEffect(() => {
    setCurrentPage(1); // Sempre reseta a página ao aplicar um novo filtro
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
                eventosFiltrados={eventosFiltrados} // Passa os eventos JÁ FORMATADOS E FILTRADOS
                // eventosCompletos não precisa mais ser passado para Eventos
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                onEventoCadastrado={handleNovoEventoCadastrado}
            />
          } />
          <Route path="/detalhes/:id" element={
            <InfoEvento
                eventos={eventosCompletos} // Use eventosCompletos aqui para detalhes, se necessário
                onVoltar={() => navigate('/')}
            />
          } />
        </Routes>
        <Footer />
      </main>
  );
}

export default Home;
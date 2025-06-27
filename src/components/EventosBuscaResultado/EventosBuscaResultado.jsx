import React, { useState, useEffect } from 'react';
import api from '../../api/index.js';
import { useLocation, useNavigate } from 'react-router-dom';
import useTitle from '../../hooks/useTitle';
import { FaCalendarAlt } from 'react-icons/fa';
import { MdPlace } from 'react-icons/md';
import { FaMagnifyingGlass } from "react-icons/fa6";
import Header from '../header/header.jsx';
import Footer from '../Footer/footer.jsx';
// Carrossel is not used in this component, so it can be removed if not needed elsewhere.
// import Carrossel from '../Carrossel/carrossel'; 

const EventosBuscaResultados = () => {
    useTitle('Resultados da Busca - Sonora');

    const [eventos, setEventos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [eventImageUrls, setEventImageUrls] = useState({}); // To store image URLs by event ID

    const location = useLocation();
    const navigate = useNavigate();

    // Function to format date and time (copied from EventoDetalhes)
    const formatarDataHora = (dataHoraStr, horaEncerramentoStr) => {
        if (!dataHoraStr) return 'Data e hora não informadas';

        try {
            const parseDateTimeString = (dtStr, isTimeOnly = false) => {
                if (!dtStr) return null;
                if (isTimeOnly) {
                    const datePart = '2000-01-01'; // Dummy date for time parsing
                    return new Date(`${datePart}T${dtStr}`);
                }
                // Try parsing the dd/mm/yyyy hh:mm:ss format first
                const parts = dtStr.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
                if (parts) {
                    return new Date(`${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}:${parts[6]}`);
                }
                // Fallback for other formats (like YYYY-MM-DD HH:MM:SS.SSS from database)
                return new Date(dtStr);
            };

            const dataInicio = parseDateTimeString(dataHoraStr);

            if (dataInicio && !isNaN(dataInicio.getTime())) {
                const data = dataInicio.toLocaleDateString('pt-BR');
                const horaInicio = dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const dataFim = parseDateTimeString(horaEncerramentoStr, true);
                let horaFim = ''; // Changed to empty string to avoid "Hora de encerramento não informada" if not present

                if (dataFim && !isNaN(dataFim.getTime())) {
                    horaFim = ` até ${dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
                }

                return `${data} às ${horaInicio}${horaFim}`;
            } else {
                return 'Formato de data e hora de início inválido.';
            }
        } catch (error) {
            console.error('Erro ao processar data/hora:', error);
            return 'Erro ao processar data/hora.';
        }
    };

    useEffect(() => {
        const fetchEventosDeBusca = async () => {
            setCarregando(true);
            setErro(null);
            setEventos([]); // Clear previous events
            setEventImageUrls({}); // Clear previous image URLs

            const queryParams = new URLSearchParams(location.search);
            const nomeEvento = queryParams.get('nomeEvento');

            if (!nomeEvento) {
                setErro('Nenhum termo de busca fornecido.');
                setCarregando(false);
                return;
            }

            try {
                const response = await api.get(
                    `/eventos/search?nomeEvento=${encodeURIComponent(nomeEvento)}`
                );

                const fetchedEvents = response.data;
                setEventos(fetchedEvents);

                if (fetchedEvents.length === 0) {
                    setCarregando(false);
                    return;
                }

                // Fetch images concurrently for all events
                const imagePromises = fetchedEvents.map(async (evento) => {
                    try {
                        return { id: evento.idEvento, url: `${api.defaults.baseURL}/eventos/${evento.idEvento}/image` };
                    } catch (err) {
                        console.error(`Erro ao carregar imagem para o evento ${evento.idEvento}:`, err);
                        return { id: evento.idEvento, url: '/images/evento_padrao.png' };
                    }
                });

                const images = await Promise.all(imagePromises);

                const imageUrlsMap = {};
                images.forEach(img => { imageUrlsMap[img.id] = img.url; });
                setEventImageUrls(imageUrlsMap);

            } catch (error) {
                console.error('Erro ao buscar eventos:', error);
                setErro(error.response?.data?.message || 'Erro ao carregar eventos da busca.');
                setEventos([]); // Ensure events is empty on error
            } finally {
                setCarregando(false);
            }
        };

        fetchEventosDeBusca();
    }, [location.search]);

    if (carregando) {
        return (
            <div className="flex items-center justify-center h-screen w-screen text-white text-xl bg-[#564A72]">
                Carregando resultados da busca... <FaMagnifyingGlass className="ml-2" />
            </div>
        );
    }

    if (erro) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-screen text-red-500 text-center bg-white">
                <p>{erro}</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 bg-[#564A72] hover:bg-[#7d6aaa] text-white px-4 py-2 rounded"
                >
                    Voltar para Home
                </button>
            </div>
        );
    }

    if (eventos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-screen text-[#564A72] text-center bg-[#EDE6F2]">
                <p>Nenhum evento encontrado com o nome fornecido.</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 bg-[#564A72] hover:bg-[#453a58] text-white px-4 py-2 rounded"
                >
                    Voltar para Home
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#EDE6F2]">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto px-4 mb-25 mt-25">
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-3xl font-bold text-[#564A72] flex items-center gap-5">
                        Resultados da sua Busca <FaMagnifyingGlass />
                    </h1>
                    <button
                        onClick={() => navigate('/')}
                        className="text-[#564A72] hover:text-[#7d6aaa] underline font-semibold flex items-center text-xl"
                        type="button"
                    >
                        Voltar para página inicial
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 justify-items-center max-w-7xl mx-auto">
                    {eventos.map((evento) => (
                        <div
                            key={evento.idEvento}
                            // Reverted to original styling for the card container
                            className="relative h-[400px] sm:h-[300px] md:h-[400px] lg:h-[620px] overflow-hidden bg-gradient-to-b from-[#2E284E] via-[#5A4E75] to-[#E8DFEC] rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer flex flex-col w-full max-w-[350px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-[400px] lg:min-w-[400px] mx-auto"
                            onClick={() => navigate(`/detalhes/${evento.idEvento}`)}
                        >
                            <img
                                src={eventImageUrls[evento.idEvento] || '/images/evento_padrao.png'}
                                alt={evento.nomeEvento || evento.titulo}
                                // Reverted to original styling for the image
                                className="w-full h-100 object-cover"
                            />
                            <div
                                // Reverted to original styling for the content padding
                                className="p-8 flex-grow flex flex-col justify-between"
                            >
                                <div className="flex-grow">
                                    <h2
                                        // Reverted to original styling for the title
                                        className="text-2xl font-bold mb-6 text-[#564A72]"
                                    >
                                        {evento.nomeEvento || evento.titulo}
                                    </h2>
                                    <p
                                        // Reverted to original styling for date/time
                                        className="text-gray-700 text-base mb-4 flex items-center"
                                    >
                                        <FaCalendarAlt className="mr-3 text-[#564A72]" />
                                        {formatarDataHora(evento.dataHora, evento.horaEncerramento) || 'Data e hora não informadas'}
                                    </p>
                                    <p
                                        // Reverted to original styling for local
                                        className="text-gray-700 text-base mb-4 flex items-center"
                                    >
                                        <MdPlace className="mr-3 text-[#564A72]" />
                                        {evento.localEvento?.local || evento.local || 'Local não informado'}
                                    </p>
                                </div>
                                {/* Removed Classification and Artists sections as per your request */}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EventosBuscaResultados;
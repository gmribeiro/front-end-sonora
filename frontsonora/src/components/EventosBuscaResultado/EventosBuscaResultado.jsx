// src/components/EventosBuscaResultados/EventosBuscaResultados.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import useTitle from '../../hooks/useTitle';
import { FaCalendarAlt } from "react-icons/fa";
import { MdPlace } from "react-icons/md";
import { IoMdMusicalNotes } from "react-icons/io";

// Importa os componentes Header e Footer iguais aos da Home.jsx
import Header from '../Header/Header';  
import Footer from '../Footer/Footer';
import Carrossel from '../Carrossel/carrossel'

const EventosBuscaResultados = () => {
    useTitle('Resultados da Busca - Sonora');

    const [eventos, setEventos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEventosDeBusca = async () => {
            setCarregando(true);
            setErro(null);

            const queryParams = new URLSearchParams(location.search);
            const nomeEvento = queryParams.get('nomeEvento');

            if (!nomeEvento) {
                setErro('Nenhum termo de busca fornecido.');
                setCarregando(false);
                return;
            }

            try {
                const response = await axios.get(`/eventos/search?nomeEvento=${encodeURIComponent(nomeEvento)}`);
                setEventos(response.data);
            } catch (error) {
                console.error('Erro ao buscar eventos:', error);
                setErro(error.response?.data?.message || 'Erro ao carregar eventos da busca.');
                setEventos([]);
            } finally {
                setCarregando(false);
            }
        };

        fetchEventosDeBusca();
    }, [location.search]);

    if (carregando) {
        return (
            <div className="flex items-center justify-center h-screen w-screen text-white text-xl bg-black">
                Carregando resultados da busca...
            </div>
        );
    }

    if (erro) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-screen text-red-500 text-center bg-white">
                <p>{erro}</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Voltar para Home
                </button>
            </div>
        );
    }

    if (eventos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-screen text-white text-center bg-black">
                <p>Nenhum evento encontrado com o nome fornecido.</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Voltar para Home
                </button>
            </div>
        );
    }

    

    return (
        <div className="flex flex-col min-h-screen bg-[#EDE6F2]">
            <Header />

            <Carrossel/>

            <div className={`max-w-7xl mx-auto ${isAnimating ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0'} transition-all duration-300`}>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 justify-items-center max-w-7xl mx-auto px-4">
                {eventosPaginaAtual.map(evento => (
                    <div
                    key={evento.id}
                    onClick={() => handleEventoClick(evento.id)}
                    className="bg-gradient-to-b from-[#2E284E] via-[#5A4E75] to-[#E8DFEC] rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer flex flex-col w-full max-w-[350px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-[400px] mx-auto"
                    >
                    <div className="relative w-full h-[216px] sm:h-[288px] md:h-[400px] overflow-hidden">
                        <img
                        src={evento.imagem || '/images/evento_padrao.png'}
                        alt={evento.titulo}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-5 sm:p-6 flex-grow flex flex-col">
                        <h3 className="text-[#564A72] text-sm sm:text-base font-semibold truncate mb-1 sm:mb-2">{evento.titulo}</h3>
                        <p className="!text-[#564A72] text-xs sm:text-sm mb-2 sm:mb-3">{evento.local} - {evento.hora}</p>
                                                {usuarioLogado?.role === 'CLIENT' && (
                                                    <div className="mt-auto">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleReservar(evento.id);
                                                            }}
                                                            disabled={reservandoId === evento.id}
                                                            className="w-full bg-[#5A4E75] hover:bg-[#2E284E] text-white py-2 px-4 sm:py-3 sm:px-5 text-sm sm:text-base rounded-md transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                                        >
                                                            {reservandoId === evento.id ? 'Reservando...' : 'Reservar'}
                                                        </button>
                                                    </div>
                                                )}
                                                {mensagemReserva && reservandoId === evento.id && (
                                                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-center text-white">{mensagemReserva}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {totalPaginas > 1 && (
                                <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-10 md:mt-12">
                                    <button
                                        onClick={() => mudarPagina(currentPage - 1)}
                                        disabled={currentPage === 1 || isAnimating}
                                        className="bg-[#5A4E75] hover:bg-[#2E284E] text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:bg-[#8B7EA2] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                                    >
                                        &lt;
                                    </button>

                                    <span className="text-[#2E284E] font-bold text-sm sm:text-base">Página {currentPage} de {totalPaginas}</span>

                                    <button
                                        onClick={() => mudarPagina(currentPage + 1)}
                                        disabled={currentPage === totalPaginas || isAnimating}
                                        className="bg-[#5A4E75] hover:bg-[#2E284E] text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:bg-[#8B7EA2] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>
    );
}

Eventos.propTypes = {
    eventosFiltrados: PropTypes.array.isRequired,
    currentPage: PropTypes.number.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    onEventoCadastrado: PropTypes.func
};

Eventos.defaultProps = {
    onEventoCadastrado: () => {}
};

            <Footer />

export default EventosBuscaResultados;

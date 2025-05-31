import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt } from "react-icons/fa";
import { MdPlace } from "react-icons/md";
import { IoMdMusicalNotes } from "react-icons/io";
import useTitle from '../../hooks/useTitle';

const EventoDetalhes = () => {
    useTitle('Dados Evento - Sonora');

    const { id } = useParams();
    const navigate = useNavigate();

    const [evento, setEvento] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [reservando, setReservando] = useState(false);
    const [mensagemReserva, setMensagemReserva] = useState('');
    const [carregandoUsuarioReserva, setCarregandoUsuarioReserva] = useState(false);
    const [eventImageUrl, setEventImageUrl] = useState(null);
    const [escalasDoEvento, setEscalasDoEvento] = useState([]);
    const [carregandoEscalas, setCarregandoEscalas] = useState(false);
    const [erroEscalas, setErroEscalas] = useState(null);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                setCarregando(true);
                setErro(null);

                const token = localStorage.getItem('token');

                const eventoResponse = await axios.get(`/eventos/${id}`);
                const eventoData = eventoResponse.data;
                setEvento(eventoData);

                let loggedInUser = null;
                if (token) {
                    loggedInUser = await verificarUsuarioLogado(token);
                }
                setUsuarioLogado(loggedInUser);

                if (eventoData && eventoData.idEvento) {
                    try {
                        const imageResponse = await axios.get(`/eventos/${eventoData.idEvento}/image`, {
                            responseType: 'blob'
                        });
                        setEventImageUrl(URL.createObjectURL(imageResponse.data));
                    } catch (imageError) {
                        console.error('Erro ao carregar imagem do evento:', imageError);
                        setEventImageUrl('/images/evento_padrao.png');
                    }
                } else {
                    setEventImageUrl('/images/evento_padrao.png');
                }

            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setErro(error.response?.data?.message || 'Erro ao carregar evento');
            } finally {
                setCarregando(false);
            }
        };

        const verificarUsuarioLogado = async (token) => {
            if (!token) return null;
            try {
                const response = await axios.get('/auth/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                console.error('Erro ao verificar usuário:', error);
                return null;
            }
        };

        carregarDados();
    }, [id]);

    useEffect(() => {
        const fetchEscalasDoEvento = async () => {
            if (!id) return;
            setCarregandoEscalas(true);
            setErroEscalas(null);
            try {
                const response = await axios.get(`/escalas/event/${id}`);
                if (Array.isArray(response.data)) {
                    setEscalasDoEvento(response.data);
                } else {
                    console.error('Dados de escalas recebidos da API não são um array:', response.data);
                    setErroEscalas('Formato de dados inesperado para artistas escalados.');
                    setEscalasDoEvento([]);
                }
            } catch (error) {
                console.error('Erro ao carregar escalas do evento:', error);
                if (axios.isAxiosError(error) && error.response && error.response.status === 204) {
                    setEscalasDoEvento([]);
                } else {
                    setErroEscalas('Erro ao carregar os artistas escalados.');
                    setEscalasDoEvento([]);
                }
            } finally {
                setCarregandoEscalas(false);
            }
        };
        fetchEscalasDoEvento();
    }, [id]);

    const handleReservar = async () => {
        if (usuarioLogado?.role !== 'CLIENT') {
            setMensagemReserva('Apenas clientes podem fazer reservas.');
            return;
        }
        if (!evento?.idEvento) {
            alert('Dados do evento incompletos');
            return;
        }
        if (!usuarioLogado?.id) {
            setCarregandoUsuarioReserva(true);
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userResponse = await axios.get('/auth/user/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setUsuarioLogado(userResponse.data);
                } catch {
                    setMensagemReserva('Erro ao carregar informações do usuário.');
                    setCarregandoUsuarioReserva(false);
                    return;
                } finally {
                    setCarregandoUsuarioReserva(false);
                }
            } else {
                navigate('/acesso', { state: { from: `/detalhes/${id}` } });
                return;
            }
            if (!usuarioLogado?.id) {
                setMensagemReserva('É necessário estar logado para fazer reservas.');
                return;
            }
        }
        setReservando(true);
        setMensagemReserva('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/acesso', { state: { from: `/detalhes/${id}` } });
                return;
            }
            const reservaData = {
                usuario: { id: usuarioLogado.id },
                evento: { idEvento: evento.idEvento },
                confirmado: false
            };
            await axios.post('/reservas', reservaData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setMensagemReserva(`Reserva para "${evento.nomeEvento || evento.titulo}" realizada com sucesso!`);
        } catch (error) {
            let errorMessage = 'Erro ao processar reserva';
            if (error.response?.status === 401) {
                errorMessage = 'Sessão expirada. Faça login novamente.';
                localStorage.removeItem('token');
                navigate('/acesso');
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            setMensagemReserva(errorMessage);
        } finally {
            setReservando(false);
        }
    };

    const formatarDataHora = (dataHora) => {
        if (!dataHora) return 'Data não disponível';
        try {
            const [data, tempo] = dataHora.split(' ');
            const [dia, mes, ano] = data.split('/');
            const [hora, minuto] = tempo.split(':');
            return `${dia}/${mes}/${ano} às ${hora}h${minuto}`;
        } catch {
            return dataHora;
        }
    };

    if (carregando) {
        return <div className="text-center py-10 text-white">Carregando...</div>;
    }

    if (erro) {
        return (
            <div className="text-center py-10 text-red-500">
                <p>{erro}</p>
                <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Tentar novamente</button>
            </div>
        );
    }

    if (!evento) {
        return (
            <div className="text-center py-10 text-white">
                <p>Evento não encontrado</p>
                <button onClick={() => navigate('/eventos')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Voltar</button>
            </div>
        );
    }

    const podeReservar = usuarioLogado && usuarioLogado.role === 'CLIENT';
    const textoBotaoReserva = usuarioLogado && usuarioLogado.role !== 'CLIENT'
        ? 'Apenas clientes podem reservar'
        : (carregandoUsuarioReserva ? 'Carregando informações...' : (reservando ? 'Processando...' : 'Reservar Ingresso'));

    return (
        <div className="min-h-screen bg-[#EDE6F2] text-[#564A72] flex flex-col"
             style={{ overflowX: 'hidden' }}>
            <div className="w-full h-12 overflow-hidden">
                <img 
                    src="/images/elementodegrade.png" 
                    alt="Imagem degradê sonora" 
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="relative w-full h-[240px] md:h-[320px] lg:h-[420px] overflow-hidden">
                
                <img
                    src={eventImageUrl || '/images/evento_padrao.png'}
                    alt="Imagem de fundo do evento"
                    className="absolute top-0 left-0 w-full h-full object-cover filter blur-md scale-110 z-0 pointer-events-none"
                />

                <div className="relative z-10 flex justify-center items-center h-full px-2">
                    <div className="shadow-xl rounded-lg overflow-hidden w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
                        <img
                            src={eventImageUrl || '/images/evento_padrao.png'}
                            alt={evento.nomeEvento || evento.titulo || 'Imagem do evento'}
                            className="w-full h-[180px] sm:h-[280px] md:h-[380px] object-cover"
                        />
                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="absolute bottom-4 left-4 z-20 border border-[#564A72] bg-white text-[#564A72] px-3 py-1 rounded hover:bg-[#564A72] hover:text-white transition text-sm sm:text-base"
                >
                    Voltar
                </button>

            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mt-8 sm:mt-16 mb-6 sm:mb-12 text-center !text-[#564A72] px-4 max-w-[600px] mx-auto truncate">
                {evento.nomeEvento || evento.titulo}
            </h1>

            <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 pb-12 flex-grow text-base sm:text-lg">
                <div className="flex items-center mt-6 sm:mt-10 mb-3 sm:mb-5 overflow-x-auto">
                    <FaCalendarAlt className="text-xl sm:text-2xl mr-2 flex-shrink-0" />
                    <span className="text-lg sm:text-2xl whitespace-nowrap">{formatarDataHora(evento.dataHora)}</span>
                </div>

                <div className="flex items-center mb-6 sm:mb-15 overflow-x-auto">
                    <MdPlace className="text-xl sm:text-2xl mr-2 flex-shrink-0" />
                    <span className="text-lg sm:text-2xl whitespace-nowrap">{evento.localEvento?.local || evento.local || 'Local não informado'}</span>
                </div>

                <div className="mb-10 sm:mb-15">
                    <h2 className="!text-left !text-[#564A72] text-xl sm:text-2xl font-semibold mb-2">Descrição</h2>
                    <p className='!text-[#564A72] text-base sm:text-[18px]'>{evento.descricao || 'Descrição não disponível.'}</p>
                </div>

                <div className="mb-16 sm:mb-20">
                    <h2 className="!text-[#564A72] flex items-center text-xl sm:text-2xl font-semibold mb-3 overflow-x-auto">
                        <IoMdMusicalNotes className="mr-2 flex-shrink-0" /> Artistas Escalados
                    </h2>
                    {carregandoEscalas ? (
                        <p className='!text-[#564A72] mt-10'>Carregando artistas...</p>
                    ) : erroEscalas ? (
                        <p className="!text-red-600 mt-10">{erroEscalas}</p>
                    ) : escalasDoEvento.length === 0 ? (
                        <p className='!text-[#564A72] mt-10'>Nenhum artista escalado para este evento.</p>
                    ) : (
                        <ul className="list-disc list-inside !text-[#564A72] max-w-full overflow-x-auto">
                            {escalasDoEvento.map((escala) => (
                                <li key={escala.id} className="truncate">{escala.nomeArtista}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {mensagemReserva && (
                    <div
                        className={`mb-4 px-4 py-3 rounded ${
                            mensagemReserva.toLowerCase().includes('sucesso')
                                ? 'bg-green-200 text-green-800'
                                : 'bg-red-200 text-red-800'
                        }`}
                    >
                        {mensagemReserva}
                    </div>
                )}

                <button
                    onClick={handleReservar}
                    disabled={!podeReservar || reservando}
                    className={`w-full py-3 rounded font-semibold transition
                        ${
                            podeReservar
                                ? 'bg-[#564A72] text-white hover:bg-[#453a58]'
                                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                >
                    {textoBotaoReserva}
                </button>
            </div>
        </div>
    );
};

export default EventoDetalhes;

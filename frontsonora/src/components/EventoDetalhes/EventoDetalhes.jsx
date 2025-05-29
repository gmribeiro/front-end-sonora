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

                console.log('Resposta da API para escalas (response.data):', response.data);
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
                    console.log('API retornou 204 No Content, definindo escalas como array vazio.');
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
                evento: {
                    idEvento: evento.idEvento,
                },
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
        <div className="bg-cover bg-center min-h-screen px-4 py-8 text-[#564A72]" style={{ backgroundImage: "url('/images/detalheevento.png')" }}>
            <div className="max-w-4xl mx-auto bg-[#EDE6F2] bg-opacity-80 p-6 rounded shadow-md">
                <div className="mb-6 flex items-start justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="transition-transform duration-300 transform hover:scale-105 px-3 py-3 border border-[#564A72] bg-white text-[#564A72] hover:bg-[#564A72] hover:text-white rounded"
                    >
                        Voltar
                    </button>
                    <h1 className="text-4xl font-bold text-center w-full -ml-12">{evento.nomeEvento || evento.titulo}</h1>
                </div>

                {eventImageUrl && (
                    <div className="mb-6">
                        <img src={eventImageUrl} alt={evento.nomeEvento || evento.titulo} className="w-3/4 mx-auto h-auto rounded" />
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <FaCalendarAlt className="text-2xl text-[#564A72]" />
                            <div>
                                <h3 className="text-xl font-semibold">Data e Horário</h3>
                                <p>{formatarDataHora(evento.dataHora)}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MdPlace className="text-2xl text-[#564A72]" />
                            <div>
                                <h3 className="text-xl font-semibold">Local</h3>
                                <p>{evento.localEvento?.local || evento.local || 'Local não informado'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <IoMdMusicalNotes className="text-2xl text-[#564A72]" />
                            <div>
                                <h3 className="text-xl font-semibold">Gênero Musical</h3>
                                <p>{evento.generoMusical?.nomeGenero || evento.genero || 'Não especificado'}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-semibold mb-2">Artistas Escalados</h3>
                        {carregandoEscalas ? (
                            <p>Carregando artistas...</p>
                        ) : erroEscalas ? (
                            <p className="text-red-600 mt-2 font-medium">{erroEscalas}</p>
                        ) : (
                            <>
                                {Array.isArray(escalasDoEvento) && escalasDoEvento.length === 0 ? (
                                    <p>Nenhum artista escalado para este evento ainda.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {escalasDoEvento.map((escala, index) => (
                                            <div key={index} className="bg-gray-800 p-4 rounded text-white">
                                                <h4 className="font-semibold">Gênero: {escala.idEscala?.genero?.nomeGenero || 'Não especificado'}</h4>
                                                {escala.musicos && escala.musicos.length > 0 ? (
                                                    <ul className="list-disc list-inside">
                                                        {escala.musicos.map((musico, i) => (
                                                            <li key={`${index}-${i}`}>{musico.nomeArtistico || 'Nome indisponível'}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>Nenhum músico para este gênero neste slot.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div>
                        <h3 className="text-2xl font-semibold mb-2">Descrição</h3>
                        <p>{evento.descricao || 'Descrição não disponível.'}</p>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleReservar}
                            disabled={!podeReservar || reservando || carregandoUsuarioReserva}
                            className="transition-transform duration-300 transform hover:scale-110 bg-[#564A72] hover:bg-[#c2a0bb] disabled:bg-gray-600 text-white text-lg px-8 py-3 rounded"
                        >
                            {textoBotaoReserva}
                        </button>
                        {mensagemReserva && (
                            <p className={`mt-4 ${mensagemReserva.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>
                                {mensagemReserva}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventoDetalhes;
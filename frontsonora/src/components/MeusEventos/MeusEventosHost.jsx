import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './meusEventosHost.css';
import './dashboardCard.css';
import './minhasReservas.css';
import './meusContratos.css';

function MeusEventosHost() {
    const [isHost, setIsHost] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isArtista, setIsArtista] = useState(false);
    const [artistaIdLogado, setArtistaIdLogado] = useState(null);
    const [eventosFuturos, setEventosFuturos] = useState([]);
    const [eventosPassados, setEventosPassados] = useState([]);
    const [reservasPorEvento, setReservasPorEvento] = useState({});
    const [minhasReservas, setMinhasReservas] = useState([]);
    const [minhasReservasConfirmadas, setMinhasReservasConfirmadas] = useState([]);
    const [meusContratosArtista, setMeusContratosArtista] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dashboardData, setDashboardData] = useState({
        totalEventos: 0,
        totalReservas: 0,
        mediaReservas: 0,
    });
    const [confirmandoId, setConfirmandoId] = useState(null);
    const [mensagemConfirmacao, setMensagemConfirmacao] = useState('');
    const [cancelandoId, setCancelandoId] = useState(null);
    const [mensagemCancelamento, setMensagemCancelamento] = useState('');
    const [usuarioLogadoId, setUsuarioLogadoId] = useState(null);
    const [loadingReservasDashboard, setLoadingReservasDashboard] = useState(true);

    // Novo estado para controlar a mensagem de exclusão de evento
    const [mensagemExclusaoEvento, setMensagemExclusaoEvento] = useState({ id: null, message: '', type: '' });
    const [excluindoEventoId, setExcluindoEventoId] = useState(null); // Para desabilitar o botão enquanto exclui

    const fetchReservasPorEvento = useCallback(async (eventosParaBuscarReservas) => {
        const reservasData = {};
        const promises = eventosParaBuscarReservas.map(async (evento) => {
            try {
                const token = localStorage.getItem('token');
                const reservasResponse = await axios.get(`/reservas/evento/${evento.idEvento}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                reservasData[evento.idEvento] = reservasResponse.data;
            } catch (error) {
                console.error(`Erro ao buscar reservas para o evento ${evento.idEvento}:`, error);
                reservasData[evento.idEvento] = [];
            }
        });
        await Promise.all(promises);
        setReservasPorEvento(reservasData);
    }, []);

    const fetchMinhasReservas = useCallback(async (userId, token) => {
        try {
            const response = await axios.get(`/reservas/usuario/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMinhasReservas(response.data);
        } catch (error) {
            console.error('Erro ao carregar minhas reservas:', error);
            setError('Erro ao carregar suas reservas.');
        }
    }, []);

    const fetchMinhasReservasConfirmadas = useCallback(async (userId, token) => {
        try {
            const response = await axios.get(`/reservas/usuario/${userId}/confirmadas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMinhasReservasConfirmadas(response.data);
        } catch (error) {
            console.error('Erro ao carregar minhas reservas confirmadas:', error);
            setError('Erro ao carregar suas reservas confirmadas.');
        }
    }, []);

    const fetchMeusContratosArtista = useCallback(async (artistaId, token) => {
        try {
            const response = await axios.get(`/contratos/musico/${artistaId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMeusContratosArtista(response.data);
        } catch (error) {
            console.error('Erro ao carregar meus contratos como artista:', error);
            setError('Erro ao carregar seus contratos.');
        }
    }, []);

    const calcularDadosDashboard = useCallback(() => {
        let totalReservasUnicas = 0;
        const todosEventos = [...eventosFuturos, ...eventosPassados];
        let reservasCount = 0;

        todosEventos.forEach(evento => {
            if (reservasPorEvento[evento.idEvento]) {
                reservasCount += reservasPorEvento[evento.idEvento].length;
            }
        });

        totalReservasUnicas = reservasCount;

        const totalEventos = todosEventos.length;
        const mediaReservas = totalEventos > 0 ? reservasCount / totalEventos : 0;

        setDashboardData({
            totalEventos: totalEventos,
            totalReservas: totalReservasUnicas,
            mediaReservas: mediaReservas.toFixed(2),
        });
    }, [eventosFuturos, eventosPassados, reservasPorEvento]);

    useEffect(() => {
        const verificarRoleEBuscarDados = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsHost(false);
                    setIsClient(false);
                    setIsArtista(false);
                    setLoading(false);
                    return;
                }
                const userResponse = await axios.get('/auth/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const userRole = userResponse.data.role;
                setUsuarioLogadoId(userResponse.data.id);
                setIsHost(userRole === 'HOST');
                setIsClient(userRole === 'CLIENT');
                setIsArtista(userRole === 'ARTISTA');

                if (userRole === 'HOST') {
                    const hostId = userResponse.data.id;
                    const futurosResponse = await axios.get(`/eventos/host/${hostId}/future`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    setEventosFuturos(futurosResponse.data);

                    const passadosResponse = await axios.get(`/eventos/host/${hostId}/past`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    setEventosPassados(passadosResponse.data);

                    const todosOsEventosDoHost = [...futurosResponse.data, ...passadosResponse.data];
                    setLoadingReservasDashboard(true);
                    await fetchReservasPorEvento(todosOsEventosDoHost);

                    setLoadingReservasDashboard(false);
                } else if (userRole === 'CLIENT') {
                    fetchMinhasReservas(userResponse.data.id, token);
                    fetchMinhasReservasConfirmadas(userResponse.data.id, token);
                } else if (userRole === 'ARTISTA') {
                    try {
                        const musicosResponse = await axios.get('/musicos', {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });
                        const musicoLogado = musicosResponse.data.find(musico => musico.usuario?.id === userResponse.data.id);

                        if (musicoLogado && musicoLogado.idMusico) {
                            setArtistaIdLogado(musicoLogado.idMusico);
                            fetchMeusContratosArtista(musicoLogado.idMusico, token);
                        } else {
                            console.warn('Nenhum músico encontrado para este usuário.');
                            setIsArtista(false);
                        }
                    } catch (error) {
                        console.error('Erro ao buscar músicos:', error);
                        setIsArtista(false);
                    }
                }

            } catch (error) {
                console.error('Erro ao verificar role ou buscar dados:', error);
                setError('Erro ao carregar informações.');
                setIsHost(false);
                setIsClient(false);
                setIsArtista(false);
            } finally {
                setLoading(false);
            }
        };
        verificarRoleEBuscarDados();
    }, [fetchMinhasReservas, fetchReservasPorEvento, fetchMeusContratosArtista, fetchMinhasReservasConfirmadas]);

    useEffect(() => {
        if (!loadingReservasDashboard) {
            calcularDadosDashboard();
        }
    }, [loadingReservasDashboard, eventosFuturos, eventosPassados, reservasPorEvento, calcularDadosDashboard]);

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        try {
            const parts = dateTimeString.split(' ');
            const dateParts = parts[0].split('/');
            const timeParts = parts[1].split(':');
            const isoFormattedString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${timeParts[0]}:${timeParts[1]}:${timeParts[2]}.000Z`;
            const date = new Date(isoFormattedString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return 'Data/Hora inválida';
        }
    };
    const handleConfirmarPresenca = async (reservaId, reservaEventoId) => {
        setConfirmandoId(reservaId);
        setMensagemConfirmacao('');
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`/reservas/${reservaId}`, {
                confirmado: true,
                usuario: {
                    id: usuarioLogadoId
                },
                evento: {
                    idEvento: reservaEventoId
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setMinhasReservas(minhasReservas.map(reserva =>
                    reserva.idReserva === reservaId ? { ...reserva, confirmado: true } : reserva
                ));
                const updatedReserva = response.data;
                setMinhasReservasConfirmadas(prevConfirmed => {
                    const exists = prevConfirmed.some(r => r.idReserva === updatedReserva.idReserva);
                    return exists ? prevConfirmed.map(r => r.idReserva === updatedReserva.idReserva ? updatedReserva : r) : [...prevConfirmed, updatedReserva];
                });

                setMensagemConfirmacao('Presença confirmada!');
            } else {
                setMensagemConfirmacao('Erro ao confirmar presença.');
            }
        } catch (error) {
            console.error('Erro ao confirmar presença:', error);
            setMensagemConfirmacao(`Erro ao confirmar presença: ${error.response?.data?.message || error.message}`);
        } finally {
            setTimeout(() => {
                setConfirmandoId(null);
                setMensagemConfirmacao('');
            }, 3000);
        }
    };
    const handleCancelarReserva = async (reservaId) => {
        setCancelandoId(reservaId);
        setMensagemCancelamento('');
        const token = localStorage.getItem('token');
        const confirmCancel = window.confirm("Tem certeza que deseja cancelar esta reserva?");
        if (!confirmCancel) {
            setCancelandoId(null);
            return;
        }

        try {
            const response = await axios.delete(`/reservas/${reservaId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 204) {
                setMinhasReservas(prevReservas => prevReservas.filter(reserva => reserva.idReserva !== reservaId));
                setMinhasReservasConfirmadas(prevConfirmed => prevConfirmed.filter(reserva => reserva.idReserva !== reservaId));
                setMensagemCancelamento('Reserva cancelada com sucesso!');
            } else {
                setMensagemCancelamento('Erro ao cancelar reserva.');
            }
        } catch (error) {
            console.error('Erro ao cancelar reserva:', error);
            setMensagemCancelamento(`Erro ao cancelar reserva: ${error.response?.data?.message || error.message}`);
        } finally {
            setTimeout(() => {
                setCancelandoId(null);
                setMensagemCancelamento('');
            }, 3000);
        }
    };
    const handleCancelarEvento = async (eventId) => {
        const hasReservas = reservasPorEvento[eventId] && reservasPorEvento[eventId].length > 0;

        if (hasReservas) {
            setMensagemExclusaoEvento({
                id: eventId,
                message: "Não é possível excluir este evento, pois já existem reservas para ele.",
                type: 'error'
            });
            setTimeout(() => setMensagemExclusaoEvento({ id: null, message: '', type: '' }), 5000); // Limpa a mensagem após 5 segundos
            return;
        }

        const confirmDelete = window.confirm("Tem certeza que deseja cancelar este evento? Esta ação é irreversível.");
        if (!confirmDelete) {
            return;
        }

        setExcluindoEventoId(eventId);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.delete(`/eventos/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.status === 204) {
                setEventosFuturos(prevEvents => prevEvents.filter(e => e.idEvento !== eventId));
                setEventosPassados(prevEvents => prevEvents.filter(e => e.idEvento !== eventId));
                setReservasPorEvento(prevReservas => {
                    const newReservas = { ...prevReservas };
                    delete newReservas[eventId];
                    return newReservas;
                });
                setMensagemExclusaoEvento({
                    id: eventId,
                    message: "Evento cancelado com sucesso!",
                    type: 'success'
                });
            } else {
                setMensagemExclusaoEvento({
                    id: eventId,
                    message: "Erro ao cancelar evento. Tente novamente.",
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Erro ao cancelar evento:', error);
            setMensagemExclusaoEvento({
                id: eventId,
                message: `Erro ao cancelar evento: ${error.response?.data?.message || error.message}`,
                type: 'error'
            });
        } finally {
            setExcluindoEventoId(null); // Reabilita o botão
            setTimeout(() => setMensagemExclusaoEvento({ id: null, message: '', type: '' }), 5000); // Limpa a mensagem
        }
    };


    if (loading) {
        return <div>Carregando informações...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }
    if (isHost) {
        return (
            <div className="meus-eventos-host-container">
                <h2>Seus Eventos como HOST</h2>

                <div className="dashboard-cards">
                    <div className="dashboard-card">
                        <h3>Eventos Postados</h3>
                        <p>{eventosFuturos.length + eventosPassados.length}</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Total de Reservas</h3>
                        <p>{dashboardData.totalReservas}</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Média de Reservas</h3>
                        <p>{dashboardData.mediaReservas}</p>
                    </div>
                </div>

                <h3>Próximos Eventos</h3>
                {eventosFuturos.length > 0 ? (
                    <ul>
                        {eventosFuturos.map(evento => (
                            <li key={evento.idEvento}>
                                <div className="event-info-actions">
                                    <Link to={`/detalhes/${evento.idEvento}`}>{evento.nomeEvento}</Link>
                                    <button
                                        onClick={() => handleCancelarEvento(evento.idEvento)}
                                        disabled={excluindoEventoId === evento.idEvento}
                                        className="cancel-event-button"
                                    >
                                        {excluindoEventoId === evento.idEvento ? 'Cancelando...' : 'Cancelar Evento'}
                                    </button>
                                </div>
                                {mensagemExclusaoEvento.id === evento.idEvento && (
                                    <p className={`event-action-message ${mensagemExclusaoEvento.type}`}>
                                        {mensagemExclusaoEvento.message}
                                    </p>
                                )}
                                {reservasPorEvento[evento.idEvento] && reservasPorEvento[evento.idEvento].length > 0 ? (
                                    <div>
                                        Reservas ({reservasPorEvento[evento.idEvento].length}):
                                        <ul className="reservas-lista">
                                            {reservasPorEvento[evento.idEvento].map(reserva => (
                                                <li key={reserva.idReserva}>
                                                    Codigo da Reserva: <Link to={`/reservas/${reserva.idReserva}`}>{reserva.idReserva}</Link>
                                                    - Usuário: {reserva.usuario?.name || 'Nome não disponível'}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p>Nenhuma reserva para este evento.</p>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nenhum evento futuro publicado.</p>
                )}

                <h3>Eventos Passados</h3>
                {eventosPassados.length > 0 ? (
                    <ul>
                        {eventosPassados.map(evento => (
                            <li key={evento.idEvento}>
                                <div className="event-info-actions">
                                    <Link to={`/detalhes/${evento.idEvento}`}>{evento.nomeEvento}</Link>
                                </div>
                                {mensagemExclusaoEvento.id === evento.idEvento && (
                                    <p className={`event-action-message ${mensagemExclusaoEvento.type}`}>
                                        {mensagemExclusaoEvento.message}
                                    </p>
                                )}
                                {reservasPorEvento[evento.idEvento] && reservasPorEvento[evento.idEvento].length > 0 ? (
                                    <div>
                                        Reservas ({reservasPorEvento[evento.idEvento].length}):
                                        <ul className="reservas-lista">
                                            {reservasPorEvento[evento.idEvento].map(reserva => (
                                                <li key={reserva.idReserva}>
                                                    ID da Reserva: <Link to={`/reservas/${reserva.idReserva}`}>{reserva.idReserva}</Link>
                                                    - Usuário: {reserva.usuario?.name || 'Nome não disponível'}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p>Nenhuma reserva para este evento.</p>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nenhum evento passado publicado.</p>
                )}
            </div>
        );
    }

    if (isClient) {
        return (
            <div className="minhas-reservas-container">
                {/* Seção de Todas as Minhas Reservas (incluindo pendentes e confirmadas) */}
                <h2>Minhas Reservas</h2>
                {minhasReservas.length === 0 ? (
                    <p>Você ainda não fez nenhuma reserva.</p>
                ) : (
                    <ul className="reservas-lista">
                        {minhasReservas.map(reserva => (
                            <li key={reserva.idReserva || Math.random()} className="reserva-item">
                                <p><strong>Evento:</strong> <Link to={`/detalhes/${reserva.evento?.idEvento}`}>{reserva.evento?.nomeEvento || 'Nome não disponível'}</Link></p>
                                <p><strong>Data e Hora:</strong> {reserva.evento?.dataHora ? formatDateTime(reserva.evento.dataHora) : 'Data/Hora não disponível'}</p>
                                <p><strong>Local:</strong> {reserva.evento?.localEvento?.local || 'Local não disponível'}</p>
                                <p><strong>Status:</strong> {reserva.confirmado ? <span className="status-confirmada">Confirmada</span> : <span className="status-pendente">Pendente</span>}</p>
                                {!reserva.confirmado && (
                                    <button
                                        onClick={() => handleConfirmarPresenca(reserva.idReserva, reserva.evento?.idEvento)}
                                        disabled={confirmandoId === reserva.idReserva || cancelandoId === reserva.idReserva}
                                    >
                                        {confirmandoId === reserva.idReserva ? 'Confirmando...' : 'Confirmar Presença'}
                                    </button>
                                )}
                                {mensagemConfirmacao && confirmandoId === reserva.idReserva && (
                                    <p className="mensagem-confirmacao">{mensagemConfirmacao}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Seção: Minhas Reservas Confirmadas com botão de cancelar */}
                <h2 style={{ marginTop: '30px' }}>Reservas Confirmadas</h2>
                {minhasReservasConfirmadas.length === 0 ? (
                    <p>Você ainda não tem reservas confirmadas.</p>
                ) : (
                    <ul className="reservas-lista">
                        {minhasReservasConfirmadas.map(reserva => (
                            <li key={reserva.idReserva || Math.random()} className="reserva-item">
                                <p><strong>Evento:</strong> <Link to={`/detalhes/${reserva.evento?.idEvento}`}>{reserva.evento?.nomeEvento || 'Nome não disponível'}</Link></p>
                                <p><strong>Data e Hora:</strong> {reserva.evento?.dataHora ? formatDateTime(reserva.evento.dataHora) : 'Data/Hora não disponível'}</p>
                                <p><strong>Local:</strong> {reserva.evento?.localEvento?.local || 'Local não disponível'}</p>
                                <p><strong>Status:</strong> <span className="status-confirmada">Confirmada</span></p>

                                {/* Botão de Cancelar Reserva */}
                                <button
                                    onClick={() => handleCancelarReserva(reserva.idReserva)}
                                    disabled={cancelandoId === reserva.idReserva || confirmandoId === reserva.idReserva}
                                    className="cancel-button"
                                >
                                    {cancelandoId === reserva.idReserva ? 'Cancelando...' : 'Cancelar Reserva'}
                                </button>
                                {mensagemCancelamento && cancelandoId === reserva.idReserva && (
                                    <p className="mensagem-cancelamento">{mensagemCancelamento}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    if (isArtista) {
        return (
            <div className="meus-contratos-artista-container">
                <h2>Meus Contratos como Artista</h2>
                {meusContratosArtista.length === 0 ? (
                    <p>Você ainda não possui nenhum contrato.</p>
                ) : (
                    <ul className="contratos-lista">
                        {meusContratosArtista.map(contrato => (
                            <li key={contrato.idContrato.contratoId} className="contrato-item">
                                <p><strong>Evento:</strong> <Link to={`/detalhes/${contrato.idContrato.evento.idEvento}`}>{contrato.idContrato.evento.nomeEvento || 'Nome não disponível'}</Link></p>
                                <p><strong>Valor:</strong> {contrato.valor}</p>
                                <p><strong>Detalhes:</strong> {contrato.detalhes || 'Nenhum detalhe fornecido'}</p>
                                <p><strong>Status:</strong> {contrato.status || 'Pendente'}</p>
                                {/* Adicione mais detalhes do contrato conforme necessário */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    return <div>Você não tem permissão para acessar esta página.</div>;
}

export default MeusEventosHost;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './meusEventosHost.css';
import './dashboardCard.css';

function MeusEventos() {
    const [eventosFuturos, setEventosFuturos] = useState([]);
    const [eventosPassados, setEventosPassados] = useState([]);
    const [reservasPorEvento, setReservasPorEvento] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dashboardData, setDashboardData] = useState({
        totalEventos: 0,
        totalReservas: 0,
        mediaReservas: 0,
    });
    const [mensagemExclusaoEvento, setMensagemExclusaoEvento] = useState({ id: null, message: '', type: '' });
    const [excluindoEventoId, setExcluindoEventoId] = useState(null);

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

    const handleCancelarEvento = async (eventId) => {
        const hasReservas = reservasPorEvento[eventId] && reservasPorEvento[eventId].length > 0;

        if (hasReservas) {
            setMensagemExclusaoEvento({
                id: eventId,
                message: "Não é possível excluir este evento, pois já existem reservas para ele.",
                type: 'error'
            });
            setTimeout(() => setMensagemExclusaoEvento({ id: null, message: '', type: '' }), 5000);
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
            setExcluindoEventoId(null);
            setTimeout(() => setMensagemExclusaoEvento({ id: null, message: '', type: '' }), 5000);
        }
    };

    useEffect(() => {
        const fetchMeusEventos = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const userResponse = await axios.get('/auth/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
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
                await fetchReservasPorEvento(todosOsEventosDoHost);
            } catch (error) {
                console.error('Erro ao carregar eventos:', error);
                setError('Erro ao carregar seus eventos.');
            } finally {
                setLoading(false);
            }
        };

        fetchMeusEventos();
    }, [fetchReservasPorEvento]);

    useEffect(() => {
        if (!loading) {
            calcularDadosDashboard();
        }
    }, [loading, eventosFuturos, eventosPassados, reservasPorEvento, calcularDadosDashboard]);

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

export default MeusEventos;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './meusEventosHost.css';
import './dashboardCard.css';

function MeusEventosHost() {
    const [isHost, setIsHost] = useState(false);
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

    const fetchReservas = useCallback(async (eventosParaBuscarReservas) => {
        const reservasData = {};
        for (const evento of eventosParaBuscarReservas) {
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
        }
        setReservasPorEvento(reservasData);
    }, []);

    const calcularDadosDashboard = useCallback(() => {
        let totalReservasUnicas = new Set();
        const todosEventos = [...eventosFuturos, ...eventosPassados];
        todosEventos.forEach(evento => {
            if (reservasPorEvento[evento.idEvento]) {
                reservasPorEvento[evento.idEvento].forEach(reserva => {
                    totalReservasUnicas.add(reserva.idReserva);
                });
            }
        });
        const totalEventos = todosEventos.length;
        const totalReservas = totalReservasUnicas.size;
        const mediaReservas = totalEventos > 0 ? totalReservas / totalEventos : 0;
        setDashboardData({
            totalEventos: totalEventos,
            totalReservas: totalReservas,
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
                    setLoading(false);
                    return;
                }

                const userResponse = await axios.get('/auth/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (userResponse.data.role === 'HOST') {
                    setIsHost(true);
                    const hostId = userResponse.data.id;

                    // Buscar eventos futuros do HOST
                    const futurosResponse = await axios.get(`/eventos/future`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    setEventosFuturos(futurosResponse.data);
                    fetchReservas(futurosResponse.data);

                    // Buscar eventos passados do HOST
                    const passadosResponse = await axios.get(`/eventos/past`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    setEventosPassados(passadosResponse.data);
                    fetchReservas(passadosResponse.data);
                } else {
                    setIsHost(false);
                }

            } catch (error) {
                console.error('Erro ao verificar role ou buscar eventos:', error);
                setError('Erro ao carregar seus eventos.');
            } finally {
                setLoading(false);
            }
        };

        verificarRoleEBuscarDados();
    }, [fetchReservas]);

    useEffect(() => {
        const todosEventos = [...eventosFuturos, ...eventosPassados];
        if (todosEventos.length > 0 && Object.keys(reservasPorEvento).length >= todosEventos.length) {
            calcularDadosDashboard();
        }
    }, [eventosFuturos, eventosPassados, reservasPorEvento, calcularDadosDashboard]);

    if (loading) {
        return <div>Carregando seus eventos e reservas...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!isHost) {
        return <div>Você não tem permissão para ver os eventos de um HOST.</div>;
    }

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
                            <Link to={`/detalhes/${evento.idEvento}`}>{evento.nomeEvento}</Link>
                            {reservasPorEvento[evento.idEvento] && reservasPorEvento[evento.idEvento].length > 0 && (
                                <div>
                                    Reservas ({reservasPorEvento[evento.idEvento].length}):
                                    <ul>
                                        {reservasPorEvento[evento.idEvento].map(reserva => (
                                            <li key={reserva.idReserva}>
                                                Codigo da Reserva: <Link to={`/reservas/${reserva.idReserva}`}>{reserva.idReserva}</Link>
                                                - Usuário: {reserva.usuario?.name || 'Nome não disponível'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {reservasPorEvento[evento.idEvento] && reservasPorEvento[evento.idEvento].length === 0 && (
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
                            <Link to={`/evento/${evento.idEvento}`}>{evento.nomeEvento}</Link>
                            {reservasPorEvento[evento.idEvento] && reservasPorEvento[evento.idEvento].length > 0 && (
                                <div>
                                    Reservas ({reservasPorEvento[evento.idEvento].length}):
                                    <ul>
                                        {reservasPorEvento[evento.idEvento].map(reserva => (
                                            <li key={reserva.idReserva}>
                                                ID da Reserva: <Link to={`/reservas/${reserva.idReserva}`}>{reserva.idReserva}</Link>
                                                - Usuário: {reserva.usuario?.name || 'Nome não disponível'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {reservasPorEvento[evento.idEvento] && reservasPorEvento[evento.idEvento].length === 0 && (
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

export default MeusEventosHost;
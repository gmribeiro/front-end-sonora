import React, { useState, useEffect, useCallback } from 'react';

import axios from 'axios';

import { Link } from 'react-router-dom';

import './meusEventosHost.css';

import './dashboardCard.css';



function MeusEventosHost() {

    const [isHost, setIsHost] = useState(false);

    const [isClient, setIsClient] = useState(false);

    const [eventosFuturos, setEventosFuturos] = useState([]);

    const [eventosPassados, setEventosPassados] = useState([]);

    const [reservasPorEvento, setReservasPorEvento] = useState({});

    const [minhasReservas, setMinhasReservas] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');

    const [dashboardData, setDashboardData] = useState({

        totalEventos: 0,

        totalReservas: 0,

        mediaReservas: 0,

    });

    const [confirmandoId, setConfirmandoId] = useState(null);

    const [mensagemConfirmacao, setMensagemConfirmacao] = useState('');

    const [usuarioLogadoId, setUsuarioLogadoId] = useState(null);

    const [loadingReservasDashboard, setLoadingReservasDashboard] = useState(true); // Novo estado para loading das reservas do dashboard



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



    const calcularDadosDashboard = useCallback(() => {

        let totalReservasUnicas = 0;

        const todosEventos = [...eventosFuturos, ...eventosPassados];

        let reservasCount = 0;



        todosEventos.forEach(evento => {

            if (reservasPorEvento[evento.idEvento]) {

                reservasCount += reservasPorEvento[evento.idEvento].length;

            }

        });



        totalReservasUnicas = reservasCount; // Agora contamos o total de entradas de reserva



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



                if (userRole === 'HOST') {

                    const hostId = userResponse.data.id;



                    const futurosResponse = await axios.get(`/eventos/future`, {

                        headers: {

                            'Authorization': `Bearer ${token}`,

                        },

                    });

                    setEventosFuturos(futurosResponse.data);



                    const passadosResponse = await axios.get(`/eventos/past`, {

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

                }



            } catch (error) {

                console.error('Erro ao verificar role ou buscar dados:', error);

                setError('Erro ao carregar informações.');

                setIsHost(false);

                setIsClient(false);

            } finally {

                setLoading(false);

            }

        };



        verificarRoleEBuscarDados();

    }, [fetchMinhasReservas, fetchReservasPorEvento]);



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



    if (isClient) {

        return (

            <div className="minhas-reservas-container">

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

                                <p><strong>Status:</strong> {reserva.confirmado ? 'Confirmada' : 'Pendente'}</p>

                                {!reserva.confirmado && (

                                    <button

                                        onClick={() => handleConfirmarPresenca(reserva.idReserva, reserva.evento?.idEvento)}

                                        disabled={confirmandoId === reserva.idReserva}

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

            </div>

        );

    }



    return <div>Você não tem permissão para acessar esta página.</div>;

}



export default MeusEventosHost;
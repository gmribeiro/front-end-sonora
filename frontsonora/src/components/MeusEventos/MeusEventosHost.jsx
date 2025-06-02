import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// Não precisamos mais destes arquivos CSS, pois usaremos Tailwind
// import './meusEventosHost.css';
// import './dashboardCard.css';

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

    // Renderização do Loader ou Erro
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-800"></div>
                    <p className="text-lg mt-4 text-gray-700">Carregando seus eventos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 bg-gray-100 font-sans">
            <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-8 lg:p-10 border border-gray-200">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-8 pb-4 border-b-4 border-purple-700 text-center tracking-tight text-purple-900">
                    Seus Eventos como HOST
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <div className="dashboard-card bg-purple-100 text-purple-900 p-6 rounded-lg shadow-md border border-purple-200 text-center">
                        <h3 className="text-xl font-semibold mb-2">Eventos Postados</h3>
                        <p className="text-4xl font-bold">{eventosFuturos.length + eventosPassados.length}</p>
                    </div>
                    <div className="dashboard-card bg-green-100 text-green-900 p-6 rounded-lg shadow-md border border-green-200 text-center">
                        <h3 className="text-xl font-semibold mb-2">Total de Reservas</h3>
                        <p className="text-4xl font-bold">{dashboardData.totalReservas}</p>
                    </div>
                    <div className="dashboard-card bg-blue-100 text-blue-900 p-6 rounded-lg shadow-md border border-blue-200 text-center">
                        <h3 className="text-xl font-semibold mb-2">Média de Reservas</h3>
                        <p className="text-4xl font-bold">{dashboardData.mediaReservas}</p>
                    </div>
                </div>

                <section className="mb-10">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 pb-2 border-b-2 border-purple-600 text-purple-800">
                        Próximos Eventos
                    </h3>
                    {eventosFuturos.length > 0 ? (
                        <ul className="grid grid-cols-1 gap-6">
                            {eventosFuturos.map(evento => (
                                <li key={evento.idEvento} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                        <Link to={`/detalhes/${evento.idEvento}`} className="text-lg sm:text-xl font-semibold text-purple-700 hover:text-purple-900 transition-colors duration-200 mb-2 sm:mb-0">
                                            {evento.nomeEvento}
                                        </Link>
                                        <button
                                            onClick={() => handleCancelarEvento(evento.idEvento)}
                                            disabled={excluindoEventoId === evento.idEvento}
                                            className="ml-0 sm:ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                                        >
                                            {excluindoEventoId === evento.idEvento ? 'Cancelando...' : 'Cancelar Evento'}
                                        </button>
                                    </div>
                                    {mensagemExclusaoEvento.id === evento.idEvento && (
                                        <p className={`mt-2 text-sm ${mensagemExclusaoEvento.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                                            {mensagemExclusaoEvento.message}
                                        </p>
                                    )}
                                    {reservasPorEvento[evento.idEvento] && reservasPorEvento[evento.idEvento].length > 0 ? (
                                        <div className="mt-4">
                                            <p className="font-medium text-gray-700 mb-2">Reservas ({reservasPorEvento[evento.idEvento].length}):</p>
                                            <ul className="reservas-lista bg-gray-50 p-3 rounded-md border border-gray-200 max-h-48 overflow-y-auto">
                                                {reservasPorEvento[evento.idEvento].map(reserva => (
                                                    <li key={reserva.idReserva} className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mb-1">
                                                        <span className="mr-2">Código da Reserva:</span>
                                                        <Link to={`/reservas/${reserva.idReserva}`} className="text-blue-600 hover:underline">
                                                            {reserva.idReserva}
                                                        </Link>
                                                        <span className="ml-0 sm:ml-4">- Usuário: {reserva.usuario?.name || 'Nome não disponível'}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-gray-500 italic">Nenhuma reserva para este evento.</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 p-4 bg-gray-50 rounded-md shadow-inner">Nenhum evento futuro publicado.</p>
                    )}
                </section>

                <section>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 pb-2 border-b-2 border-purple-600 text-purple-800">
                        Eventos Passados
                    </h3>
                    {eventosPassados.length > 0 ? (
                        <ul className="grid grid-cols-1 gap-6">
                            {eventosPassados.map(evento => (
                                <li key={evento.idEvento} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                        <Link to={`/detalhes/${evento.idEvento}`} className="text-lg sm:text-xl font-semibold text-purple-700 hover:text-purple-900 transition-colors duration-200 mb-2 sm:mb-0">
                                            {evento.nomeEvento}
                                        </Link>
                                    </div>
                                    {reservasPorEvento[evento.idEvento] && reservasPorEvento[evento.idEvento].length > 0 ? (
                                        <div className="mt-4">
                                            <p className="font-medium text-gray-700 mb-2">Reservas ({reservasPorEvento[evento.idEvento].length}):</p>
                                            <ul className="reservas-lista bg-gray-50 p-3 rounded-md border border-gray-200 max-h-48 overflow-y-auto">
                                                {reservasPorEvento[evento.idEvento].map(reserva => (
                                                    <li key={reserva.idReserva} className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mb-1">
                                                        <span className="mr-2">ID da Reserva:</span>
                                                        <Link to={`/reservas/${reserva.idReserva}`} className="text-blue-600 hover:underline">
                                                            {reserva.idReserva}
                                                        </Link>
                                                        <span className="ml-0 sm:ml-4">- Usuário: {reserva.usuario?.name || 'Nome não disponível'}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-gray-500 italic">Nenhuma reserva para este evento.</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 p-4 bg-gray-50 rounded-md shadow-inner">Nenhum evento passado publicado.</p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default MeusEventos;
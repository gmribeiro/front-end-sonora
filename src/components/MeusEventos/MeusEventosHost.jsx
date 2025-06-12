import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';

// Definição das cores
const COLORS = {
    primary: '#55286B', // Roxo escuro
    secondary: '#8B44A9', // Roxo médio, menos saturado
    background: '#f8f2f8', // Roxo muito pálido/quase branco
    borderLight: '#e0e0e0', // Cinza claro para bordas e fundos
    textDark: '#333333', // Texto escuro
    textMedium: '#666666', // Texto médio
    success: '#4CAF50', // Verde padrão para sucesso
    warning: '#FFC107', // Amarelo padrão para alerta/pendente
    danger: '#EF4444', // Vermelho padrão para perigo/cancelar
};

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
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Token de autenticação não encontrado.');
            return;
        }

        const promises = eventosParaBuscarReservas.map(async (evento) => {
            try {
                const reservasResponse = await api.get(`/reservas/evento/${evento.idEvento}`, {
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
        if (!token) {
            setMensagemExclusaoEvento({
                id: eventId,
                message: "Erro: Token de autenticação não encontrado.",
                type: 'error'
            });
            setExcluindoEventoId(null);
            setTimeout(() => setMensagemExclusaoEvento({ id: null, message: '', type: '' }), 5000);
            return;
        }

        try {
            const response = await api.delete(`/eventos/${eventId}`, {
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
                if (!token) {
                    setError('Você precisa estar logado para ver seus eventos.');
                    setLoading(false);
                    return;
                }

                const userResponse = await api.get('/auth/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const hostId = userResponse.data.id;

                const futurosResponse = await api.get(`/eventos/host/${hostId}/future`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setEventosFuturos(futurosResponse.data);

                const passadosResponse = await api.get(`/eventos/host/${hostId}/past`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setEventosPassados(passadosResponse.data);

                const todosOsEventosDoHost = [...futurosResponse.data, ...passadosResponse.data];
                await fetchReservasPorEvento(todosOsEventosDoHost);
            } catch (error) {
                console.error('Erro ao carregar eventos:', error);
                setError('Erro ao carregar seus eventos. Por favor, tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchMeusEventos();
    }, [fetchReservasPorEvento]); // Dependência adicionada para useCallback

    useEffect(() => {
        if (!loading) {
            calcularDadosDashboard();
        }
    }, [loading, eventosFuturos, eventosPassados, reservasPorEvento, calcularDadosDashboard]);

    // Renderização do Loader ou Erro
    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat font-['Poppins',_sans-serif]"
                style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2" style={{ borderColor: COLORS.primary, borderBottomColor: COLORS.secondary }} ></div>
                    <p className="text-lg mt-4" style={{ color: COLORS.textMedium }}>Carregando seus eventos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat font-['Poppins',_sans-serif]"
                style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
            >
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 font-sans flex items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
        >
            {/* O ajuste foi feito aqui: 'max-w-7xl' foi removido e 'w-full' adicionado */}
            <div className="mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-8 lg:p-10 border w-full" style={{ borderColor: COLORS.borderLight }}>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-8 pb-4 border-b-4 text-center tracking-tight" style={{ color: COLORS.primary, borderColor: COLORS.secondary }}>
                    Seus Eventos como HOST
                </h2>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <div className="dashboard-card p-6 rounded-lg shadow-md border text-center" style={{ backgroundColor: `${COLORS.primary}1A`, borderColor: COLORS.primary, color: COLORS.primary }}>
                        <h3 className="text-xl font-semibold mb-2">Eventos Postados</h3>
                        <p className="text-4xl font-bold">{eventosFuturos.length + eventosPassados.length}</p>
                    </div>
                    <div className="dashboard-card p-6 rounded-lg shadow-md border text-center" style={{ backgroundColor: `${COLORS.success}1A`, borderColor: COLORS.success, color: COLORS.success }}>
                        <h3 className="text-xl font-semibold mb-2">Total de Reservas</h3>
                        <p className="text-4xl font-bold">{dashboardData.totalReservas}</p>
                    </div>
                    <div className="dashboard-card p-6 rounded-lg shadow-md border text-center" style={{ backgroundColor: `${COLORS.secondary}1A`, borderColor: COLORS.secondary, color: COLORS.secondary }}>
                        <h3 className="text-xl font-semibold mb-2">Média de Reservas</h3>
                        <p className="text-4xl font-bold">{dashboardData.mediaReservas}</p>
                    </div>
                </div>

                {/* Seção de Próximos Eventos */}
                <section className="mb-10">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 pb-2 border-b-2" style={{ color: COLORS.primary, borderColor: COLORS.secondary }}>
                        Próximos Eventos
                    </h3>
                    {eventosFuturos.length > 0 ? (
                        <ul className="grid grid-cols-1 gap-6">
                            {eventosFuturos.map(evento => (
                                <li key={evento.idEvento} className="bg-white p-5 rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-300" style={{ borderColor: COLORS.borderLight }}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                        <Link to={`/detalhes/${evento.idEvento}`} className="text-lg sm:text-xl font-semibold hover:underline mb-2 sm:mb-0" style={{ color: COLORS.primary }}>
                                            {evento.nomeEvento}
                                        </Link>
                                        <button
                                            onClick={() => handleCancelarEvento(evento.idEvento)}
                                            disabled={excluindoEventoId === evento.idEvento}
                                            className="ml-0 sm:ml-4 px-4 py-2 text-white rounded-md hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                                            style={{ backgroundColor: COLORS.danger, color: 'white' }}
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
                                            <p className="font-medium mb-2" style={{ color: COLORS.textDark }}>Reservas ({reservasPorEvento[evento.idEvento].length}):</p>
                                            <ul className="bg-gray-50 p-3 rounded-md border max-h-48 overflow-y-auto" style={{ borderColor: COLORS.borderLight }}>
                                                {reservasPorEvento[evento.idEvento].map(reserva => (
                                                    <li key={reserva.idReserva} className="flex flex-col sm:flex-row sm:items-center text-sm mb-1" style={{ color: COLORS.textMedium }}>
                                                        <span className="mr-2">Código da Reserva:</span>
                                                        <Link to={`/reservas/${reserva.idReserva}`} className="hover:underline" style={{ color: COLORS.secondary }}>
                                                            {reserva.idReserva}
                                                        </Link>
                                                        <span className="ml-0 sm:ml-4">- Usuário: {reserva.usuario?.name || 'Nome não disponível'}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="mt-4 italic" style={{ color: COLORS.textMedium }}>Nenhuma reserva para este evento.</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-4 rounded-md shadow-inner italic" style={{ color: COLORS.textMedium, backgroundColor: COLORS.background }}>Nenhum evento futuro publicado.</p>
                    )}
                </section>

                {/* Seção de Eventos Passados */}
                <section>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 pb-2 border-b-2" style={{ color: COLORS.primary, borderColor: COLORS.secondary }}>
                        Eventos Passados
                    </h3>
                    {eventosPassados.length > 0 ? (
                        <ul className="grid grid-cols-1 gap-6">
                            {eventosPassados.map(evento => (
                                <li key={evento.idEvento} className="bg-white p-5 rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-300" style={{ borderColor: COLORS.borderLight }}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                        <Link to={`/detalhes/${evento.idEvento}`} className="text-lg sm:text-xl font-semibold hover:underline mb-2 sm:mb-0" style={{ color: COLORS.primary }}>
                                            {evento.nomeEvento}
                                        </Link>
                                    </div>
                                    {reservasPorEvento[evento.idEvento] && reservasPorEvento[evento.idEvento].length > 0 ? (
                                        <div className="mt-4">
                                            <p className="font-medium mb-2" style={{ color: COLORS.textDark }}>Reservas ({reservasPorEvento[evento.idEvento].length}):</p>
                                            <ul className="bg-gray-50 p-3 rounded-md border max-h-48 overflow-y-auto" style={{ borderColor: COLORS.borderLight }}>
                                                {reservasPorEvento[evento.idEvento].map(reserva => (
                                                    <li key={reserva.idReserva} className="flex flex-col sm:flex-row sm:items-center text-sm mb-1" style={{ color: COLORS.textMedium }}>
                                                        <span className="mr-2">ID da Reserva:</span>
                                                        <Link to={`/reservas/${reserva.idReserva}`} className="hover:underline" style={{ color: COLORS.secondary }}>
                                                            {reserva.idReserva}
                                                        </Link>
                                                        <span className="ml-0 sm:ml-4">- Usuário: {reserva.usuario?.name || 'Nome não disponível'}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="mt-4 italic" style={{ color: COLORS.textMedium }}>Nenhuma reserva para este evento.</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-4 rounded-md shadow-inner italic" style={{ color: COLORS.textMedium, backgroundColor: COLORS.background }}>Nenhum evento passado publicado.</p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default MeusEventos;
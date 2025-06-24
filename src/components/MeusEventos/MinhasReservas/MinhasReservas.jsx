import { useState, useEffect, useCallback } from 'react';
import api from '../../../api';
import { Link } from 'react-router-dom';

// Definição das novas cores
const COLORS = {
    primary: '#55286B', // Roxo escuro (novo)
    secondary: '#8B44A9', // Roxo médio, menos saturado (novo)
    background: '#f8f2f8', // Roxo muito pálido/quase branco (mantido)
    borderLight: '#e0e0e0', // Cinza claro para bordas e fundos (mantido)
    textDark: '#333333', // Texto escuro (mantido)
    textMedium: '#666666', // Texto médio (mantido)
    success: '#4CAF50', // Verde padrão para sucesso (mantido)
    warning: '#FFC107', // Amarelo padrão para alerta/pendente (mantido)
    danger: '#EF4444', // Vermelho padrão para perigo/cancelar (mantido)
};

function MinhasReservas() {
    // Estados para gerenciar os dados e o UI
    const [minhasReservas, setMinhasReservas] = useState([]); // Reservas pendentes de eventos futuros/atuais
    const [minhasReservasConfirmadas, setMinhasReservasConfirmadas] = useState([]); // Reservas confirmadas de eventos futuros/atuais
    const [historicoReservas, setHistoricoReservas] = useState([]); // Reservas confirmadas de eventos passados
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmandoId, setConfirmandoId] = useState(null);
    const [mensagemConfirmacao, setMensagemConfirmacao] = useState("");
    const [cancelandoId, setCancelandoId] = useState(null);
    const [mensagemCancelamento, setMensagemCancelamento] = useState("");
    const [usuarioLogadoId, setUsuarioLogadoId] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [reservationToCancel, setReservationToCancel] = useState(null);

    // Para armazenar IDs de todas as reservas confirmadas (passadas e futuras) para checagem rápida
    const [confirmedReservationIds, setConfirmedReservationIds] = useState(new Set());

    /**
     * Formata uma string de data e hora para o formato "DD/MM/AAAA HH:MM".
     * @param {string} dateTimeString - A string de data e hora no formato "DD/MM/AAAA HH:MM:SS".
     * @returns {string} A data e hora formatada ou "Não disponível" em caso de erro.
     */
    const formatDateTime = useCallback((dateTimeString) => {
        if (!dateTimeString) return 'Não disponível';

        try {
            const [datePart, timePart] = dateTimeString.split(' ');
            const [day, month, year] = datePart.split('/');

            // Cria um objeto Date no fuso horário local
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day),
                parseInt(timePart.split(':')[0]), parseInt(timePart.split(':')[1]));

            if (isNaN(date.getTime())) {
                throw new Error('Data de entrada inválida');
            }

            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };

            return new Intl.DateTimeFormat('pt-BR', options).format(date);

        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return 'Data/Hora inválida';
        }
    }, []);

    /**
     * Verifica se a data e hora do evento já passaram.
     * Assume que dateTimeString está no formato "DD/MM/AAAA HH:MM:SS".
     * @param {string} dateTimeString - A string de data e hora do evento.
     * @returns {boolean} True se a data do evento for anterior à data/hora atual, False caso contrário.
     */
    const isEventInPast = useCallback((dateTimeString) => {
        if (!dateTimeString) return true; // Trata datas inválidas como passadas

        try {
            const [datePart, timePart] = dateTimeString.split(' ');
            const [day, month, year] = datePart.split('/');
            const [hours, minutes, seconds] = timePart.split(':');

            // Cria um objeto Date no fuso horário local
            const eventDate = new Date(
                parseInt(year),
                parseInt(month) - 1, // Mês é baseado em 0 (jan=0, dez=11)
                parseInt(day),
                parseInt(hours),
                parseInt(minutes),
                parseInt(seconds)
            );

            const now = new Date(); // Data e hora atual

            return eventDate < now;
        } catch (error) {
            console.error('Erro ao verificar se o evento está no passado:', error);
            return true; // Em caso de erro na data, considera como passado
        }
    }, []);

    /**
     * Função auxiliar para obter o token de autorização.
     * @returns {string|null} O token de autorização ou null se não encontrado.
     */
    const getAuthToken = () => localStorage.getItem('token');

    // Funções de busca de dados
    const fetchMinhasReservas = useCallback(async (userId, token) => {
        try {
            const response = await api.get(`/reservas/usuario/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Filtra as reservas pendentes para não mostrar eventos passados
            const futurasPendentes = response.data.filter(reserva => !isEventInPast(reserva.evento?.dataHora));
            setMinhasReservas(futurasPendentes);
        } catch (err) {
            console.error('Erro ao carregar minhas reservas:', err);
            setError('Erro ao carregar suas reservas pendentes.');
        }
    }, [isEventInPast]);

    const fetchMinhasReservasConfirmadas = useCallback(async (userId, token) => {
        try {
            const response = await api.get(`/reservas/usuario/${userId}/confirmadas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const allConfirmed = Array.isArray(response.data) ? response.data : [];

            // Filtra: Apenas reservas confirmadas de eventos futuros/atuais
            const futurasConfirmadas = allConfirmed.filter(reserva => !isEventInPast(reserva.evento?.dataHora));
            setMinhasReservasConfirmadas(futurasConfirmadas);

            // Atualiza o Set de IDs confirmados com TODAS as confirmadas para `handleConfirmarPresenca`
            setConfirmedReservationIds(new Set(allConfirmed.map(res => res.idReserva)));

        } catch (err) {
            console.error('Erro ao carregar minhas reservas confirmadas:', err);
            setError('Erro ao carregar suas reservas confirmadas.');
        }
    }, [isEventInPast]);

    const fetchHistoricoReservas = useCallback(async (userId, token) => {
        try {
            // Este endpoint `/reservas/user/${userId}/confirmed/past` é ideal se seu backend já retorna
            // apenas as reservas confirmadas de eventos passados.
            const response = await api.get(`/reservas/user/${userId}/confirmed/past`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHistoricoReservas(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Erro ao carregar histórico de reservas:', err);
            setError('Erro ao carregar seu histórico de reservas.');
        }
    }, []);

    // Efeito para carregar os dados iniciais
    useEffect(() => {
        const carregarReservasCliente = async () => {
            setLoading(true);
            setError("");

            try {
                const token = getAuthToken();
                if (!token) {
                    setError('Token de autenticação não encontrado. Por favor, faça login novamente.');
                    setLoading(false);
                    return;
                }

                const userResponse = await api.get('/auth/user/me', { headers: { 'Authorization': `Bearer ${token}` } });
                const userId = userResponse.data.id;
                setUsuarioLogadoId(userId);

                // Carrega todas as reservas em paralelo
                await Promise.all([
                    fetchMinhasReservas(userId, token),
                    fetchMinhasReservasConfirmadas(userId, token),
                    fetchHistoricoReservas(userId, token),
                ]);

            } catch (err) {
                console.error('Erro ao carregar dados do cliente:', err);
                setError('Erro ao carregar informações.');
            } finally {
                setLoading(false);
            }
        };

        carregarReservasCliente();
    }, [fetchMinhasReservas, fetchMinhasReservasConfirmadas, fetchHistoricoReservas]);

    /**
     * Lida com a confirmação de presença de uma reserva.
     * @param {string} reservaId - O ID da reserva a ser confirmada.
     * @param {string} reservaEventoId - O ID do evento associado à reserva.
     */
    const handleConfirmarPresenca = async (reservaId, reservaEventoId) => {
        // Checa se a reserva já está confirmada antes de tentar confirmar
        if (confirmedReservationIds.has(reservaId)) {
            setMensagemConfirmacao('Esta reserva já está confirmada.');
            setTimeout(() => setMensagemConfirmacao(""), 3000);
            return;
        }

        setConfirmandoId(reservaId);
        setMensagemConfirmacao("");

        const token = getAuthToken();
        try {
            const response = await api.put(`/reservas/${reservaId}`, {
                confirmado: true,
                usuario: { id: usuarioLogadoId },
                evento: { idEvento: reservaEventoId }
            }, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                // Remove a reserva da lista de pendentes
                setMinhasReservas(prevReservas => prevReservas.filter(r => r.idReserva !== reservaId));

                // Recarrega as confirmadas e o histórico para garantir a consistência
                // e para que a reserva recém-confirmada apareça na lista correta (futuras vs. passado)
                await fetchMinhasReservasConfirmadas(usuarioLogadoId, token);
                await fetchHistoricoReservas(usuarioLogadoId, token); // Importante recarregar histórico para pegar eventos passados

                setMensagemConfirmacao('Presença confirmada!');
            } else {
                setMensagemConfirmacao('Erro ao confirmar presença.');
            }
        } catch (err) {
            console.error('Erro ao confirmar presença:', err);
            setMensagemConfirmacao(`Erro ao confirmar presença: ${err.response?.data?.message || err.message}`);
        } finally {
            setTimeout(() => {
                setConfirmandoId(null);
                setMensagemConfirmacao("");
            }, 3000);
        }
    };

    /**
     * Abre o modal de confirmação de cancelamento.
     * @param {object} reserva - O objeto de reserva a ser cancelado.
     */
    const handleAbrirModalCancelar = (reserva) => {
        setReservationToCancel(reserva);
        setShowCancelModal(true);
    };

    /**
     * Lida com a confirmação do cancelamento da reserva no modal.
     */
    const handleCancelarReservaConfirmacao = async () => {
        if (!reservationToCancel) return;

        setCancelandoId(reservationToCancel.idReserva);
        setMensagemCancelamento("");
        setShowCancelModal(false); // Fechar o modal

        const token = getAuthToken();
        try {
            const response = await api.delete(`/reservas/${reservationToCancel.idReserva}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 204) {
                // Remove a reserva de todas as listas onde ela possa estar
                setMinhasReservas(prevReservas => prevReservas.filter(r => r.idReserva !== reservationToCancel.idReserva));
                setMinhasReservasConfirmadas(prevReservas => prevReservas.filter(r => r.idReserva !== reservationToCancel.idReserva));
                setHistoricoReservas(prevReservas => prevReservas.filter(r => r.idReserva !== reservationToCancel.idReserva)); // Também remove do histórico

                // Remove o ID da reserva do Set de IDs confirmados
                setConfirmedReservationIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(reservationToCancel.idReserva);
                    return newSet;
                });

                setMensagemCancelamento('Reserva cancelada com sucesso!');
            } else {
                setMensagemCancelamento('Erro ao cancelar reserva.');
            }
        } catch (err) {
            console.error('Erro ao cancelar reserva:', err);
            setMensagemCancelamento(`Erro ao cancelar reserva: ${err.response?.data?.message || err.message}`);
        } finally {
            setTimeout(() => {
                setCancelandoId(null);
                setMensagemCancelamento("");
                setReservationToCancel(null);
            }, 3000);
        }
    };

    /**
     * Aborta o cancelamento da reserva (fecha o modal).
     */
    const handleCancelarReservaAbortar = () => {
        setShowCancelModal(false);
        setReservationToCancel(null);
    };

    // Componente de Loading
    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat font-['Poppins',_sans-serif]"
                style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2" style={{
                        borderColor: COLORS.primary, borderBottomColor: COLORS.secondary
                    }}></div>
                    <p className="text-lg mt-4" style={{ color: COLORS.textMedium }}>Carregando suas reservas...</p>
                </div>
            </div>
        );
    }

    // Componente de Erro
    if (error) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat font-['Poppins',_sans-serif]"
                style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
            >
                <div className="bg-red-100 border !border-red-400 !text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            </div>
        );
    }

    // Renderização principal do componente
    return (
        <div
            className="min-h-screen p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 font-sans flex items-center justify-center bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
        >
            <div className="max-w-7xl mx-auto !bg-white shadow-xl rounded-lg p-6 sm:p-8 lg:p-10 border w-full" style={{ borderColor: COLORS.borderLight }}>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 pb-4 border-b-4 text-center tracking-tight" style={{ color: COLORS.primary, borderColor: COLORS.secondary }}>
                    Minhas Reservas
                </h2>

                {/* Seção de Reservas Pendentes */}
                <section className="mb-10">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-6 pb-2 border-b-2" style={{
                        color: COLORS.primary, borderColor: COLORS.secondary
                    }}>
                        Reservas Pendentes de Confirmação
                    </h3>
                    {minhasReservas.length === 0 ? (
                        <p className="text-base sm:text-lg italic p-4 rounded-lg shadow-inner"
                           style={{ color: COLORS.textMedium, backgroundColor: COLORS.background }}>
                            Você não possui reservas aguardando confirmação.
                        </p>
                    ) : (
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {minhasReservas.map(reserva => {
                                // Checa se a reserva já está confirmada
                                const isConfirmed = confirmedReservationIds.has(reserva.idReserva);
                                return (
                                    <li key={reserva.idReserva || Math.random()} className="!bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col border" style={{ borderColor: COLORS.warning }}>
                                        {reserva.evento?.imageUrl && (
                                            <img
                                                src={reserva.evento.imageUrl}
                                                alt={`Imagem do evento ${reserva.evento.nomeEvento}`}
                                                className="w-full h-40 object-cover rounded-t-xl"
                                                onError={(e) => {
                                                    e.target.onerror = null; e.target.src =
                                                        'https://placehold.co/400x200/e0e0e0/808080?text=Imagem+Nao+Disponivel';
                                                }}
                                            />
                                        )}
                                        <div className="p-5 flex-grow">
                                            <h4 className="text-xl font-semibold mb-2 leading-tight"
                                                style={{ color: COLORS.primary }}>
                                                {reserva.evento?.nomeEvento || 'Evento Desconhecido'}
                                            </h4>
                                            <p className="text-sm mb-1" style={{ color: COLORS.textMedium }}>
                                                <strong className="font-medium" style={{ color: COLORS.primary }}>Data e Hora:</strong>{' '}
                                                {reserva.evento?.dataHora ? formatDateTime(reserva.evento.dataHora) : 'Não disponível'}
                                            </p>
                                            <p className="text-sm mb-2" style={{ color: COLORS.textMedium }}>
                                                <strong className="font-medium" style={{ color: COLORS.primary }}>Local:</strong>{' '}
                                                {reserva.evento?.localEvento?.local || 'Não disponível'}
                                            </p>
                                            <p className="text-sm font-semibold mt-2" style={{ color: COLORS.warning }}>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.warning}1A`, color: COLORS.warning }}>
                                                    <svg className="-ml-0.5 mr-1.5 h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
                                                        <circle cx="4" cy="4" r="3" />
                                                    </svg>
                                                    Pendente
                                                </span>
                                            </p>
                                        </div>
                                        <div className="p-4 border-t flex flex-col space-y-2" style={{
                                            borderColor: COLORS.borderLight, backgroundColor: COLORS.background
                                        }}>
                                            <button
                                                onClick={() => handleConfirmarPresenca(reserva.idReserva, reserva.evento?.idEvento)}
                                                disabled={confirmandoId === reserva.idReserva || cancelandoId === reserva.idReserva || isConfirmed} // Desabilita se já confirmada
                                                className="w-full !text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                                style={{ backgroundColor: COLORS.secondary, color: 'white', borderColor: COLORS.secondary, '--focus-ring-color': COLORS.secondary }}
                                            >
                                                {confirmandoId === reserva.idReserva ? 'Confirmando...' : (isConfirmed ? 'Já Confirmada' : 'Confirmar Presença')}
                                            </button>
                                            {mensagemConfirmacao && confirmandoId === reserva.idReserva && (
                                                <p className="text-center mt-2 text-sm animate-fade-in"
                                                   style={{ color: COLORS.success }}>{mensagemConfirmacao}</p>
                                            )}
                                            {isConfirmed && ( // Mensagem extra se já confirmada
                                                <p className="text-center mt-2 text-sm italic" style={{ color: COLORS.textMedium }}>
                                                    Esta reserva já foi confirmada.
                                                </p>
                                            )}
                                            <Link to={`/detalhes/${reserva.evento?.idEvento}`} className="block mt-2">
                                                <button className="w-full text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base"
                                                        style={{ backgroundColor: COLORS.primary, color: 'white', borderColor: COLORS.primary, '--focus-ring-color': COLORS.primary }}>
                                                    Ver Detalhes do Evento
                                                </button>
                                            </Link>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                {/* Seção de Reservas Confirmadas (Eventos Futuros/Atuais) */}
                <section className="mb-10">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-6 pb-2 border-b-2" style={{
                        color: COLORS.primary, borderColor: COLORS.secondary
                    }}>
                        Suas Reservas Confirmadas (Próximos Eventos)
                    </h3>
                    {minhasReservasConfirmadas.length === 0 ? (
                        <p className="text-base sm:text-lg italic p-4 rounded-lg shadow-inner"
                           style={{ color: COLORS.textMedium, backgroundColor: COLORS.background }}>
                            Você não possui reservas confirmadas para eventos futuros ou atuais.
                        </p>
                    ) : (
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {minhasReservasConfirmadas.map(reserva => (
                                <li key={reserva.idReserva || Math.random()} className="!bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col border" style={{ borderColor: COLORS.success }}>
                                    {reserva.evento?.imageUrl && (
                                        <img
                                            src={reserva.evento.imageUrl}
                                            alt={`Imagem do evento ${reserva.evento.nomeEvento}`}
                                            className="w-full h-40 object-cover rounded-t-xl"
                                            onError={(e) => {
                                                e.target.onerror = null; e.target.src =
                                                    'https://placehold.co/400x200/e0e0e0/808080?text=Imagem+Nao+Disponivel';
                                            }}
                                        />
                                    )}
                                    <div className="p-5 flex-grow">
                                        <h4 className="text-xl font-semibold mb-2 leading-tight" style={{
                                            color: COLORS.primary
                                        }}>
                                            {reserva.evento?.nomeEvento || 'Evento Desconhecido'}
                                        </h4>
                                        <p className="text-sm mb-1" style={{ color: COLORS.textMedium }}>
                                            <strong className="font-medium" style={{ color: COLORS.primary }}>Data e Hora:</strong>{' '}
                                            {reserva.evento?.dataHora ? formatDateTime(reserva.evento.dataHora) : 'Não disponível'}
                                        </p>
                                        <p className="text-sm mb-2" style={{ color: COLORS.textMedium }}>
                                            <strong className="font-medium" style={{ color: COLORS.primary }}>Local:</strong>{' '}
                                            {reserva.evento?.localEvento?.local || 'Não disponível'}
                                        </p>
                                        <p className="text-sm font-semibold mt-2" style={{ color: COLORS.success }}>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.success}1A`, color: COLORS.success }}>
                                                <svg className="-ml-0.5 mr-1.5 h-2 w-2" fill="currentColor" viewBox="0 0 8 8">
                                                    <circle cx="4" cy="4" r="3" />
                                                </svg>
                                                Confirmada
                                            </span>
                                        </p>
                                    </div>
                                    <div className="p-4 border-t flex flex-col space-y-2" style={{
                                        borderColor: COLORS.borderLight, backgroundColor: COLORS.background
                                    }}>
                                        <button
                                            onClick={() => alert('Funcionalidade de confirmação por e-mail a ser implementada.')}
                                            className="w-full sm:w-auto flex-1 !text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base"
                                            style={{ backgroundColor: COLORS.primary, color: 'white', borderColor: COLORS.primary, '--focus-ring-color': COLORS.primary }}
                                        >
                                            Confirmação no Email
                                        </button>
                                        <button
                                            onClick={() => handleAbrirModalCancelar(reserva)}
                                            disabled={cancelandoId === reserva.idReserva || confirmandoId === reserva.idReserva}
                                            className="w-full sm:w-auto flex-1 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                            style={{ backgroundColor: COLORS.danger, color: 'white', borderColor: COLORS.danger, '--focus-ring-color': COLORS.danger }}
                                        >
                                            {cancelandoId === reserva.idReserva ? 'Cancelando...' : 'Cancelar Reserva'}
                                        </button>
                                    </div>
                                    {mensagemCancelamento && cancelandoId === reserva.idReserva && (
                                        <p className="text-center mt-2 text-sm animate-fade-in p-2"
                                           style={{ color: COLORS.danger }}>{mensagemCancelamento}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Seção de Histórico de Eventos Concluídos */}
                <section>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-6 pb-2 border-b-2" style={{
                        color: COLORS.primary, borderColor: COLORS.secondary
                    }}>
                        Histórico de Eventos Concluídos
                    </h3>
                    {historicoReservas.length === 0 ? (
                        <p className="text-base sm:text-lg italic p-4 rounded-lg shadow-inner"
                           style={{ color: COLORS.textMedium, backgroundColor: COLORS.background }}>
                            Você não possui histórico de eventos concluídos.
                        </p>
                    ) : (
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {historicoReservas.map(reserva => (
                                <li key={reserva.idReserva || Math.random()} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col border"
                                    style={{ borderColor: COLORS.borderLight }}>
                                    {reserva.evento?.imageUrl && (
                                        <img
                                            src={reserva.evento.imageUrl}
                                            alt={`Imagem do evento ${reserva.evento.nomeEvento}`}
                                            className="w-full h-40 object-cover rounded-t-xl"
                                            onError={(e) => {
                                                e.target.onerror = null; e.target.src =
                                                    'https://placehold.co/400x200/e0e0e0/808080?text=Imagem+Nao+Disponivel';
                                            }}
                                        />
                                    )}
                                    <div className="p-5 flex-grow">
                                        <h4 className="text-xl font-semibold mb-2 leading-tight" style={{
                                            color: COLORS.primary
                                        }}>
                                            {reserva.evento?.nomeEvento || 'Evento Desconhecido'}
                                        </h4>
                                        <p className="text-sm mb-1" style={{ color: COLORS.textMedium }}>
                                            <strong className="font-medium" style={{ color: COLORS.primary }}>Data e Hora:</strong>{' '}
                                            {reserva.evento?.dataHora ? formatDateTime(reserva.evento.dataHora) : 'Não disponível'}
                                        </p>
                                        <p className="text-sm mb-2" style={{ color: COLORS.textMedium }}>
                                            <strong className="font-medium" style={{ color: COLORS.primary }}>Local:</strong>{' '}
                                            {reserva.evento?.localEvento?.local || 'Não disponível'}
                                        </p>
                                        <p className="text-sm font-semibold mt-2" style={{ color: COLORS.textMedium }}>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.borderLight}80`, color: COLORS.textMedium }}>
                                                Concluído
                                            </span>
                                        </p>
                                    </div>
                                    <div className="p-4 border-t flex flex-col space-y-2" style={{ // Added flex and space-y-2 here
                                        borderColor: COLORS.borderLight, backgroundColor: COLORS.background
                                    }}>
                                        <Link to="/avaliacoes" state={{ eventoId: reserva.evento?.idEvento }}>
                                            <button className="w-full text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base"
                                                    style={{ backgroundColor: COLORS.primary, color: 'white', borderColor: COLORS.primary, '--focus-ring-color': COLORS.primary }}>
                                                Avaliar Evento
                                            </button>
                                        </Link>
                                        {/* NEW: Button to view Event Details in History */}
                                        <Link to={`/detalhes/${reserva.evento?.idEvento}`} className="block mt-2">
                                            <button className="w-full text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base"
                                                    style={{ backgroundColor: COLORS.secondary, color: 'white', borderColor: COLORS.secondary, '--focus-ring-color': COLORS.secondary }}>
                                                Ver Detalhes do Evento
                                            </button>
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Modal de Confirmação de Cancelamento */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-center" style={{ borderColor: COLORS.primary }}>
                            <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.danger }}>Confirmar Cancelamento</h3>
                            <p className="mb-6 text-base" style={{ color: COLORS.textDark }}>
                                Tem certeza que deseja cancelar a reserva para o evento "
                                <span className="font-semibold">{reservationToCancel?.evento?.nomeEvento || 'Evento Desconhecido'}</span>"?
                                Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={handleCancelarReservaConfirmacao}
                                    className="px-6 py-2 rounded-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style={{ backgroundColor: COLORS.danger, color: 'white', borderColor: COLORS.danger, '--focus-ring-color': COLORS.danger }}
                                >
                                    Sim, Cancelar
                                </button>
                                <button
                                    onClick={handleCancelarReservaAbortar}
                                    className="px-6 py-2 rounded-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    style={{ backgroundColor: COLORS.secondary, color: 'white', borderColor: COLORS.secondary, '--focus-ring-color': COLORS.secondary }}
                                >
                                    Não, Manter
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MinhasReservas;
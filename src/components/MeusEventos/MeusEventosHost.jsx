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

    // --- ESTADOS PARA EDIÇÃO ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [eventoEmEdicao, setEventoEmEdicao] = useState(null); // Armazena o evento sendo editado
    const [editForm, setEditForm] = useState({ // Estados do formulário de edição
        idEvento: null,
        nomeEvento: '',
        dataHora: '',          // Formato YYYY-MM-DDTHH:MM para input datetime-local
        horaEncerramento: '',  // Formato HH:MM para input time
        descricao: '',
        classificacao: '',
        idGeneroMusical: '',
        localEvento: {
            idLocalEvento: null,
            local: '',
            cep: '',
            numero: ''
        },
    });
    const [generos, setGeneros] = useState([]); // Para o select de gêneros no formulário de edição
    const [editMessage, setEditMessage] = useState({ text: '', type: '' }); // Mensagens de sucesso/erro na edição
    const [savingEdit, setSavingEdit] = useState(false); // Estado de salvamento da edição

    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const [loggedInHostId, setLoggedInHostId] = useState(null);

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
        const todosOsEventosDoHost = [...eventosFuturos, ...eventosPassados];
        let reservasCount = 0;

        todosOsEventosDoHost.forEach(evento => {
            if (reservasPorEvento[evento.idEvento]) {
                reservasCount += reservasPorEvento[evento.idEvento].length;
            }
        });

        totalReservasUnicas = reservasCount;

        const totalEventos = todosOsEventosDoHost.length;
        const mediaReservas = totalEventos > 0 ? reservasCount / totalEventos : 0;

        setDashboardData({
            totalEventos: totalEventos,
            totalReservas: totalReservasUnicas,
            mediaReservas: mediaReservas.toFixed(2),
        });
    }, [eventosFuturos, eventosPassados, reservasPorEvento]);

    // Função para formatar data/hora do backend (DD/MM/YYYY HH:MM:SS) para input (YYYY-MM-DDTHH:MM)
    const formatDateTimeForInput = (dataHoraBackend) => {
        if (!dataHoraBackend) return '';
        const [datePart, timePart] = dataHoraBackend.split(' '); // "DD/MM/YYYY" "HH:MM:SS"
        if (!datePart || !timePart) return '';

        const [day, month, year] = datePart.split('/');
        const [hours, minutes] = timePart.split(':'); // Pegamos apenas HH:MM para o input

        // Retorna no formato YYYY-MM-DDTHH:MM que o input datetime-local espera
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Função para formatar hora de encerramento do backend (HH:MM:SS) para input (HH:MM)
    const formatTimeForInput = (horaEncerramentoBackend) => {
        if (!horaEncerramentoBackend) return '';
        const [hours, minutes] = horaEncerramentoBackend.split(':');
        return `${hours}:${minutes}`;
    };

    // Função para formatar data/hora do input (YYYY-MM-DDTHH:MM) para backend (DD/MM/YYYY HH:MM:SS)
    const formatDateTimeForBackend = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return '';

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    // Função para formatar data/hora do backend (DD/MM/YYYY HH:MM:SS) para exibição do usuário (DD/MM/AAAA hh:MM)
    const formatDateTimeForUserDisplay = (dateTimeString) => {
        if (typeof dateTimeString !== 'string' || !dateTimeString) {
            return 'Data e hora não informadas';
        }

        const parts = dateTimeString.split(' '); // Expected "DD/MM/YYYY HH:MM:SS"
        if (parts.length !== 2) {
            console.warn(`[formatDateTimeForUserDisplay] Formato inesperado: ${dateTimeString}`);
            return 'Formato de data inválido';
        }

        const [datePart, timePart] = parts;
        const [day, month, year] = datePart.split('/');
        const [hours, minutes] = timePart.split(':');

        if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes)) {
            console.warn(`[formatDateTimeForUserDisplay] Componentes numéricos inválidos: ${dateTimeString}`);
            return 'Data e hora inválidas';
        }

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };


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

    // --- FUNÇÕES DE EDIÇÃO ---
    const handleEditClick = (evento) => {
        // LOG crucial para depuração do objeto 'evento' que será editado
        console.log("[handleEditClick] Evento selecionado para edição:", evento);

        setEventoEmEdicao(evento);
        // Preenche o formulário de edição de forma defensiva
        setEditForm({
            idEvento: evento.idEvento,
            nomeEvento: evento.nomeEvento,
            dataHora: formatDateTimeForInput(evento.dataHora),
            horaEncerramento: formatTimeForInput(evento.horaEncerramento),
            descricao: evento.descricao,
            classificacao: evento.classificacao,
            idGeneroMusical: evento.generoMusical?.idGeneroMusical || '', // Optional chaining para generoMusical
            localEvento: {
                idLocalEvento: evento.localEvento?.idLocalEvento || null, // Optional chaining para idLocalEvento
                local: evento.localEvento?.local || '', // Optional chaining para local
                cep: evento.localEvento?.cep || '',     // Optional chaining para cep
                numero: evento.localEvento?.numero || '' // Optional chaining para numero
            }
        });
        setShowEditModal(true);
        setEditMessage({ text: '', type: '' });
        setSavingEdit(false);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'local' || name === 'cep' || name === 'numero') {
            setEditForm(prev => ({
                ...prev,
                localEvento: {
                    ...prev.localEvento,
                    [name]: value
                }
            }));
        } else if (name === 'idGeneroMusical') {
            setEditForm(prev => ({
                ...prev,
                idGeneroMusical: value
            }));
        } else {
            setEditForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSavingEdit(true);
        setEditMessage({ text: '', type: '' });
        const token = localStorage.getItem('token');

        if (!token) {
            setEditMessage({ text: 'Erro: Token de autenticação não encontrado.', type: 'error' });
            setSavingEdit(false);
            return;
        }

        try {
            // Formatar data e hora para o backend
            const formattedDataHora = formatDateTimeForBackend(editForm.dataHora);
            let formattedHoraEncerramento = '00:00:00';
            if (editForm.horaEncerramento) {
                const [hours, minutes] = editForm.horaEncerramento.split(':');
                formattedHoraEncerramento = `${hours}:${minutes}:00`;
            }

            if (!formattedDataHora || !formattedHoraEncerramento) {
                setEditMessage({ text: 'Erro: Data ou hora de encerramento inválida. Por favor, verifique o formato.', type: 'error' });
                setSavingEdit(false);
                return;
            }

            // Lógica para atualizar/criar LocalEvento
            let updatedLocalEventoId = editForm.localEvento.idLocalEvento;
            let currentLocalEvento = editForm.localEvento;

            // Se o ID do local existir, tentar atualizar. Se falhar (e.g., ID inválido), criar um novo.
            if (updatedLocalEventoId) {
                try {
                    await api.put(`/places/${updatedLocalEventoId}`, {
                        local: currentLocalEvento.local,
                        cep: currentLocalEvento.cep,
                        numero: currentLocalEvento.numero
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                } catch (localUpdateError) {
                    console.warn("Falha ao atualizar local existente, tentando criar um novo:", localUpdateError);
                    const newPlaceResponse = await api.post('/places', {
                        local: currentLocalEvento.local,
                        cep: currentLocalEvento.cep,
                        numero: currentLocalEvento.numero
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    updatedLocalEventoId = newPlaceResponse.data.idLocalEvento;
                }
            } else {
                // Se não tem ID de local, cria um novo
                const newPlaceResponse = await api.post('/places', {
                    local: currentLocalEvento.local,
                    cep: currentLocalEvento.cep,
                    numero: currentLocalEvento.numero
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                updatedLocalEventoId = newPlaceResponse.data.idLocalEvento;
            }

            // Construir os dados para o PUT do evento
            const updatedEventData = {
                nomeEvento: editForm.nomeEvento,
                dataHora: formattedDataHora,
                horaEncerramento: formattedHoraEncerramento,
                descricao: editForm.descricao,
                classificacao: editForm.classificacao,
                generoMusical: { idGeneroMusical: editForm.idGeneroMusical },
                localEvento: { idLocalEvento: updatedLocalEventoId },
                host: { id: loggedInHostId },
                foto: eventoEmEdicao.foto,
                eventPictureContentType: eventoEmEdicao.eventPictureContentType
            };

            console.log("Dados enviados para o PUT de evento:", JSON.stringify(updatedEventData, null, 2));

            const response = await api.put(`/eventos/${editForm.idEvento}`, updatedEventData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setEditMessage({ text: 'Evento atualizado com sucesso!', type: 'success' });
                setEventosFuturos(prevEvents => prevEvents.map(e =>
                    e.idEvento === editForm.idEvento ? response.data : e
                ));
                setShowEditModal(false);
            } else {
                setEditMessage({ text: 'Erro ao atualizar evento. Tente novamente.', type: 'error' });
            }

        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            setEditMessage({ text: `Erro ao atualizar evento: ${error.response?.data?.message || error.message || 'Erro desconhecido.'}`, type: 'error' });
        } finally {
            setSavingEdit(false);
            if (showEditModal) {
                setTimeout(() => setEditMessage({ text: '', type: '' }), 5000);
            }
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
                setLoggedInHostId(hostId);

                const futurosResponse = await api.get(`/eventos/host/${hostId}/future`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                // LOG: Inspeciona a estrutura completa dos eventos futuros, incluindo localEvento
                console.log("[fetchMeusEventos] Eventos Futuros Recebidos (com localEvento):", futurosResponse.data);
                setEventosFuturos(futurosResponse.data);

                const passadosResponse = await api.get(`/eventos/host/${hostId}/past`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                // LOG: Inspeciona a estrutura completa dos eventos passados, incluindo localEvento
                console.log("[fetchMeusEventos] Eventos Passados Recebidos (com localEvento):", passadosResponse.data);
                setEventosPassados(passadosResponse.data);

                const todosOsEventosDoHost = [...futurosResponse.data, ...passadosResponse.data];
                await fetchReservasPorEvento(todosOsEventosDoHost);

                const genresResponse = await api.get('/genres');
                setGeneros(genresResponse.data);

            } catch (error) {
                console.error('Erro ao carregar eventos:', error);
                setError('Erro ao carregar seus eventos. Por favor, tente novamente.');
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
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {/* Botão de Editar Evento */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Previne o clique no link pai
                                                    handleEditClick(evento);
                                                }}
                                                className="px-4 py-2 text-white rounded-md hover:opacity-80 transition-colors duration-200 text-sm"
                                                style={{ backgroundColor: COLORS.secondary, color: 'white' }}
                                            >
                                                Editar Evento
                                            </button>
                                            {/* Botão de Cancelar Evento */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Previne o clique no link pai
                                                    handleCancelarEvento(evento.idEvento);
                                                }}
                                                disabled={excluindoEventoId === evento.idEvento}
                                                className="px-4 py-2 text-white rounded-md hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                                                style={{ backgroundColor: COLORS.danger, color: 'white' }}
                                            >
                                                {excluindoEventoId === evento.idEvento ? 'Cancelando...' : 'Cancelar Evento'}
                                            </button>
                                        </div>
                                    </div>
                                    {mensagemExclusaoEvento.id === evento.idEvento && (
                                        <p className={`mt-2 text-sm ${mensagemExclusaoEvento.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                                            {mensagemExclusaoEvento.message}
                                        </p>
                                    )}
                                    {/* Exibindo a data e hora formatadas para o usuário */}
                                    <p className="text-sm mt-2" style={{ color: COLORS.textMedium }}>
                                        Data: {formatDateTimeForUserDisplay(evento.dataHora)}
                                    </p>
                                    {/* Exibindo o local do evento diretamente na lista de próximos eventos com optional chaining */}
                                    <p className="text-sm mt-2" style={{ color: COLORS.textMedium }}>
                                        Local: {evento.localEvento?.local || 'Local não informado'}
                                    </p>
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

                {/* Seção de Eventos Passados (mantida inalterada, adicionado display de local) */}
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
                                    {/* Exibindo a data e hora formatadas para o usuário */}
                                    <p className="text-sm mt-2" style={{ color: COLORS.textMedium }}>
                                        Data: {formatDateTimeForUserDisplay(evento.dataHora)}
                                    </p>
                                    {/* Exibindo o local do evento diretamente na lista de eventos passados com optional chaining */}
                                    <p className="text-sm mt-2" style={{ color: COLORS.textMedium }}>
                                        Local: {evento.localEvento?.local || 'Local não informado'}
                                    </p>
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

            {/* --- Pop-up/Modal de Edição de Evento --- */}
            {showEditModal && eventoEmEdicao && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
                        <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: COLORS.primary }}>
                            Editar Evento: {eventoEmEdicao.nomeEvento}
                        </h3>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="edit_nomeEvento" className="block text-sm font-medium" style={{ color: COLORS.textDark }}>Nome do Evento:</label>
                                <input
                                    type="text"
                                    id="edit_nomeEvento"
                                    name="nomeEvento"
                                    value={editForm.nomeEvento}
                                    onChange={handleEditFormChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2" style={{ borderColor: COLORS.secondary }}
                                />
                            </div>

                            <div>
                                <label htmlFor="edit_dataHora" className="block text-sm font-medium" style={{ color: COLORS.textDark }}>Data e Hora:</label>
                                <input
                                    type="datetime-local"
                                    id="edit_dataHora"
                                    name="dataHora"
                                    value={editForm.dataHora}
                                    onChange={handleEditFormChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2" style={{ borderColor: COLORS.secondary }}
                                />
                            </div>

                            <div>
                                <label htmlFor="edit_horaEncerramento" className="block text-sm font-medium" style={{ color: COLORS.textDark }}>Hora de Encerramento:</label>
                                <input
                                    type="time"
                                    id="edit_horaEncerramento"
                                    name="horaEncerramento"
                                    value={editForm.horaEncerramento}
                                    onChange={handleEditFormChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2" style={{ borderColor: COLORS.secondary }}
                                />
                            </div>

                            <div>
                                <label htmlFor="edit_descricao" className="block text-sm font-medium" style={{ color: COLORS.textDark }}>Descrição:</label>
                                <textarea
                                    id="edit_descricao"
                                    name="descricao"
                                    value={editForm.descricao}
                                    onChange={handleEditFormChange}
                                    required
                                    rows="3"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2" style={{ borderColor: COLORS.secondary }}
                                />
                            </div>

                            <div>
                                <label htmlFor="edit_classificacao" className="block text-sm font-medium" style={{ color: COLORS.textDark }}>Classificação:</label>
                                <select
                                    id="edit_classificacao"
                                    name="classificacao"
                                    value={editForm.classificacao}
                                    onChange={handleEditFormChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2" style={{ borderColor: COLORS.secondary }}
                                >
                                    <option value="">Selecione uma classificação</option>
                                    <option value="Livre">Livre</option>
                                    <option value="10+">10+</option>
                                    <option value="12+">12+</option>
                                    <option value="14+">14+</option>
                                    <option value="16+">16+</option>
                                    <option value="18+">18+</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="edit_generoMusical" className="block text-sm font-medium" style={{ color: COLORS.textDark }}>Gênero Musical:</label>
                                <select
                                    id="edit_generoMusical"
                                    name="idGeneroMusical"
                                    value={editForm.idGeneroMusical}
                                    onChange={handleEditFormChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2" style={{ borderColor: COLORS.secondary }}
                                >
                                    <option value="">Selecione um gênero</option>
                                    {generos.map(genero => (
                                        <option key={genero.idGeneroMusical} value={genero.idGeneroMusical}>
                                            {genero.nomeGenero}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <h4 className="text-lg font-semibold mt-6 mb-3" style={{ color: COLORS.primary }}>
                                Detalhes do Local
                            </h4>
                            <div>
                                <label htmlFor="edit_local" className="block text-sm font-medium" style={{ color: COLORS.textDark }}>Nome do Local:</label>
                                <input
                                    type="text"
                                    id="edit_local"
                                    name="local"
                                    value={editForm.localEvento.local}
                                    onChange={handleEditFormChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2" style={{ borderColor: COLORS.secondary }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit_cep" className="block text-sm font-medium" style={{ color: COLORS.textDark }}>CEP:</label>
                                    <input
                                        type="text"
                                        id="edit_cep"
                                        name="cep"
                                        value={editForm.localEvento.cep}
                                        onChange={handleEditFormChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2" style={{ borderColor: COLORS.secondary }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit_numero" className="block text-sm font-medium" style={{ color: COLORS.textDark }}>Número:</label>
                                    <input
                                        type="text"
                                        id="edit_numero"
                                        name="numero"
                                        value={editForm.localEvento.numero}
                                        onChange={handleEditFormChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2" style={{ borderColor: COLORS.secondary }}
                                    />
                                </div>
                            </div>

                            {editMessage.text && (
                                <p className={`text-center py-2 rounded-md text-sm ${editMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {editMessage.text}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="px-6 py-2 rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: COLORS.primary, hoverBackgroundColor: COLORS.secondary }}
                                >
                                    {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MeusEventos;

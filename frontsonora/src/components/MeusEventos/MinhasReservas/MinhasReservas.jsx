import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MinhasReservas.css';

function MinhasReservas() {
    const [minhasReservas, setMinhasReservas] = useState([]);
    const [minhasReservasConfirmadas, setMinhasReservasConfirmadas] = useState([]);
    const [historicoReservas, setHistoricoReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmandoId, setConfirmandoId] = useState(null);
    const [mensagemConfirmacao, setMensagemConfirmacao] = useState('');
    const [cancelandoId, setCancelandoId] = useState(null);
    const [mensagemCancelamento, setMensagemCancelamento] = useState('');
    const [usuarioLogadoId, setUsuarioLogadoId] = useState(null);

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

    const fetchHistoricoReservas = useCallback(async (userId, token) => {
        try {
            const response = await axios.get(`/reservas/user/${userId}/confirmed/past`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHistoricoReservas(response.data);
        } catch (error) {
            console.error('Erro ao carregar histórico de reservas:', error);
            setError('Erro ao carregar seu histórico de reservas.');
        }
    }, []);

    useEffect(() => {
        const carregarReservasCliente = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const userResponse = await axios.get('/auth/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setUsuarioLogadoId(userResponse.data.id);
                fetchMinhasReservas(userResponse.data.id, token);
                fetchMinhasReservasConfirmadas(userResponse.data.id, token);
                fetchHistoricoReservas(userResponse.data.id, token);
            } catch (error) {
                console.error('Erro ao carregar dados do cliente:', error);
                setError('Erro ao carregar informações.');
            } finally {
                setLoading(false);
            }
        };

        carregarReservasCliente();
    }, [fetchMinhasReservas, fetchMinhasReservasConfirmadas, fetchHistoricoReservas]);

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

    if (loading) {
        return <div>Carregando suas reservas...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

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

            <h2 style={{ marginTop: '30px' }}>Histórico de Eventos</h2>
            {historicoReservas.length === 0 ? (
                <p>Você não possui histórico de eventos confirmados.</p>
            ) : (
                <ul className="reservas-lista">
                    {historicoReservas.map(reserva => (
                        <li key={reserva.idReserva || Math.random()} className="reserva-item">
                            <p><strong>Evento:</strong> <Link to={`/detalhes/${reserva.evento?.idEvento}`}>{reserva.evento?.nomeEvento || 'Nome não disponível'}</Link></p>
                            <p><strong>Data e Hora:</strong> {reserva.evento?.dataHora ? formatDateTime(reserva.evento.dataHora) : 'Data/Hora não disponível'}</p>
                            <p><strong>Local:</strong> {reserva.evento?.localEvento?.local || 'Local não disponível'}</p>
                            <p><strong>Status:</strong> <span className="status-concluido">Concluído</span></p>
                            <Link to="/avaliacoes" state={{ eventoId: reserva.evento?.idEvento }}>
                                <button className="avaliar-button">Avaliar Evento</button>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MinhasReservas;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './minhasreservas.css'; // Importe um arquivo CSS para estilos

const MinhasReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmandoId, setConfirmandoId] = useState(null);
    const [mensagemConfirmacao, setMensagemConfirmacao] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('/auth/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    setUsuarioLogado(response.data);
                    if (response.data.role === 'CLIENT') {
                        fetchReservas(response.data.id, token);
                    } else {
                        setLoading(false);
                    }
                })
                .catch(error => {
                    console.error('Erro ao carregar usuário:', error);
                    setError('Erro ao carregar informações do usuário.');
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const fetchReservas = async (userId, token) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/reservas/usuario/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 200) {
                setReservas(response.data);
            } else if (response.status === 404) {
                setReservas([]); // Usuário não tem reservas
            } else {
                setError('Erro ao carregar suas reservas.');
            }
            setLoading(false);
        } catch (error) {
            console.error('Erro ao carregar reservas:', error);
            setError('Erro ao carregar suas reservas.');
            setLoading(false);
        }
    };

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
                    id: usuarioLogado.id
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
                setReservas(reservas.map(reserva =>
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
        return <div className="minhas-reservas-container"><p>Carregando suas reservas...</p></div>;
    }

    if (error) {
        return <div className="minhas-reservas-container"><p className="error-message">{error}</p></div>;
    }

    if (!usuarioLogado || usuarioLogado.role !== 'CLIENT') {
        return <div className="minhas-reservas-container"><p>Você precisa ser um cliente para ver suas reservas.</p></div>;
    }

    return (
        <div className="minhas-reservas-container">
            <h2>Minhas Reservas</h2>
            {reservas.length === 0 ? (
                <p>Você ainda não fez nenhuma reserva.</p>
            ) : (
                <ul className="reservas-lista">
                    {reservas.map(reserva => (
                        <li key={reserva.idReserva || Math.random()} className="reserva-item">
                            <p><strong>Evento:</strong> {reserva.evento?.nomeEvento || 'Nome não disponível'}</p>
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
};

export default MinhasReservas;
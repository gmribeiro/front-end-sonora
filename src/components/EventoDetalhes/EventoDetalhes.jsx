import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EventoDetalhes.css';

const EventoDetalhes = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [reservando, setReservando] = useState(false);
    const [mensagemReserva, setMensagemReserva] = useState('');
    const [carregandoUsuarioReserva, setCarregandoUsuarioReserva] = useState(false);

    // State for evaluation form
    const [showAvaliacaoForm, setShowAvaliacaoForm] = useState(false);
    const [avaliacaoForm, setAvaliacaoForm] = useState({
        nota: '3',
        mensagem: ''
    });
    const [avaliacaoMessage, setAvaliacaoMessage] = useState('');

    useEffect(() => {
        const carregarDados = async () => {
            try {
                setCarregando(true);
                setErro(null);

                const [eventoResponse, usuarioResponse] = await Promise.all([
                    axios.get(`/eventos/${id}`),
                    verificarUsuarioLogado()
                ]);

                setEvento(eventoResponse.data);
                setUsuarioLogado(usuarioResponse?.data || null);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setErro(error.response?.data?.message || 'Erro ao carregar evento');
            } finally {
                setCarregando(false);
            }
        };

        const verificarUsuarioLogado = async () => {
            const token = localStorage.getItem('token');
            if (!token) return null;

            try {
                const response = await axios.get('/auth/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                console.error('Erro ao verificar usuário:', error);
                return null;
            }
        };

        carregarDados();
    }, [id]);

    const formatarDataHoraParaReserva = (dataHora) => {
        if (!dataHora) return null;
        try {
            const [data, tempo] = dataHora.split(' ');
            const [dia, mes, ano] = data.split('/');
            return `${dia}/${mes}/${ano} ${tempo}`;
        } catch (error) {
            console.error('Erro ao formatar data/hora para reserva:', error);
            return null;
        }
    };

    const handleReservar = async () => {
        if (!evento?.idEvento) {
            alert('Dados do evento incompletos');
            return;
        }

        if (!usuarioLogado?.id) {
            setCarregandoUsuarioReserva(true);
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userResponse = await axios.get('/auth/user/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setUsuarioLogado(userResponse.data);
                } catch (error) {
                    console.error('Erro ao carregar usuário para reserva:', error);
                    setMensagemReserva('Erro ao carregar informações do usuário.');
                    setCarregandoUsuarioReserva(false);
                    return;
                } finally {
                    setCarregandoUsuarioReserva(false);
                }
            } else {
                navigate('/acesso', { state: { from: `/detalhes/${id}` } });
                return;
            }
            return; // Importante: sair da função após tentar carregar o usuário
        }

        setReservando(true);
        setMensagemReserva('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/acesso', { state: { from: `/detalhes/${id}` } });
                return;
            }

            const reservaData = {
                usuario: { id: usuarioLogado.id },
                evento: {
                    idEvento: evento.idEvento,
                },
                confirmado: false
            };

            console.log('Enviando reserva:', reservaData);

            const response = await axios.post('http://localhost:8080/reservas', reservaData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setMensagemReserva(`Reserva para "${evento.nomeEvento || evento.titulo}" realizada com sucesso!`);
        } catch (error) {
            console.error('Erro ao processar reserva:', error);
            let errorMessage = 'Erro ao processar reserva';
            if (error.response?.status === 401) {
                errorMessage = 'Sessão expirada. Faça login novamente.';
                localStorage.removeItem('token');
                navigate('/acesso');
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            setMensagemReserva(errorMessage);
        } finally {
            setReservando(false);
        }
    };

    const formatarDataHora = (dataHora) => {
        if (!dataHora) return 'Data não disponível';
        try {
            const [data, tempo] = dataHora.split(' ');
            const [dia, mes, ano] = data.split('/');
            const [hora, minuto] = tempo.split(':');
            return `${dia}/${mes}/${ano} às ${hora}h${minuto}`;
        } catch {
            return dataHora;
        }
    };

    const handleAvaliarClick = () => {
        setShowAvaliacaoForm(true);
        setAvaliacaoForm({ nota: '3', mensagem: '' });
        setAvaliacaoMessage('');
    };

    const handleNotaChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value >= 1 && value <= 5) {
            setAvaliacaoForm(prev => ({ ...prev, nota: value }));
        }
    };

    const handleMensagemChange = (event) => {
        setAvaliacaoForm(prev => ({ ...prev, mensagem: event.target.value }));
    };

    const handleSubmitAvaliacao = async () => {
        if (!evento?.idEvento) {
            alert('Dados do evento incompletos para avaliação');
            return;
        }

        const token = localStorage.getItem('token');
        if (token && usuarioLogado?.role === "CLIENT" && usuarioLogado?.id) {
            try {
                await axios.post(
                    "/avaliacoes",
                    {
                        nota: parseInt(avaliacaoForm.nota),
                        mensagem: avaliacaoForm.mensagem,
                        usuarioId: usuarioLogado.id,
                        eventoId: evento.idEvento,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setAvaliacaoMessage("Avaliação enviada com sucesso!");
                setShowAvaliacaoForm(false);
                setTimeout(() => setAvaliacaoMessage(''), 3000);
            } catch (error) {
                console.error("Erro ao enviar avaliação:", error);
                setAvaliacaoMessage("Erro ao enviar avaliação.");
            }
        } else if (usuarioLogado?.role !== "CLIENT") {
            setAvaliacaoMessage("Apenas clientes podem fazer avaliações.");
        } else if (!usuarioLogado?.id) {
            setAvaliacaoMessage("Informações do usuário ausentes.");
        } else {
            setAvaliacaoMessage("Token de autenticação não encontrado.");
        }
    };

    if (carregando) {
        return <div className="carregando-container">Carregando...</div>;
    }

    if (erro) {
        return (
            <div className="erro-container">
                <p>{erro}</p>
                <button onClick={() => window.location.reload()}>Tentar novamente</button>
            </div>
        );
    }

    if (!evento) {
        return (
            <div className="sem-dados">
                <p>Evento não encontrado</p>
                <button onClick={() => navigate('/eventos')}>Voltar</button>
            </div>
        );
    }

    return (
        <div className="evento-detalhes-container">
            <div className="cabecalho">
                <button onClick={() => navigate(-1)}>&larr; Voltar</button>
                <h1>{evento.nomeEvento || evento.titulo}</h1>
            </div>

            <div className="conteudo-principal">
                <div className="detalhes-content">
                    <div className="info-section">
                        <div className="info-item">
                            <span>📅</span>
                            <div>
                                <h3>Data e Horário</h3>
                                <p>{formatarDataHora(evento.dataHora)}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <span>📍</span>
                            <div>
                                <h3>Local</h3>
                                <p>{evento.localEvento?.local || evento.local || 'Local não informado'}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <span>🎵</span>
                            <div>
                                <h3>Gênero Musical</h3>
                                <p>{evento.generoMusical?.nomeGenero || evento.genero || 'Não especificado'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="descricao-section">
                        <h3>Descrição</h3>
                        <p>{evento.descricao || 'Descrição não disponível.'}</p>
                    </div>

                    <div className="acoes-section">
                        <button
                            onClick={handleReservar}
                            disabled={reservando || carregandoUsuarioReserva}
                        >
                            {carregandoUsuarioReserva ? 'Carregando informações...' : (reservando ? 'Processando...' : 'Reservar Ingresso')}
                        </button>
                        {mensagemReserva && (
                            <p className={`mensagem-reserva ${mensagemReserva.includes('sucesso') ? 'sucesso' : 'erro'}`}>
                                {mensagemReserva}
                            </p>
                        )}
                    </div>

                    {usuarioLogado?.role === 'CLIENT' && (
                        <div className="avaliacao-container">
                            {!showAvaliacaoForm ? (
                                <button onClick={handleAvaliarClick}>Avaliar Evento</button>
                            ) : (
                                <div className="avaliacao-form">
                                    <h4>Avaliar {evento.nomeEvento || evento.titulo}</h4>
                                    <div className="form-group">
                                        <label htmlFor="nota">Nota (1-5):</label>
                                        <select
                                            id="nota"
                                            name="nota"
                                            value={avaliacaoForm.nota}
                                            onChange={handleNotaChange}
                                        >
                                            <option value="1">★</option>
                                            <option value="2">★★</option>
                                            <option value="3">★★★</option>
                                            <option value="4">★★★★</option>
                                            <option value="5">★★★★★</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="mensagem">Mensagem (opcional):</label>
                                        <textarea
                                            id="mensagem"
                                            name="mensagem"
                                            value={avaliacaoForm.mensagem}
                                            onChange={handleMensagemChange}
                                        />
                                    </div>
                                    <button onClick={handleSubmitAvaliacao}>Enviar Avaliação</button>
                                    <button onClick={() => setShowAvaliacaoForm(false)}>Cancelar</button>
                                    {avaliacaoMessage && <p className="avaliacao-message">{avaliacaoMessage}</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventoDetalhes;
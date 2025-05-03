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

    // Configuração do Axios para a API
    const api = axios.create({
        baseURL: 'http://localhost:8080',
        timeout: 5000,
    });

    useEffect(() => {
        const carregarDados = async () => {
            try {
                setCarregando(true);
                setErro(null);

                // Verifica se temos um ID válido
                if (!id) {
                    throw new Error('ID do evento não fornecido');
                }

                // Carrega evento e usuário em paralelo
                const [eventoResponse, usuarioResponse] = await Promise.all([
                    api.get(`/eventos/${id}`),
                    verificarUsuarioLogado()
                ]);

                if (!eventoResponse.data) {
                    throw new Error('Evento não encontrado');
                }

                setEvento(eventoResponse.data);
                setUsuarioLogado(usuarioResponse?.data || null);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setErro(error.response?.data?.message || error.message || 'Erro ao carregar evento');
            } finally {
                setCarregando(false);
            }
        };

        const verificarUsuarioLogado = async () => {
            const token = localStorage.getItem('token');
            if (!token) return null;

            try {
                const response = await api.get('/auth/user/me', {
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

    const handleReservar = async () => {
        if (!evento?.id) {
            alert('Dados do evento incompletos');
            return;
        }

        setReservando(true);
        setMensagemReserva('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/acesso', { state: { from: `/detalhes/${id}` } });
                return;
            }

            // Verifica se o usuário está carregado
            if (!usuarioLogado?.id) {
                const userResponse = await api.get('/auth/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUsuarioLogado(userResponse.data);
            }

            // Formata os dados para o padrão esperado pelo backend
            const reservaData = {
                usuario: { id: usuarioLogado.id },
                evento: {
                    idEvento: evento.id,
                    // Inclua outros campos necessários aqui
                },
                confirmado: false
            };

            console.log('Enviando reserva:', reservaData); // Para debug

            const response = await api.post('/reservas', reservaData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setMensagemReserva(`Reserva para "${evento.nomeEvento}" realizada com sucesso!`);
        } catch (error) {
            console.error('Erro completo:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

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
                <div className="imagem-container">
                    <img
                        src={evento.imagem || '/images/evento-default.jpg'}
                        alt={`Banner ${evento.nomeEvento}`}
                        onError={(e) => e.target.src = '/images/evento-default.jpg'}
                    />
                </div>

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
                            disabled={reservando}
                        >
                            {reservando ? 'Processando...' : 'Reservar Ingresso'}
                        </button>
                        {mensagemReserva && (
                            <p className={`mensagem-reserva ${mensagemReserva.includes('sucesso') ? 'sucesso' : 'erro'}`}>
                                {mensagemReserva}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventoDetalhes;
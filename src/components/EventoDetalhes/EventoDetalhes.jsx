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

    // Estados para avaliação
    const [mostrarFormAvaliacao, setMostrarFormAvaliacao] = useState(false);
    const [avaliacao, setAvaliacao] = useState({
        nota: 0,
        mensagem: ''
    });
    const [mensagemAvaliacao, setMensagemAvaliacao] = useState('');

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
            return `${dia}/${mes}/${ano} ${tempo}`; // Formato "dd/MM/yyyy HH:mm:ss"
        } catch (error) {
            console.error('Erro ao formatar data/hora para reserva:', error);
            return null;
        }
    };

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
                const userResponse = await axios.get('/auth/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUsuarioLogado(userResponse.data);
            }

            const dataHoraFormatadaParaBackend = formatarDataHoraParaReserva(evento.dataHora);

            const reservaData = {
                usuario: { id: usuarioLogado.id },
                evento: {
                    idEvento: evento.id,
                    nomeEvento: evento.nomeEvento,
                    dataHora: dataHoraFormatadaParaBackend,
                    descricao: evento.descricao,
                    generoMusical: evento.generoMusical,
                    localEvento: evento.localEvento
                },
                confirmado: false
            };

            console.log('Enviando reserva:', reservaData); // Para debug

            const response = await axios.post('/reservas', reservaData, {
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

    const handleAvaliarChange = (e) => {
        const { name, value } = e.target;
        setAvaliacao(prev => ({
            ...prev,
            [name]: name === 'nota' ? parseInt(value) : value
        }));
    };

    const handleSubmitAvaliacao = async (e) => {
        e.preventDefault();
        setMensagemAvaliacao('');

        try {
            const token = localStorage.getItem('token');
            if (!token || !usuarioLogado) {
                navigate('/acesso');
                return;
            }

            const avaliacaoData = {
                nota: avaliacao.nota,
                mensagem: avaliacao.mensagem,
                usuario: usuarioLogado.id, // Envia apenas o ID
                evento: evento.id // Assumindo que o backend espera id
            };

            const response = await axios.post('/avaliacoes', avaliacaoData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setMensagemAvaliacao('Avaliação enviada com sucesso!');
            setAvaliacao({ nota: 0, mensagem: '' });
            setMostrarFormAvaliacao(false);

            // Recarregar os dados do evento para atualizar as avaliações (se necessário)
            const eventoResponse = await axios.get(`/eventos/${id}`);
            setEvento(eventoResponse.data);

        } catch (error) {
            console.error('Erro ao enviar avaliação:', error);
            setMensagemAvaliacao(error.response?.data?.message || 'Erro ao enviar avaliação');
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

                    {/* Seção de Avaliação */}
                    {usuarioLogado?.role === 'CLIENT' && (
                        <div className="form-avaliacao-container">
                            {!mostrarFormAvaliacao ? (
                                <button
                                    onClick={() => setMostrarFormAvaliacao(true)}
                                    className="btn-avaliar"
                                >
                                    Avaliar este evento
                                </button>
                            ) : (
                                <form onSubmit={handleSubmitAvaliacao} className="form-avaliacao">
                                    <h4>Avaliar Evento</h4>

                                    <div className="form-group">
                                        <label>Nota (1-5):</label>
                                        <select
                                            name="nota"
                                            value={avaliacao.nota}
                                            onChange={handleAvaliarChange}
                                            required
                                        >
                                            <option value="0">Selecione uma nota</option>
                                            <option value="1">1 ★</option>
                                            <option value="2">2 ★★</option>
                                            <option value="3">3 ★★★</option>
                                            <option value="4">4 ★★★★</option>
                                            <option value="5">5 ★★★★★</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Comentário (opcional):</label>
                                        <textarea
                                            name="mensagem"
                                            value={avaliacao.mensagem}
                                            onChange={handleAvaliarChange}
                                            rows="3"
                                        />
                                    </div>

                                    <div className="form-buttons">
                                        <button type="submit" className="btn-enviar">Enviar Avaliação</button>
                                        <button
                                            type="button"
                                            onClick={() => setMostrarFormAvaliacao(false)}
                                            className="btn-cancelar"
                                        >
                                            Cancelar
                                        </button>
                                    </div>

                                    {mensagemAvaliacao && (
                                        <p className={`mensagem ${mensagemAvaliacao.includes('sucesso') ? 'sucesso' : 'erro'}`}>
                                            {mensagemAvaliacao}
                                        </p>
                                    )}
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventoDetalhes;
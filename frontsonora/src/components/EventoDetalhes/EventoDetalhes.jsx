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
    const [eventImageUrl, setEventImageUrl] = useState(null);
    const [escalasDoEvento, setEscalasDoEvento] = useState([]);
    const [carregandoEscalas, setCarregandoEscalas] = useState(false);
    const [erroEscalas, setErroEscalas] = useState(null);


    useEffect(() => {
        const carregarDados = async () => {
            try {
                setCarregando(true);
                setErro(null);

                const token = localStorage.getItem('token');

                const [eventoResponse, usuarioResponseData] = await Promise.all([
                    axios.get(`/eventos/${id}`),
                    verificarUsuarioLogado(token)
                ]);

                const eventoData = eventoResponse.data;
                setEvento(eventoData);
                setUsuarioLogado(usuarioResponseData || null);

                if (eventoData && eventoData.idEvento) {
                    try {
                        const imageResponse = await axios.get(`/eventos/${eventoData.idEvento}/image`, {
                            responseType: 'blob',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        setEventImageUrl(URL.createObjectURL(imageResponse.data));
                    } catch (imageError) {
                        console.error('Erro ao carregar imagem do evento:', imageError);
                        setEventImageUrl('/images/evento_padrao.png');
                    }
                } else {
                    setEventImageUrl('/images/evento_padrao.png');
                }

            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setErro(error.response?.data?.message || 'Erro ao carregar evento');
            } finally {
                setCarregando(false);
            }
        };

        const verificarUsuarioLogado = async (token) => {
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


    useEffect(() => {
        const fetchEscalasDoEvento = async () => {
            if (!id) return;

            setCarregandoEscalas(true);
            setErroEscalas(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setErroEscalas('Token de autenticação não encontrado para carregar escalas.');
                    setCarregandoEscalas(false);
                    return;
                }

                const response = await axios.get(`/escalas/event/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setEscalasDoEvento(response.data);
            } catch (error) {
                console.error('Erro ao carregar escalas do evento:', error);
                setErroEscalas('Erro ao carregar os artistas escalados.');
            } finally {
                setCarregandoEscalas(false);
            }
        };

        fetchEscalasDoEvento();
    }, [id]);

    const handleReservar = async () => {
        if (usuarioLogado?.role !== 'CLIENT') {
            setMensagemReserva('Apenas clientes podem fazer reservas.');
            return;
        }

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

            if (!usuarioLogado?.id) {
                setMensagemReserva('É necessário estar logado para fazer reservas.');
                return;
            }
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

    const podeReservar = usuarioLogado && usuarioLogado.role === 'CLIENT';
    const textoBotaoReserva = usuarioLogado && usuarioLogado.role !== 'CLIENT'
        ? 'Apenas clientes podem reservar'
        : (carregandoUsuarioReserva ? 'Carregando informações...' : (reservando ? 'Processando...' : 'Reservar Ingresso'));


    return (
        <div className="evento-detalhes-container">
            <div className="cabecalho">
                <button onClick={() => navigate(-1)}>&larr; Voltar</button>
                <h1>{evento.nomeEvento || evento.titulo}</h1>
            </div>

            <div className="conteudo-principal">
                {eventImageUrl && (
                    <div className="evento-imagem-detalhes">
                        <img src={eventImageUrl} alt={evento.nomeEvento || evento.titulo} />
                    </div>
                )}

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

                    <div className="escalas-section">
                        <h3>Artistas Escalados</h3>
                        {carregandoEscalas ? (
                            <p>Carregando artistas...</p>
                        ) : erroEscalas ? (
                            <p className="erro-mensagem-escalas">{erroEscalas}</p>
                        ) : escalasDoEvento.length === 0 ? (
                            <p>Nenhum artista escalado para este evento ainda.</p>
                        ) : (
                            <div className="artistas-escalados-list">
                                {escalasDoEvento.map((escala, index) => (
                                    <div key={index} className="escala-item">
                                        <h4>Gênero: {escala.idEscala?.genero?.nomeGenero || 'Não especificado'}</h4>
                                        {escala.musicos && escala.musicos.length > 0 ? (
                                            <ul>
                                                {escala.musicos.map((musico, musicoIndex) => (
                                                    <li key={`${index}-${musicoIndex}`}>
                                                        {musico.nomeArtistico || 'Nome indisponível'}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>Nenhum músico para este gênero ainda.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="descricao-section">
                        <h3>Descrição</h3>
                        <p>{evento.descricao || 'Descrição não disponível.'}</p>
                    </div>

                    <div className="acoes-section">
                        <button
                            onClick={handleReservar}
                            disabled={!podeReservar || reservando || carregandoUsuarioReserva}
                        >
                            {textoBotaoReserva}
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
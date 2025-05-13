import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Artistas.css';

const Artistas = () => {
    const [artistaIds, setArtistaIds] = useState([]);
    const [artistas, setArtistas] = useState([]);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [isLoadingArtistas, setIsLoadingArtistas] = useState(true);
    const [errorArtistas, setErrorArtistas] = useState(null);
    const [eventosHost, setEventosHost] = useState([]);
    const [isLoadingEventos, setIsLoadingEventos] = useState(true);
    const [errorEventos, setErrorEventos] = useState(null);
    const [eventoSelecionado, setEventoSelecionado] = useState('');
    const [contratandoId, setContratandoId] = useState(null);
    const [contratacaoStatus, setContratacaoStatus] = useState(null);
    const [contratacaoDetalhes, setContratacaoDetalhes] = useState({});
    const [showContratarForm, setShowContratarForm] = useState(null); // ID do artista para o qual o form está aberto

    useEffect(() => {
        const buscarArtistas = async () => {
            setIsLoadingArtistas(true);
            setErrorArtistas(null);
            try {
                const response = await axios.get('/musicos');
                if (response && response.data && Array.isArray(response.data)) {
                    setArtistas(response.data);
                    const ids = response.data.map(artista => artista.idMusico);
                    setArtistaIds(ids);
                } else {
                    setErrorArtistas('Formato de dados inválido recebido do servidor (artistas).');
                    setArtistas([]);
                    setArtistaIds([]);
                }
                setIsLoadingArtistas(false);
            } catch (error) {
                console.error('Erro ao buscar artistas:', error);
                setErrorArtistas('Erro ao carregar os artistas.');
                setIsLoadingArtistas(false);
                setArtistas([]);
                setArtistaIds([]);
            }
        };

        const buscarUsuario = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('/auth/user/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setUsuarioLogado(response.data);
                } catch (error) {
                    console.error('Erro ao buscar informações do usuário:', error);
                }
            }
        };

        const buscarEventosHost = async () => {
            setIsLoadingEventos(true);
            setErrorEventos(null);
            const token = localStorage.getItem('token');
            if (token && usuarioLogado?.role === 'HOST') {
                try {
                    const response = await axios.get(`/eventos/host/${usuarioLogado.id}`, { // Endpoint atualizado
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response && response.data && Array.isArray(response.data)) {
                        setEventosHost(response.data);
                    } else {
                        setErrorEventos('Formato de dados inválido recebido do servidor (eventos).');
                        setEventosHost([]);
                    }
                    setIsLoadingEventos(false);
                } catch (error) {
                    console.error('Erro ao buscar eventos do host:', error);
                    setErrorEventos('Erro ao carregar os seus eventos.');
                    setIsLoadingEventos(false);
                    setEventosHost([]);
                }
            } else {
                setIsLoadingEventos(false);
            }
        };

        buscarArtistas();
        buscarUsuario();
        buscarEventosHost();
    }, [usuarioLogado?.id, usuarioLogado?.role]); // Dependência no ID do usuário para refetch de eventos

    const handleContratarClick = (artistaId) => {
        if (!eventoSelecionado) {
            setContratacaoStatus({ type: 'error', message: 'Por favor, selecione um evento primeiro.' });
            setTimeout(() => setContratacaoStatus(null), 3000);
            return;
        }
        setShowContratarForm(artistaId);
        setContratacaoDetalhes({ valor: '', detalhes: '' });
    };

    const handleContratacaoDetalhesChange = (event) => {
        const { name, value } = event.target;
        setContratacaoDetalhes(prev => ({ ...prev, [name]: value }));
    };

    const confirmarContratacao = async (artistaId) => {
        if (!contratacaoDetalhes.valor) {
            setContratacaoStatus({ type: 'error', message: 'Por favor, informe o valor da contratação.' });
            setTimeout(() => setContratacaoStatus(null), 3000);
            return;
        }

        setContratandoId(artistaId);
        setContratacaoStatus({ type: 'loading', message: `Contratando o artista ${artistas.find(a => a.idMusico === artistaId)?.nomeArtistico}...` });

        try {
            const token = localStorage.getItem('token');
            const contratoResponse = await axios.post('http://localhost:8080/contratos', {
                idContrato: {
                    evento: { idEvento: parseInt(eventoSelecionado) },
                    musico: { idMusico: artistaId },
                },
                valor: parseFloat(contratacaoDetalhes.valor),
                detalhes: contratacaoDetalhes.detalhes,
                // Outros detalhes do contrato podem ser adicionados aqui, se necessário
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (contratoResponse.status === 200) {
                setContratacaoStatus({ type: 'success', message: `Artista ${artistas.find(a => a.idMusico === artistaId)?.nomeArtistico} contratado com sucesso para o evento!` });
                setShowContratarForm(null); // Fechar o formulário após a contratação

                // Enviar notificação para o artista
                const artista = artistas.find(a => a.idMusico === artistaId);
                const evento = eventosHost.find(e => e.idEvento === parseInt(eventoSelecionado));

                if (artista && evento && usuarioLogado && artista.idUsuario) {
                    console.log("ID do usuário do artista:", artista.idUsuario);
                    const notificationMessage = `O anfitrião ${usuarioLogado.nome} te contratou para o evento ${evento.nomeEvento || evento.nome}! Valor: ${contratacaoDetalhes.valor}. Detalhes: ${contratacaoDetalhes.detalhes}`;
                    await axios.post(`http://localhost:8080/notifications/user/${artista.idUsuario}`, {
                        mensagem: notificationMessage
                    }, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    console.log('Notificação enviada para o usuário do artista com ID:', artista.idUsuario);
                } else {
                    console.warn('Não foi possível enviar a notificação: informações do artista, evento ou anfitrião incompletas ou ID do usuário do artista ausente.');
                }
            } else {
                setContratacaoStatus({ type: 'error', message: `Erro ao contratar o artista ${artistas.find(a => a.idMusico === artistaId)?.nomeArtistico}.` });
            }

            // Opcional: Atualizar a lista de artistas ou exibir uma mensagem diferente
        } catch (error) {
            console.error('Erro ao contratar artista:', error);
            setContratacaoStatus({ type: 'error', message: `Erro ao contratar o artista ${artistas.find(a => a.idMusico === artistaId)?.nomeArtistico}.` });
        } finally {
            setContratandoId(null);
            setTimeout(() => setContratacaoStatus(null), 5000);
        }
    };

    const cancelarContratacao = () => {
        setShowContratarForm(null);
    };

    const handleEventoChange = (event) => {
        setEventoSelecionado(event.target.value);
    };

    return (
        <div className="artistas-container">
            <h2>Artistas Disponíveis</h2>

            {usuarioLogado?.role === 'HOST' && (
                <div className="selecao-evento">
                    <label htmlFor="evento">Selecionar Evento:</label>
                    {isLoadingEventos && <p>Carregando seus eventos...</p>}
                    {errorEventos && <p className="error-message">{errorEventos}</p>}
                    {!isLoadingEventos && !errorEventos && eventosHost.length > 0 ? (
                        <select id="evento" value={eventoSelecionado} onChange={handleEventoChange} required>
                            <option value="">Selecione um evento</option>
                            {eventosHost.map(evento => (
                                <option key={evento.idEvento} value={evento.idEvento}>
                                    {evento.nome}
                                    {evento.nomeEvento && ` - ${evento.nomeEvento}`}
                                    {evento.data && ` - ${new Date(evento.data).toLocaleDateString()}`}
                                </option>
                            ))}
                        </select>
                    ) : (!isLoadingEventos && !errorEventos && (
                        <p>Você ainda não criou nenhum evento.</p>
                    ))}
                </div>
            )}

            {isLoadingArtistas && <p>Carregando artistas...</p>}
            {errorArtistas && <p className="error-message">{errorArtistas}</p>}
            {contratacaoStatus && (
                <div className={`contratacao-status ${contratacaoStatus.type}`}>
                    {contratacaoStatus.message}
                </div>
            )}
            {!isLoadingArtistas && !errorArtistas && (
                <div className="artistas-lista">
                    {artistas.map(artista => (
                        <div key={artista.idMusico} className="artista-card">
                            <h3>{artista.nomeArtistico}</h3>
                            {artista.redesSociais && (
                                <p>Rede Social: <a href={artista.redesSociais} target="_blank" rel="noopener noreferrer">{artista.redesSociais}</a></p>
                            )}
                            {usuarioLogado?.role === 'HOST' && showContratarForm === artista.idMusico ? (
                                <div className="contratar-form">
                                    <h4>Detalhes da Contratação</h4>
                                    <label htmlFor={`valor-${artista.idMusico}`}>Valor:</label>
                                    <input
                                        type="number"
                                        id={`valor-${artista.idMusico}`}
                                        name="valor"
                                        value={contratacaoDetalhes.valor}
                                        onChange={handleContratacaoDetalhesChange}
                                        required
                                    />
                                    <label htmlFor={`detalhes-${artista.idMusico}`}>Detalhes:</label>
                                    <textarea
                                        id={`detalhes-${artista.idMusico}`}
                                        name="detalhes"
                                        value={contratacaoDetalhes.detalhes}
                                        onChange={handleContratacaoDetalhesChange}
                                    />
                                    <button onClick={() => confirmarContratacao(artista.idMusico)} disabled={contratandoId === artista.idMusico}>
                                        {contratandoId === artista.idMusico ? 'Contratando...' : 'Confirmar Contratação'}
                                    </button>
                                    <button className="btn-cancelar" onClick={cancelarContratacao}>Cancelar</button>
                                </div>
                            ) : (
                                usuarioLogado?.role === 'HOST' && (
                                    <button
                                        onClick={() => handleContratarClick(artista.idMusico)}
                                        className="btn-contratar"
                                        disabled={contratandoId === artista.idMusico}
                                    >
                                        Contratar
                                    </button>
                                )
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Artistas;
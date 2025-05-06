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
                    const response = await axios.get('/eventos', {
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
    }, [usuarioLogado?.role]);

    const handleContratar = async (artistaId) => {
        if (!eventoSelecionado) {
            setContratacaoStatus({ type: 'error', message: 'Por favor, selecione um evento para contratar.' });
            setTimeout(() => setContratacaoStatus(null), 3000);
            return;
        }

        setContratandoId(artistaId);
        setContratacaoStatus({ type: 'loading', message: `Contratando o artista ${artistas.find(a => a.idMusico === artistaId)?.nomeArtistico}...` });

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/contratos', {
                idContrato: {
                    evento: { idEvento: parseInt(eventoSelecionado) },
                    musico: { idMusico: artistaId },
                },
                // Outros detalhes do contrato podem ser adicionados aqui, se necessário
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setContratacaoStatus({ type: 'success', message: `Artista ${artistas.find(a => a.idMusico === artistaId)?.nomeArtistico} contratado com sucesso para o evento!` });
            // Opcional: Atualizar a lista de artistas ou exibir uma mensagem diferente
        } catch (error) {
            console.error('Erro ao contratar artista:', error);
            setContratacaoStatus({ type: 'error', message: `Erro ao contratar o artista ${artistas.find(a => a.idMusico === artistaId)?.nomeArtistico}.` });
        } finally {
            setContratandoId(null);
            setTimeout(() => setContratacaoStatus(null), 5000);
        }
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
                                    {evento.nomeEvento && ` - ${evento.nomeEvento}`} {/* Adicionado nomeEvento se existir */}
                                    {evento.data && ` - ${new Date(evento.data).toLocaleDateString()}`} {/* Mantido data */}
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
                            {usuarioLogado?.role === 'HOST' && (
                                <button
                                    onClick={() => handleContratar(artista.idMusico)}
                                    className="btn-contratar"
                                    disabled={contratandoId === artista.idMusico}
                                >
                                    {contratandoId === artista.idMusico ? 'Contratando...' : 'Contratar'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Artistas;
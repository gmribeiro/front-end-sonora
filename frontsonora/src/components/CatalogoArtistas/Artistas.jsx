import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Artistas.css';
// REMOVIDO: import placeholderImage from './placeholder-profile.png';

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
    const [showContratarForm, setShowContratarForm] = useState(null);

    const [profileImages, setProfileImages] = useState({});

    // Função para buscar a foto de perfil de um usuário específico
    const fetchProfileImage = async (userId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        try {
            const response = await axios.get(`auth/users/${userId}/profile-image`, { // Endpoint para pegar a imagem
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'arraybuffer'
            });

            if (response.data && response.data.byteLength > 0) {

                const blob = new Blob([response.data], { type: response.headers['content-type'] });
                const imageUrl = URL.createObjectURL(blob);
                setProfileImages(prevImages => ({
                    ...prevImages,
                    [userId]: imageUrl
                }));
            } else {
                setProfileImages(prevImages => ({
                    ...prevImages,
                    [userId]: null
                }));
            }
        } catch (error) {
            console.error(`Erro ao buscar imagem de perfil para o usuário ${userId}:`, error);
            setProfileImages(prevImages => ({
                ...prevImages,
                [userId]: null
            }));
        }
    };

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

                    response.data.forEach(artista => {
                        if (artista.usuario?.id) {
                            setProfileImages(prevImages => ({
                                ...prevImages,
                                [artista.usuario.id]: null
                            }));
                            fetchProfileImage(artista.usuario.id);
                        } else {
                            setProfileImages(prevImages => ({
                                ...prevImages,
                                [artista.idMusico]: null
                            }));
                        }
                    });

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

        buscarArtistas();
        buscarUsuario();
    }, []);

    useEffect(() => {
        const buscarEventosHost = async () => {
            setIsLoadingEventos(true);
            setErrorEventos(null);
            const token = localStorage.getItem('token');
            if (token && usuarioLogado?.role === 'HOST' && usuarioLogado?.id) {
                try {
                    const response = await axios.get(`/eventos/host/${usuarioLogado.id}`, {
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
        buscarEventosHost();
    }, [usuarioLogado]);

    useEffect(() => {
        return () => {
            Object.values(profileImages).forEach(url => {
                if (url && typeof url === 'string' && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [profileImages]);


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
            const contratoResponse = await axios.post('/contratos', {
                idContrato: {
                    evento: { idEvento: parseInt(eventoSelecionado) },
                    musico: { idMusico: artistaId },
                },
                valor: parseFloat(contratacaoDetalhes.valor),
                detalhes: contratacaoDetalhes.detalhes,
                status: false, // Passando o status como false
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setContratacaoStatus({ type: 'success', message: `Artista ${artistas.find(a => a.idMusico === artistaId)?.nomeArtistico} contratado com sucesso para o evento!` });
            setShowContratarForm(null);
            setTimeout(() => setContratacaoStatus(null), 5000);

            const artistaContratado = artistas.find(a => a.idMusico === artistaId);
            const evento = eventosHost.find(e => e.idEvento === parseInt(eventoSelecionado));
            if (artistaContratado?.usuario?.id && evento) {
                try {
                    await axios.post(`/notifications/user/${artistaContratado.usuario.id}`, {
                        mensagem: `Você foi convidado para o evento ${evento.nome || evento.nomeEvento} pelo anfitrião ${usuarioLogado?.nome || usuarioLogado?.username}!`,
                        tipo: 'CONVITE_EVENTO',
                    }, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    console.log(`Notificação de convite enviada para o artista com ID: ${artistaContratado.usuario.id}`);
                } catch (error) {
                    console.error('Erro ao enviar notificação de convite para o artista:', error);
                }
            }

        } catch (error) {
            console.error('Erro ao contratar artista:', error);
            setContratacaoStatus({ type: 'error', message: `Erro ao contratar o artista ${error.response?.data?.message || error.message}.` });
        } finally {
            setContratandoId(null);
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
                            <div className="profile-image-container">
                                {/* Renderiza a imagem SOMENTE se profileImages[artista.usuario?.id] tiver um valor válido */}
                                {profileImages[artista.usuario?.id] && (
                                    <img
                                        src={profileImages[artista.usuario.id]}
                                        alt={`Foto de perfil de ${artista.nomeArtistico}`}
                                        className="profile-image"
                                    />
                                )}
                                {/* OPCIONAL: Pode adicionar um ícone de fallback SVG ou uma div colorida se a imagem não carregar */}
                                {!profileImages[artista.usuario?.id] && (
                                    <div className="profile-placeholder">
                                        {/* Você pode colocar um ícone de usuário aqui, por exemplo */}
                                        <span>{artista.nomeArtistico.charAt(0).toUpperCase()}</span>
                                    </div>
                                )}
                            </div>
                            <h3>{artista.nomeArtistico}</h3>
                            {artista.redesSociais && (
                                <p>Rede Social: <a href={artista.redesSociais} target="_blank" rel="noopener noreferrer">{artista.redesSociais}</a></p>
                            )}
                            {usuarioLogado?.role === 'HOST' && (
                                <>
                                    {showContratarForm === artista.idMusico ? (
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
                                                {contratandoId === artista.idMusico ? 'Contratando...' : 'Confirmar'}
                                            </button>
                                            <button className="btn-cancelar" onClick={cancelarContratacao}>Cancelar</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleContratarClick(artista.idMusico)}
                                            className="btn-contratar"
                                            disabled={contratandoId === artista.idMusico}
                                        >
                                            Contratar
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Artistas;
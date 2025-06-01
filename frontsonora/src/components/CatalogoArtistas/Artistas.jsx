import { useState, useEffect } from 'react';
import axios from 'axios';

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

    const fetchProfileImage = async (userId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get(`auth/users/${userId}/profile-image`, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'arraybuffer'
            });

            if (response.data && response.data.byteLength > 0) {
                const blob = new Blob([response.data], { type: response.headers['content-type'] });
                const imageUrl = URL.createObjectURL(blob);
                setProfileImages(prev => ({ ...prev, [userId]: imageUrl }));
            } else {
                setProfileImages(prev => ({ ...prev, [userId]: null }));
            }
        } catch (error) {
            console.error(`Erro ao buscar imagem:`, error);
            setProfileImages(prev => ({ ...prev, [userId]: null }));
        }
    };

    useEffect(() => {
        const buscarArtistas = async () => {
            setIsLoadingArtistas(true);
            try {
                const res = await axios.get('/musicos');
                if (Array.isArray(res.data)) {
                    setArtistas(res.data);
                    const ids = res.data.map(a => a.idMusico);
                    setArtistaIds(ids);

                    res.data.forEach(a => {
                        const userId = a.usuario?.id ?? a.idMusico;
                        setProfileImages(prev => ({ ...prev, [userId]: null }));
                        fetchProfileImage(userId);
                    });
                } else {
                    setErrorArtistas('Dados inválidos do servidor.');
                }
            } catch (err) {
                setErrorArtistas('Erro ao carregar os artistas.');
            } finally {
                setIsLoadingArtistas(false);
            }
        };

        const buscarUsuario = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get('/auth/user/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUsuarioLogado(res.data);
                } catch (err) {
                    console.error('Erro ao buscar usuário:', err);
                }
            }
        };

        buscarArtistas();
        buscarUsuario();
    }, []);

    useEffect(() => {
        const buscarEventosHost = async () => {
            setIsLoadingEventos(true);
            const token = localStorage.getItem('token');
            if (token && usuarioLogado?.role === 'HOST' && usuarioLogado?.id) {
                try {
                    const res = await axios.get(`/eventos/host/${usuarioLogado.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setEventosHost(Array.isArray(res.data) ? res.data : []);
                } catch (err) {
                    setErrorEventos('Erro ao carregar eventos.');
                } finally {
                    setIsLoadingEventos(false);
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
                if (url?.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [profileImages]);

    const handleContratarClick = (id) => {
        if (!eventoSelecionado) {
            setContratacaoStatus({ type: 'error', message: 'Selecione um evento primeiro.' });
            setTimeout(() => setContratacaoStatus(null), 3000);
            return;
        }
        setShowContratarForm(id);
        setContratacaoDetalhes({ valor: '', detalhes: '' });
    };

    const handleContratacaoDetalhesChange = (e) => {
        const { name, value } = e.target;
        setContratacaoDetalhes(prev => ({ ...prev, [name]: value }));
    };

    const confirmarContratacao = async (id) => {
        if (!contratacaoDetalhes.valor) {
            setContratacaoStatus({ type: 'error', message: 'Informe o valor da contratação.' });
            setTimeout(() => setContratacaoStatus(null), 3000);
            return;
        }

        const parsedEventoId = parseInt(eventoSelecionado);
        const parsedArtistaId = parseInt(id);
        if (isNaN(parsedEventoId) || isNaN(parsedArtistaId)) {
            setContratacaoStatus({ type: 'error', message: 'IDs inválidos.' });
            return;
        }

        setContratandoId(id);
        setContratacaoStatus({ type: 'loading', message: 'Contratando...' });

        try {
            const token = localStorage.getItem('token');
            await axios.post('/contratos', {
                idContrato: {
                    evento: { idEvento: parsedEventoId },
                    musico: { idMusico: parsedArtistaId },
                },
                valor: parseFloat(contratacaoDetalhes.valor),
                detalhes: contratacaoDetalhes.detalhes,
                status: false,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setContratacaoStatus({ type: 'success', message: 'Contratação realizada com sucesso!' });
            setShowContratarForm(null);
            setTimeout(() => setContratacaoStatus(null), 5000);
        } catch (error) {
            setContratacaoStatus({
                type: 'error',
                message: `Erro: ${error.response?.data?.error || error.message}`
            });
        } finally {
            setContratandoId(null);
        }
    };

    const cancelarContratacao = () => setShowContratarForm(null);

    const handleEventoChange = (e) => setEventoSelecionado(e.target.value);

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-y-auto"
            style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
        >
            <div className="p-6 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-white drop-shadow">Artistas Disponíveis</h2>

                {usuarioLogado?.role === 'HOST' && (
                    <div className="mb-6 bg-white p-4 rounded-lg shadow">
                        <label htmlFor="evento" className="block font-medium mb-1">Selecionar Evento:</label>
                        {isLoadingEventos && <p className="text-gray-500">Carregando eventos...</p>}
                        {errorEventos && <p className="text-red-500">{errorEventos}</p>}
                        {!isLoadingEventos && eventosHost.length > 0 && (
                            <select
                                id="evento"
                                value={eventoSelecionado}
                                onChange={handleEventoChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="">Selecione um evento</option>
                                {eventosHost.map(e => (
                                    <option key={e.idEvento} value={e.idEvento}>
                                        {e.nome} {e.nomeEvento && `- ${e.nomeEvento}`} {e.data && `- ${new Date(e.data).toLocaleDateString()}`}
                                    </option>
                                ))}
                            </select>
                        )}
                        {!isLoadingEventos && eventosHost.length === 0 && <p>Nenhum evento encontrado.</p>}
                    </div>
                )}

                {isLoadingArtistas && <p className="text-gray-100">Carregando artistas...</p>}
                {errorArtistas && <p className="text-red-500">{errorArtistas}</p>}

                {contratacaoStatus && (
                    <div className={`p-3 rounded-md mb-4 ${contratacaoStatus.type === 'error' ? 'bg-red-100 text-red-700' : contratacaoStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {contratacaoStatus.message}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {artistas.map(artista => (
                        <div key={artista.idMusico} className="border rounded-lg p-6 shadow-md bg-white flex flex-col items-center text-center min-h-[270px] min-w-[250px]">
                            {profileImages[artista.usuario?.id] ? (
                                <img
                                    src={profileImages[artista.usuario.id]}
                                    alt={`Foto de ${artista.nomeArtistico}`}
                                    className="w-32 h-32 rounded-full object-cover mb-3"
                                />
                            ) : (
                                <div className="w-32 h-32 flex items-center justify-center bg-gray-200 rounded-full mb-3 text-3xl font-bold text-gray-600">
                                    {artista.nomeArtistico.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <h3 className="text-xl font-semibold">{artista.nomeArtistico}</h3>
                            {artista.redesSociais && (
                                <p className="text-blue-600 underline break-words">
                                    <a href={artista.redesSociais} target="_blank" rel="noreferrer">
                                        {artista.redesSociais}
                                    </a>
                                </p>
                            )}
                            {usuarioLogado?.role === 'HOST' && (
                                <>
                                    {showContratarForm === artista.idMusico ? (
                                        <div className="w-full mt-4 space-y-2">
                                            <label className="block text-left text-sm">Valor:</label>
                                            <input
                                                type="number"
                                                name="valor"
                                                value={contratacaoDetalhes.valor}
                                                onChange={handleContratacaoDetalhesChange}
                                                className="w-full border px-3 py-1 rounded-md"
                                                required
                                            />
                                            <label className="block text-left text-sm">Detalhes:</label>
                                            <textarea
                                                name="detalhes"
                                                value={contratacaoDetalhes.detalhes}
                                                onChange={handleContratacaoDetalhesChange}
                                                className="w-full border px-3 py-1 rounded-md"
                                            />
                                            <button
                                                onClick={() => confirmarContratacao(artista.idMusico)}
                                                className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 disabled:opacity-50"
                                                disabled={contratandoId === artista.idMusico}
                                            >
                                                {contratandoId === artista.idMusico ? 'Contratando...' : 'Confirmar'}
                                            </button>
                                            <button
                                                onClick={cancelarContratacao}
                                                className="text-red-600 text-sm hover:underline"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleContratarClick(artista.idMusico)}
                                            className="mt-3 bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700"
                                        >
                                            Contratar
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end">
          <button
            className="mt-8 px-6 py-3 bg-white text-[#564A72] hover:bg-[#564A72] hover:text-white transition"
            onClick={() => window.location.href = '/'}
          >
            <strong>Voltar</strong>
          </button>
        </div>
            </div>
        </div>
    );
};

export default Artistas;

import { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';

const Artistas = () => {
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

    const fetchProfileImage = useCallback(async (userId) => {
        if (!userId) return;

        try {
            const response = await api.get(`/auth/users/${userId}/profile-image`, {
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
            console.error(`Erro ao buscar imagem para o usuário ${userId}:`, error);
            setProfileImages(prev => ({ ...prev, [userId]: null }));
        }
    }, []);

    useEffect(() => {
        const buscarArtistas = async () => {
            setIsLoadingArtistas(true);
            try {
                const res = await api.get('/musicos');
                if (Array.isArray(res.data)) {
                    setArtistas(res.data);
                    res.data.forEach(a => {
                        const userId = a.usuario?.id;
                        setProfileImages(prev => ({ ...prev, [userId]: null }));
                        fetchProfileImage(userId);
                    });
                } else {
                    setErrorArtistas('Dados de artistas inválidos do servidor.');
                }
            } catch (err) {
                setErrorArtistas('Erro ao carregar os artistas. Tente novamente mais tarde.');
            } finally {
                setIsLoadingArtistas(false);
            }
        };

        const buscarUsuarioLogado = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/user/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUsuarioLogado(res.data);
                } catch (err) {
                    console.error('Erro ao buscar dados do usuário logado:', err);
                }
            }
        };

        buscarArtistas();
        buscarUsuarioLogado();
    }, [fetchProfileImage]);

    useEffect(() => {
        const buscarEventosHost = async () => {
            setIsLoadingEventos(true);
            const token = localStorage.getItem('token');
            if (token && usuarioLogado?.role === 'HOST' && usuarioLogado?.id) {
                try {
                    const res = await api.get(`/eventos/host/${usuarioLogado.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setEventosHost(Array.isArray(res.data) ? res.data : []);
                } catch (err) {
                    setErrorEventos('Erro ao carregar seus eventos. Verifique sua conexão.');
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

    const handleContratarClick = (artistaId) => {
        if (!eventoSelecionado) {
            setContratacaoStatus({ type: 'error', message: 'Selecione um evento para enviar a proposta.' });
            setTimeout(() => setContratacaoStatus(null), 4000);
            return;
        }
        setShowContratarForm(artistaId);
        setContratacaoDetalhes({ valor: '', detalhes: '' });
    };

    const handleContratacaoDetalhesChange = (e) => {
        const { name, value } = e.target;
        setContratacaoDetalhes(prev => ({ ...prev, [name]: value }));
    };

    const confirmarContratacao = async (artistaId) => {
        const valorNumerico = parseFloat(contratacaoDetalhes.valor);
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            setContratacaoStatus({ type: 'error', message: 'Por favor, informe um valor numérico válido para a contratação.' });
            setTimeout(() => setContratacaoStatus(null), 4000);
            return;
        }

        const parsedEventoId = parseInt(eventoSelecionado);
        if (isNaN(parsedEventoId)) {
            setContratacaoStatus({ type: 'error', message: 'ID do evento selecionado é inválido.' });
            setTimeout(() => setContratacaoStatus(null), 4000);
            return;
        }

        setContratandoId(artistaId);
        setContratacaoStatus({ type: 'loading', message: 'Enviando proposta de contratação...' });

        try {
            const token = localStorage.getItem('token');
            await api.post('/contratos', {
                idContrato: {
                    evento: { idEvento: parsedEventoId },
                    musico: { idMusico: artistaId },
                },
                valor: valorNumerico,
                detalhes: contratacaoDetalhes.detalhes,
                status: false,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setContratacaoStatus({ type: 'success', message: 'Proposta enviada ao artista com sucesso!' });
            setShowContratarForm(null);
            setContratacaoDetalhes({});
            setTimeout(() => setContratacaoStatus(null), 5000);
        } catch (error) {
            console.error('Erro ao confirmar contratação:', error);
            setContratacaoStatus({
                type: 'error',
                message: `Erro ao enviar proposta: ${error.response?.data?.message || 'Ocorreu um erro inesperado. Tente novamente.'}`
            });
            setTimeout(() => setContratacaoStatus(null), 5000);
        } finally {
            setContratandoId(null);
        }
    };

    const cancelarContratacao = () => {
        setShowContratarForm(null);
        setContratacaoDetalhes({});
    };

    const handleEventoChange = (e) => setEventoSelecionado(e.target.value);

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-y-auto font-['Poppins',_sans-serif] text-gray-800 p-8 md:p-12"
            style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
        >
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />

            <div className="flex flex-col md:flex-row justify-between items-center mb-12 md:mb-20 gap-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg text-center md:text-left">Artistas Disponíveis</h1>
                <Link
                    to="/"
                    className="flex-shrink-0 bg-[#342e5a] hover:bg-[#564A72] text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#342e5a] focus:ring-opacity-75 font-semibold text-lg"
                >
                    ← Voltar para Home
                </Link>
            </div>

            {usuarioLogado?.role === 'HOST' && (
                <div className="mb-10 bg-white p-7 rounded-3xl shadow-xl border border-gray-100 bg-opacity-95 backdrop-blur-sm">
                    <label htmlFor="evento" className="block text-2xl font-bold mb-4 text-[#5c2c90]">
                        Selecione o Evento para Contratar um Artista:
                    </label>
                    {isLoadingEventos && <p className="text-xl text-gray-600">Carregando seus eventos...</p>}
                    {errorEventos && <p className="text-xl text-red-600">{errorEventos}</p>}
                    {!isLoadingEventos && eventosHost.length > 0 ? (
                        <select
                            id="evento"
                            value={eventoSelecionado}
                            onChange={handleEventoChange}
                            className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-[#a06cb3] focus:border-[#a06cb3] outline-none transition-all duration-200 text-lg placeholder-gray-400 shadow-sm focus:shadow-md"
                        >
                            <option value="">-- Selecione um evento --</option>
                            {eventosHost.map(e => (
                                <option key={e.idEvento} value={e.idEvento}>
                                    {e.nome} {e.nomeEvento && `- ${e.nomeEvento}`} {e.data && `- ${new Date(e.data).toLocaleDateString('pt-BR')}`}
                                </option>
                            ))}
                        </select>
                    ) : (
                        !isLoadingEventos && !errorEventos && (
                            <p className="text-xl text-gray-600">Você não tem eventos criados. Crie um evento para poder contratar artistas.</p>
                        )
                    )}
                </div>
            )}

            {isLoadingArtistas && <p className="text-3xl text-white text-center mt-12">Carregando artistas...</p>}
            {errorArtistas && <p className="text-3xl text-red-500 text-center mt-12">{errorArtistas}</p>}

            {contratacaoStatus && (
                <div className={`p-5 rounded-xl mb-8 text-2xl text-center shadow-lg font-semibold ${
                    contratacaoStatus.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
                    contratacaoStatus.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
                    'bg-blue-100 text-blue-700 border border-blue-300'
                }`}>
                    {contratacaoStatus.message}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
                {artistas.length > 0 ? (
                    artistas.map(artista => (
                        <div key={artista.idMusico} className="bg-white rounded-3xl p-7 shadow-xl flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-[1.03] border border-gray-100 bg-opacity-95 backdrop-blur-sm min-h-[420px]">
                            {profileImages[artista.usuario?.id] ? (
                                <img
                                    src={profileImages[artista.usuario.id]}
                                    alt={`Foto de ${artista.nomeArtistico}`}
                                    className="w-36 h-36 rounded-full object-cover mb-4 border-4 border-[#a06cb3] shadow-md"
                                />
                            ) : (
                                <div className="w-36 h-36 flex items-center justify-center bg-gradient-to-br from-[#9b59b6] to-[#7f399f] rounded-full mb-4 text-4xl font-bold text-white shadow-md">
                                    {artista.nomeArtistico.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-[#5c2c90] mb-2">{artista.nomeArtistico}</h3>

                            {artista.redesSociais && (
                                <p className="text-base text-gray-600 hover:text-[#564A72] mb-3">
                                    <a href={artista.redesSociais} target="_blank" rel="noreferrer" className="underline break-words">
                                        {artista.redesSociais.length > 35 ? `${artista.redesSociais.substring(0, 32)}...` : artista.redesSociais}
                                    </a>
                                </p>
                            )}

                            <div className="mb-5 text-base text-gray-700 max-h-28 overflow-hidden w-full px-2 flex-grow">
                                <p className="whitespace-pre-line leading-relaxed">
                                    {artista.usuario?.bio ?
                                        (artista.usuario.bio.length > 180 ? `${artista.usuario.bio.substring(0, 177)}...` : artista.usuario.bio)
                                        : "Nenhuma biografia disponível para este artista."}
                                </p>
                            </div>

                            {usuarioLogado?.role === 'HOST' && (
                                <div className="w-full mt-auto">
                                    {showContratarForm === artista.idMusico ? (
                                        <div className="space-y-4">
                                            <div className="text-left">
                                                <label htmlFor={`valor-${artista.idMusico}`} className="block text-base font-semibold mb-2 text-[#5c2c90]">Valor (R$):</label>
                                                <input
                                                    id={`valor-${artista.idMusico}`}
                                                    type="number"
                                                    name="valor"
                                                    value={contratacaoDetalhes.valor}
                                                    onChange={handleContratacaoDetalhesChange}
                                                    className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-[#a06cb3] focus:border-[#a06cb3] outline-none transition-all duration-200 placeholder-gray-400 shadow-sm"
                                                    placeholder="Ex: 500.00"
                                                    required
                                                />
                                            </div>
                                            <div className="text-left">
                                                <label htmlFor={`detalhes-${artista.idMusico}`} className="block text-base font-semibold mb-2 text-[#5c2c90]">Detalhes:</label>
                                                <textarea
                                                    id={`detalhes-${artista.idMusico}`}
                                                    name="detalhes"
                                                    value={contratacaoDetalhes.detalhes}
                                                    onChange={handleContratacaoDetalhesChange}
                                                    rows="3"
                                                    className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-[#a06cb3] focus:border-[#a06cb3] outline-none transition-all duration-200 placeholder-gray-400 shadow-sm resize-y"
                                                    placeholder="Tipo de apresentação, duração, etc."
                                                ></textarea>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                                <button
                                                    onClick={() => confirmarContratacao(artista.idMusico)}
                                                    className="flex-1 bg-gradient-to-r from-[#2ecc71] to-[#27ae60] hover:from-[#28b466] hover:to-[#229a55] text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out font-semibold text-base transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={contratandoId === artista.idMusico}
                                                >
                                                    {contratandoId === artista.idMusico ? 'Contratando...' : 'Confirmar'}
                                                </button>
                                                <button
                                                    onClick={cancelarContratacao}
                                                    className="flex-1 bg-[#c2a0bb] hover:bg-[#a6829f] text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out font-semibold text-base transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#c2a0bb] focus:ring-opacity-75"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleContratarClick(artista.idMusico)}
                                            className="w-full bg-[#342e5a] hover:bg-[#564A72] text-white px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#342e5a] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!eventoSelecionado}
                                        >
                                            Contratar Artista
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    !isLoadingArtistas && !errorArtistas && (
                        <p className="text-3xl text-white text-center col-span-full mt-12">Nenhum artista encontrado no momento. Volte mais tarde!</p>
                    )
                )}
            </div>
        </div>
    );
};

export default Artistas;
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api';
import PropTypes from 'prop-types';

const Eventos = ({ onEventoCadastrado }) => {
    const navigate = useNavigate();
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [userId, setUserId] = useState(null);
    const [reservandoId, setReservandoId] = useState(null);
    const [mensagemReserva, setMensagemReserva] = useState('');
    const [showCadastro, setShowCadastro] = useState(false);
    const [nomeEvento, setNomeEvento] = useState('');
    const [dataHora, setDataHora] = useState('');
    const [horaEncerramento, setHoraEncerramento] = useState('');
    const [descricao, setDescricao] = useState('');
    const [classificacao, setClassificacao] = useState('');
    const [selectedGeneroId, setSelectedGeneroId] = useState('');
    const [localEventoNome, setLocalEventoNome] = useState('');
    const [cep, setCep] = useState('');
    const [numero, setNumero] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [generos, setGeneros] = useState([]);
    const [eventImageFile, setEventImageFile] = useState(null);

    const [allEvents, setAllEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [eventsError, setEventsError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const eventosPorPagina = 6;
    const totalPaginas = Math.ceil(allEvents.length / eventosPorPagina);
    const indiceInicial = (currentPage - 1) * eventosPorPagina;
    const indiceFinal = indiceInicial + eventosPorPagina;
    const eventosPaginaAtual = allEvents.slice(indiceInicial, indiceFinal);

    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/auth/user/me', {
                headers: {'Authorization': `Bearer ${token}`}
            })
                .then(response => {
                    setUsuarioLogado(response.data);
                    setUserId(response.data.id);
                })
                .catch(error => console.error('Erro ao carregar usuário:', error));

            api.get('/genres')
                .then(response => {
                    setGeneros(response.data);
                })
                .catch(error => console.error('Erro ao carregar gêneros:', error));
        }

        const fetchAllEvents = async () => {
            setLoadingEvents(true);
            setEventsError(null);
            try {
                const response = await api.get('/eventos');
                setAllEvents(response.data); // Define todos os eventos
            } catch (error) {
                console.error('Erro ao carregar todos os eventos:', error);
                setEventsError('Erro ao carregar eventos. Tente novamente mais tarde.');
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchAllEvents();
    }, []);

    const formatDateTimeForBackend = (dateTimeString) => {
        if (!dateTimeString) {
            console.warn("[formatDateTimeForBackend] Entrada vazia/inválida ao formatar para backend:", dateTimeString);
            return '';
        }

        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) {
            console.error("[formatDateTimeForBackend] Erro: Data/hora do formulário inválida para criação do objeto Date:", dateTimeString);
            return '';
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const formatDateTimeForUserDisplay = (dateTimeString) => {
        if (typeof dateTimeString !== 'string' || !dateTimeString) {
            return 'Data e hora não informadas';
        }

        const parts = dateTimeString.split(' '); // Expected "DD/MM/YYYY HH:MM:SS"
        if (parts.length !== 2) {
            console.warn(`[formatDateTimeForUserDisplay] Formato inesperado: ${dateTimeString}`);
            return 'Formato de data inválido';
        }

        const [datePart, timePart] = parts;
        const [day, month, year] = datePart.split('/');
        const [hours, minutes] = timePart.split(':');

        // Validação básica para garantir que são números
        if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes)) {
            console.warn(`[formatDateTimeForUserDisplay] Componentes numéricos inválidos: ${dateTimeString}`);
            return 'Data e hora inválidas';
        }

        // Retorna no formato DD/MM/AAAA hh:MM
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const extractTimeForDisplay = (dateTimeString) => {
        if (typeof dateTimeString !== 'string' || !dateTimeString) {
            console.warn("[extractTimeForDisplay] Entrada vazia, nula ou não-string para exibição:", dateTimeString);
            return 'Hora ??:??';
        }

        const match = dateTimeString.match(/(\d{2}):(\d{2}):(\d{2})$/);

        if (match && match.length >= 3) {
            return `${match[1]}:${match[2]}`;
        }

        console.warn("[extractTimeForDisplay] Formato de hora inesperado na string do backend para exibição:", dateTimeString);
        return 'Hora Inválida';
    };

    const handleEventoClick = (eventoId) => {
        navigate(`/detalhes/${eventoId}`);
    };

    const handleReservar = async (eventoId) => {
        setReservandoId(eventoId);
        setMensagemReserva('');
        const token = localStorage.getItem('token');

        if (!usuarioLogado || usuarioLogado.role !== 'CLIENT') {
            setMensagemReserva('Apenas clientes podem reservar eventos.');
            setReservandoId(null);
            return;
        }
        try {
            const response = await api.post('/reservas', {
                usuario: {
                    id: usuarioLogado.id
                },
                evento: {
                    idEvento: eventoId
                },
                confirmado: false
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 201) {
                setMensagemReserva(`Reserva para o evento ${allEvents.find(e => e.id === eventoId)?.titulo} realizada com sucesso!`);
                setTimeout(() => {
                    navigate('/meusconvites');
                }, 1500);
            } else {
                setMensagemReserva(`Erro ao reservar o evento.`);
            }
        } catch (error) {
            console.error('Erro ao reservar evento:', error);
            setMensagemReserva(`Erro ao reservar o evento: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        if (name === 'local') {
            setLocalEventoNome(value);
        } else if (name === 'dataHora') {
            setDataHora(value);
        } else if (name === 'horaEncerramento') {
            setHoraEncerramento(value);
        } else if (name === 'nomeEvento') {
            setNomeEvento(value);
        } else if (name === 'descricao') {
            setDescricao(value);
        } else if (name === 'classificacao') {
            setClassificacao(value);
        } else if (name === 'generoMusical') {
            setSelectedGeneroId(value);
        } else if (name === 'cep') {
            setCep(value);
        } else if (name === 'numero') {
            setNumero(value);
        }
    };

    const handleImageChange = (e) => {
        setEventImageFile(e.target.files[0]);
    };

    const handleCadastrarEvento = async (e) => {
        e.preventDefault();
        setFormMessage('');
        const token = localStorage.getItem('token');

        if (
            !nomeEvento.trim() ||
            !dataHora.trim() ||
            !horaEncerramento.trim() ||
            !descricao.trim() ||
            !classificacao.trim() ||
            !selectedGeneroId ||
            !localEventoNome.trim() ||
            !cep.trim() ||
            !numero.trim() ||
            !eventImageFile
        ) {
            setFormMessage('Por favor, preencha todos os campos obrigatórios para cadastrar o evento, incluindo a classificação e a imagem.');
            return;
        }

        if (!token || usuarioLogado?.role !== 'HOST' || !userId) {
            setFormMessage('Você não tem permissão para cadastrar eventos. Apenas HOSTs podem.');
            return;
        }

        try {
            const formattedDataHora = formatDateTimeForBackend(dataHora);
            let formattedHoraEncerramento = '00:00:00';
            if (horaEncerramento) {
                const [hours, minutes] = horaEncerramento.split(':');
                formattedHoraEncerramento = `${hours}:${minutes}:00`;
            }

            if (!formattedDataHora || !formattedHoraEncerramento) {
                setFormMessage('Erro: A data ou hora fornecida é inválida. Por favor, verifique o formato.');
                return;
            }

            const placeResponse = await api.post('/places', {
                local: localEventoNome,
                cep: cep,
                numero: numero
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const placeData = placeResponse.data;

            console.log('Dados do evento (JSON enviados ao backend):', JSON.stringify({
                nomeEvento,
                dataHora: formattedDataHora,
                horaEncerramento: formattedHoraEncerramento,
                descricao,
                classificacao,
                generoMusical: {idGeneroMusical: selectedGeneroId},
                localEvento: {idLocalEvento: placeData.idLocalEvento},
                host: {id: userId}

            }, null, 2));

            const eventData = {
                nomeEvento,
                dataHora: formattedDataHora,
                horaEncerramento: formattedHoraEncerramento,
                descricao: descricao,
                classificacao: classificacao,
                generoMusical: {idGeneroMusical: selectedGeneroId},
                localEvento: {idLocalEvento: placeData.idLocalEvento},
                host: {id: userId}
            };

            const eventResponse = await api.post('/eventos', eventData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const novoEventoDoBackend = eventResponse.data;

            if (eventImageFile && novoEventoDoBackend.idEvento) {
                const formData = new FormData();
                formData.append('foto', eventImageFile);

                const uploadResponse = await api.post(`/eventos/${novoEventoDoBackend.idEvento}/upload`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (uploadResponse.status !== 200) {
                    console.warn('Upload de imagem falhou, mas o evento foi criado.', uploadResponse.data);
                    setFormMessage('Evento cadastrado, mas o upload da imagem falhou. Tente novamente mais tarde.');
                } else {
                    console.log('Imagem do evento carregada com sucesso!', uploadResponse.data);
                    setFormMessage('Evento cadastrado com sucesso e imagem enviada!');
                }
            } else {
                setFormMessage('Evento cadastrado, mas nenhuma imagem foi selecionada ou o ID do evento não foi retornado.');
            }

            setNomeEvento('');
            setDataHora('');
            setHoraEncerramento('');
            setDescricao('');
            setClassificacao('');
            setSelectedGeneroId('');
            setLocalEventoNome('');
            setCep('');
            setNumero('');
            setEventImageFile(null);

            setAllEvents(prevEvents => [novoEventoDoBackend, ...prevEvents]);
            setCurrentPage(1);

            if (onEventoCadastrado) {
                const newEventForCallback = {
                    id: novoEventoDoBackend.idEvento,
                    titulo: nomeEvento,
                    local: localEventoNome,
                    hora: extractTimeForDisplay(novoEventoDoBackend.dataHora),
                    imagem: imagemUrlParaHome,
                    genero: generos.find(g => g.idGeneroMusical === selectedGeneroId)?.nomeGenero || 'Outro'
                };
                onEventoCadastrado(newEventForCallback);
            }

            setTimeout(() => {
                setShowCadastro(false);
                setFormMessage('');
            }, 2000);

        } catch (error) {
            console.error('Erro ao cadastrar evento ou fazer upload da imagem:', error);
            setFormMessage(`Erro ao cadastrar evento: ${error.response?.data?.message || 'Erro desconhecido'}`);
        }
    };

    const mudarPagina = (novaPagina) => {
        if (novaPagina < 1 || novaPagina > totalPaginas || isAnimating) return;

        setIsAnimating(true);
        setTimeout(() => {
            setCurrentPage(novaPagina);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsAnimating(false); // Reseta a animação após a rolagem
        }, 300);
    };

    if (loadingEvents) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] text-[#5A4E75] text-xl">
                Carregando eventos...
            </div>
        );
    }

    if (eventsError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-red-600 text-center">
                <p>{eventsError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-[#5A4E75] hover:bg-[#7d6588] text-white px-4 py-2 rounded"
                >
                    Recarregar Página
                </button>
            </div>
        );
    }

    if (allEvents.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] text-[#5A4E75] text-xl">
                Nenhum evento disponível no momento.
            </div>
        );
    }

    return (
        <div className="bg-[#EDE6F2] px-4 py-8 min-h-[70vh] mb-20">
            {usuarioLogado?.role === 'HOST' && (
                <div className="max-w-6xl mx-auto mb-6">
                    <button
                        onClick={() => setShowCadastro(!showCadastro)}
                        className="!text-[#EDE6F2] bg-gradient-to-b from-[#342e5a] via-[#5A4E75] to-[#7d6588] rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer flex flex-col w-full max-w-[350px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-[400px] lg:h-[25px] lg:mb-15 mx-auto"
                    >
                        {showCadastro ? 'Cancelar Cadastro' : 'Cadastrar Novo Evento'}
                    </button>

                    {showCadastro && (
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mt-4 max-w-3xl mx-auto">
                            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center !text-[#5A4E75]">Cadastrar
                                Novo Evento</h3>
                            <form onSubmit={handleCadastrarEvento} className="space-y-3 sm:space-y-4">
                                <div className="space-y-1 sm:space-y-2">
                                    <label htmlFor="nomeEvento"
                                           className="block text-[#5A4E75] text-sm sm:text-base font-medium">Nome do
                                        Evento:</label>
                                    <input
                                        type="text"
                                        id="nomeEvento"
                                        name="nomeEvento"
                                        value={nomeEvento}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d6588]"
                                    />
                                </div>

                                <div className="space-y-1 sm:space-y-2">
                                    <label htmlFor="dataHora"
                                           className="block text-[#5A4E75] text-sm sm:text-base font-medium">Data e
                                        Hora:</label>
                                    <input
                                        type="datetime-local"
                                        id="dataHora"
                                        name="dataHora"
                                        value={dataHora}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d6588]"
                                    />
                                </div>

                                <div className="space-y-1 sm:space-y-2">
                                    <label htmlFor="horaEncerramento"
                                           className="block text-[#5A4E75] text-sm sm:text-base font-medium">Hora de
                                        Encerramento:</label>
                                    <input
                                        type="time"
                                        id="horaEncerramento"
                                        name="horaEncerramento"
                                        value={horaEncerramento}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d6588]"
                                    />
                                </div>

                                <div className="space-y-1 sm:space-y-2">
                                    <label htmlFor="descricao"
                                           className="block text-[#5A4E75] text-sm sm:text-base font-medium">Descrição:</label>
                                    <textarea
                                        id="descricao"
                                        name="descricao"
                                        value={descricao}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d6588] min-h-[80px] sm:min-h-[100px]"
                                    />
                                </div>

                                <div className="space-y-1 sm:space-y-2">
                                    <label htmlFor="classificacao"
                                           className="block text-[#5A4E75] text-sm sm:text-base font-medium">Classificação:</label>
                                    <select
                                        id="classificacao"
                                        name="classificacao"
                                        value={classificacao}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d6588]"
                                    >
                                        <option value="">Selecione uma classificação</option>
                                        <option value="Livre">Livre</option>
                                        <option value="10+">10+</option>
                                        <option value="12+">12+</option>
                                        <option value="14+">14+</option>
                                        <option value="16+">16+</option>
                                        <option value="18+">18+</option>
                                    </select>
                                </div>

                                <div className="space-y-1 sm:space-y-2">
                                    <label htmlFor="generoMusical"
                                           className="block text-[#5A4E75] text-sm sm:text-base font-medium">Gênero
                                        Musical:</label>
                                    <select
                                        id="generoMusical"
                                        name="generoMusical"
                                        value={selectedGeneroId}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d6588]"
                                    >
                                        <option value="">Selecione um gênero</option>
                                        {generos.map(genero => (
                                            <option key={genero.idGeneroMusical} value={genero.idGeneroMusical}>
                                                {genero.nomeGenero}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1 sm:space-y-2">
                                    <label htmlFor="local"
                                           className="block text-[#5A4E75] text-sm sm:text-base font-medium">Local:</label>
                                    <input
                                        type="text"
                                        id="local"
                                        name="local"
                                        value={localEventoNome}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d6588]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="space-y-1 sm:space-y-2">
                                        <label htmlFor="cep"
                                               className="block text-[#5A4E75] text-sm sm:text-base font-medium">CEP do
                                            Local:</label>
                                        <input
                                            type="text"
                                            id="cep"
                                            name="cep"
                                            value={cep}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d6588]"
                                        />
                                    </div>

                                    <div className="space-y-1 sm:space-y-2">
                                        <label htmlFor="numero"
                                               className="block text-[#5A4E75] text-sm sm:text-base font-medium">Número
                                            do Local:</label>
                                        <input
                                            type="text"
                                            id="numero"
                                            name="numero"
                                            value={numero}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d6588]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1 sm:space-y-2">
                                    <label htmlFor="eventImage"
                                           className="block text-[#5A4E75] text-sm sm:text-base font-medium">Foto do
                                        Evento:</label>
                                    <input
                                        type="file"
                                        id="eventImage"
                                        name="eventImage"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        required
                                        className="w-full px-3 py-1 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7d6588]"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2 sm:gap-3 pt-1 sm:pt-2">
                                    <button
                                        type="submit"
                                        className="bg-[#5A4E75] hover:bg-[#7d6588] text-white px-4 py-1 sm:px-6 sm:py-2 text-sm sm:text-base rounded-md transition-colors duration-300"
                                    >
                                        Cadastrar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCadastro(false)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 sm:px-6 sm:py-2 text-sm sm:text-base rounded-md transition-colors duration-300"
                                    >
                                        Cancelar
                                    </button>
                                </div>

                                {formMessage && (
                                    <p className={`mt-2 text-sm sm:text-base font-medium ${formMessage.startsWith('Erro') ? 'text-red-600' : 'text-green-600'}`}>
                                        {formMessage}
                                    </p>
                                )}
                            </form>
                        </div>
                    )}
                </div>
            )
            }

            <div
                className={`max-w-7xl mx-auto ${isAnimating ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0'} transition-all duration-300`}>
                <div
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 justify-items-center max-w-7xl mx-auto px-4">
                    {eventosPaginaAtual.map(evento => {
                        console.log(`[Eventos.jsx - Render] Evento ID: ${evento.idEvento}, dataHora recebida para exibição: '${evento.dataHora}'`);

                        return (
                            <div
                                key={evento.idEvento}
                                onClick={() => handleEventoClick(evento.idEvento)} // Navega com idEvento
                                className="bg-gradient-to-b from-[#2E284E] via-[#5A4E75] to-[#E8DFEC] rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer flex flex-col w-full max-w-[350px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-[400px] mx-auto"
                            >
                                <div
                                    className="relative w-full h-[216px] sm:h-[288px] md:h-[400px] lg:h-[400px] overflow-hidden">
                                    <img
                                        src={evento.idEvento ? `${BACKEND_BASE_URL}/eventos/${evento.idEvento}/image` : '/images/evento_padrao.png'}
                                        alt={evento.nomeEvento || evento.titulo || 'Imagem do Evento'}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/evento_padrao.png';
                                        }}
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-5 sm:p-6 flex-grow flex flex-col">
                                    <h3 className="text-[#564A72] text-sm sm:text-base font-semibold truncate mb-1 sm:mb-2">{evento.nomeEvento || evento.titulo}</h3>
                                    <p className="!text-[#564A72] text-xs sm:text-sm mb-2 sm:mb-3">
                                        {evento.localEvento?.local || evento.local || 'Local não informado'} - {formatDateTimeForUserDisplay(evento.dataHora)}
                                    </p>
                                    {usuarioLogado?.role === 'CLIENT' && (
                                        <div className="mt-auto">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReservar(evento.idEvento);
                                                }}
                                                disabled={reservandoId === evento.idEvento}
                                                className="w-full bg-[#5A4E75] hover:bg-[#2E284E] text-white py-2 px-4 sm:py-3 sm:px-5 text-sm sm:text-base rounded-md transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {reservandoId === evento.idEvento ? 'Reservando...' : 'Reservar'}
                                            </button>
                                        </div>
                                    )}
                                    {mensagemReserva && reservandoId === evento.idEvento && (
                                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-center text-[#5A4E75]">{mensagemReserva}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {totalPaginas > 1 && (
                <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-10 md:mt-12">
                    <button
                        onClick={() => mudarPagina(currentPage - 1)}
                        disabled={currentPage === 1 || isAnimating}
                        className="bg-[#5A4E75] hover:bg-[#2E284E] text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:bg-[#8B7EA2] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        &lt;
                    </button>

                    <span
                        className="text-[#2E284E] font-bold text-sm sm:text-base">Página {currentPage} de {totalPaginas}</span>

                    <button
                        onClick={() => mudarPagina(currentPage + 1)}
                        disabled={currentPage === totalPaginas || isAnimating}
                        className="bg-[#5A4E75] hover:bg-[#2E284E] text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:bg-[#8B7EA2] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}

Eventos.propTypes = {
    onEventoCadastrado: PropTypes.func
};

Eventos.defaultProps = {
    onEventoCadastrado: () => {}
};

export default Eventos;

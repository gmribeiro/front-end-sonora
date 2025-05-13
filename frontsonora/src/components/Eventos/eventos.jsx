import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './eventos.css';
import axios from 'axios';

const Eventos = ({ eventosFiltrados, eventosCompletos, currentPage, setCurrentPage }) => {
    const navigate = useNavigate();
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [userId, setUserId] = useState(null);
    const [reservandoId, setReservandoId] = useState(null);
    const [mensagemReserva, setMensagemReserva] = useState('');
    const [showCadastro, setShowCadastro] = useState(false);
    const [nomeEvento, setNomeEvento] = useState('');
    const [dataHora, setDataHora] = useState('');
    const [descricao, setDescricao] = useState('');
    const [selectedGeneroId, setSelectedGeneroId] = useState(''); // ID do gênero selecionado
    const [localEventoNome, setLocalEventoNome] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [generos, setGeneros] = useState([]); // Array para armazenar os gêneros do banco de dados

    // Configuração da paginação
    const eventosPorPagina = 6;
    const totalPaginas = Math.ceil(eventosFiltrados.length / eventosPorPagina);
    const indiceInicial = (currentPage - 1) * eventosPorPagina;
    const indiceFinal = indiceInicial + eventosPorPagina;
    const eventosPaginaAtual = eventosFiltrados.slice(indiceInicial, indiceFinal);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('/auth/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    setUsuarioLogado(response.data);
                    setUserId(response.data.id);
                    console.log("User Role:", response.data.role);
                    console.log("User ID:", response.data.id);
                })
                .catch(error => console.error('Erro ao carregar usuário:', error));

            // Buscar gêneros do banco de dados
            axios.get('/genres')
                .then(response => {
                    setGeneros(response.data);
                })
                .catch(error => console.error('Erro ao carregar gêneros:', error));
        }
    }, []);

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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
            const response = await axios.post('/reservas', {
                usuarioId: usuarioLogado.id,
                eventoId: eventoId,
                confirmado: false
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 201) {
                setMensagemReserva(`Reserva para o evento ${eventosFiltrados.find(e => e.id === eventoId)?.titulo} realizada com sucesso!`);
            } else {
                setMensagemReserva(`Erro ao reservar o evento.`);
            }
        } catch (error) {
            console.error('Erro ao reservar evento:', error);
            setMensagemReserva(`Erro ao reservar o evento: ${error.response?.data?.message || error.message}`);
        } finally {
            setTimeout(() => {
                setReservandoId(null);
                setMensagemReserva('');
            }, 3000);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'local') {
            setLocalEventoNome(value);
        } else if (name === 'dataHora') {
            setDataHora(value);
        } else if (name === 'nomeEvento') {
            setNomeEvento(value);
        } else if (name === 'descricao') {
            setDescricao(value);
        } else if (name === 'generoMusical') {
            setSelectedGeneroId(value);
        }
    };

    const handleCadastrarEvento = async (e) => {
        e.preventDefault();
        setFormMessage('');
        const token = localStorage.getItem('token');

        if (!token || usuarioLogado?.role !== 'HOST' || !userId || !selectedGeneroId) {
            setFormMessage('Preencha todos os campos para cadastrar o evento.');
            return;
        }

        try {
            const formattedDataHora = formatDateTime(dataHora);

            const placeResponse = await axios.post('/places', { local: localEventoNome }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const placeData = placeResponse.data;

            const eventData = {
                nomeEvento,
                dataHora: formattedDataHora,
                descricao,
                generoMusical: { idGeneroMusical: selectedGeneroId },
                localEvento: { idLocalEvento: placeData.idLocalEvento },
                host: { id: userId }
            };

            const response = await axios.post('/eventos', eventData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                setFormMessage('Evento cadastrado com sucesso!');
                setNomeEvento('');
                setDataHora('');
                setDescricao('');
                setSelectedGeneroId('');
                setLocalEventoNome('');
                setShowCadastro(false);
            } else {
                setFormMessage('Erro ao cadastrar evento.');
            }

        } catch (error) {
            console.error('Erro ao cadastrar evento:', error);
            setFormMessage(`Erro ao cadastrar evento: ${error.response?.data?.message || 'Erro desconhecido'}`);
        }
    };

    const mudarPagina = (novaPagina) => {
        if (novaPagina < 1 || novaPagina > totalPaginas || isAnimating) return;

        setIsAnimating(true);
        setTimeout(() => {
            setCurrentPage(novaPagina);
            setIsAnimating(false);
        }, 300);
    };

    return (
        <div className='espaco-eventos'>
            {usuarioLogado?.role === 'HOST' && (
                <div className="host-actions">
                    <button onClick={() => setShowCadastro(!showCadastro)} className="btn-cadastrar-evento">
                        {showCadastro ? 'Cancelar Cadastro' : 'Cadastrar Novo Evento'}
                    </button>

                    {showCadastro && (
                        <div className="cadastro-evento-form">
                            <h3>Cadastrar Novo Evento</h3>
                            <form onSubmit={handleCadastrarEvento}>
                                <div className="form-group">
                                    <label htmlFor="nomeEvento">Nome do Evento:</label>
                                    <input type="text" id="nomeEvento" name="nomeEvento" value={nomeEvento} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dataHora">Data e Hora:</label>
                                    <input type="datetime-local" id="dataHora" name="dataHora" value={dataHora} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="descricao">Descrição:</label>
                                    <textarea id="descricao" name="descricao" value={descricao} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="generoMusical">Gênero Musical:</label>
                                    <select
                                        id="generoMusical"
                                        name="generoMusical"
                                        value={selectedGeneroId}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecione um gênero</option>
                                        {generos.map(genero => (
                                            <option key={genero.idGeneroMusical} value={genero.idGeneroMusical}>
                                                {genero.nomeGenero}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="local">Local:</label>
                                    <input type="text" id="local" name="local" value={localEventoNome} onChange={handleInputChange} required />
                                </div>
                                <button type="submit" className="btn-cadastrar">Cadastrar</button>
                                <button type="button" onClick={() => setShowCadastro(false)} className="btn-cancelar">Cancelar</button>
                                {formMessage && <p className={`form-message ${formMessage.startsWith('Erro') ? 'error' : 'success'}`}>{formMessage}</p>}
                            </form>
                        </div>
                    )}
                </div>
            )}

            <div
                className={`container-eventos ${isAnimating ? 'animating' : ''}`}
                style={{ minHeight: '600px' }}
            >
                {eventosPaginaAtual.map(evento => (
                    <div
                        key={evento.id}
                        className="evento"
                        onClick={() => handleEventoClick(evento.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="evento-imagem-container">
                            <img src={evento.imagem} alt={evento.titulo} className="evento-imagem" />
                        </div>
                        <h3>{evento.titulo}</h3>
                        <p>{evento.local} - {evento.hora}</p>
                        {usuarioLogado?.role === 'CLIENT' && (
                            <button
                                className="btn-reservar"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReservar(evento.id);
                                }}
                                disabled={reservandoId === evento.id}
                            >
                                {reservandoId === evento.id ? 'Reservando...' : 'Reservar'}
                            </button>
                        )}
                        {mensagemReserva && reservandoId === evento.id && (
                            <p className="mensagem-reserva">{mensagemReserva}</p>
                        )}
                    </div>
                ))}
            </div>

            {totalPaginas > 1 && (
                <div className="paginacao">
                    <button
                        className="btn-paginacao"
                        onClick={() => mudarPagina(currentPage - 1)}
                        disabled={currentPage === 1 || isAnimating}
                    >
                        &lt;
                    </button>

                    <span>Página {currentPage} de {totalPaginas}</span>

                    <button
                        className="btn-paginacao"
                        onClick={() => mudarPagina(currentPage + 1)}
                        disabled={currentPage === totalPaginas || isAnimating}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}

export default Eventos;
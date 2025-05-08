import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './eventos.css';
import axios from 'axios';

const Eventos = ({ eventosFiltrados, eventosCompletos }) => {
    const navigate = useNavigate();
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [reservandoId, setReservandoId] = useState(null);
    const [mensagemReserva, setMensagemReserva] = useState('');
    const [showCadastro, setShowCadastro] = useState(false);
    const [formEvento, setFormEvento] = useState({
        nomeEvento: '',
        dataHora: '',
        descricao: '',
        genero: '',
        local: '',
        imagem: null
    });
    const [formMessage, setFormMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const eventosPorPagina = 6; // 2 colunas x 3 eventos

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('/auth/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    setUsuarioLogado(response.data);
                })
                .catch(error => console.error('Erro ao carregar usuário:', error));
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [eventosFiltrados]);

    const totalPages = Math.ceil(eventosFiltrados.length / eventosPorPagina);
    const currentEvents = eventosFiltrados.slice(
        (currentPage - 1) * eventosPorPagina,
        currentPage * eventosPorPagina
    );

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
        setFormEvento(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImagemChange = (e) => {
        setFormEvento(prevState => ({
            ...prevState,
            imagem: e.target.files[0]
        }));
    };

    const handleCadastrarEvento = async (e) => {
        e.preventDefault();
        setFormMessage('');
        const token = localStorage.getItem('token');

        if (!token || usuarioLogado?.role !== 'HOST') {
            setFormMessage('Apenas hosts podem cadastrar eventos.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('nomeEvento', formEvento.nomeEvento);
            formData.append('dataHora', formEvento.dataHora);
            formData.append('descricao', formEvento.descricao);
            formData.append('genero', formEvento.genero);
            formData.append('local', formEvento.local);
            if (formEvento.imagem) {
                formData.append('imagem', formEvento.imagem);
            }

            const response = await axios.post('/eventos', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                setFormMessage('Evento cadastrado com sucesso!');
                setFormEvento({
                    nomeEvento: '',
                    dataHora: '',
                    descricao: '',
                    genero: '',
                    local: '',
                    imagem: null
                });
                setShowCadastro(false);
            } else {
                setFormMessage('Erro ao cadastrar evento.');
            }
        } catch (error) {
            console.error('Erro ao cadastrar evento:', error);
            setFormMessage(`Erro ao cadastrar evento: ${error.response?.data?.message || error.message}`);
        }
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
                                    <input type="text" id="nomeEvento" name="nomeEvento" value={formEvento.nomeEvento} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dataHora">Data e Hora:</label>
                                    <input type="datetime-local" id="dataHora" name="dataHora" value={formEvento.dataHora} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="descricao">Descrição:</label>
                                    <textarea id="descricao" name="descricao" value={formEvento.descricao} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="genero">Gênero Musical:</label>
                                    <input type="text" id="genero" name="genero" value={formEvento.genero} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="local">Local:</label>
                                    <input type="text" id="local" name="local" value={formEvento.local} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="imagem">Imagem:</label>
                                    <input type="file" id="imagem" name="imagem" onChange={handleImagemChange} />
                                </div>
                                <button type="submit" className="btn-cadastrar">Cadastrar</button>
                                <button type="button" onClick={() => setShowCadastro(false)} className="btn-cancelar">Cancelar</button>
                                {formMessage && <p className={`form-message ${formMessage.startsWith('Erro') ? 'error' : 'success'}`}>{formMessage}</p>}
                            </form>
                        </div>
                    )}
                </div>
            )}

            <div className="container-eventos">
                {currentEvents.map(evento => (
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

            {eventosFiltrados.length > eventosPorPagina && (
                <div className="paginacao">
                    <button
                        className="btn-paginacao"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        ◀
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button
                        className="btn-paginacao"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        ▶
                    </button>
                </div>
            )}
        </div>
    );
}

export default Eventos;
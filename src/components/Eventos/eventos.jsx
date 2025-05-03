import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './eventos.css';

const Eventos = () => {
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([
        { id: 1, titulo: "Indaiatuba Festival", local: "Indaiatuba", hora: "19:00:00", data: "15/11/2023", imagem: "../images/evento1.png", genero: "Rock" },
        { id: 2, titulo: "Boom Bap Fest", local: "Campinas", hora: "20:00:00", data: "20/11/2023", imagem: "../images/evento2.png", genero: "Hip Hop" },
        { id: 3, titulo: "Show Rock na Praça", local: "Campinas", hora: "14:30:00", data: "25/11/2023", imagem: "../images/evento3.png", genero: "Rock" },
        { id: 4, titulo: "Sunset Eletrônico", local: "Indaiatuba", hora: "12:00:00", data: "30/11/2023", imagem: "../images/evento4.png", genero: "Eletrônica" },
        { id: 5, titulo: "Festival Indie", local: "Jundiaí", hora: "17:00:00", data: "05/12/2023", imagem: "../images/evento5.png", genero: "Indie" },
        { id: 6, titulo: "Techno Waves", local: "Itupeva", hora: "23:00:00", data: "10/12/2023", imagem: "../images/evento6.png", genero: "Techno" },
    ]);

    // States for booking system
    const [reservando, setReservando] = useState(null);
    const [mensagensReserva, setMensagensReserva] = useState({});
    const [usuarioLogado, setUsuarioLogado] = useState(null);

    // States for event creation form
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventoForm, setEventoForm] = useState({
        nomeEvento: '',
        dataHora: '',
        descricao: '',
        genero: '',
        local: ''
    });
    const [formMessage, setFormMessage] = useState('');

    const handleEventoClick = (eventoId) => {
        navigate(`/detalhes/${eventoId}`);
    };

    const formatDateTime = (dateStr, timeStr) => {
        const [day, month, year] = dateStr.split('/');
        const [hours, minutes, seconds] = timeStr.split(':');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    // Load logged in user data
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('/auth/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => setUsuarioLogado(response.data))
                .catch(error => console.error('Error loading user:', error));
        }
    }, []);

    const handleReservar = async (evento) => {
        setReservando(evento.id);
        setMensagensReserva(prev => ({ ...prev, [evento.id]: '' }));

        try {
            const token = localStorage.getItem('token');

            if (!usuarioLogado || !token) {
                throw new Error('You need to be logged in to make reservations');
            }

            if (!usuarioLogado.id) {
                throw new Error('User ID not found');
            }

            const dataHoraFormatada = formatDateTime(evento.data, evento.hora);

            const reservaData = {
                usuario: { id: usuarioLogado.id },
                evento: {
                    idEvento: evento.id,
                    dataHora: dataHoraFormatada
                },
                confirmado: false
            };

            const response = await axios.post('http://localhost:8080/reservas', reservaData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setMensagensReserva(prev => ({
                ...prev,
                [evento.id]: response.status === 201
                    ? `Reservation for "${evento.titulo}" successful!`
                    : `Error reserving "${evento.titulo}". Try again.`
            }));

        } catch (error) {
            setMensagensReserva(prev => ({
                ...prev,
                [evento.id]: `Error: ${error.response?.data?.message || error.message}`
            }));
        } finally {
            setReservando(null);
        }
    };

    // Handle genre creation
    const createGenre = async (genreName) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');

            const response = await axios.post('/genres', {
                nomeGenero: genreName,
                // Adicione outros campos obrigatórios se necessário
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating genre:', error);
            if (error.response?.status === 409) {
                // Se o gênero já existe, buscar o existente
                const existingGenre = await axios.get(`/genres?nomeGenero=${encodeURIComponent(genreName)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                return existingGenre.data;
            }
            throw error;
        }
    };

    // Handle place creation
    const createPlace = async (placeName) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');

            const response = await axios.post('/places', { local: placeName }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating place:', error);
            if (error.response?.status === 409) {
                return { local: placeName };
            }
            throw error;
        }
    };

    const handleCadastrarEvento = async (e) => {
        e.preventDefault();
        setFormMessage('');

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');

            // Primeiro cria/obtém o gênero
            const genre = await createGenre(eventoForm.genero);

            // Cria/obtém o local
            const place = await createPlace(eventoForm.local);

            // Formata a data/hora
            const date = new Date(eventoForm.dataHora);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            const dataHoraFormatada = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

            // Monta o objeto do evento
            const eventoData = {
                nomeEvento: eventoForm.nomeEvento,
                dataHora: dataHoraFormatada,
                descricao: eventoForm.descricao,
                generoMusical: genre,
                localEvento: place
            };

            // Envia para a API de eventos e obtém a resposta
            const response = await axios.post('/eventos', eventoData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Adiciona o novo evento à lista
            const novoEvento = {
                id: response.data.id, // Supondo que a API retorne o ID do novo evento
                titulo: eventoForm.nomeEvento,
                local: place.local || place.nome || eventoForm.local,
                hora: `${hours}:${minutes}:${seconds}`,
                data: `${day}/${month}/${year}`,
                imagem: "../images/evento-default.png", // Imagem padrão ou você pode adicionar um campo no formulário
                genero: genre.nomeGenero || eventoForm.genero
            };

            setEventos([...eventos, novoEvento]);

            setFormMessage('Event created successfully!');
            setEventoForm({
                nomeEvento: '',
                dataHora: '',
                descricao: '',
                genero: '',
                local: ''
            });

            setTimeout(() => setShowEventForm(false), 1500);

        } catch (error) {
            setFormMessage(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className='espaco-eventos'>
            {usuarioLogado?.role === 'HOST' && (
                <div className="host-actions">
                    <button
                        onClick={() => setShowEventForm(!showEventForm)}
                        className="btn-cadastrar-evento"
                    >
                        {showEventForm ? 'Cancelar' : 'Cadastrar Evento'}
                    </button>

                    {showEventForm && (
                        <div className="evento-form-container">
                            <h3>Cadastrar Novo Evento</h3>
                            <form onSubmit={handleCadastrarEvento}>
                                <div className="form-group">
                                    <label>Nome do Evento: </label>
                                    <input
                                        type="text"
                                        value={eventoForm.nomeEvento}
                                        onChange={(e) => setEventoForm({...eventoForm, nomeEvento: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Data/Hora:</label>
                                    <input
                                        type="datetime-local"
                                        value={eventoForm.dataHora}
                                        onChange={(e) => setEventoForm({...eventoForm, dataHora: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Descricao:</label>
                                    <textarea
                                        value={eventoForm.descricao}
                                        onChange={(e) => setEventoForm({...eventoForm, descricao: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Genero Musical:</label>
                                    <input
                                        type="text"
                                        value={eventoForm.genero}
                                        onChange={(e) => setEventoForm({...eventoForm, genero: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Endereco:</label>
                                    <input
                                        type="text"
                                        value={eventoForm.local}
                                        onChange={(e) => setEventoForm({...eventoForm, local: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="form-buttons">
                                    <button type="submit">Cadastrar Evento</button>
                                </div>

                                {formMessage && (
                                    <p className={`form-message ${formMessage.includes('success') ? 'success' : 'error'}`}>
                                        {formMessage}
                                    </p>
                                )}
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Events listing */}
            <div className="container-eventos">
                {eventos.map(evento => {
                    const dataHoraFormatada = formatDateTime(evento.data, evento.hora);

                    return (
                        <div
                            key={evento.id}
                            className="evento"
                            onClick={() => handleEventoClick(evento.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <img src={evento.imagem} alt={evento.titulo} />
                            <h3>{evento.titulo}</h3>
                            <p>{evento.local} - {dataHoraFormatada} ({evento.genero})</p>
                            <button
                                className="btn-reservar"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReservar(evento);
                                }}
                                disabled={reservando === evento.id}
                            >
                                {reservando === evento.id ? 'Processing...' : 'Reserve'}
                            </button>
                            {mensagensReserva[evento.id] && (
                                <p className="mensagem-reserva">{mensagensReserva[evento.id]}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Eventos;
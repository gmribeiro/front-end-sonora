import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './eventos.css';

const Eventos = () => {
    const [reservando, setReservando] = useState(null);
    const [mensagensReserva, setMensagensReserva] = useState({}); // Objeto para armazenar mensagens por ID de evento
    const [eventosIniciais] = useState([
        { id: 1, titulo: "Indaiatuba Festival", local: "Indaiatuba", hora: "19:00", imagem: "../images/evento1.png", genero: "Rock" },
        { id: 2, titulo: "Boom Bap Fest", local: "Campinas", hora: "20:00", imagem: "../images/evento2.png", genero: "Hip Hop" },
        { id: 3, titulo: "Show Rock na Praça", local: "Campinas", hora: "14:30", imagem: "../images/evento3.png", genero: "Rock" },
        { id: 4, titulo: "Sunset Eletrônico", local: "Indaiatuba", hora: "12:00", imagem: "../images/evento4.png", genero: "Eletrônica" },
        { id: 5, titulo: "Festival Indie", local: "Jundiaí", hora: "17:00", imagem: "../images/evento5.png", genero: "Indie" },
        { id: 6, titulo: "Techno Waves", local: "Itupeva", hora: "23:00", imagem: "../images/evento6.png", genero: "Techno" },
    ]);
    const [eventosExibidos, setEventosExibidos] = useState([...eventosIniciais]);
    const [usuarioLogado, setUsuarioLogado] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/auth/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
                .then(response => response.json())
                .then(data => {
                    setUsuarioLogado(data);
                    console.log("Dados do usuário logado:", data);
                })
                .catch(error => console.error('Erro ao buscar informações do usuário:', error));
        }
    }, []);

    const handleReservarClick = async (eventoExibido) => {
        setReservando(eventoExibido.id);
        setMensagensReserva(prev => ({ ...prev, [eventoExibido.id]: '' })); // Limpa a mensagem para este evento

        try {
            const token = localStorage.getItem('token');

            if (!usuarioLogado || !token) {
                setMensagensReserva(prev => ({ ...prev, [eventoExibido.id]: 'Você precisa estar logado para reservar.' }));
                setReservando(null);
                return;
            }

            if (!usuarioLogado.id) {
                setMensagensReserva(prev => ({ ...prev, [eventoExibido.id]: 'Erro: ID do usuário não encontrado.' }));
                setReservando(null);
                return;
            }

            const reservaData = {
                usuario: { id: usuarioLogado.id },
                evento: { idEvento: eventoExibido.id },
                confirmado: false
            };

            console.log("Payload da reserva:", reservaData);

            const responseReserva = await axios.post('http://localhost:8080/reservas', reservaData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (responseReserva.status === 201) {
                setMensagensReserva(prev => ({ ...prev, [eventoExibido.id]: `Reserva para "${eventoExibido.titulo}" realizada com sucesso!` }));
            } else {
                setMensagensReserva(prev => ({ ...prev, [eventoExibido.id]: `Erro ao reservar "${eventoExibido.titulo}". Tente novamente.` }));
            }
        } catch (error) {
            console.error("Erro ao reservar:", error.response?.data || error.message);
            setMensagensReserva(prev => ({ ...prev, [eventoExibido.id]: `Erro ao reservar "${eventoExibido.titulo}". ${error.response?.data?.message || error.message}` }));
        } finally {
            setReservando(null);
        }
    };

    return (
        <div className='espaco-eventos'>
            <div className="container-eventos">
                {eventosExibidos.map(evento => (
                    <div key={evento.id} className="evento">
                        <img src={evento.imagem} alt={evento.titulo} />
                        <h3>{evento.titulo}</h3>
                        <p>{evento.local} - {evento.hora} ({evento.genero})</p>
                        <button
                            className="btn-reservar"
                            onClick={() => handleReservarClick(evento)}
                            disabled={reservando === evento.id}
                        >
                            {reservando === evento.id ? 'Reservando...' : 'Reservar'}
                        </button>
                        {mensagensReserva[evento.id] && (
                            <p className="mensagem-reserva">{mensagensReserva[evento.id]}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Eventos;
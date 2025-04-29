import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './eventos.css';

const Eventos = () => {
    const [reservando, setReservando] = useState(null);
    const [mensagemReserva, setMensagemReserva] = useState('');
    const [eventos, setEventos] = useState([
        { id: 1, titulo: "Indaiatuba Festival", local: "Indaiatuba", hora: "19:00", imagem: "../images/evento1.png" },
        { id: 2, titulo: "Boom Bap Fest", local: "Campinas", hora: "20:00", imagem: "../images/evento2.png" },
        { id: 3, titulo: "Show Rock na Praça", local: "Campinas", hora: "14:30", imagem: "../images/evento3.png" },
        { id: 4, titulo: "Sunset Eletrônico", local: "Indaiatuba", hora: "12:00", imagem: "../images/evento4.png" },
        { id: 5, titulo: "Festival Indie", local: "Jundiaí", hora: "17:00", imagem: "../images/evento5.png" },
        { id: 6, titulo: "Techno Waves", local: "Itupeva", hora: "23:00", imagem: "../images/evento6.png" },
    ]);
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
                .then(data => setUsuarioLogado(data)) // Armazena o objeto completo do usuário
                .catch(error => console.error('Erro ao buscar informações do usuário:', error));
        }
    }, []);

    const handleReservarClick = async (evento) => {
        setReservando(evento.id);
        setMensagemReserva('');

        try {
            const token = localStorage.getItem('token');

            if (!usuarioLogado || !token) {
                setMensagemReserva('Você precisa estar logado para reservar.');
                setReservando(null);
                return;
            }

            const idReserva = uuidv4();

            const reservaData = {
                idReserva: idReserva,
                usuario: { id: usuarioLogado.id }, // Usa o 'id' do objeto usuarioLogado
                evento: { idEvento: evento.id },
                confirmado: false
            };

            const response = await axios.post('http://localhost:8080/reservas', reservaData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                setMensagemReserva(`Reserva para "${evento.titulo}" realizada com sucesso!`);
            } else {
                setMensagemReserva(`Erro ao reservar "${evento.titulo}". Tente novamente.`);
            }
        } catch (error) {
            console.error("Erro ao reservar:", error);
            setMensagemReserva(`Erro ao reservar "${evento.titulo}". Verifique sua conexão.`);
        } finally {
            setReservando(null);
        }
    };

    return (
        <div className='espaco-eventos'>
            <div className="container-eventos">
                {eventos.map(evento => (
                    <div key={evento.id} className="evento">
                        <img src={evento.imagem} alt={evento.titulo} />
                        <h3>{evento.titulo}</h3>
                        <p>{evento.local} - {evento.hora}</p>
                        <button
                            className="btn-reservar"
                            onClick={() => handleReservarClick(evento)}
                            disabled={reservando === evento.id}
                        >
                            {reservando === evento.id ? 'Reservando...' : 'Reservar'}
                        </button>
                        {mensagemReserva && reservando !== evento.id && (
                            <p className="mensagem-reserva">{mensagemReserva}</p>
                        )}
                    </div>
                ))}
                {mensagemReserva && reservando === null && (
                    <p className="mensagem-reserva global-mensagem">{mensagemReserva}</p>
                )}
            </div>
        </div>
    );
}

export default Eventos;
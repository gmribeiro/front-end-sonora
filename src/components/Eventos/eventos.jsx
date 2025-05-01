import React from 'react';
import './eventos.css';
import axios from 'axios'; // Importe o axios

const Eventos = () => {
    const eventos = [
        { id: 1, titulo: "Indaiatuba Festival", local: "Indaiatuba", hora: "19:00", imagem: "../images/evento1.png" },
        { id: 2, titulo: "Boom Bap Fest", local: "Campinas", hora: "20:00", imagem: "../images/evento2.png" },
        { id: 3, titulo: "Show Rock na Praça", local: "Campinas", hora: "14:30", imagem: "../images/evento3.png" },
        { id: 4, titulo: "Sunset Eletrônico", local: "Indaiatuba", hora: "12:00", imagem: "../images/evento4.png" },
        { id: 5, titulo: "Festival Indie", local: "Jundiaí", hora: "17:00", imagem: "../images/evento5.png" },
        { id: 6, titulo: "Techno Waves", local: "Itupeva", hora: "23:00", imagem: "../images/evento6.png" },
    ];

    const handleReservar = (evento) => {
        // Informações do usuário anônimo ou removidas
        const reservaData = {
            // Remova ou comente a linha do usuário se o backend não exigir
            // usuario: { id: null, nome: "Anônimo" },
            evento: { id: evento.id, titulo: evento.titulo },
            confirmado: false
        };

        axios.post('/reservas', reservaData, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                console.log('Reserva criada com sucesso:', response.data);
                alert(`Reserva para "${evento.titulo}" realizada!`);
            })
            .catch(error => {
                console.error('Erro ao criar reserva:', error);
                alert(`Erro ao reservar "${evento.titulo}". Tente novamente.`);
            });
    };

    return (
        <div className='espaco-eventos'>
            <div className="container-eventos">
                {eventos.map(evento => (
                    <div key={evento.id} className="evento">
                        <img src={evento.imagem} alt={evento.titulo}/>
                        <h3>{evento.titulo}</h3>
                        <p>{evento.local} - {evento.hora}</p>
                        <button className="btn-reservar" onClick={() => handleReservar(evento)}>Reservar</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Eventos;
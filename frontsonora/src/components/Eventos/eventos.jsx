import './eventos.css';

const Eventos = () => {
    const eventos = [
        { id: 1, titulo: "Indaiatuba Festival", local: "Indaiatuba", hora: "19:00", imagem: "/evento1.png" },
        { id: 2, titulo: "Boom Bap Fest", local: "Campinas", hora: "20:00", imagem: "/evento2.png" },
        { id: 3, titulo: "Show Rock na Praça", local: "Campinas", hora: "14:30", imagem: "/public/evento3.png" },
        { id: 4, titulo: "Sunset Eletrônico", local: "Indaiatuba", hora: "12:00", imagem: "/public/evento4.png" },
        { id: 5, titulo: "Festival Indie", local: "Jundiaí", hora: "17:00", imagem: "/public/evento5.png" },
        { id: 6, titulo: "Techno Waves", local: "Itupeva", hora: "23:00", imagem: "/public/evento6.png" },
    ];

    return (
        <div className="container-eventos">
            {eventos.map(evento => (
                <div key={evento.id} className="evento">
                    <img src={evento.imagem} alt={evento.titulo} />
                    <h3>{evento.titulo}</h3>
                    <p>{evento.local} - {evento.hora}</p>
                    <button className="btn-reservar">Reservar</button>
                </div>
            ))}
        </div>
    );
}

export default Eventos;

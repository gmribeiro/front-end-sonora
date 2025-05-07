import { useState } from 'react';
import './eventos.css';

const Eventos = ({ eventosFiltrados }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const eventosPorPagina = 6; // 2 linhas de 3 eventos cada
    
    const eventos = eventosFiltrados || [ { id: 1, titulo: "Indaiatuba Festival", local: "Indaiatuba", hora: "19:00", imagem: "../images/evento1.png", genero: "POP" }, { id: 2, titulo: "Boom Bap Fest", local: "Campinas", hora: "20:00", imagem: "../images/evento2.png", genero: "Rock'n roll" }, { id: 3, titulo: "Show Rock na Praça", local: "Campinas", hora: "14:30", imagem: "../images/evento3.png", genero: "Rock'n roll" }, { id: 4, titulo: "Sunset Eletrônico", local: "Indaiatuba", hora: "12:00", imagem: "../images/evento4.png", genero: "Eletrônica" }, { id: 5, titulo: "Festival Indie", local: "Jundiaí", hora: "17:00", imagem: "../images/evento5.png", genero: "Indie" }, { id: 6, titulo: "Techno Waves", local: "Itupeva", hora: "23:00", imagem: "../images/evento6.png", genero: "Eletrônica" }, { id: 7, titulo: "Sertanejo Universitário", local: "Campinas", hora: "21:00", imagem: "../images/evento7.png", genero: "Sertanejo" }, { id: 8, titulo: "MPB ao Vivo", local: "Indaiatuba", hora: "18:30", imagem: "../images/evento8.png", genero: "MPB" }, ];

    const totalPages = Math.ceil(eventos.length / eventosPorPagina);
    const eventosAtuais = eventos.slice(
        currentPage * eventosPorPagina,
        (currentPage + 1) * eventosPorPagina
    );

    const handlePrevious = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    return (
        <div className='espaco-eventos'>
            <div className="container-eventos">
                {eventosAtuais.map(evento => (
                    <div key={evento.id} className="evento">
                        <div className="evento-imagem-container">
                            <img src={evento.imagem} alt={evento.titulo} className="evento-imagem" />
                        </div>
                        <h3>{evento.titulo}</h3>
                        <p>{evento.local} - {evento.hora}</p>
                        <button className="btn-reservar">Reservar</button>
                    </div>
                ))}
            </div>
            
            {eventos.length > eventosPorPagina && (
                <div className="paginacao">
                    <button 
                        onClick={handlePrevious} 
                        disabled={currentPage === 0}
                        className="btn-paginacao"
                    >
                        &lt;
                    </button>
                    <span>Página {currentPage + 1} de {totalPages}</span>
                    <button 
                        onClick={handleNext} 
                        disabled={currentPage === totalPages - 1}
                        className="btn-paginacao"
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}

export default Eventos;
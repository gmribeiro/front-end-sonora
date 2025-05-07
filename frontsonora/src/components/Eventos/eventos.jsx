import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './eventos.css';

const Eventos = ({ eventosFiltrados, eventosCompletos }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const eventosPorPagina = 6;
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentPage(0);
    }, [eventosFiltrados]);

    const handleEventoClick = (eventoId) => {
        navigate(`/infoevento/${eventoId}`);
    };

    const totalPages = Math.ceil(eventosFiltrados.length / eventosPorPagina);
    const eventosAtuais = eventosFiltrados.slice(
        currentPage * eventosPorPagina,
        (currentPage + 1) * eventosPorPagina
    );

    const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));

    return (
        <div className='espaco-eventos'>
            <div className="container-eventos">
                {eventosAtuais.map(evento => (
                    <div 
                        key={evento.id} 
                        className="evento"
                        onClick={() => handleEventoClick(evento.id)}
                    >
                        <div className="evento-imagem-container">
                            <img src={evento.imagem} alt={evento.titulo} className="evento-imagem" />
                        </div>
                        <h3>{evento.titulo}</h3>
                        <p>{evento.local} - {evento.hora}</p>
                        <button 
                            className="btn-reservar"
                            onClick={(e) => {
                                e.stopPropagation();
                                // Adicione aqui a lógica para reservar
                            }}
                        >
                            Reservar
                        </button>
                    </div>
                ))}
            </div>
            
            {eventosFiltrados.length > eventosPorPagina && (
                <div className="paginacao">
                    <button onClick={handlePrevious} disabled={currentPage === 0} className="btn-paginacao">
                        &lt;
                    </button>
                    <span>Página {currentPage + 1} de {totalPages}</span>
                    <button onClick={handleNext} disabled={currentPage === totalPages - 1} className="btn-paginacao">
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}

export default Eventos;
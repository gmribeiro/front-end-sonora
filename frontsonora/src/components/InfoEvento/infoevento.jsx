import { useParams } from 'react-router-dom';
import './infoevento.css';

const InfoEvento = ({ eventos, onVoltar }) => {
    const { id } = useParams();
    const evento = eventos.find(e => e.id === parseInt(id));

    if (!evento) {
        return (
            <div className="info-evento-container">
                <button onClick={onVoltar} className="btn-voltar">
                    &larr; Voltar
                </button>
                <div className="evento-nao-encontrado">
                    Evento não encontrado
                </div>
            </div>
        );
    }

    return (
        <div className="info-evento-container">
            <button onClick={onVoltar} className="btn-voltar">
                &larr; Voltar
            </button>
            
            <div className="info-evento-content">
                <div className="info-evento-imagem">
                    <img src={evento.imagem} alt={evento.titulo} />
                </div>
                
                <div className="info-evento-detalhes">
                    <h1>{evento.titulo}</h1>
                    <p><strong>Local:</strong> {evento.local}</p>
                    <p><strong>Horário:</strong> {evento.hora}</p>
                    <p><strong>Gênero:</strong> {evento.genero}</p>
                    
                    <button className="btn-reservar">
                        Reservar Ingresso
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoEvento;
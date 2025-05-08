import { useParams, useNavigate } from 'react-router-dom';
import './InfoEvento.css';

const InfoEvento = ({ eventos, onVoltar }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const evento = eventos.find(e => e.id === parseInt(id));

    if (!evento) {
        return <div>Evento não encontrado</div>;
    }

    return (
        <div className="info-evento-container">
            <button onClick={() => navigate(-1)} className="btn-voltar">
                Voltar
            </button>
            <div className="info-evento-content">
                <img src={evento.imagem} alt={evento.titulo} className="info-evento-imagem" />
                <div className="info-evento-detalhes">
                    <h1>{evento.titulo}</h1>
                    <p><strong>Local:</strong> {evento.local}</p>
                    <p><strong>Horário:</strong> {evento.hora}</p>
                    <p><strong>Gênero:</strong> {evento.genero}</p>
                </div>
            </div>
        </div>
    );
};

export default InfoEvento;
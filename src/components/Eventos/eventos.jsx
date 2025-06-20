import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api';
import PropTypes from 'prop-types';

const Eventos = ({ eventosFiltrados, currentPage, setCurrentPage, onEventoCadastrado }) => {
    const navigate = useNavigate();
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [userId, setUserId] = useState(null);
    const [reservandoId, setReservandoId] = useState(null);
    const [mensagemReserva, setMensagemReserva] = useState('');
    const [generos, setGeneros] = useState([]);
    const [formMessage, setFormMessage] = useState('');
    const [showCadastro, setShowCadastro] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const [nomeEvento, setNomeEvento] = useState('');
    const [dataHora, setDataHora] = useState('');
    const [horaEncerramento, setHoraEncerramento] = useState('');
    const [descricao, setDescricao] = useState('');
    const [classificacao, setClassificacao] = useState('');
    const [selectedGeneroId, setSelectedGeneroId] = useState('');
    const [localEventoNome, setLocalEventoNome] = useState('');
    const [cep, setCep] = useState('');
    const [numero, setNumero] = useState('');
    const [eventImageFile, setEventImageFile] = useState(null);

    const eventosPorPagina = 6;
    const totalPaginas = Math.ceil(eventosFiltrados.length / eventosPorPagina);
    const indiceInicial = (currentPage - 1) * eventosPorPagina;
    const eventosPaginaAtual = eventosFiltrados.slice(indiceInicial, indiceInicial + eventosPorPagina);

    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/auth/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(response => {
                setUsuarioLogado(response.data);
                setUserId(response.data.id);
            }).catch(err => console.error(err));

            api.get('/genres')
                .then(response => setGeneros(response.data))
                .catch(err => console.error(err));
        }
    }, []);

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleReservar = async (eventoId) => {
        const token = localStorage.getItem('token');
        if (!usuarioLogado || usuarioLogado.role !== 'CLIENT') {
            setMensagemReserva('Apenas clientes podem reservar eventos.');
            return;
        }
        setReservandoId(eventoId);
        try {
            const response = await api.post('/reservas', {
                usuario: { id: usuarioLogado.id },
                evento: { idEvento: eventoId },
                confirmado: false
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMensagemReserva(`Reserva realizada com sucesso!`);
            setTimeout(() => navigate('/meusconvites'), 1500);
        } catch (error) {
            setMensagemReserva('Erro ao reservar o evento.');
        } finally {
            setReservandoId(null);
        }
    };

    const mudarPagina = (novaPagina) => {
        if (novaPagina < 1 || novaPagina > totalPaginas || isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentPage(novaPagina);
            setIsAnimating(false);
        }, 300);
    };

    return (
        <div className="bg-[#EDE6F2] px-4 py-8 min-h-[70vh] mb-20">
            <div className={`max-w-7xl mx-auto ${isAnimating ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0'} transition-all duration-300`}>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
                    {eventosPaginaAtual.map(evento => (
                        <div key={evento.id} onClick={() => navigate(`/detalhes/${evento.id}`)}
                             className="bg-gradient-to-b from-[#2E284E] via-[#5A4E75] to-[#E8DFEC] rounded-lg shadow-lg overflow-hidden transition hover:scale-[1.02] cursor-pointer w-full max-w-[350px]">
                            <div className="relative w-full h-[216px] sm:h-[288px] md:h-[400px]">
                                <img src={`${BACKEND_BASE_URL}/eventos/${evento.id}/image`} alt={evento.titulo}
                                     onError={(e) => { e.target.onerror = null; e.target.src = '/images/evento_padrao.png'; }}
                                     className="absolute w-full h-full object-cover" />
                            </div>
                            <div className="p-5">
                                <h3 className="text-[#564A72] text-base font-semibold truncate mb-2">{evento.titulo}</h3>
                                <p className="text-[#564A72] text-sm mb-3">{evento.local} - {evento.hora}</p>
                                {usuarioLogado?.role === 'CLIENT' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleReservar(evento.id); }}
                                            disabled={reservandoId === evento.id}
                                            className="w-full bg-[#5A4E75] hover:bg-[#2E284E] text-white py-2 px-4 rounded-md">
                                        {reservandoId === evento.id ? 'Reservando...' : 'Reservar'}
                                    </button>
                                )}
                                {mensagemReserva && reservandoId === evento.id && (
                                    <p className="mt-2 text-xs text-center text-[#5A4E75]">{mensagemReserva}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {totalPaginas > 1 && (
                <div className="flex justify-center gap-4 mt-8">
                    <button onClick={() => mudarPagina(currentPage - 1)} disabled={currentPage === 1 || isAnimating}
                            className="bg-[#5A4E75] hover:bg-[#2E284E] text-white w-8 h-8 rounded-full disabled:opacity-50">
                        &lt;
                    </button>
                    <span className="text-[#2E284E] font-bold">Página {currentPage} de {totalPaginas}</span>
                    <button onClick={() => mudarPagina(currentPage + 1)} disabled={currentPage === totalPaginas || isAnimating}
                            className="bg-[#5A4E75] hover:bg-[#2E284E] text-white w-8 h-8 rounded-full disabled:opacity-50">
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
};

Eventos.propTypes = {
    eventosFiltrados: PropTypes.array.isRequired,
    currentPage: PropTypes.number.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    onEventoCadastrado: PropTypes.func
};

Eventos.defaultProps = {
    onEventoCadastrado: () => {}
};

export default Eventos;

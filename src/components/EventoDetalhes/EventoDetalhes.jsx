import { useState, useEffect } from 'react';
import api from '../../api';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt } from "react-icons/fa";
import { MdPlace } from "react-icons/md";
import { IoMdMusicalNotes } from "react-icons/io";
import useTitle from '../../hooks/useTitle';

const EventoDetalhes = () => {
    useTitle('Dados Evento - Sonora');

    const { id } = useParams();
    const navigate = useNavigate();

    const [evento, setEvento] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [reservando, setReservando] = useState(false);
    const [mensagemReserva, setMensagemReserva] = useState('');
    const [carregandoUsuarioReserva, setCarregandoUsuarioReserva] = useState(false);
    const [eventImageUrl, setEventImageUrl] = useState(null);
    const [escalasDoEvento, setEscalasDoEvento] = useState([]);
    const [carregandoEscalas, setCarregandoEscalas] = useState(false);
    const [erroEscalas, setErroEscalas] = useState(null);
    const [jaReservado, setJaReservado] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                setCarregando(true);
                setErro(null);

                const token = localStorage.getItem('token');

                const eventoResponse = await api.get(`/eventos/${id}`);
                const eventoData = eventoResponse.data;
                setEvento(eventoData);

                let loggedInUser = null;
                if (token) {
                    loggedInUser = await verificarUsuarioLogado(token);
                    setUsuarioLogado(loggedInUser);

                    if (loggedInUser?.id && eventoData?.idEvento) {
                        try {
                            const reservasResponse = await api.get(`/reservas/usuario/${loggedInUser.id}/evento/${eventoData.idEvento}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            setJaReservado(reservasResponse.data.length > 0);
                        } catch (reservaError) {
                            if (reservaError.response && reservaError.response.status === 404) {
                                setJaReservado(false);
                            } else {
                                console.error('Erro ao verificar reserva existente:', reservaError);
                            }
                        }
                    }
                }

                if (eventoData && eventoData.idEvento) {
                    // Use a URL do seu backend que faz o redirecionamento
                    setEventImageUrl(`${api.defaults.baseURL}/eventos/${eventoData.idEvento}/image`);
                } else {
                    setEventImageUrl('/images/evento_padrao.png');
                }

            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setErro(error.response?.data?.message || 'Erro ao carregar evento');
            } finally {
                setCarregando(false);
            }
        };

        const verificarUsuarioLogado = async (token) => {
            if (!token) return null;
            try {
                const response = await api.get('/auth/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return response.data;
            } catch (error) {
                console.error('Erro ao verificar usuário:', error);
                return null;
            }
        };

        carregarDados();
    }, [id, api.defaults.baseURL]);

    useEffect(() => {
        const fetchEscalasDoEvento = async () => {
            if (!id) return;
            setCarregandoEscalas(true);
            setErroEscalas(null);
            try {
                const response = await api.get(`/escalas/event/${id}`);

                if (response.status === 204) {
                    setEscalasDoEvento([]);
                    setErroEscalas('Os artistas escalados serão anunciados em breve!');
                    return;
                }

                if (Array.isArray(response.data)) {
                    const artistasNomes = response.data.flatMap(escala =>
                        escala.musicos.map(musico => musico.nomeMusico)
                    );
                    setEscalasDoEvento(artistasNomes);
                } else {
                    console.error('Dados de escalas recebidos da API não são um array:', response.data);
                    setErroEscalas('Formato de dados inesperado da API.');
                    setEscalasDoEvento([]);
                }
            } catch (error) {
                console.error('Erro ao carregar escalas do evento:', error);
                setErroEscalas('Erro ao carregar os artistas escalados.');
                setEscalasDoEvento([]);
            } finally {
                setCarregandoEscalas(false);
            }
        };
        fetchEscalasDoEvento();
    }, [id]);

    const handleReservar = async () => {
        if (usuarioLogado?.role !== 'CLIENT') {
            setMensagemReserva('Apenas clientes podem fazer reservas.');
            return;
        }

        if (jaReservado && !mostrarConfirmacao) {
            setMostrarConfirmacao(true);
            return;
        }

        if (!evento?.idEvento) {
            alert('Dados do evento incompletos');
            return;
        }

        if (!usuarioLogado?.id) {
            setCarregandoUsuarioReserva(true);
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userResponse = await api.get('/auth/user/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setUsuarioLogado(userResponse.data);
                    if (!userResponse.data?.id) {
                        setMensagemReserva('Não foi possível obter o ID do usuário logado.');
                        setCarregandoUsuarioReserva(false);
                        return;
                    }
                } catch {
                    setMensagemReserva('Erro ao carregar informações do usuário.');
                    setCarregandoUsuarioReserva(false);
                    return;
                } finally {
                    setCarregandoUsuarioReserva(false);
                }
            } else {
                navigate('/acesso', { state: { from: `/detalhes/${id}` } });
                return;
            }
        }

        if (!usuarioLogado?.id) {
            setMensagemReserva('É necessário estar logado para fazer reservas.');
            return;
        }

        setReservando(true);
        setMensagemReserva('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/acesso', { state: { from: `/detalhes/${id}` } });
                return;
            }
            const reservaData = {
                usuario: { id: usuarioLogado.id },
                evento: { idEvento: evento.idEvento },
                confirmado: false
            };
            await api.post('/reservas', reservaData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setMensagemReserva(`Reserva para "${evento.nomeEvento || evento.titulo}" realizada com sucesso!`);
            setJaReservado(true);
            setMostrarConfirmacao(false);
        } catch (error) {
            let errorMessage = 'Erro ao processar reserva';
            if (error.response?.status === 401) {
                errorMessage = 'Sessão expirada. Faça login novamente.';
                localStorage.removeItem('token');
                navigate('/acesso');
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            setMensagemReserva(errorMessage);
        } finally {
            setReservando(false);
        }
    };

    const formatarDataHora = (dataHoraStr, horaEncerramentoStr) => {
        if (!dataHoraStr) return 'Data e hora não informadas';

        let data = 'Data não informada';
        let horaInicio = 'Hora não informada';
        let horaFim = 'Hora de encerramento não informada';

        try {
            const parseDateTimeString = (dtStr, isTimeOnly = false) => {
                if (!dtStr) return null;
                if (isTimeOnly) {
                    const datePart = '2000-01-01';
                    return new Date(`${datePart}T${dtStr}`);
                }
                const parts = dtStr.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
                if (parts) {
                    return new Date(`${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}:${parts[6]}`);
                }
                return new Date(dtStr);
            };

            const dataInicio = parseDateTimeString(dataHoraStr);
            if (dataInicio && !isNaN(dataInicio.getTime())) {
                data = dataInicio.toLocaleDateString('pt-BR');
                horaInicio = dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            } else {
                return 'Formato de data e hora de início inválido.';
            }

            const dataFim = parseDateTimeString(horaEncerramentoStr, true);
            if (dataFim && !isNaN(dataFim.getTime())) {
                horaFim = dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }

            return `${data} às ${horaInicio} até ${horaFim}`;
        } catch {
            return 'Erro ao processar data/hora.';
        }
    };

    if (carregando) {
        return <div className="text-center py-10 text-white">Carregando...</div>;
    }

    if (erro) {
        return (
            <div className="text-center py-10 text-red-500">
                <p>{erro}</p>
                <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Tentar novamente</button>
            </div>
        );
    }

    return (
        <div className="text-center py-10 text-white">Componente carregado corretamente.</div>
    );
};

export default EventoDetalhes;

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Avaliacoes = () => {
    const [nota, setNota] = useState(1);
    const [mensagem, setMensagem] = useState("");
    const [userRole, setUserRole] = useState(null);
    const [usuarioId, setUsuarioId] = useState(null);
    const [eventos, setEventos] = useState([]);
    const [eventoSelecionadoId, setEventoSelecionadoId] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const responseUser = await axios.get('/auth/user/me', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUserRole(responseUser.data?.role);
                    setUsuarioId(responseUser.data?.id);
                } catch (error) {
                    console.error("Erro ao carregar detalhes do usuário:", error);
                }
            }
        };

        const fetchEventos = async () => {
            const token = localStorage.getItem('token');
            if (usuarioId && token) {
                try {
                    const responseReservas = await axios.get(`/reservas/user/${usuarioId}/confirmed/past`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const eventosDasReservas = responseReservas.data.map(reserva => reserva.evento);
                    const eventosUnicos = Array.from(new Set(eventosDasReservas.map(e => e.idEvento)))
                        .map(id => eventosDasReservas.find(e => e.idEvento === id));
                    setEventos(eventosUnicos);
                } catch (error) {
                    console.error("Erro ao carregar eventos de reservas passadas:", error);
                }
            }
        };

        fetchUserDetails();
        fetchEventos();
    }, [usuarioId]);

    const handleNotaChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1 && value <= 5) {
            setNota(value);
        }
    };

    const handleMensagemChange = (e) => setMensagem(e.target.value);
    const handleEventoChange = (e) => setEventoSelecionadoId(e.target.value);
    const handleVoltar = () => navigate(-1);

    const handleSubmitAvaliacao = async () => {
        const token = localStorage.getItem('token');
        if (token && userRole === "CLIENT" && usuarioId && eventoSelecionadoId) {
            try {
                await axios.post(
                    "/avaliacoes",
                    {
                        nota,
                        mensagem,
                        usuarioId,
                        eventoId: eventoSelecionadoId,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                alert("Avaliação enviada com sucesso!");
                setNota(1);
                setMensagem("");
                setEventoSelecionadoId("");
            } catch (error) {
                console.error("Erro ao enviar avaliação:", error);
                alert("Erro ao enviar avaliação.");
            }
        } else if (userRole !== "CLIENT") {
            alert("Apenas clientes podem fazer avaliações.");
        } else {
            alert("Informações do usuário ou do evento ausentes.");
        }
    };

    return (
        <div
            className="h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
            style={{ backgroundImage: "url('/images/fundoavaliacao.png')" }}
        >
            <div className="w-full max-w-xl bg-[#f8f6ff] shadow-xl rounded-2xl p-8 sm:p-10 text-[#3f3864]">
                {userRole === "CLIENT" ? (
                    <>
                        <h3 className="text-2xl sm:text-3xl font-bold text-center mb-6">Avaliar Evento</h3>

                        <div className="mb-4">
                            <label htmlFor="evento" className="block font-semibold mb-1">Evento:</label>
                            <select
                                id="evento"
                                value={eventoSelecionadoId}
                                onChange={handleEventoChange}
                                className="w-full px-4 py-2 rounded-xl border-2 border-[#6d6384] bg-white text-sm sm:text-base focus:outline-none"
                                required
                            >
                                <option value="">Selecione um evento</option>
                                {eventos.map((evento) => (
                                    <option key={evento.idEvento} value={evento.idEvento}>
                                        {evento.nomeEvento}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="nota" className="block font-semibold mb-1">Nota (1-5):</label>
                            <select
                                id="nota"
                                value={nota}
                                onChange={handleNotaChange}
                                className="w-full px-4 py-2 rounded-xl border-2 border-[#6d6384] bg-white text-sm sm:text-base focus:outline-none"
                            >
                                {[1, 2, 3, 4, 5].map(n => (
                                    <option key={n} value={n}>{'★'.repeat(n)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="mensagem" className="block font-semibold mb-1">Mensagem (opcional):</label>
                            <textarea
                                id="mensagem"
                                value={mensagem}
                                onChange={handleMensagemChange}
                                className="w-full h-28 px-4 py-3 rounded-xl border-2 border-[#6d6384] bg-white text-sm sm:text-base focus:outline-none resize-none"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleSubmitAvaliacao}
                                className="bg-[#3f3864] hover:bg-[#2d274d] text-white font-semibold py-2 px-6 rounded-xl transition-colors"
                            >
                                Enviar Avaliação
                            </button>
                            <button
                                onClick={handleVoltar}
                                className="bg-[#6d6384] hover:bg-[#847aa3] text-white font-semibold py-2 px-6 rounded-xl transition-colors"
                            >
                                Voltar
                            </button>
                        </div>
                    </>
                ) : userRole ? (
                    <>
                        <p className="text-center mb-6">Você precisa ser um cliente para avaliar um evento.</p>
                        <div className="flex justify-center">
                            <button
                                onClick={handleVoltar}
                                className="bg-[#6d6384] hover:bg-[#847aa3] text-white font-semibold py-2 px-6 rounded-xl transition-colors"
                            >
                                Voltar
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-center">Carregando informações...</p>
                )}
            </div>
        </div>
    );
};

export default Avaliacoes;

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Avaliacoes.css";
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
            try {
                const responseEventos = await axios.get('/eventos');
                setEventos(responseEventos.data);
            } catch (error) {
                console.error("Erro ao carregar eventos:", error);
            }
        };

        fetchUserDetails();
        fetchEventos();
    }, []);

    const handleNotaChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value >= 1 && value <= 5) {
            setNota(value);
        }
    };

    const handleMensagemChange = (event) => {
        setMensagem(event.target.value);
    };

    const handleEventoChange = (event) => {
        setEventoSelecionadoId(event.target.value);
    };

    const handleSubmitAvaliacao = async () => {
        const token = localStorage.getItem('token');
        if (token && userRole === "CLIENT" && usuarioId && eventoSelecionadoId) {
            try {
                await axios.post(
                    "/avaliacoes",
                    {
                        nota: nota,
                        mensagem: mensagem,
                        usuarioId: usuarioId,
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
                setNota(1); // Reset form
                setMensagem("");
                setEventoSelecionadoId("");
            } catch (error) {
                console.error("Erro ao enviar avaliação:", error);
                alert("Erro ao enviar avaliação.");
            }
        } else if (userRole !== "CLIENT") {
            alert("Apenas clientes podem fazer avaliações.");
        } else if (!usuarioId || !eventoSelecionadoId) {
            alert("Informações do usuário ou do evento ausentes.");
        } else {
            alert("Token de autenticação não encontrado.");
        }
    };

    const handleVoltar = () => {
        navigate(-1); // Volta para a página anterior
    };

    if (userRole === "CLIENT") {
        return (
            <div className="avaliacoes-container">
                <h3>Avaliar Evento</h3>
                <div>
                    <label htmlFor="evento">Evento:</label>
                    <select id="evento" value={eventoSelecionadoId} onChange={handleEventoChange} required>
                        <option value="">Selecione um evento</option>
                        {eventos.map((evento) => (
                            <option key={evento.idEvento} value={evento.idEvento}>
                                {evento.nomeEvento}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="nota">Nota (1-5):</label>
                    <select id="nota" value={nota} onChange={handleNotaChange}>
                        <option value={1}>★</option>
                        <option value={2}>★★</option>
                        <option value={3}>★★★</option>
                        <option value={4}>★★★★</option>
                        <option value={5}>★★★★★</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="mensagem">Mensagem (opcional):</label>
                    <textarea
                        id="mensagem"
                        value={mensagem}
                        onChange={handleMensagemChange}
                    />
                </div>
                <button onClick={handleSubmitAvaliacao}>Enviar Avaliação</button>
                <button onClick={handleVoltar}>Voltar</button>
            </div>
        );
    } else if (userRole) {
        return (
            <div>
                <p>Você precisa ser um cliente para avaliar um evento.</p>
                <button onClick={handleVoltar}>Voltar</button>
            </div>
        );
    } else {
        return <p>Carregando informações...</p>;
    }
};

export default Avaliacoes;
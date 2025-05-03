import React, { useState, useEffect } from "react";
import "./notificacao.css";
import axios from "axios";

const notificacoesIniciais = [
    { id: 1, title: "Indaiatuba Fest", date: "10 de Abril de 2025", image: "../public/evento7.png", details: "Um festival incrível com diversas atrações musicais e gastronômicas." },
    { id: 2, title: "Boom Bap Fest", date: "15 de Novembro de 2024", image: "../public/evento7.png", details: "Celebração da cultura Hip Hop com shows de rap, DJs e batalhas de breaking." },
    { id: 3, title: "Rock na Praça", date: "27 de Abril de 2025", image: "../public/evento7.png", details: "Bandas de rock locais e convidadas agitando a praça principal da cidade." },
    { id: 4, title: "Rock na Praça", date: "27 de Abril de 2025", image: "../public/evento7.png", details: "Mais uma edição do nosso tradicional encontro de rock." },
    { id: 5, title: "Rock na Praça", date: "27 de Abril de 2025", image: "../public/evento7.png", details: "Prepare-se para muito som e energia!" },
    { id: 6, title: "Indaiatuba Arts", date: "10 de Abril de 2025", image: "../public/evento7.png", details: "Exposição de arte com trabalhos de artistas da região." },
    { id: 7, title: "Boom Bap Fest", date: "15 de Novembro de 2024", image: "../public/evento7.png", details: "Segunda edição do festival dedicado ao Boom Bap." },
    { id: 8, title: "Rock na Praça", date: "27 de Abril de 2025", image: "../public/evento7.png", details: "A última edição do Rock na Praça deste ano." },
];

const Notificacao = () => {
    const [notificacoesExibidas, setNotificacoesExibidas] = useState([]);
    const [detalhesVisiveis, setDetalhesVisiveis] = useState({});
    const [notificacoesLidas, setNotificacoesLidas] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [usuarioLogadoId, setUsuarioLogadoId] = useState(null);

    useEffect(() => {
        const fetchUsuarioId = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const responseUser = await axios.get('/auth/user/me', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUsuarioLogadoId(responseUser.data?.id);
                    if (responseUser.data?.id && notificacoesIniciais.length > 0 && notificacoesExibidas.length === 0) {
                        enviarNotificacaoParaBackend(0, responseUser.data.id);
                        setNotificacoesExibidas([notificacoesIniciais[0]]);
                        setCurrentIndex(1);
                    }
                } catch (error) {
                    console.error('Erro ao carregar informações do usuário:', error);
                }
            } else {
                console.warn("Token não encontrado.");
            }
        };

        fetchUsuarioId();
    }, [notificacoesExibidas.length]);

    useEffect(() => {
        const enviarNotificacaoInterval = async () => {
            if (usuarioLogadoId && currentIndex < notificacoesIniciais.length) {
                await enviarNotificacaoParaBackend(currentIndex, usuarioLogadoId);
                setNotificacoesExibidas(prev => [...prev, notificacoesIniciais[currentIndex]]);
                setCurrentIndex(prevIndex => prevIndex + 1);
            }
        };

        const intervalId = setInterval(enviarNotificacaoInterval,5 * 60 * 10000); // 10 segundos para teste

        return () => clearInterval(intervalId);
    }, [currentIndex, usuarioLogadoId]);

    const enviarNotificacaoParaBackend = async (index, usuarioId) => {
        const event = notificacoesIniciais[index];
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await axios.post(
                    "http://localhost:8080/notifications",
                    {
                        usuarioId: usuarioId,
                        mensagem: `Novo evento: ${event.title}, dia: ${event.date}`,
                        // Você pode enviar mais informações do 'event' se o backend esperar
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log(`Notificação POST para: ${event.title}`);
            } catch (error) {
                console.error("Erro ao enviar notificação para o backend:", error);
            }
        } else {
            console.warn("Token não encontrado, não foi possível enviar a notificação para o backend.");
        }
    };

    const handleVerDetalhes = (id) => {
        setDetalhesVisiveis(prevState => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const handleMarcarComoLida = async (id) => {
        const token = localStorage.getItem('token');
        const notificacaoParaMarcar = notificacoesIniciais.find(n => n.id === id);

        if (token && notificacaoParaMarcar) {
            try {
                await axios.put(
                    `http://localhost:8080/notifications/${id}/read`,
                    {
                        // Envie informações da notificação local para o PUT
                        title: notificacaoParaMarcar.title,
                        date: notificacaoParaMarcar.date,
                        // Envie outras propriedades relevantes da notificação local
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setNotificacoesLidas(prev => ({
                    ...prev,
                    [id]: true,
                }));
                setNotificacoesExibidas(prev =>
                    prev.map(n => (n.id === id ? { ...n, lida: true } : n))
                );
                console.log(`Notificação ${id} marcada como lida no backend.`);
            } catch (error) {
                console.error(`Erro ao marcar notificação ${id} como lida no backend:`, error);
            }
        } else {
            console.warn("Token não encontrado ou notificação não encontrada.");
        }
    };

    return (
        <main className="notifications-container">
            <h2 className="notifications-title">Notificações</h2>
            <div className="notifications-grid">
                {notificacoesExibidas.map((notificacao) => (
                    <div
                        className={`notification-card ${detalhesVisiveis[notificacao.id] ? 'com-detalhes' : ''} ${notificacoesLidas[notificacao.id] ? 'lida' : ''}`}
                        key={notificacao.id}
                    >
                        <div className="notification-content">
                            <img src={`/images/${notificacao.image}`} alt={notificacao.title} className="notification-image" />
                            <h3 className="notification-title">{notificacao.title}</h3>
                            <p className="notification-date">Data: {notificacao.date}</p>
                            <button onClick={() => handleVerDetalhes(notificacao.id)}>
                                {detalhesVisiveis[notificacao.id] ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                            </button>
                            {detalhesVisiveis[notificacao.id] && (
                                <div className="notification-details">
                                    <p>{notificacao.details}</p>
                                </div>
                            )}
                        </div>
                        <div className="notification-actions">
                            <button
                                onClick={() => handleMarcarComoLida(notificacao.id)}
                                disabled={notificacoesLidas[notificacao.id] || false}
                            >
                                {notificacoesLidas[notificacao.id] ? 'Já Lida' : 'Marcar como Lida'}
                            </button>
                            <div className="notification-icon">🔔</div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default Notificacao;
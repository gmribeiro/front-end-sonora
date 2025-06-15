import React, { useState, useEffect } from "react";
import "./notificacao.css";
import api from "../../api";

const Notificacao = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [detalhesVisiveis, setDetalhesVisiveis] = useState({});
  const [notificacoesLidasLocal, setNotificacoesLidasLocal] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [notificacoesVisiveis, setNotificacoesVisiveis] = useState({}); // Controla a visibilidade das notificações

  useEffect(() => {
    const buscarUsuario = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/user/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUsuarioLogado(response.data);
        } catch (error) {
          console.error('Erro ao buscar informações do usuário:', error);
          setError("Erro ao buscar informações do usuário.");
          setIsLoading(false);
        }
      } else {
        console.warn("Token não encontrado.");
        setError("Token não encontrado.");
        setIsLoading(false);
      }
    };

    buscarUsuario();
  }, []);

  useEffect(() => {
    const fetchNotificacoes = async () => {
      if (usuarioLogado?.id) {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        try {
          const response = await api.get(`/notifications/user/${usuarioLogado.id}`, { 
            headers: { Authorization: `Bearer ${token}` },
          });
          setNotificacoes(response.data);
          const initialVisibility = {};
          response.data.forEach(n => (initialVisibility[n.idNotificacao] = true));
          setNotificacoesVisiveis(initialVisibility);
        } catch (error) {
          console.error("Erro ao buscar notificações:", error);
          setError("Erro ao buscar notificações.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchNotificacoes();
  }, [usuarioLogado?.id]);

  const handleVerDetalhes = (id) => {
    setDetalhesVisiveis(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handleMarcarComoLida = async (idNotificacao) => {
    console.log("ID recebido para marcar como lida:", idNotificacao);
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put(
            `/notifications/${idNotificacao}/read`,
            {
              lida: true,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
        );

        setNotificacoesLidasLocal(prev => ({ ...prev, [idNotificacao]: true }));
        setNotificacoes(prev =>
            prev.map(n => (n.idNotificacao === idNotificacao ? { ...n, lida: true } : n))
        );

        setTimeout(() => {
          setNotificacoesVisiveis(prev => ({ ...prev, [idNotificacao]: false }));
        }, 3000);

        console.log(`Notificação ${idNotificacao} marcada como lida no backend e sumirá em 3s.`);
      } catch (error) {
        console.error(`Erro ao marcar notificação ${idNotificacao} como lida no backend:`, error);
        setNotificacoesLidasLocal(prev => {
          const newState = { ...prev };
          delete newState[idNotificacao];
          return newState;
        });
      }
    } else {
      console.warn("Token não encontrado.");
    }
  };

  if (isLoading) {
    return <div className="loading-message">Carregando notificações...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
      <main className="notifications-container">
        <h2 className="notifications-title">Notificações</h2>
        <div className="notifications-grid">
          {notificacoes.map((notificacao) => (
              notificacoesVisiveis[notificacao.idNotificacao] && (
                  <div
                      className={`notification-card ${detalhesVisiveis[notificacao.idNotificacao] ? 'com-detalhes' : ''} ${notificacoesLidasLocal[notificacao.idNotificacao] || notificacao.lida ? 'lida' : ''}`}
                      key={notificacao.idNotificacao}
                  >
                    <div className="notification-content">
                      <img src={`/images/${notificacao.image || 'evento7.png'}`} alt={notificacao.title || notificacao.mensagem} className="notification-image" />
                      <h3 className="notification-title">{notificacao.title || notificacao.mensagem}</h3>
                      <p className="notification-date">Data: {notificacao.date || (notificacao.dataCriacao ? new Date(notificacao.dataCriacao).toLocaleDateString() : '')}</p>
                      <button onClick={() => handleVerDetalhes(notificacao.idNotificacao)}>
                        {detalhesVisiveis[notificacao.idNotificacao] ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                      </button>
                      {detalhesVisiveis[notificacao.idNotificacao] && (
                          <div className="notification-details">
                            <p>{notificacao.details || notificacao.mensagem}</p>
                          </div>
                      )}
                    </div>
                    <div className="notification-actions">
                      <button
                          onClick={() => handleMarcarComoLida(notificacao.idNotificacao)}
                          disabled={notificacoesLidasLocal[notificacao.idNotificacao] || notificacao.lida || false}
                      >
                        {notificacoesLidasLocal[notificacao.idNotificacao] || notificacao.lida ? 'Já Lida' : 'Marcar como Lida'}
                      </button>
                      <div className="notification-icon">🔔</div>
                    </div>
                  </div>
              )
          ))}
        </div>
      </main>
  );
};

export default Notificacao;
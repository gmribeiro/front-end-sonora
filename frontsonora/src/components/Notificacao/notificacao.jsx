import React, { useState, useEffect } from "react";
import "./notificacao.css";
import axios from "axios";

const Notificacao = () => {
  const [notificacaoUnica, setNotificacaoUnica] = useState(null);
  const [notificacaoId, setNotificacaoId] = useState(null); // Estado para armazenar o ID da notificação
  const [detalhesVisiveis, setDetalhesVisiveis] = useState(false);
  const [notificacaoLidaLocal, setNotificacaoLidaLocal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotificacaoUnica = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`/notifications/1`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNotificacaoUnica(response.data);
          setNotificacaoId(response.data?.idNotificacao); // Armazena o ID no estado (camelCase)
        } catch (error) {
          console.error("Erro ao buscar notificação:", error);
          setError("Erro ao buscar notificação.");
        } finally {
          setIsLoading(false);
        }
      } else {
        console.warn("Token não encontrado.");
        setError("Token não encontrado.");
        setIsLoading(false);
      }
    };

    fetchNotificacaoUnica();
  }, []);

  const handleVerDetalhes = () => {
    setDetalhesVisiveis(!detalhesVisiveis);
  };

  const handleMarcarComoLida = async () => {
    if (!notificacaoId) {
      console.warn("ID da notificação não disponível para marcar como lida.");
      return;
    }

    console.log("ID para marcar como lida:", notificacaoId);
    const token = localStorage.getItem('token');
    if (token && notificacaoUnica) {
      try {
        await axios.put(
            `/notifications/${notificacaoId}/read`, // Usa o ID do estado
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

        setNotificacaoLidaLocal(true);
        setNotificacaoUnica({ ...notificacaoUnica, lida: true });
        console.log(`Notificação ${notificacaoId} marcada como lida no backend.`);
      } catch (error) {
        console.error(`Erro ao marcar notificação ${notificacaoId} como lida no backend:`, error);
        setNotificacaoLidaLocal(false);
      }
    } else {
      console.warn("Token não encontrado ou notificação não carregada.");
    }
  };

  if (isLoading) {
    return <div className="loading-message">Carregando notificação...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!notificacaoUnica) {
    return <div>Nenhuma notificação encontrada.</div>;
  }

  return (
      <main className="notifications-container">
        <h2 className="notifications-title">Notificação</h2>
        <div className="notifications-grid">
          <div
              className={`notification-card ${detalhesVisiveis ? 'com-detalhes' : ''} ${notificacaoLidaLocal || notificacaoUnica.lida ? 'lida' : ''}`}
              key={notificacaoUnica?.idNotificacao} // Usa a chave correta (opcional chaining para evitar erros iniciais)
          >
            <div className="notification-content">
              <img src={`/images/${notificacaoUnica?.image || 'evento7.png'}`} alt={notificacaoUnica?.title || notificacaoUnica?.mensagem} className="notification-image" />
              <h3 className="notification-title">{notificacaoUnica?.title || notificacaoUnica?.mensagem}</h3>
              <p className="notification-date">Data: {notificacaoUnica?.date || (notificacaoUnica?.dataCriacao ? new Date(notificacaoUnica.dataCriacao).toLocaleDateString() : '')}</p>
              <button onClick={handleVerDetalhes}>
                {detalhesVisiveis ? 'Ocultar Detalhes' : 'Ver Detalhes'}
              </button>
              {detalhesVisiveis && (
                  <div className="notification-details">
                    <p>{notificacaoUnica?.details || notificacaoUnica?.mensagem}</p>
                  </div>
              )}
            </div>
            <div className="notification-actions">
              <button
                  onClick={handleMarcarComoLida}
                  disabled={isLoading || notificacaoLidaLocal || notificacaoUnica?.lida || !notificacaoId}
              >
                {notificacaoLidaLocal || notificacaoUnica?.lida ? 'Já Lida' : 'Marcar como Lida'}
              </button>
              <div className="notification-icon">🔔</div>
            </div>
          </div>
        </div>
      </main>
  );
};

export default Notificacao;
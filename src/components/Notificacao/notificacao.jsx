import React, { useState, useEffect } from "react";
import api from "../../api";

const Notificacao = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [detalhesVisiveis, setDetalhesVisiveis] = useState({});
  const [notificacoesLidasLocal, setNotificacoesLidasLocal] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [notificacoesVisiveis, setNotificacoesVisiveis] = useState({});
  const [filtro, setFiltro] = useState('Todas');
  const [unreadCount, setUnreadCount] = useState(0);

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

          setUnreadCount(response.data.filter(n => !n.lida).length);

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
        setNotificacoes(prev => {
          const updatedNotifs = prev.map(n => (n.idNotificacao === idNotificacao ? { ...n, lida: true } : n));
          setUnreadCount(updatedNotifs.filter(n => !n.lida).length);
          return updatedNotifs;
        });

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

  const notificacoesFiltradas = notificacoes.filter(notificacao => {
    if (filtro === 'Unidade') {
      return !notificacao.lida;
    }
    return true;
  });

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#EDE6F2] text-[#5A4E75] text-xl">
          Carregando notificações...
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#EDE6F2] text-red-600 text-xl">
          {error}
        </div>
    );
  }

  return (
      <main className="bg-[#EDE6F2] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#5A4E75] mb-6 sm:mb-8 text-center">Notificações</h2>

          <div className="flex justify-center gap-4 mb-6 sm:mb-8">
            <button
                onClick={() => setFiltro('Unidade')}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                    filtro === 'Unidade'
                        ? 'bg-[#5A4E75] text-white shadow-md'
                        : 'bg-white text-[#5A4E75] border border-[#5A4E75] hover:bg-[#E8DFEC]'
                }`}
            >
              Unidade ({unreadCount})
            </button>
            <button
                onClick={() => setFiltro('Todas')}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                    filtro === 'Todas'
                        ? 'bg-[#5A4E75] text-white shadow-md'
                        : 'bg-white text-[#5A4E75] border border-[#5A4E75] hover:bg-[#E8DFEC]'
                }`}
            >
              Todas
            </button>
          </div>

          {filtro === 'Todas' && unreadCount > 0 && (
              <p className="text-[#564A72] text-center text-sm mb-4 sm:text-base">
                {unreadCount} atualizações não visualizadas
              </p>
          )}

          {notificacoesFiltradas.length === 0 ? (
              <div className="text-center text-[#5A4E75] text-lg sm:text-xl mt-10">
                {filtro === 'Unidade' ? 'Nenhuma notificação não lida.' : 'Nenhuma notificação para exibir.'}
              </div>
          ) : (
      <div className="space-y-4">
        {notificacoesFiltradas.map((notificacao) => (
            notificacoesVisiveis[notificacao.idNotificacao] && (
                <div
                    className={`relative bg-white rounded-lg shadow-md p-4 sm:p-6 transition-all duration-300 ${
                        detalhesVisiveis[notificacao.idNotificacao] ? 'scale-[1.01] shadow-lg' : ''
                    } ${notificacoesLidasLocal[notificacao.idNotificacao] || notificacao.lida ? 'opacity-70' : ''}`}
                    key={notificacao.idNotificacao}
                >
                  <p className="absolute top-4 right-4 text-xs sm:text-sm text-gray-500">
                    {notificacao.date || (notificacao.dataCriacao ? new Date(notificacao.dataCriacao).toLocaleDateString() : '')}
                  </p>

                  <div className="flex items-start gap-4">
                    <img
                        src={`/images/${notificacao.image || 'evento7.png'}`}
                        alt="Ícone de Notificação"
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                    />

                    <div className="flex-grow">
                      <h3 className="text-lg sm:text-xl font-semibold text-[#5A4E75] mb-1">{notificacao.title || notificacao.mensagem}</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-2">{notificacao.details || notificacao.mensagem}</p> {/* Assumi que details é a descrição completa */}

                      {!(notificacao.lida || notificacoesLidasLocal[notificacao.idNotificacao]) && (
                          <span className="inline-block bg-[#7d6588] text-white text-xs font-semibold px-3 py-1 rounded-full mt-1">
                                Não Visualizada
                              </span>
                      )}

                      {notificacao.details && (
                          <button
                              onClick={() => handleVerDetalhes(notificacao.idNotificacao)}
                              className="mt-2 text-[#5A4E75] hover:text-[#7d6588] text-sm underline transition-colors duration-200"
                          >
                            {detalhesVisiveis[notificacao.idNotificacao] ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                          </button>
                      )}

                      {detalhesVisiveis[notificacao.idNotificacao] && notificacao.details && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-700 border border-gray-200">
                            <p>{notificacao.details}</p>
                          </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <button
                        onClick={() => handleMarcarComoLida(notificacao.idNotificacao)}
                        disabled={notificacoesLidasLocal[notificacao.idNotificacao] || notificacao.lida}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                            notificacoesLidasLocal[notificacao.idNotificacao] || notificacao.lida
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-[#5A4E75] hover:bg-[#2E284E] text-white'
                        }`}
                    >
                      {notificacoesLidasLocal[notificacao.idNotificacao] || notificacao.lida ? 'Já Lida' : 'Marcar como Lida'}
                    </button>
                  </div>
                </div>
            )
        ))}
      </div>
          )}
        </div>
      </main>
  );
};

Notificacao.propTypes = {};

export default Notificacao;

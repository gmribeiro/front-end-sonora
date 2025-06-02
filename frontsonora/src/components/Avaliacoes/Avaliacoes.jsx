import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { IoIosStar } from "react-icons/io";

// Definição das cores para fácil ajuste e consistência
const COLORS = {
  primary: '#3f3864', // Roxo escuro
  secondary: '#6d6384', // Roxo médio
  backgroundLight: '#f8f6ff', // Roxo muito pálido
  borderLight: '#e0e0e0', // Cinza claro para bordas
  textDark: '#2d274d', // Texto quase preto para contraste
  textMedium: '#666666', // Texto médio para detalhes
  starFilled: '#2d274d', // Cor da estrela preenchida
  starEmpty: '#d1d5db', // Cor da estrela vazia (gray-400)
  buttonPrimaryBg: '#3f3864',
  buttonPrimaryHover: '#6d6384',
  buttonSecondaryBg: '#6d6384',
  buttonSecondaryHover: '#2d274d',
};

// Componente de Mensagem de Carregamento
const LoadingMessage = ({ message = "Carregando informações..." }) => (
  <div className="flex items-center justify-center p-6 text-center text-lg font-medium" style={{ color: COLORS.primary }}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mr-3" style={{ borderColor: COLORS.secondary }}></div>
    {message}
  </div>
);

// Componente de Mensagem de Erro/Alerta
const AlertMessage = ({ message, type = "info" }) => {
  let bgColor, textColor, borderColor;
  switch (type) {
    case "error":
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      borderColor = 'border-red-400';
      break;
    case "success":
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      borderColor = 'border-green-400';
      break;
    case "warning":
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      borderColor = 'border-yellow-400';
      break;
    default:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      borderColor = 'border-blue-400';
  }
  return (
    <div className={`${bgColor} ${borderColor} ${textColor} px-4 py-3 rounded relative text-center`} role="alert">
      <p className="font-bold">{message}</p>
    </div>
  );
};

const Avaliacoes = () => {
  // Estados do componente
  const [nota, setNota] = useState(1);
  const [mensagem, setMensagem] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' }); // Para feedback de formulário

  const navigate = useNavigate();

  // Função auxiliar para obter o token de autorização
  const getAuthToken = useCallback(() => localStorage.getItem('token'), []);

  // Efeito para carregar detalhes do usuário
  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        setError("Token de autenticação não encontrado. Por favor, faça login.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/auth/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserRole(response.data?.role);
        setUsuarioId(response.data?.id);
      } catch (err) {
        console.error("Erro ao carregar detalhes do usuário:", err);
        setError("Não foi possível carregar suas informações. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [getAuthToken]);

  // Efeito para carregar eventos passados do usuário após o ID do usuário ser definido
  useEffect(() => {
    const fetchEventos = async () => {
      setError(null);
      const token = getAuthToken();
      if (!usuarioId || !token) return; // Não tenta buscar se não houver ID ou token

      try {
        const responseReservas = await axios.get(`/reservas/user/${usuarioId}/confirmed/past`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Mapeia para pegar apenas os eventos e remove duplicatas
        const eventosDasReservas = responseReservas.data.map(reserva => reserva.evento);
        const eventosUnicos = Array.from(new Set(eventosDasReservas.map(e => e.idEvento)))
          .map(id => eventosDasReservas.find(e => e.idEvento === id));
        setEventos(eventosUnicos);

        // Se houver eventos, pré-seleciona o primeiro (opcional)
        if (eventosUnicos.length > 0) {
          setEventoSelecionadoId(eventosUnicos[0].idEvento);
        }
      } catch (err) {
        console.error("Erro ao carregar eventos de reservas passadas:", err);
        setError("Erro ao carregar seus eventos passados. Por favor, recarregue a página.");
      }
    };
    if (usuarioId) { // Garante que só busca eventos se o usuarioId estiver disponível
      fetchEventos();
    }
  }, [usuarioId, getAuthToken]);

  // Handlers de eventos
  const handleMensagemChange = useCallback((e) => setMensagem(e.target.value), []);
  const handleEventoChange = useCallback((e) => setEventoSelecionadoId(e.target.value), []);
  const handleVoltar = useCallback(() => navigate(-1), [navigate]);

  const handleSubmitAvaliacao = useCallback(async () => {
    setFormMessage({ type: '', text: '' }); // Limpa mensagens anteriores
    const token = getAuthToken();

    if (!token || userRole !== "CLIENT" || !usuarioId || !eventoSelecionadoId) {
      if (userRole !== "CLIENT") {
        setFormMessage({ type: 'warning', text: "Apenas clientes podem fazer avaliações." });
      } else {
        setFormMessage({ type: 'error', text: "Por favor, selecione um evento e certifique-se de estar logado." });
      }
      return;
    }

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
      setFormMessage({ type: 'success', text: "Avaliação enviada com sucesso!" });
      // Limpa o formulário após o sucesso
      setNota(1);
      setMensagem("");
      setEventoSelecionadoId(""); // Reseta a seleção
      // Poderia recarregar a lista de eventos para remover o avaliado, se desejado
    } catch (err) {
      console.error("Erro ao enviar avaliação:", err);
      setFormMessage({ type: 'error', text: "Erro ao enviar avaliação. Tente novamente." });
      // Mensagem mais detalhada se houver resposta do servidor
      if (err.response && err.response.data && err.response.data.message) {
        setFormMessage({ type: 'error', text: `Erro: ${err.response.data.message}` });
      }
    }
  }, [nota, mensagem, usuarioId, eventoSelecionadoId, userRole, getAuthToken]);

  // Renderização condicional para estados de carregamento e erro globais
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.backgroundLight }}>
        <LoadingMessage />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: COLORS.backgroundLight }}>
        <AlertMessage message={error} type="error" />
        <button
          onClick={handleVoltar}
          className="ml-4 px-6 py-2 rounded-full font-semibold transition-colors mt-4 sm:mt-0"
          style={{ backgroundColor: COLORS.buttonSecondaryBg, color: 'white', '&:hover': { backgroundColor: COLORS.buttonSecondaryHover } }}
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6 lg:p-8"
      style={{ backgroundImage: "url('/images/fundoavaliacao.png')" }}
    >
      <div
        className="
          w-full
          h-full
          sm:max-w-2xl
          sm:h-auto
          bg-white // Alterado de #f8f6ff para white para consistência com o COLORS
          shadow-2xl
          p-6
          sm:p-12
          text-gray-800 // Cor de texto padrão mais neutra, será sobrescrita por COLORS
          overflow-auto
          rounded-none
          sm:rounded-xl
          border border-gray-200 // Adicionado uma borda sutil para melhor visual
        "
        style={{ color: COLORS.primary, backgroundColor: COLORS.backgroundLight }}
      >
        {userRole === "CLIENT" ? (
          <>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-center mb-10 pb-4 border-b-2" style={{ color: COLORS.textDark, borderColor: COLORS.secondary }}>
              Dê uma nota para seus eventos:
            </h3>

            {formMessage.text && (
              <div className="mb-6">
                <AlertMessage message={formMessage.text} type={formMessage.type} />
              </div>
            )}

            <div className="mb-8">
              <label htmlFor="evento" className="block font-semibold mb-3 text-lg" style={{ color: COLORS.textDark }}>Evento:</label>
              <select
                id="evento"
                value={eventoSelecionadoId}
                onChange={handleEventoChange}
                className="w-full px-4 py-3 border-2 rounded-xl text-base focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out cursor-pointer"
                style={{ borderColor: COLORS.secondary, backgroundColor: 'white', color: COLORS.textMedium, outlineColor: COLORS.secondary }}
                required
              >
                <option value="">Selecione um evento</option>
                {eventos.length === 0 ? (
                  <option value="" disabled>Nenhum evento disponível para avaliação.</option>
                ) : (
                  eventos.map((evento) => (
                    <option key={evento.idEvento} value={evento.idEvento}>
                      {evento.nomeEvento}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mb-8">
              <label className="block font-semibold mb-3 text-lg" style={{ color: COLORS.textDark }}>Nota:</label>
              <div className="flex space-x-2 items-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <IoIosStar
                    key={n}
                    className={`cursor-pointer transition-colors text-4xl sm:text-5xl ${
                      n <= nota ? `text-[${COLORS.starFilled}]` : `text-[${COLORS.starEmpty}]`
                    } hover:scale-110 transform`}
                    style={{ color: n <= nota ? COLORS.starFilled : COLORS.starEmpty }}
                    onClick={() => setNota(n)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-10">
              <label htmlFor="mensagem" className="block font-semibold mb-3 text-lg" style={{ color: COLORS.textDark }}>Mensagem (opcional):</label>
              <textarea
                id="mensagem"
                value={mensagem}
                onChange={handleMensagemChange}
                className="w-full h-32 px-4 py-3 border-2 rounded-xl text-base focus:ring-2 focus:ring-offset-2 resize-none scrollbar-thin transition-all duration-200 ease-in-out"
                style={{
                  borderColor: COLORS.secondary,
                  backgroundColor: 'white',
                  color: COLORS.textDark,
                  outlineColor: COLORS.secondary,
                  scrollbarColor: `${COLORS.secondary} ${COLORS.backgroundLight}` // Custom scrollbar
                }}
                placeholder="Deixe sua mensagem aqui..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={handleSubmitAvaliacao}
                className="w-full sm:w-auto flex-1 px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: COLORS.buttonPrimaryBg, color: 'white', '--hover-bg-color': COLORS.buttonPrimaryHover, borderColor: COLORS.buttonPrimaryBg, '--focus-ring-color': COLORS.buttonPrimaryBg }}
              >
                Enviar Avaliação
              </button>
              <button
                onClick={handleVoltar}
                className="w-full sm:w-auto flex-1 px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: COLORS.buttonSecondaryBg, color: 'white', '--hover-bg-color': COLORS.buttonSecondaryHover, borderColor: COLORS.buttonSecondaryBg, '--focus-ring-color': COLORS.buttonSecondaryBg }}
              >
                Voltar
              </button>
            </div>
          </>
        ) : ( // Se userRole não for "CLIENT" (ou ainda nulo antes de carregar)
          <div className="text-center p-6">
            <AlertMessage message="Você precisa ser um cliente para avaliar um evento." type="warning" />
            <div className="flex justify-center mt-8">
              <button
                onClick={handleVoltar}
                className="px-8 py-3 rounded-full font-bold shadow-md transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: COLORS.buttonSecondaryBg, color: 'white', '--hover-bg-color': COLORS.buttonSecondaryHover, borderColor: COLORS.buttonSecondaryBg, '--focus-ring-color': COLORS.buttonSecondaryBg }}
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Avaliacoes;
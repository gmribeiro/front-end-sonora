import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './meuperfil.css'; // Certifique-se de que este arquivo CSS existe e está correto

function MeuPerfil() {
  // 1. Estados para Informações do Usuário e Autenticação
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [userId, setUserId] = useState(null);
  const [userRole, setuserRole] = useState('');
  // Feedback para o usuário: mensagem e tipo (sucesso/erro)
  const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  // 2. Estados para Alteração de Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false); // Para desabilitar o botão

  // 3. Estados para Upload de Foto de Perfil
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null); // URL do objeto Blob para exibição
  const [isUploadingImage, setIsUploadingImage] = useState(false); // Para desabilitar o botão

  // 4. Estados para Cadastro de Evento (se for HOST)
  const [exibirFormularioEvento, setExibirFormularioEvento] = useState(false);
  const [nomeEvento, setNomeEvento] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nomeGenero, setNomeGenero] = useState('');
  const [localEventoNome, setLocalEventoNome] = useState('');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false); // Para desabilitar o botão

  // --- Funções Auxiliares ---

  // Função para exibir mensagens de feedback ao usuário
  const showFeedback = (text, type) => {
    setFeedbackMessage({ text, type });
    // Opcional: esconder a mensagem após um tempo
    setTimeout(() => setFeedbackMessage({ text: '', type: '' }), 5000);
  };

  // Função para formatar data e hora (já estava OK)
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // --- Funções de Requisição ao Backend ---
  const fetchProfileImage = useCallback(async (token) => {
    if (!token) {
      setProfileImageUrl(null);
      return;
    }
    try {
      const response = await axios.get('/auth/user/me/profile-image', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(response.data);
      setProfileImageUrl(imageUrl);
      console.log("Foto de perfil carregada com sucesso.");
    } catch (error) {
      console.error('Erro ao buscar foto de perfil:', error);
      setProfileImageUrl(null);
    }
  }, []); // <-- ARRAY DE DEPENDÊNCIAS VAZIO PARA useCallback. Isso é crucial!

  const handleUploadProfileImage = async () => {
    if (!selectedFile) {
      showFeedback('Por favor, selecione uma imagem para fazer upload.', 'erro');
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('foto', selectedFile); // 'foto' deve ser o nome do parâmetro no Spring Boot @RequestParam

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showFeedback('Usuário não autenticado. Por favor, faça login novamente.', 'erro');
        navigate('/acesso');
        return;
      }

      const response = await axios.post('/auth/user/me/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      showFeedback('Foto de perfil atualizada com sucesso!', 'sucesso');
      // Recarrega a imagem após o upload bem-sucedido.
      // fetchProfileImage precisa ser chamada aqui para atualizar a imagem na tela.
      fetchProfileImage(token);
      setSelectedFile(null); // Limpa o arquivo selecionado no input
    } catch (error) {
      console.error('Erro ao fazer upload da foto de perfil:', error);
      showFeedback(error.response?.data || 'Erro ao fazer upload da imagem.', 'erro');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Função para alterar a senha
  const handleAlterarSenha = async (event) => {
    event.preventDefault();
    setFeedbackMessage({ text: '', type: '' }); // Limpa mensagens anteriores

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      showFeedback('Todos os campos de senha são obrigatórios.', 'erro');
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      showFeedback('A nova senha e a confirmação não coincidem.', 'erro');
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showFeedback('Usuário não autenticado. Por favor, faça login novamente.', 'erro');
        navigate('/acesso');
        return;
      }

      const response = await axios.post('/auth/change-password', {
        currentPassword: senhaAtual,
        newPassword: novaSenha,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      showFeedback(response.data || 'Senha alterada com sucesso!', 'sucesso');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
    } catch (error) {
      console.error('Erro ao alterar a senha:', error);
      showFeedback(error.response?.data?.message || 'Erro ao alterar a senha.', 'erro');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Função para cadastrar evento (se for HOST)
  const handleCadastrarEventoSubmit = async (event) => {
    event.preventDefault();
    setFeedbackMessage({ text: '', type: '' });

    // Validação básica dos campos do evento
    if (!nomeEvento || !dataHora || !descricao || !nomeGenero || !localEventoNome) {
      showFeedback('Por favor, preencha todos os campos do evento.', 'erro');
      return;
    }

    setIsCreatingEvent(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !userId) {
        showFeedback('Usuário não autenticado ou ID do usuário não encontrado.', 'erro');
        navigate('/acesso');
        return;
      }

      // 1. Criar Gênero Musical
      const genreResponse = await axios.post('/genres', { nomeGenero }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const genreData = genreResponse.data;

      // 2. Criar Local do Evento
      const placeResponse = await axios.post('/places', { local: localEventoNome }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const placeData = placeResponse.data;

      // 3. Formatar Data e Hora para o Backend
      const formattedDataHora = formatDateTime(dataHora); // Verifique se o backend aceita este formato

      // 4. Cadastrar Evento
      const eventResponse = await axios.post('/eventos', {
        nomeEvento,
        dataHora: formattedDataHora, // Certifique-se que o formato é compatível com o backend
        descricao,
        generoMusical: { idGeneroMusical: genreData.idGeneroMusical },
        localEvento: { idLocalEvento: placeData.idLocalEvento },
        host: { id: userId }, // Assumindo que o backend espera um objeto com o ID do host
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      showFeedback('Evento cadastrado com sucesso!', 'sucesso');
      setExibirFormularioEvento(false); // Esconde o formulário
      // Limpa os campos do formulário
      setNomeEvento('');
      setDataHora('');
      setDescricao('');
      setNomeGenero('');
      setLocalEventoNome('');
    } catch (error) {
      console.error('Erro ao cadastrar evento:', error);
      showFeedback(`Erro ao cadastrar evento: ${error.response?.data?.message || 'Erro desconhecido'}`, 'erro');
    } finally {
      setIsCreatingEvent(false);
    }
  };


  // --- Efeitos Colaterais (useEffect) ---

  // useEffect para carregar informações do usuário e a foto de perfil na montagem do componente
  useEffect(() => {
    const buscarInformacoesUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          showFeedback('Usuário não autenticado. Redirecionando para a página de acesso.', 'erro');
          navigate('/acesso');
          return;
        }

        // Requisição para buscar dados do usuário
        const userResponse = await axios.get('/auth/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setNomeUsuario(userResponse.data.nome || 'Usuário');
        setuserRole(userResponse.data.role); // Corrigi o set do userRole aqui
        setUserId(userResponse.data.id);

        // Chamada para buscar a foto de perfil usando o token obtido
        fetchProfileImage(token);

      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
        showFeedback('Erro ao buscar informações do usuário. Por favor, tente novamente.', 'erro');
        navigate('/acesso'); // Redireciona em caso de erro na busca inicial do usuário
      }
    };

    buscarInformacoesUsuario();

    // Função de limpeza para revogar a URL do objeto Blob quando o componente é desmontado
    // ou quando o effect é re-executado (o que não deve acontecer muito com as dependências corretas).
    // Esta função de limpeza CAPTURA o valor de `profileImageUrl` do momento em que o effect foi executado.
    return () => {
      if (profileImageUrl) {
        URL.revokeObjectURL(profileImageUrl);
        console.log("URL de objeto de imagem revogada:", profileImageUrl); // Opcional para depuração
      }
    };
    // **AQUI ESTÁ A CORREÇÃO MAIS IMPORTANTE:**
    // Removemos `profileImageUrl` do array de dependências.
    // O `useEffect` só será disparado quando `Maps` ou `WorkspaceProfileImage` (a instância da função useCallback) mudarem.
    // Como `WorkspaceProfileImage` está memorizada com `useCallback` e tem dependências vazias, ela não muda.
    // `Maps` também é estável.
    // Assim, o efeito será executado apenas uma vez na montagem do componente.
  }, [navigate, fetchProfileImage]); // <--- ARRAY DE DEPENDÊNCIAS CORRETO!

  // --- Handlers de Eventos simples ---

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showFeedback('Logout realizado com sucesso!', 'sucesso');
    navigate('/acesso');
  };

  const handleCadastrarEventoClick = () => {
    setExibirFormularioEvento(true);
  };


  // --- Renderização do Componente ---

  return (
      <div className="meu-perfil-container">
        <Link to="/" className="voltar-home-btn">
          Voltar para Home
        </Link>
        <h1>Meu Perfil</h1>

        {/* Exibir feedback ao usuário */}
        {feedbackMessage.text && (
            <p className={`mensagem ${feedbackMessage.type === 'sucesso' ? 'sucesso' : 'erro'}`}>
              {feedbackMessage.text}
            </p>
        )}

        <div className="bem-vindo">
          <h2>Bem-vindo(a), {nomeUsuario}!</h2>
          {/* Exibir a foto de perfil se profileImageUrl estiver definido */}
          {profileImageUrl ? (
              <div className="foto-perfil-preview">
                <img src={profileImageUrl} alt="Foto de Perfil" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '50%' }} />
              </div>
          ) : (
              <div className="foto-perfil-placeholder">
                {/* Opcional: mostrar um placeholder ou um ícone se não houver foto */}
                <p>Nenhuma foto de perfil</p>
              </div>
          )}
        </div>

        {/* Seção para Cliente */}
        {userRole === 'CLIENT' && (
            <Link to="/avaliacoes" className="avaliacoes-btn">
              Minhas Avaliações
            </Link>
        )}

        {/* Seção para Host */}
        {userRole === 'HOST' && (
            <div className="cadastrar-evento-container">
              <button onClick={handleCadastrarEventoClick} className="cadastrar-evento-btn">
                Cadastrar Evento
              </button>

              {exibirFormularioEvento && (
                  <div className="formulario-evento">
                    <h3>Cadastrar Novo Evento</h3>
                    <form onSubmit={handleCadastrarEventoSubmit}>
                      <div className="form-group">
                        <label htmlFor="nomeEvento">Nome do Evento:</label>
                        <input
                            type="text"
                            id="nomeEvento"
                            value={nomeEvento}
                            onChange={(e) => setNomeEvento(e.target.value)}
                            required
                            disabled={isCreatingEvent}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="dataHora">Data e Hora:</label>
                        <input
                            type="datetime-local"
                            id="dataHora"
                            value={dataHora}
                            onChange={(e) => setDataHora(e.target.value)}
                            required
                            disabled={isCreatingEvent}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="descricao">Descrição:</label>
                        <textarea
                            id="descricao"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            required
                            disabled={isCreatingEvent}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="generoMusical">Gênero:</label>
                        <input
                            type="text"
                            id="generoMusical"
                            value={nomeGenero}
                            onChange={(e) => setNomeGenero(e.target.value)}
                            required
                            disabled={isCreatingEvent}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="localEvento">Local do Evento:</label>
                        <input
                            type="text"
                            id="localEvento"
                            value={localEventoNome}
                            onChange={(e) => setLocalEventoNome(e.target.value)}
                            required
                            disabled={isCreatingEvent}
                        />
                      </div>
                      <button type="submit" className="cadastrar-evento-submit-btn" disabled={isCreatingEvent}>
                        {isCreatingEvent ? 'Cadastrando...' : 'Cadastrar Evento'}
                      </button>
                      <button type="button" onClick={() => setExibirFormularioEvento(false)} className="cancelar-evento-btn" disabled={isCreatingEvent}>
                        Cancelar
                      </button>
                    </form>
                  </div>
              )}
            </div>
        )}

        {/* Seção de Upload de Foto de Perfil */}
        <div className="upload-foto-perfil-container">
          <h3>Foto de Perfil</h3>
          <div className="upload-area">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="profileImageInput"
                style={{ display: 'none' }}
                disabled={isUploadingImage}
            />
            <label htmlFor="profileImageInput" className="selecionar-foto-btn" style={isUploadingImage ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
              {selectedFile ? 'Selecionar outra foto' : 'Selecionar Foto'}
            </label>
            {selectedFile && (
                <p>Arquivo selecionado: {selectedFile.name}</p>
            )}
            <button onClick={handleUploadProfileImage} disabled={!selectedFile || isUploadingImage} className="enviar-foto-btn">
              {isUploadingImage ? 'Enviando...' : 'Enviar Foto'}
            </button>
          </div>
        </div>

        {/* Seção de Alterar Senha */}
        <div className="alterar-senha-container">
          <h3>Alterar Senha</h3>
          <form onSubmit={handleAlterarSenha}>
            <div className="form-group">
              <label htmlFor="senhaAtual">Senha Atual:</label>
              <input
                  type="password"
                  id="senhaAtual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  required
                  disabled={isChangingPassword}
              />
            </div>
            <div className="form-group">
              <label htmlFor="novaSenha">Nova Senha:</label>
              <input
                  type="password"
                  id="novaSenha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  disabled={isChangingPassword}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmarNovaSenha">Confirmar Nova Senha:</label>
              <input
                  type="password"
                  id="confirmarNovaSenha"
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  required
                  disabled={isChangingPassword}
              />
            </div>
            <button type="submit" className="alterar-senha-btn" disabled={isChangingPassword}>
              {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>

        {/* Botão de Sair (Logout) */}
        <button onClick={handleLogout} className="logout-btn">
          Sair
        </button>
      </div>
  );
}

export default MeuPerfil;
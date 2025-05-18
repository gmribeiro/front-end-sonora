import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './meuperfil.css';

function MeuPerfil() {
  // 1. Estados para Informações do Usuário e Autenticação
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [userId, setUserId] = useState(null);
  const [userRole, setuserRole] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  // 2. Estados para Alteração de Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // NOVO: Estado para edição de perfil
  const [exibirFormularioEdicaoPerfil, setExibirFormularioEdicaoPerfil] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // 3. Estados para Upload de Foto de Perfil
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);


  // Função para exibir mensagens de feedback ao usuário
  const showFeedback = (text, type) => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage({ text: '', type: '' }), 5000);
  };


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
  }, []);

  const handleUploadProfileImage = async () => {
    if (!selectedFile) {
      showFeedback('Por favor, selecione uma imagem para fazer upload.', 'erro');
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('foto', selectedFile);

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
      fetchProfileImage(token);
      setSelectedFile(null);
    } catch (error) {
      console.error('Erro ao fazer upload da foto de perfil:', error);
      showFeedback(error.response?.data || 'Erro ao fazer upload da imagem.', 'erro');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAlterarSenha = async (event) => {
    event.preventDefault();
    setFeedbackMessage({ text: '', type: '' });

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      showFeedback('Todos os campos de senha são obrigatórios.', 'erro');
      return false;
    }
    if (novaSenha !== confirmarNovaSenha) {
      showFeedback('A nova senha e a confirmação não coincidem.', 'erro');
      return false;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showFeedback('Usuário não autenticado. Por favor, faça login novamente.', 'erro');
        navigate('/acesso');
        return false;
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
      return true; // Retorna true para indicar sucesso
    } catch (error) {
      console.error('Erro ao alterar a senha:', error);
      showFeedback(error.response?.data?.message || 'Erro ao alterar a senha.', 'erro');
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setFeedbackMessage({ text: '', type: '' });

    if (!userId) {
      showFeedback('ID do usuário não encontrado para atualizar o perfil.', 'erro');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showFeedback('Usuário não autenticado. Por favor, faça login novamente.', 'erro');
      navigate('/acesso');
      return;
    }
    let passwordChangedSuccessfully = true;
    if (senhaAtual || novaSenha || confirmarNovaSenha) {
      passwordChangedSuccessfully = await handleAlterarSenha(event);
      if (!passwordChangedSuccessfully) {
        return;
      }
    }

    if (novoNome !== nomeUsuario) {
      setIsUpdatingProfile(true);
      try {
        const updatePayload = {
          name: novoNome
        };

        const response = await axios.put(`/users/${userId}`, updatePayload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        setNomeUsuario(response.data.nome || response.data.name);
        showFeedback('Perfil atualizado com sucesso!', 'sucesso');
        setExibirFormularioEdicaoPerfil(false);
      } catch (error) {
        console.error('Erro ao atualizar o perfil:', error);
        showFeedback(error.response?.data?.message || 'Erro ao atualizar o perfil.', 'erro');
      } finally {
        setIsUpdatingProfile(false);
      }
    } else if (passwordChangedSuccessfully) {
      showFeedback('Senha alterada com sucesso!', 'sucesso');
      setExibirFormularioEdicaoPerfil(false);
    } else {
      showFeedback('Nenhuma alteração detectada para o nome ou senha.', 'erro');
      setExibirFormularioEdicaoPerfil(false);
    }
  };

  useEffect(() => {
    const buscarInformacoesUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          showFeedback('Usuário não autenticado. Redirecionando para a página de acesso.', 'erro');
          navigate('/acesso');
          return;
        }
        const userResponse = await axios.get('/auth/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const fetchedName = userResponse.data.nome || 'Usuário';
        setNomeUsuario(fetchedName);
        setNovoNome(fetchedName);
        setuserRole(userResponse.data.role);
        setUserId(userResponse.data.id);
        fetchProfileImage(token);

      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
        showFeedback('Erro ao buscar informações do usuário. Por favor, tente novamente.', 'erro');
        navigate('/acesso');
      }
    };

    buscarInformacoesUsuario();


    return () => {
      if (profileImageUrl) {
        URL.revokeObjectURL(profileImageUrl);
        console.log("URL de objeto de imagem revogada:", profileImageUrl);
      }
    };

  }, [navigate, fetchProfileImage]);

  // --- Handlers de Eventos simples ---

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showFeedback('Logout realizado com sucesso!', 'sucesso');
    navigate('/acesso');
  };


  const handleEditarPerfilClick = () => {
    setExibirFormularioEdicaoPerfil(true);
    setNovoNome(nomeUsuario);
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setFeedbackMessage({ text: '', type: '' });
  };

  const handleCancelarEdicaoPerfil = () => {
    setExibirFormularioEdicaoPerfil(false);
    setFeedbackMessage({ text: '', type: '' });
  };


  return (
      <div className="meu-perfil-container">
        <Link to="/" className="voltar-home-btn">
          Voltar para Home
        </Link>
        <h1>Meu Perfil</h1>

        {feedbackMessage.text && (
            <p className={`mensagem ${feedbackMessage.type === 'sucesso' ? 'sucesso' : 'erro'}`}>
              {feedbackMessage.text}
            </p>
        )}

        <div className="bem-vindo">
          <h2>Bem-vindo(a) ao Sonora, {nomeUsuario}!</h2>
          {profileImageUrl ? (
              <div className="foto-perfil-preview">
                <img src={profileImageUrl} alt="Foto de Perfil" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '50%' }} />
              </div>
          ) : (
              <div className="foto-perfil-placeholder">
                <p>Nenhuma foto de perfil</p>
              </div>
          )}
          <button onClick={handleEditarPerfilClick} className="editar-perfil-btn">
            Editar Perfil
          </button>
        </div>

        {exibirFormularioEdicaoPerfil && (
            <div className="formulario-edicao-perfil">
              <h3>Editar Perfil</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label htmlFor="novoNome">Novo Nome:</label>
                  <input
                      type="text"
                      id="novoNome"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      required
                      disabled={isUpdatingProfile}
                  />
                </div>

                <h4>Alterar Senha (opcional)</h4>
                <p className="small-text">Preencha apenas se desejar alterar sua senha.</p>
                <div className="form-group">
                  <label htmlFor="senhaAtualEditar">Senha Atual:</label>
                  <input
                      type="password"
                      id="senhaAtualEditar"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      disabled={isUpdatingProfile || isChangingPassword}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="novaSenhaEditar">Nova Senha:</label>
                  <input
                      type="password"
                      id="novaSenhaEditar"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      disabled={isUpdatingProfile || isChangingPassword}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmarNovaSenhaEditar">Confirmar Nova Senha:</label>
                  <input
                      type="password"
                      id="confirmarNovaSenhaEditar"
                      value={confirmarNovaSenha}
                      onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                      disabled={isUpdatingProfile || isChangingPassword}
                  />
                </div>

                <button type="submit" className="salvar-perfil-btn" disabled={isUpdatingProfile || isChangingPassword}>
                  {isUpdatingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button type="button" onClick={handleCancelarEdicaoPerfil} className="cancelar-perfil-btn" disabled={isUpdatingProfile || isChangingPassword}>
                  Cancelar
                </button>
              </form>
            </div>
        )}

        {userRole === 'CLIENT' && (
            <Link to="/avaliacoes" className="avaliacoes-btn">
              Minhas Avaliações
            </Link>
        )}

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

        <button onClick={handleLogout} className="logout-btn">
          Sair
        </button>
      </div>
  );
}

export default MeuPerfil;
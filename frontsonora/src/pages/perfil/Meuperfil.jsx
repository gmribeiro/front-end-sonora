import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './meuperfil.css'; // Certifique-se de ter este arquivo CSS

function MeuPerfil() {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mensagemSenha, setMensagemSenha] = useState('');
  const [exibirFormularioEvento, setExibirFormularioEvento] = useState(false);
  const [nomeEvento, setNomeEvento] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nomeGenero, setNomeGenero] = useState('');
  const [localEventoNome, setLocalEventoNome] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const buscarInformacoesUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('/auth/user/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          setNomeUsuario(response.data.nome || 'Usuário');
          setUserRole(response.data.role);
          setUserId(response.data.id);
          setProfileImageUrl(response.data.foto || ''); // Se response.data.foto for null, profileImageUrl será ''
          console.log("User Role:", response.data.role);
          console.log("User ID:", response.data.id);
          console.log("Profile Image URL:", response.data.foto);
        } else {
          setMensagemSenha('Usuário não autenticado.');
          navigate('/acesso');
        }
      } catch (error) {
        setMensagemSenha('Erro ao buscar informações do usuário.');
        navigate('/acesso');
      }
    };

    buscarInformacoesUsuario();
  }, [navigate]);


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

  const handleAlterarSenha = async (event) => {
    event.preventDefault();
    setMensagemSenha('');

    if (novaSenha !== confirmarNovaSenha) {
      setMensagemSenha('A nova senha e a confirmação não coincidem.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.post('/auth/change-password', {
          currentPassword: senhaAtual,
          newPassword: novaSenha,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        setMensagemSenha(response.data || 'Senha alterada com sucesso!');
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarNovaSenha('');
      } else {
        setMensagemSenha('Usuário não autenticado.');
      }
    } catch (error) {
      setMensagemSenha('Erro de conexão ao alterar a senha.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/acesso');
  };

  const handleCadastrarEventoClick = () => {
    setExibirFormularioEvento(true);
  };

  const handleCadastrarEventoSubmit = async (event) => {
    event.preventDefault();
    setMensagemSenha('');

    try {
      const token = localStorage.getItem('token');
      if (token && userId) {
        const genreResponse = await axios.post('/genres', { nomeGenero }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const genreData = genreResponse.data;

        const placeResponse = await axios.post('/places', { local: localEventoNome }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const placeData = placeResponse.data;

        const formattedDataHora = formatDateTime(dataHora);

        const eventResponse = await axios.post('/eventos', {
          nomeEvento,
          dataHora: formattedDataHora,
          descricao,
          generoMusical: { idGeneroMusical: genreData.idGeneroMusical },
          localEvento: { idLocalEvento: placeData.idLocalEvento },
          host: { id: userId },
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        setMensagemSenha('Evento cadastrado com sucesso!');
        setExibirFormularioEvento(false);
        setNomeEvento('');
        setDataHora('');
        setDescricao('');
        setNomeGenero('');
        setLocalEventoNome('');
      } else {
        setMensagemSenha('Usuário não autenticado ou ID do usuário não encontrado.');
      }
    } catch (error) {
      setMensagemSenha(`Erro ao cadastrar evento: ${error.response?.data?.message || 'Erro desconhecido'}`);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadProfileImage = async () => {
    if (!selectedFile) {
      setUploadMessage('Por favor, selecione uma imagem.');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', selectedFile);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.post('/auth/user/me/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
        setUploadMessage('Foto de perfil atualizada com sucesso!');
        setProfileImageUrl(response.data);
        console.log('Foto de perfil atualizada:', response.data);
        setSelectedFile(null);
      } else {
        setUploadMessage('Usuário não autenticado.');
      }
    } catch (error) {
      console.error('Erro ao fazer upload da foto de perfil:', error);
      setUploadMessage(error.response?.data || 'Erro ao fazer upload da imagem.');
    }
  };

  return (
      <div className="meu-perfil-container">
        <Link to="/" className="voltar-home-btn">
          Voltar para Home
        </Link>
        <h1>Meu Perfil</h1>
        <div className="bem-vindo">
          <h2>Bem-vindo(a), {nomeUsuario}!</h2>
          {profileImageUrl && (
              <div className="foto-perfil-preview">
                <img src={profileImageUrl} alt="Foto de Perfil" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '50%' }} />
              </div>
          )}
        </div>

        {userRole === 'CLIENT' && (
            <Link to="/avaliacoes" className="avaliacoes-btn">
              Avaliações
            </Link>
        )}

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
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="descricao">Descrição:</label>
                        <textarea
                            id="descricao"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            required
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
                        />
                      </div>
                      <button type="submit" className="cadastrar-evento-submit-btn">
                        Cadastrar Evento
                      </button>
                      <button type="button" onClick={() => setExibirFormularioEvento(false)} className="cancelar-evento-btn">
                        Cancelar
                      </button>
                    </form>
                  </div>
              )}
            </div>
        )}

        <div className="upload-foto-perfil-container">
          <h3>Foto de Perfil</h3>
          <div className="upload-area">
            <input type="file" accept="image/*" onChange={handleFileChange} id="profileImageInput" style={{ display: 'none' }} />
            <label htmlFor="profileImageInput" className="selecionar-foto-btn">
              {selectedFile ? 'Selecionar outra foto' : 'Selecionar Foto'}
            </label>
            {selectedFile && (
                <p>Arquivo selecionado: {selectedFile.name}</p>
            )}
            <button onClick={handleUploadProfileImage} disabled={!selectedFile} className="enviar-foto-btn">
              Enviar Foto
            </button>
            {uploadMessage && <p className={`mensagem ${uploadMessage.includes('sucesso') ? 'sucesso' : 'erro'}`}>{uploadMessage}</p>}
          </div>
        </div>

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
              />
            </div>
            <button type="submit" className="alterar-senha-btn">
              Alterar Senha
            </button>
          </form>
          {mensagemSenha && <p className={`mensagem ${mensagemSenha.includes('sucesso') ? 'sucesso' : 'erro'}`}>{mensagemSenha}</p>}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Sair
        </button>
      </div>
  );
}

export default MeuPerfil;
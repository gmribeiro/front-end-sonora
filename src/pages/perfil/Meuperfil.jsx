import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

function MeuPerfil() {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [userId, setUserId] = useState(null);
  const [novoNome, setNovoNome] = useState('');
  const [accountCreationDate, setAccountCreationDate] = useState('');
  const [bio, setBio] = useState('');
  const [novaBio, setNovaBio] = useState('');

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSenhaModal, setShowSenhaModal] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const [role, setUserRole] = useState('');

  const navigate = useNavigate();

  const editProfileRef = useRef(null);

  const showError = (msg) => alert(msg);
  const showSuccess = (msg) => alert(msg);

  const fetchProfileImage = useCallback(async (token) => {
    try {
      const response = await api.get('/auth/user/me/profile-image', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      setProfileImageUrl(URL.createObjectURL(response.data));
    } catch (error) {
      console.error('Erro ao buscar imagem de perfil:', error);
      setProfileImageUrl(null);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Você precisa estar logado para acessar esta página.');
        navigate('/acesso');
        return;
      }
      try {
        const res = await api.get('/auth/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNomeUsuario(res.data.nome);
        setNovoNome(res.data.nome);
        setUserId(res.data.id);
        setUserRole(res.data.role);
        const date = res.data.createdAt ? new Date(res.data.createdAt) : new Date();
        setAccountCreationDate(date.toLocaleDateString('pt-BR'));
        setBio(res.data.bio || 'Adicione uma breve descrição sobre você.');
        setNovaBio(res.data.bio || '');
        fetchProfileImage(token);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        showError('Erro ao buscar dados do usuário. Por favor, tente novamente.');
        navigate('/acesso');
      }
    };
    fetchUser();
  }, [navigate, fetchProfileImage]);

  const handleUpload = async () => {
    if (!selectedFile) {
      return showError('Por favor, selecione um arquivo para enviar.');
    }

    const formData = new FormData();
    formData.append('foto', selectedFile);

    const token = localStorage.getItem('token');
    try {
      await api.post('/auth/user/me/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      showSuccess('Foto de perfil atualizada com sucesso!');
      fetchProfileImage(token);
      setSelectedFile(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      showError('Erro ao enviar foto. Verifique o tamanho e tipo do arquivo.');
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await api.put(`/users/${userId}`, { name: novoNome, bio: novaBio }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess('Perfil atualizado com sucesso!');
      setNomeUsuario(novoNome);
      setBio(novaBio);
      setExibirFormulario(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      showError('Erro ao atualizar perfil. Por favor, tente novamente.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/acesso');
  };

  const handleSenhaSubmit = async (e) => {
    e.preventDefault();
    if (!senhaAtual || !novaSenha || !confirmaSenha) {
      return showError('Por favor, preencha todos os campos da senha.');
    }
    if (novaSenha !== confirmaSenha) {
      return showError('A nova senha e a confirmação de senha não coincidem.');
    }

    const token = localStorage.getItem('token');
    try {
      await api.post('/auth/change-password', {
        currentPassword: senhaAtual,
        newPassword: novaSenha,
      }, { headers: { Authorization: `Bearer ${token}` } });
      showSuccess('Senha alterada com sucesso!');
      setShowSenhaModal(false);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmaSenha('');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      showError('Erro ao alterar senha. Verifique se a senha atual está correta.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewImage(null);
    }
  };

  const handleEditProfileClick = () => {
    setExibirFormulario(true);
    setTimeout(() => {
      editProfileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <div
        className="min-h-screen w-full bg-cover bg-fixed bg-center p-6 bg-no-repeat font-['Inter',_system-ui,_Avenir,_Helvetica,_Arial,_sans-serif] text-gray-800"
        style={{ backgroundImage: "url('./images/meuperfil.png')" }}
      >
        <div className="flex justify-between items-center mb-8 md:mb-12">
          <h1 className="text-4xl font-extrabold text-[#342e5a] tracking-tight md:text-5xl drop-shadow-md">Meu Perfil</h1>
          <Link
            to="/"
            className="bg-[#342e5a] hover:bg-[#564A72] text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#342e5a] focus:ring-opacity-75 font-semibold text-base"
          >
            ← Voltar para Home
          </Link>
        </div>

        <div className="flex flex-col gap-8 lg:gap-10 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-6 transform transition-transform duration-300 hover:scale-[1.005] border border-gray-100 backdrop-blur-sm bg-opacity-90">
            <h2 className="text-3xl font-bold text-[#342e5a] mb-5 pb-2 border-b border-[#eee] leading-tight">Bem-vindo(a), {nomeUsuario}</h2>
            <div className="flex flex-col items-center gap-5">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Perfil"
                  className="w-44 h-44 rounded-full border-4 border-[#342e5a] object-cover shadow-xl transform transition-transform duration-300 hover:scale-105 ring-4 ring-offset-2 ring-[#c2a0bb]"
                />
              ) : (
                <div className="w-44 h-44 rounded-full bg-gradient-to-br from-[#342e5a] via-[#5A4E75] to-[#7d6588] flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-offset-2 ring-[#c2a0bb]">
                  Sem foto
                </div>
              )}
              <button
                onClick={handleEditProfileClick}
                className="bg-[#342e5a] hover:bg-[#564A72] text-white px-7 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#342e5a] focus:ring-opacity-75 font-semibold text-base"
              >
                Editar Perfil
              </button>
              <button
                onClick={() => setShowSenhaModal(true)}
                className="bg-[#c2a0bb] hover:bg-[#A48BB3] text-white px-7 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#c2a0bb] focus:ring-opacity-75 font-semibold text-base mt-2"
              >
                Alterar Senha
              </button>
            </div>

            <div className="bg-[#EDE6F2] rounded-2xl shadow-inner p-5 my-8 border border-gray-100">
              <h3 className="text-xl font-bold text-[#342e5a] mb-3">Sobre mim</h3>
              <p className="text-base text-gray-700 whitespace-pre-line">{bio}</p>
            </div>

            <div className="bg-[#EDE6F2] rounded-2xl shadow-inner p-5 my-8 border border-gray-100">
              <h3 className="text-xl font-bold text-[#342e5a] mb-3">Informações da Conta</h3>
              <p className="text-base text-gray-700 mb-2">
                <strong>Tipo de usuário:</strong> <span className="font-medium text-gray-800">{role}</span>
              </p>
              <p className="text-base text-gray-700">
                <strong>Data de Criação da Conta:</strong> <span className="font-medium text-gray-800">{accountCreationDate}</span>
              </p>
            </div>
          </div>

          {exibirFormulario && (
            <div ref={editProfileRef} className="bg-white rounded-lg shadow-2xl p-6 animate-fade-in transform transition-transform duration-300 hover:scale-[1.005] border border-gray-100 backdrop-blur-sm bg-opacity-90">
              <h3 className="text-2xl font-bold text-[#342e5a] mb-5 pb-2 border-b border-[#eee] leading-tight">Editar Perfil</h3>
              <form onSubmit={handleSalvar} className="space-y-5">
                <div>
                  <label htmlFor="novoNomeInput" className="block text-base font-semibold mb-2 text-[#342e5a]">
                    Novo Nome:
                  </label>
                  <input
                    id="novoNomeInput"
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#c2a0bb] focus:border-[#c2a0bb] outline-none transition-all duration-200 text-base placeholder-gray-400 shadow-sm focus:shadow-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="novaBioInput" className="block text-base font-semibold mb-2 text-[#342e5a]">
                    Sua Biografia:
                  </label>
                  <textarea
                    id="novaBioInput"
                    value={novaBio}
                    onChange={(e) => setNovaBio(e.target.value)}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#c2a0bb] focus:border-[#c2a0bb] outline-none transition-all duration-200 text-base placeholder-gray-400 shadow-sm focus:shadow-md resize-y"
                    placeholder="Conte um pouco sobre você..."
                  ></textarea>
                </div>

                <div>
                  <h4 className="text-xl font-bold mb-3 text-[#342e5a]">Atualizar Foto</h4>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <label
                      htmlFor="profileImageInput"
                      className="cursor-pointer bg-[#342e5a] hover:bg-[#564A72] text-white px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-base"
                    >
                      Selecionar Foto
                    </label>
                    <input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={!selectedFile}
                      className={`${
                        selectedFile
                          ? 'bg-[#c2a0bb] hover:bg-[#A48BB3]'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      } text-white px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-base`}
                    >
                      Enviar Foto
                    </button>
                  </div>
                  {previewImage && (
                    <div className="mt-4 flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-[#EDE6F2] shadow-md">
                      <img
                        src={previewImage}
                        alt="Prévia da imagem selecionada"
                        className="w-24 h-24 rounded-full object-cover border-3 border-[#342e5a] shadow-lg"
                      />
                      <p className="text-sm text-gray-700 truncate max-w-[calc(100%-7rem)]">Arquivo selecionado: <span className="font-semibold text-gray-900">{selectedFile?.name}</span></p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col md:flex-row gap-3 pt-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#342e5a] hover:bg-[#564A72] text-white px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-base transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#342e5a] focus:ring-opacity-75"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExibirFormulario(false);
                      setSelectedFile(null);
                      setPreviewImage(null);
                      setNovoNome(nomeUsuario);
                      setNovaBio(bio);
                    }}
                    className="flex-1 bg-[#B00020] hover:bg-red-700 text-white px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-base transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#B00020] focus:ring-opacity-75"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-12 md:mt-16">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="bg-[#B00020] hover:bg-red-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#B00020] focus:ring-opacity-75"
          >
            Sair
          </button>
        </div>

        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-md">
            <div className="bg-white rounded-xl p-8 shadow-3xl w-full max-w-md animate-scale-in text-center border border-gray-100">
              <h2 className="text-2xl font-bold text-[#342e5a] mb-6 leading-snug">Deseja sair da sua conta?</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-[#B00020] hover:bg-red-700 text-white px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#B00020] focus:ring-opacity-75"
                >
                  Sim, sair
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-[#EDE6F2] hover:bg-gray-300 text-[#342e5a] px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {showSenhaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-md">
            <div className="bg-white rounded-xl p-8 shadow-3xl w-full max-w-md animate-scale-in text-center border border-gray-100">
              <h2 className="text-2xl font-bold text-[#342e5a] mb-6 leading-snug">Alterar Senha</h2>
              <form onSubmit={handleSenhaSubmit} className="space-y-5">
                <input
                  type="password"
                  placeholder="Senha atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#c2a0bb] focus:border-[#c2a0bb] outline-none transition-all duration-200 text-base placeholder-gray-400 shadow-sm focus:shadow-md"
                  required
                />
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#c2a0bb] focus:border-[#c2a0bb] outline-none transition-all duration-200 text-base placeholder-gray-400 shadow-sm focus:shadow-md"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#c2a0bb] focus:border-[#c2a0bb] outline-none transition-all duration-200 text-base placeholder-gray-400 shadow-sm focus:shadow-md"
                  required
                />
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-[#342e5a] hover:bg-[#564A72] text-white px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#342e5a] focus:ring-opacity-75"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSenhaModal(false)}
                    className="flex-1 bg-[#EDE6F2] hover:bg-gray-300 text-[#342e5a] px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MeuPerfil;
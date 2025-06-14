import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

function MeuPerfil() {
  // State for user data
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [userId, setUserId] = useState(null);
  const [novoNome, setNovoNome] = useState('');
  const [accountCreationDate, setAccountCreationDate] = useState('');
  const [bio, setBio] = useState(''); // Novo estado para a biografia
  const [novaBio, setNovaBio] = useState(''); // Novo estado para a edição da biografia

  // State for profile image management
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // State for UI control
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSenhaModal, setShowSenhaModal] = useState(false);

  // State for password change
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const [role, setUserRole] = useState('');

  const navigate = useNavigate();

  // Utility functions for alerts
  const showError = (msg) => alert(msg);
  const showSuccess = (msg) => alert(msg);

  /**
   * Fetches the user's profile image from the backend.
   * @param {string} token - The authentication token.
   */
  const fetchProfileImage = useCallback(async (token) => {
    try {
      const response = await api.get('/auth/user/me/profile-image', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Expecting a binary response for the image
      });
      setProfileImageUrl(URL.createObjectURL(response.data));
    } catch (error) {
      console.error('Erro ao buscar imagem de perfil:', error);
      setProfileImageUrl(null); // Set to null if there's an error fetching the image
    }
  }, []);

  // Effect hook to fetch user data on component mount
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
        setNovoNome(res.data.nome); // Initialize new name with current name
        setUserId(res.data.id);
        setUserRole(res.data.role)
        // Assuming your backend sends a creation date and a bio
        const date = res.data.createdAt ? new Date(res.data.createdAt) : new Date();
        setAccountCreationDate(date.toLocaleDateString('pt-BR'));
        setBio(res.data.bio || 'Adicione uma breve descrição sobre você.'); // Get bio from backend, or set a placeholder
        setNovaBio(res.data.bio || ''); // Initialize novaBio for editing
        fetchProfileImage(token);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        showError('Erro ao buscar dados do usuário. Por favor, tente novamente.');
        navigate('/acesso');
      }
    };
    fetchUser();
  }, [navigate, fetchProfileImage]);

  /**
   * Handles the upload of a new profile image.
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      return showError('Por favor, selecione um arquivo para enviar.');
    }

    const formData = new FormData();
    formData.append('foto', selectedFile); // 'foto' should match the backend's expected field name

    const token = localStorage.getItem('token');
    try {
      await api.post('/auth/user/me/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Important for file uploads
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

  /**
   * Handles saving the updated user name and bio.
   * @param {Event} e - The form submission event.
   */
  const handleSalvar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      // Send both name and bio in the update request
      await api.put(`/users/${userId}`, { name: novoNome, bio: novaBio }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess('Perfil atualizado com sucesso!');
      setNomeUsuario(novoNome);
      setBio(novaBio); // Update the displayed bio
      setExibirFormulario(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      showError('Erro ao atualizar perfil. Por favor, tente novamente.');
    }
  };

  /**
   * Logs out the user by removing the token and navigating to the access page.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/acesso');
  };

  /**
   * Handles the submission for changing the user's password.
   * @param {Event} e - The form submission event.
   */
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

  /**
   * Handles the file input change for profile image.
   * Creates a preview URL for the selected image.
   * @param {Event} e - The file input change event.
   */
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

  return (
    <div
      className="min-h-screen w-full bg-cover bg-fixed bg-center p-6 bg-no-repeat font-['Poppins',_sans-serif] text-gray-800"
      style={{ backgroundImage: "url('./images/meuperfil.png')" }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10 md:mb-16">
        <h1 className="text-5xl font-extrabold text-[#55286B] tracking-tight md:text-6xl drop-shadow-md">Meu Perfil</h1>
        <Link
          to="/"
          className="bg-gradient-to-r from-[#8B44A9] to-[#8B44A9] hover:from-[#8B44A9] hover:to-[#55286B] text-white px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#8B44A9] focus:ring-opacity-75 font-semibold text-xl"
        >
          ← Voltar para Home
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-10 lg:gap-12 max-w-6xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-none shadow-2xl p-8 transform transition-transform duration-300 hover:scale-[1.005] border border-gray-100 backdrop-blur-sm bg-opacity-90">
          <h2 className="text-4xl font-bold text-[#55286B] mb-6 pb-3 border-b border-[#eee] leading-tight">Bem-vindo(a), {nomeUsuario}</h2>
          <div className="flex flex-col items-center gap-8">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Perfil"
                className="w-48 h-48 rounded-full border-5 border-[#55286B] object-cover shadow-xl transform transition-transform duration-300 hover:scale-105 ring-4 ring-offset-2 ring-[#8B44A9]"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#8B44A9] to-[#55286B] flex items-center justify-center text-3xl font-bold shadow-xl ring-4 ring-offset-2 ring-[#8B44A9]">
                Sem foto
              </div>
            )}
            <button
              onClick={() => setExibirFormulario(true)}
              className="bg-gradient-to-r from-[#8B44A9] to-[#55286B] hover:from-[#8B44A9] hover:to-[#55286B] text-white px-9 py-4.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#8B44A9] focus:ring-opacity-75 font-semibold text-xl"
            >
              Editar Perfil
            </button>
            <button
              onClick={() => setShowSenhaModal(true)}
              className="bg-gradient-to-r from-[#55286B] to-[#55286B] hover:from-[#55286B] hover:to-[#8B44A9] text-white px-9 py-4.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#55286B] focus:ring-opacity-75 font-semibold text-xl mt-4"
            >
              Alterar Senha
            </button>
          </div>

          {/* User Bio Section */}
          <div className="bg-gray-50 rounded-2xl shadow-inner p-6 my-10 border border-gray-100">
            <h3 className="text-2xl font-bold text-[#55286B] mb-4">Sobre mim</h3> {/* Changed heading */}
            <p className="text-lg text-gray-700 whitespace-pre-line">{bio}</p> {/* Display bio, preserves line breaks */}
          </div>

          {/* Additional Account Information */}
          <div className="bg-gray-50 rounded-2xl shadow-inner p-6 my-10 border border-gray-100">
            <h3 className="text-2xl font-bold text-[#55286B] mb-4">Informações da Conta</h3>
            <p className="text-lg text-gray-700 mb-3">
              <strong>Tipo de usuário:</strong> <span className="font-medium text-gray-800">{role}</span>
            </p>
            <p className="text-lg text-gray-700">
              <strong>Data de Criação da Conta:</strong> <span className="font-medium text-gray-800">{accountCreationDate}</span>
            </p>
          </div>
        </div>

        {/* Edit Profile Form - Conditionally Rendered Below */}
        {exibirFormulario && (
          <div className="bg-white rounded-none shadow-2xl p-8 animate-fade-in transform transition-transform duration-300 hover:scale-[1.005] border border-gray-100 backdrop-blur-sm bg-opacity-90">
            <h3 className="text-3xl font-bold text-[#55286B] mb-6 pb-3 border-b border-[#eee] leading-tight">Editar Perfil</h3>
            <form onSubmit={handleSalvar} className="space-y-6">
              <div>
                <label htmlFor="novoNomeInput" className="block text-lg font-semibold mb-2 text-[#55286B]">
                  Novo Nome:
                </label>
                <input
                  id="novoNomeInput"
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-[#8B44A9] focus:border-[#8B44A9] outline-none transition-all duration-200 text-lg placeholder-gray-400 shadow-sm focus:shadow-md"
                  required
                />
              </div>
              {/* New Bio Textarea */}
              <div>
                <label htmlFor="novaBioInput" className="block text-lg font-semibold mb-2 text-[#55286B]">
                  Sua Biografia:
                </label>
                <textarea
                  id="novaBioInput"
                  value={novaBio}
                  onChange={(e) => setNovaBio(e.target.value)}
                  rows="4" // Define number of rows
                  className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-[#8B44A9] focus:border-[#8B44A9] outline-none transition-all duration-200 text-lg placeholder-gray-400 shadow-sm focus:shadow-md resize-y" // Add resize-y
                  placeholder="Conte um pouco sobre você..."
                ></textarea>
              </div>

              <div>
                <h4 className="text-2xl font-bold mb-4 text-[#55286B]">Atualizar Foto</h4>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <label
                    htmlFor="profileImageInput"
                    className="cursor-pointer bg-gradient-to-r from-[#8B44A9] to-[#55286B] hover:from-[#8B44A9] hover:to-[#55286B] text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-lg"
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
                        ? 'bg-gradient-to-r from-[#55286B] to-[#55286B] hover:from-[#55286B] hover:to-[#8B44A9]'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    } text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-lg`}
                  >
                    Enviar Foto
                  </button>
                </div>
                {previewImage && (
                  <div className="mt-5 flex items-center gap-5 p-4 border border-gray-200 rounded-xl bg-gray-50 shadow-md">
                    <img
                      src={previewImage}
                      alt="Prévia da imagem selecionada"
                      className="w-28 h-28 rounded-full object-cover border-4 border-[#55286B] shadow-lg"
                    />
                    <p className="text-base text-gray-700 truncate max-w-[calc(100%-8rem)]">Arquivo selecionado: <span className="font-semibold text-gray-900">{selectedFile?.name}</span></p>
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#55286B] to-[#55286B] hover:from-[#55286B] hover:to-[#8B44A9] text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#55286B] focus:ring-opacity-75"
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
                    setNovaBio(bio); // Reset novaBio to current bio
                  }}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="flex justify-end mt-16 md:mt-20">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-2xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
        >
          Sair
        </button>
      </div>

      {/* Modals */}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-10 shadow-3xl w-full max-w-md animate-scale-in text-center border border-gray-100">
            <h2 className="text-3xl font-bold text-[#55286B] mb-8 leading-snug">Deseja sair da sua conta?</h2>
            <div className="flex flex-col sm:flex-row gap-5">
              <button
                onClick={handleLogout}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
              >
                Sim, sair
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#55286B] px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showSenhaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-10 shadow-3xl w-full max-w-md animate-scale-in text-center border border-gray-100">
            <h2 className="text-3xl font-bold text-[#55286B] mb-8 leading-snug">Alterar Senha</h2>
            <form onSubmit={handleSenhaSubmit} className="space-y-6">
              <input
                type="password"
                placeholder="Senha atual"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-[#8B44A9] focus:border-[#8B44A9] outline-none transition-all duration-200 text-lg placeholder-gray-400 shadow-sm focus:shadow-md"
                required
              />
              <input
                type="password"
                placeholder="Nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-[#8B44A9] focus:border-[#8B44A9] outline-none transition-all duration-200 text-lg placeholder-gray-400 shadow-sm focus:shadow-md"
                required
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-[#8B44A9] focus:border-[#8B44A9] outline-none transition-all duration-200 text-lg placeholder-gray-400 shadow-sm focus:shadow-md"
                required
              />
              <div className="flex flex-col sm:flex-row gap-5 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#55286B] to-[#55286B] hover:from-[#55286B] hover:to-[#8B44A9] text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-[#55286B] focus:ring-opacity-75"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setShowSenhaModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#55286B] px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MeuPerfil;

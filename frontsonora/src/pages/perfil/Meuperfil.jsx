import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MeuPerfil() {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [userId, setUserId] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [novoNome, setNovoNome] = useState('');
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const showError = (msg) => alert(msg);
  const showSuccess = (msg) => alert(msg);

  const fetchProfileImage = useCallback(async (token) => {
    try {
      const response = await axios.get('/auth/user/me/profile-image', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const imageUrl = URL.createObjectURL(response.data);
      setProfileImageUrl(imageUrl);
    } catch (error) {
      console.error('Erro ao carregar imagem de perfil:', error);
      setProfileImageUrl(null);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/auth/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNomeUsuario(res.data.nome);
        setNovoNome(res.data.nome);
        setUserId(res.data.id);
        fetchProfileImage(token);
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        showError('Erro ao buscar dados');
        navigate('/acesso');
      }
    };
    fetchUser();
  }, [navigate, fetchProfileImage]);

  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Selecione um arquivo');
      return;
    }

    const formData = new FormData();
    formData.append('foto', selectedFile);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/auth/user/me/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      showSuccess('Foto atualizada!');
      fetchProfileImage(token);
      setSelectedFile(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Erro no upload:', error);
      showError('Erro ao enviar foto');
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/users/${userId}`, { name: novoNome }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess('Nome atualizado!');
      setNomeUsuario(novoNome);
      setExibirFormulario(false);
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      showError('Erro ao atualizar nome');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/acesso');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    } else {
      setPreviewImage(null);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-y-auto"
      style={{ backgroundImage: "url('./images/meuperfil.png')" }}
    >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[#5c2c90]">Meu Perfil</h1>
          <Link
            to="/"
            className="bg-[#c79bdc] hover:bg-[#b88bc9] text-white px-4 py-2 rounded-full shadow-md transition"
          >
            ← Voltar para Home
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Card de Perfil */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-[#5c2c90] mb-4">
              Bem-vinda, {nomeUsuario}
            </h2>
            <div className="flex flex-col items-center gap-4">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Perfil"
                  className="w-40 h-40 rounded-full border-4 border-[#5c2c90] object-cover shadow-md"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-[#c79bdc] flex items-center justify-center text-white text-lg">
                  Sem foto
                </div>
              )}
              <button
                onClick={() => setExibirFormulario(true)}
                className="bg-[#c79bdc] hover:bg-[#b88bc9] text-white px-6 py-2 rounded-full shadow-md transition"
              >
                Editar Perfil
              </button>
            </div>
          </div>

          {/* Formulário de edição */}
          {exibirFormulario && (
            <div className="flex-1 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#5c2c90] mb-4">Editar Perfil</h3>
              <form onSubmit={handleSalvar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#5c2c90]">
                    Novo Nome:
                  </label>
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#c79bdc]"
                    required
                  />
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2 text-[#5c2c90]">
                    Atualizar Foto de Perfil
                  </h4>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <label
                      htmlFor="profileImageInput"
                      className="cursor-pointer bg-[#c79bdc] hover:bg-[#b88bc9] text-white px-4 py-2 rounded-full shadow-md transition"
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
                          ? 'bg-[#5c2c90] hover:bg-[#47236d]'
                          : 'bg-gray-300 cursor-not-allowed'
                      } text-white px-4 py-2 rounded-full shadow-md transition`}
                    >
                      Enviar Foto
                    </button>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-4">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#5c2c90]"
                      />
                      <p className="text-sm text-gray-600">
                        Arquivo: {selectedFile.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#5c2c90] hover:bg-[#47236d] text-white px-4 py-2 rounded-full shadow-md transition"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExibirFormulario(false);
                      setSelectedFile(null);
                      setPreviewImage(null);
                    }}
                    className="flex-1 bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-full shadow-md transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full shadow-md transition"
          >
            Sair
          </button>
        </div>

        {/* Modal de logout */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-lg w-[90%] max-w-md">
              <h2 className="text-xl font-bold text-[#5c2c90] mb-4">
                Deseja mesmo sair?
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md transition"
                >
                  Sim, sair
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-[#5c2c90] px-4 py-2 rounded-full shadow-md transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default MeuPerfil;

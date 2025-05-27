import { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const navigate = useNavigate();

  const fetchProfileImage = useCallback(async (token) => {
    if (!token) {
      setProfileImageUrl(null);
      return;
    }
    try {
      const response = await axios.get('/auth/user/me/profile-image', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const imageUrl = URL.createObjectURL(response.data);
      setProfileImageUrl(imageUrl);
      console.log('Foto de perfil do Header carregada.');
    } catch (error) {
      console.error('Erro ao buscar foto de perfil no Header:', error);
      setProfileImageUrl(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/auth/user/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            if (response.status === 401) {
              console.log('Token expirado ou inválido. Redirecionando para login.');
              localStorage.removeItem('token');
              navigate('/acesso');
            }
            throw new Error(`Erro HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => setNomeUsuario(data.nome || ''))
        .catch((error) => console.error('Erro ao buscar nome do usuário:', error));

      fetchProfileImage(token);
    } else {
      setNomeUsuario('');
      setProfileImageUrl(null);
    }

    return () => {
      if (profileImageUrl) {
        URL.revokeObjectURL(profileImageUrl);
        console.log('URL de objeto da foto de perfil do Header revogada.');
      }
    };
  }, [navigate, fetchProfileImage, profileImageUrl]);

  const handleNomeClick = () => {
    if (nomeUsuario) {
      navigate('/perfil');
    }
  };

  return (
    <header className="bg-[#564A72] w-full py-4">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          <div className="w-[140px] h-[30px] flex items-center justify-center sm:justify-start">
            <Link to="/">
              <img
                src="../images/logosemfundo.png"
                alt="Logo"
                className="h-[60px] w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center border-2 border-[#c2a0bb] rounded-[22px] px-35 py-2 flex-grow max-w-full sm:max-w-[500px]">
            <FaSearch className="text-[#c2a0bb] mr-3 text-[15px]" />
            <input
              type="text"
              placeholder="Pesquisar eventos, shows, teatros, cursos"
              className="bg-transparent border-none outline-none text-[#c2a0bb] text-[16px] w-full placeholder:text-[#c2a0bb]"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="hidden md:block h-[45px] w-[2px] bg-[#c2a0bb] mx-4" />

          <nav className="flex flex-wrap justify-center gap-6 whitespace-nowrap text-center">
            <Link
              to="/"
              className="text-[#c2a0bb] font-semibold no-underline hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/meusconvites"
              className="text-[#c2a0bb] font-semibold no-underline hover:text-white transition-colors"
            >
              Meus Convites
            </Link>
            <Link
              to="/artistas"
              className="text-[#c2a0bb] font-semibold no-underline hover:text-white transition-colors"
            >
              Catálogo de Artistas
            </Link>
          </nav>

          {nomeUsuario ? (
            <div
              onClick={handleNomeClick}
              className="flex items-center cursor-pointer px-3 py-2 rounded-full transition-colors hover:bg-[#c2a0bb33] max-w-[180px] truncate"
              title={nomeUsuario}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Foto de Perfil"
                  className="w-10 h-10 rounded-full object-cover mr-2 border-2 border-[#c2a0bb]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#927AA3] text-white text-lg font-bold flex items-center justify-center mr-2 border-2 border-[#c2a0bb]">
                  {nomeUsuario.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[#c2a0bb] font-semibold text-base truncate">
                {nomeUsuario}
              </span>
            </div>
          ) : (
            <div>
              <Link
                to="/acesso"
                className="bg-white text-[#564A72] font-bold text-lg px-3 py-3 no-underline whitespace-nowrap shadow-sm transition-all hover:brightness-95"
              >
                Entrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

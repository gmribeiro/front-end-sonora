import { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const currentProfileImageUrl = useRef(null);

  const fetchProfileImage = useCallback(async (token) => {
    if (!token) {
      if (currentProfileImageUrl.current) {
        URL.revokeObjectURL(currentProfileImageUrl.current);
        currentProfileImageUrl.current = null;
      }
      setProfileImageUrl(null);
      return;
    }

    try {
      const response = await axios.get('/auth/user/me/profile-image', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      if (currentProfileImageUrl.current) {
        URL.revokeObjectURL(currentProfileImageUrl.current);
      }

      const imageUrl = URL.createObjectURL(response.data);
      setProfileImageUrl(imageUrl);
      currentProfileImageUrl.current = imageUrl;
      console.log('Foto de perfil do Header carregada.');
    } catch (error) {
      console.error('Erro ao buscar foto de perfil no Header:', error);
      if (currentProfileImageUrl.current) {
        URL.revokeObjectURL(currentProfileImageUrl.current);
        currentProfileImageUrl.current = null;
      }
      setProfileImageUrl(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchUserDataAndImage = async () => {
      if (!token) {
        setNomeUsuario('');
        setProfileImageUrl(null);
        return;
      }

      try {
        const userResponse = await axios.get('/auth/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNomeUsuario(userResponse.data.nome || '');
      } catch (error) {
        console.error('Erro ao buscar nome do usuário:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/acesso');
        }
        setNomeUsuario('');
      }

      fetchProfileImage(token);
    };

    fetchUserDataAndImage();

    return () => {
      if (currentProfileImageUrl.current) {
        URL.revokeObjectURL(currentProfileImageUrl.current);
        console.log('URL de objeto da foto de perfil do Header revogada na limpeza.');
      }
    };
  }, [navigate, fetchProfileImage]);

  const handleNomeClick = () => {
    if (nomeUsuario) navigate('/perfil');
  };

  const handleSearch = () => {
      if (searchTerm.trim()){
        navigate(`/eventos/resultado-busca?nomeEvento=${encodeURIComponent(searchTerm.trim())}`)
        setSearchTerm('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
      <header className="bg-[#564A72] w-full py-2">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
            <div className="w-[140px] h-[30px] flex items-center justify-center sm:justify-start">
              <Link to="/">
                <img src="../images/logosemfundo.png" alt="Logo" className="h-[60px] w-auto object-contain" />
              </Link>
            </div>

            <div className="relative border-2 bg-[#EDE6F2] border-[#c2a0bb] rounded-[22px] py-2 w-full max-w-[600px] lg:max-w-[1000px] lg:min-w-[600px] mx-auto px-4">
              <input
                  type="text"
                  placeholder="Busque seu evento desejado"
                  className="border-none outline-none text-[#c2a0bb] text-[16px] placeholder:text-[#c2a0bb] w-full pr-[45px] pl-[15px] text-left"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
              />
              <FaSearch
                  className="absolute right-[25px] top-1/2 transform -translate-y-1/2 text-[#c2a0bb] text-[20px] cursor-pointer"
                  onClick={handleSearch}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
            <div className="hidden md:block h-[45px] w-[2px] bg-[#c2a0bb] mx-5" />

            <nav className="flex flex-wrap justify-center gap-6 whitespace-nowrap text-center">
              {[
                { to: "/", label: "Home" },
                { to: "/meusconvites", label: "Meus Convites" },
                { to: "/artistas", label: "Catálogo de Artistas" },
              ].map(({ to, label }) => (
                  <Link
                      key={to}
                      to={to}
                      className="relative group text-[#c2a0bb] font-semibold no-underline transition-transform duration-200 hover:scale-105"
                  >
                <span className="transition-opacity duration-300 group-hover:opacity-80">
                  {label}
                </span>
                    <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#c2a0bb] transition-all duration-300 group-hover:w-full group-hover:left-0" />
                  </Link>
              ))}
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
                  <span className="text-[#c2a0bb] font-semibold text-base truncate">{nomeUsuario}</span>
                </div>
            ) : (
                <Link
                    to="/acesso"
                    className="bg-white text-[#564A72] font-bold text-lg px-2 py-1 no-underline whitespace-nowrap shadow-sm transition-all hover:brightness-80"
                >
                  Entrar
                </Link>
            )}
          </div>
        </div>
      </header>
  );
};

export default Header;
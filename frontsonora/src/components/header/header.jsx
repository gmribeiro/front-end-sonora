import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const Header = ({ nomeUsuario, handleNomeClick, profileImageUrl }) => {
  return (
    <header className="bg-[#564A72] w-full py-2">
      <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
        <div className="flex items-center gap-12">
        <div className="w-[140px] h-[80px] flex items-center justify-end">
  <Link to="/">
    <img
      src="../images/logosemfundo.png"
      alt="Logo"
      className="h-[60px] w-auto object-contain"
    />
  </Link>
</div>

          <div className="flex items-center border-2 border-[#c2a0bb] rounded-[22px] px-6 py-2">
            <FaSearch className="text-[#c2a0bb] mr-3 text-[15px]" />
            <input
              type="text"
              placeholder="Pesquisar eventos, shows, teatros, cursos"
              className="bg-transparent border-none outline-none text-[#c2a0bb] text-[16px] w-[500px] placeholder:text-[#c2a0bb]"
            />
          </div>
        </div>

        <div className="flex items-center gap-15 mr-6">
          <div className="h-[45px] w-[2px] bg-[#c2a0bb] mx-4"></div>
          <nav className="flex gap-15 whitespace-nowrap">
            <Link to="/" className="text-[#c2a0bb] font-semibold no-underline hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/meusconvites" className="text-[#c2a0bb] font-semibold no-underline hover:text-white transition-colors">
              Meus Convites
            </Link>
            <Link to="/artistas" className="text-[#c2a0bb] font-semibold no-underline hover:text-white transition-colors">
              Catálogo de Artistas
            </Link>
          </nav>
          {nomeUsuario ? (
            <div
              onClick={handleNomeClick}
              className="flex items-center cursor-pointer px-3 py-2 rounded-full transition-colors hover:bg-[#c2a0bb33]"
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
              <span className="text-[#c2a0bb] font-semibold text-base max-w-[120px] truncate">
                {nomeUsuario}
              </span>
            </div>
          ) : (
          <div className="flex items-center justify-center">
            <Link
            to="/acesso"
            className="bg-white text-[#564A72] font-bold text-lg px-15 py-10 no-underline whitespace-nowrap shadow-sm transition-all hover:brightness-95"
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

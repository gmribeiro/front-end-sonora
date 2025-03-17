import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeaderPerfil.css";
import { Link } from "react-router-dom"; // Importando Link
import { MdNotifications } from "react-icons/md"; // Ícone de Notificações

const HeaderPerfil = () => {
  const [nome, setNome] = useState("Nome de usuário");
  const [editando, setEditando] = useState(false);
  const navigate = useNavigate();

  const alterarNome = () => {
    setEditando(!editando);
  };

  const handleLogout = () => {
    navigate("/acesso");
  };

  return (
    <header className="header-perfil">
      {/* Logo com redirecionamento para Home */}
      <div className="logo-container">
        <Link to="/" className="logo-link">
          <img src="/logosemfundo.png" alt="Logo" className="logo" />
        </Link>
      </div>

      {/* Perfil */}
      <div className="info-perfil">
        <div className="foto-container"></div>
        <div className="perfil-info">
          {editando ? (
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-nome"
            />
          ) : (
            <h1>{nome}</h1>
          )}
          <button onClick={alterarNome} className="btn-editar">
            {editando ? "Salvar" : "Editar"}
          </button>
        </div>
      </div>

      {/* Botão de Notificações */}
      <button className="btn-notifications">
        <MdNotifications size={28} />
      </button>

      <button onClick={handleLogout} className="btn-sair">
        Sair da conta
      </button>
    </header>
  );
};

export default HeaderPerfil;

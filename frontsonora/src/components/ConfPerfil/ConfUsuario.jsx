import React, { useState } from 'react';
import './ConfPerfil.css';
import { Link, useNavigate } from 'react-router-dom';

const ConfUsuario = () => {
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);

  const [username, setUsername] = useState('MariaSpinula');
  const [editUsername, setEditUsername] = useState(false);

  const [idioma, setIdioma] = useState('Português');
  const [editIdioma, setEditIdioma] = useState(false);

  const [privacidade, setPrivacidade] = useState('Perfil público');
  const [editPrivacidade, setEditPrivacidade] = useState(false);

  const handleLogout = () => {
    navigate('/acesso');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="tela-config">
      <div className="conf-usuario-header">
        <Link to="/" className="logo-link">
          <img src="/images/logosemfundo.png" alt="Logo" className="logo-small" />
        </Link>
        <h2 className="conf-title">Configurações da conta</h2>
        <div className="header-buttons">
          <button className="button-secondary" onClick={handleLogout}>Sair da conta</button>
          <button className="button-secondary">Alterar senha</button>
        </div>
      </div>

      <div className="voltar-container">
        <Link to="/meuperfil" className="voltar-button">← Voltar</Link>
      </div>

      <div className="conf-usuario-container">
        {/* Foto do perfil */}
        <div className="conf-usuario-section">
          <h3>Foto do perfil</h3>
          <div className="item">
            <div className="profile-placeholder-container">
              {preview ? (
                <img src={preview} alt="Preview" className="preview-foto" />
              ) : (
                <div className="profile-placeholder">ALTERAR</div>
              )}
              <input
                type="file"
                id="upload-foto"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button className="button-primary" onClick={() => document.getElementById('upload-foto').click()}>
                Escolher foto
              </button>
            </div>
          </div>
        </div>

        {/* Nome de usuário */}
        <div className="conf-usuario-section">
          <h3>Nome de usuário</h3>
          <div className="item">
            {editUsername ? (
              <>
                <input value={username} onChange={(e) => setUsername(e.target.value)} />
                <button className="button-primary" onClick={() => setEditUsername(false)}>Salvar</button>
              </>
            ) : (
              <>
                <span>{username}</span>
                <button className="button-primary" onClick={() => setEditUsername(true)}>Editar</button>
              </>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="conf-usuario-section">
          <h3>Email</h3>
          <div className="item">
            <span>MariaSpinula@gmail.com</span>
          </div>
        </div>

        {/* Idioma */}
        <div className="conf-usuario-section">
          <h3>Idioma</h3>
          <div className="item">
            {editIdioma ? (
              <>
                <input value={idioma} onChange={(e) => setIdioma(e.target.value)} />
                <button className="button-primary" onClick={() => setEditIdioma(false)}>Salvar</button>
              </>
            ) : (
              <>
                <span>{idioma}</span>
                <button className="button-primary" onClick={() => setEditIdioma(true)}>Editar</button>
              </>
            )}
          </div>
        </div>

        {/* Privacidade */}
        <div className="conf-usuario-section">
          <h3>Privacidade</h3>
          <div className="item">
            {editPrivacidade ? (
              <>
                <select value={privacidade} onChange={(e) => setPrivacidade(e.target.value)}>
                  <option>Perfil público</option>
                  <option>Perfil privado</option>
                </select>
                <button className="button-primary" onClick={() => setEditPrivacidade(false)}>Salvar</button>
              </>
            ) : (
              <>
                <span>{privacidade}</span>
                <button className="button-primary" onClick={() => setEditPrivacidade(true)}>Editar</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfUsuario;

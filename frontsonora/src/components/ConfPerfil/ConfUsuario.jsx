import React, { useState } from 'react';
import './ConfPerfil.css';
import { Link, useNavigate } from 'react-router-dom';

const ConfUsuario = () => {
  const navigate = useNavigate();
  const [fotoPreview, setFotoPreview] = useState('/images/default-profile.png');
  const [novoNome, setNovoNome] = useState('MariaSpinula');
  const [editandoNome, setEditandoNome] = useState(false);

  const [email, setEmail] = useState('MariaSpinula@gmail.com');
  const [editEmail, setEditEmail] = useState(false);

  const [telefone, setTelefone] = useState('19 99999-9999');
  const [editTelefone, setEditTelefone] = useState(false);

  const [idioma, setIdioma] = useState('Português');
  const [editIdioma, setEditIdioma] = useState(false);

  const [notificacoes, setNotificacoes] = useState('Sim');
  const [editNotificacoes, setEditNotificacoes] = useState(false);

  const [interacao, setInteracao] = useState('Não');
  const [editInteracao, setEditInteracao] = useState(false);

  const [privacidade, setPrivacidade] = useState('Perfil Público');
  const [editPrivacidade, setEditPrivacidade] = useState(false);

  const handleLogout = () => {
    navigate('/acesso');
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNomeChange = (e) => {
    setNovoNome(e.target.value);
  };

  const salvarNome = () => {
    setEditandoNome(false);
  };

  return (
    <div className="tela-config">
      {/* Header */}
      <div className="conf-usuario-header">
        <Link to="/" className="logo-link">
          <img src="/images/logosemfundo.png" alt="Logo" className="logo-small" />
        </Link>
        <h2 className="conf-title">Configurações da Conta</h2>
        <div className="header-buttons">
          <button className="button-secondary" onClick={handleLogout}>Sair da Conta</button>
          <button className="button-secondary">Alterar Senha</button>
        </div>
      </div>

      {/* Voltar */}
      <div className="voltar-container">
        <Link to="/meuperfil" className="voltar-button">← Voltar</Link>
      </div>

      {/* Principal */}
      <div className="conf-usuario-main">
        <div className="conf-usuario-left">
          <div className="profile-card">
            <div className="profile-image-wrapper">
              <img src={fotoPreview} alt="Foto de Perfil" className="preview-foto" />
              <input
                type="file"
                accept="image/*"
                id="fotoInput"
                style={{ display: 'none' }}
                onChange={handleFotoChange}
              />
              <label htmlFor="fotoInput" className="button-primary">Alterar Foto</label>
            </div>
            <div className="profile-nome">
              {editandoNome ? (
                <div className="nome-edit">
                  <input
                    type="text"
                    value={novoNome}
                    onChange={handleNomeChange}
                    className="input-nome"
                  />
                  <button className="button-primary" onClick={salvarNome}>Salvar</button>
                </div>
              ) : (
                <div className="nome-display">
                  <h3>{novoNome}</h3>
                  <button className="button-primary" onClick={() => setEditandoNome(true)}>Editar Nome</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="linha-divisoria" />

        <div className="conf-usuario-right">
          {[
            { label: 'Email', value: email, editing: editEmail, setEditing: setEditEmail, setter: setEmail },
            { label: 'Telefone', value: telefone, editing: editTelefone, setEditing: setEditTelefone, setter: setTelefone },
            { label: 'Idioma', value: idioma, editing: editIdioma, setEditing: setEditIdioma, setter: setIdioma },
            { label: 'Notificações', value: notificacoes, editing: editNotificacoes, setEditing: setEditNotificacoes, setter: setNotificacoes },
            { label: 'Interação', value: interacao, editing: editInteracao, setEditing: setEditInteracao, setter: setInteracao },
            { label: 'Privacidade', value: privacidade, editing: editPrivacidade, setEditing: setEditPrivacidade, setter: setPrivacidade },
          ].map(({ label, value, editing, setEditing, setter }) => (
            <div className="conf-usuario-section" key={label}>
              <h3>{label}</h3>
              <div className="item">
                {editing ? (
                  <>
                    <input type="text" value={value} onChange={(e) => setter(e.target.value)} className="input-nome" />
                    <button className="button-primary" onClick={() => setEditing(false)}>Salvar</button>
                  </>
                ) : (
                  <>
                    <span>{value}</span>
                    <button className="button-primary" onClick={() => setEditing(true)}>Editar</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfUsuario;

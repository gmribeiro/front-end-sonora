import Header from '../../components/HeaderPerfil/headerperfil';
import { Link } from 'react-router-dom';
import '../css/global.css';
import React from 'react';

function Meuperfil() {
  return (
    <>
      <Header />
      <div className="meu-perfil-container">
        <Link to="/meusconvites" className="meus-convites-btn">
          Meus Convites
        </Link>
      </div>
    </>
  );
}

export default Meuperfil;


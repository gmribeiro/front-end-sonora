import Header from '../../components/HeaderPerfil/headerperfil';
import { Link } from 'react-router-dom';
import '../css/global.css';
import '../css/meuperfil.css';
import React from 'react';
import useTitle from '../../hooks/useTitle';

function Meuperfil() {
  useTitle('Meu perfil - Sonora');

  const meusConvites = [
    {
      id: 10,
      titulo: "Show Rock na Praça",
      local: "Campinas",
      hora: "14:30",
      imagem: "../images/rock2.png"
    }
  ];

  return (
    <>
      <Header />
      <div className="meu-perfil-container">
        
        {/* Botão de Voltar */}
        <div className="voltar-container">
          <button className="voltar-button">← Voltar</button>
        </div>

        {/* Meus Convites */}
        <section className="perfil-secao">
          <h2>Meus Convites</h2>
          <div className="cards-container">
            {meusConvites.map(evento => (
              <div key={evento.id} className="card">
                <img src={evento.imagem} alt={evento.titulo} className="card-imagem" />
                <div className="card-info">
                  <h3>{evento.titulo}</h3>
                  <p>{evento.local}</p>
                  <p>{evento.hora}</p>
                </div>
              </div>
            ))}
            <Link to="/meusconvites" className="card link-card">
              <img src="../images/convite.png" alt="Meus Convites" className="card-imagem" />
              <div className="card-info">
                <h3>Meus Convites</h3>
                <span className="seta">→</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Artistas Favoritos */}
        <section className="perfil-secao">
          <h2>Artistas Favoritos</h2>
          <div className="cards-container">
            <div className="card">
              <img src="https://pm1.aminoapps.com/9034/0857179e3acf3a21aa959176a3168b6b257dfcbfr1-736-736v2_00.jpg" alt="Artista Favorito" className="card-imagem" />
              <div className="card-info">
                <h3>Enhypen</h3>
                <p>Indie Rock</p>
              </div>
            </div>
          </div>
        </section>

        {/* Avaliações */}
        <section className="perfil-secao">
          <h2>Avaliações</h2>
          <div className="cards-container">
            <div className="card">
              <img src="../images/eventopop2.png" alt="Evento Avaliado" className="card-imagem" />
              <div className="card-info">
                <h3>Hit Parade Live</h3>
                <p>Avaliação: ⭐⭐⭐⭐☆</p>
                <p>"Ótimo som e energia do público!"</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Meuperfil;

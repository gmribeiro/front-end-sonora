import HeaderGenericos from '../../components/HeaderGenericos/headergenericos';
import '../css/termos.css';
import React from 'react';
import useTitle from '../../hooks/useTitle.js';

function Termos() {
  useTitle('Termos de Uso Sonora');
  return (
    <div className="termos-container">
      <div className="termos-pdf-container">
        <iframe
          src="../pdfs/termos.pdf"
          title="Termos de Uso"
          width="90%"
          height="100%"
        />
      </div>
      <button className="botao-voltar" onClick={() => window.history.back()}>
        Voltar
      </button>
    </div>
  );
}

export default Termos;
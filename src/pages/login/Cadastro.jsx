import '../css/global.css';
import Cadastrar from '../../components/Cadastrar/cadastrar.jsx';
import React from 'react';
import useTitle from '../../hooks/useTitle.js';


function Cadastro() {
  useTitle('Cadastro - Sonora');
  return (
    <>
    <Cadastrar/>
    </>
  )
}

export default Cadastro;
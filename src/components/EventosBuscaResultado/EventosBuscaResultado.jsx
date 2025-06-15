// src/components/EventosBuscaResultados/EventosBuscaResultados.jsx

import React, { useState, useEffect } from 'react';
import api from '../../api/index.js';
import { useLocation, useNavigate } from 'react-router-dom';
import useTitle from '../../hooks/useTitle';
import { FaCalendarAlt } from 'react-icons/fa';
import { MdPlace } from 'react-icons/md';
import { IoMdMusicalNotes } from 'react-icons/io';
import { FaMagnifyingGlass } from "react-icons/fa6";

// Componentes reutilizados
import Header from '../header/header.jsx';
import Footer from '../Footer/footer.jsx';
import Carrossel from '../Carrossel/carrossel';

const EventosBuscaResultados = () => {
  useTitle('Resultados da Busca - Sonora');

  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventosDeBusca = async () => {
      setCarregando(true);
      setErro(null);

      const queryParams = new URLSearchParams(location.search);
      const nomeEvento = queryParams.get('nomeEvento');

      if (!nomeEvento) {
        setErro('Nenhum termo de busca fornecido.');
        setCarregando(false);
        return;
      }

      try {
        const response = await api.get(
          `/eventos/search?nomeEvento=${encodeURIComponent(nomeEvento)}`
        );
        setEventos(response.data);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        setErro(error.response?.data?.message || 'Erro ao carregar eventos da busca.');
        setEventos([]);
      } finally {
        setCarregando(false);
      }
    };

    fetchEventosDeBusca();
  }, [location.search]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen w-screen text-white text-xl bg-[#564A72]">
        Carregando resultados da busca... <FaMagnifyingGlass />
      </div> 
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen text-red-500 text-center bg-white">
        <p>{erro}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-[#564A72] hover:bg-[#7d6aaa] text-white px-4 py-2 rounded"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen text-white text-center bg-black">
        <p>Nenhum evento encontrado com o nome fornecido.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-[#564A72] hover:bg-[#7d6aaa] text-white px-4 py-2 rounded"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#EDE6F2]">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 mb-25 mt-25">
  <div className="flex items-center justify-between mb-10">
    <h1 className="text-3xl font-bold text-[#564A72] flex items-center gap-5">
      Resultados da sua Busca <FaMagnifyingGlass />
    </h1>
    <button
      onClick={() => navigate('/')}
      className="text-[#564A72] hover:text-[#7d6aaa] underline font-semibold flex items-center text-xl"
      type="button"
    >
      Voltar para página inicial
    </button>
  </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 justify-items-center max-w-7xl mx-auto">
          {eventos.map((evento) => (
            <div
              key={evento.idEvento}
              className="relative h-[400px] sm:h-[300px] md:h-[400px] lg:h-[620px] overflow-hidden bg-gradient-to-b from-[#2E284E] via-[#5A4E75] to-[#E8DFEC] rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer flex flex-col w-full max-w-[350px] sm:max-w-[320px] md:max-w-[350px] lg:max-w-[400px] lg:min-w-[400px] mx-auto"
              onClick={() => navigate(`/detalhes/${evento.idEvento}`)}
            >
              <img
                src={evento.foto || '/images/evento_padrao.png'}
                alt={evento.nomeEvento || evento.titulo}
                className="w-full h-100 object-cover"
              />
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold mb-6 text-[#564A72]">
                    {evento.nomeEvento || evento.titulo}
                  </h2>
                  <p className="text-gray-700 text-base mb-4 flex items-center">
                    <FaCalendarAlt className="mr-3 text-[#564A72]" />
                    {evento.dataHora}
                  </p>
                  <p className="text-gray-700 text-base mb-4 flex items-center">
                    <MdPlace className="mr-3 text-[#564A72]" />
                    {evento.localEvento?.local || evento.local || 'Local não informado'}
                  </p>
                </div>
                <p className="text-gray-700 text-base flex items-center">
                  <IoMdMusicalNotes className="mr-3 text-[#564A72]" />
                  {evento.generoMusical?.nomeGenero || evento.genero || 'Não especificado'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventosBuscaResultados;

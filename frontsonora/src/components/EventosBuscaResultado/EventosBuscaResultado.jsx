// src/components/EventosBuscaResultados/EventosBuscaResultados.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import useTitle from '../../hooks/useTitle';

import { FaCalendarAlt } from 'react-icons/fa';
import { MdPlace } from 'react-icons/md';
import { IoMdMusicalNotes } from 'react-icons/io';

// Componentes reutilizados
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
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
        const response = await axios.get(`/eventos/search?nomeEvento=${encodeURIComponent(nomeEvento)}`);
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
      <div className="flex items-center justify-center h-screen w-screen text-white text-xl bg-black">
        Carregando resultados da busca...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen text-red-500 text-center bg-white">
        <p>{erro}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#EDE6F2]">
      <Header />
      <Carrossel />

      <main className="flex-grow px-6 py-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-[#564A72]">Resultados da Busca</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {eventos.map((evento) => (
            <div
              key={evento.idEvento}
              className="bg-[#F9F5FB] rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105"
              onClick={() => navigate(`/detalhes/${evento.idEvento}`)}
            >
              <img
                src={evento.foto || '/images/evento_padrao.png'}
                alt={evento.nomeEvento || evento.titulo}
                className="w-full h-72 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-3 text-[#564A72]">
                  {evento.nomeEvento || evento.titulo}
                </h2>
                <p className="text-gray-700 text-base mb-2 flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  {evento.dataHora}
                </p>
                <p className="text-gray-700 text-base mb-2 flex items-center">
                  <MdPlace className="mr-2" />
                  {evento.localEvento?.local || evento.local || 'Local não informado'}
                </p>
                <p className="text-gray-700 text-base flex items-center">
                  <IoMdMusicalNotes className="mr-2" />
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

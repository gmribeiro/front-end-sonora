// src/components/EventosBuscaResultados/EventosBuscaResultados.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import useTitle from '../../hooks/useTitle';
import './EventosBuscaResultado.css';
import {FaCalendarAlt} from "react-icons/fa";
import {MdPlace} from "react-icons/md";
import {IoMdMusicalNotes} from "react-icons/io";

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
        return <div className="text-center py-10 text-white">Carregando resultados da busca...</div>;
    }

    if (erro) {
        return (
            <div className="text-center py-10 text-red-500">
                <p>{erro}</p>
                <button onClick={() => navigate('/')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Voltar para Home</button>
            </div>
        );
    }

    if (eventos.length === 0) {
        return (
            <div className="text-center py-10 text-white">
                <p>Nenhum evento encontrado com o nome fornecido.</p>
                <button onClick={() => navigate('/')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Voltar para Home</button>
            </div>
        );
    }

    return (
        <div className="eventos-busca-container bg-cover bg-center min-h-screen px-4 py-8 text-[#564A72]" style={{ backgroundImage: "url('/images/detalheevento.png')" }}>
            <div className="max-w-4xl mx-auto bg-[#EDE6F2] bg-opacity-80 p-6 rounded shadow-md">
                <h1 className="text-4xl font-bold text-center mb-6">Resultados da Busca</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventos.map((evento) => (
                        <div
                            key={evento.idEvento}
                            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105"
                            onClick={() => navigate(`/detalhes/${evento.idEvento}`)}>
                            <img
                                src={evento.foto || '/images/evento_padrao.png'}
                                alt={evento.nomeEvento || evento.titulo}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold mb-2">{evento.nomeEvento || evento.titulo}</h2>
                                <p className="text-gray-600 text-sm mb-1">
                                    <FaCalendarAlt className="inline-block mr-1" /> {evento.dataHora}
                                </p>
                                <p className="text-gray-600 text-sm mb-1">
                                    <MdPlace className="inline-block mr-1" /> {evento.localEvento?.local || evento.local || 'Local não informado'}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    <IoMdMusicalNotes className="inline-block mr-1" /> {evento.generoMusical?.nomeGenero || evento.genero || 'Não especificado'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventosBuscaResultados;
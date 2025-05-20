import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MeusContratos.css';

function MeusContratos() {
    const [meusContratosArtista, setMeusContratosArtista] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [artistaIdLogado, setArtistaIdLogado] = useState(null);

    const fetchMeusContratosArtista = useCallback(async (artistaId, token) => {
        try {
            const response = await axios.get(`/contratos/musico/${artistaId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMeusContratosArtista(response.data);
        } catch (error) {
            console.error('Erro ao carregar meus contratos como artista:', error);
            setError('Erro ao carregar seus contratos.');
        }
    }, []);

    useEffect(() => {
        const carregarContratosArtista = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const userResponse = await axios.get('/auth/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const musicosResponse = await axios.get('/musicos', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const musicoLogado = musicosResponse.data.find(musico => musico.usuario?.id === userResponse.data.id);

                if (musicoLogado && musicoLogado.idMusico) {
                    setArtistaIdLogado(musicoLogado.idMusico);
                    fetchMeusContratosArtista(musicoLogado.idMusico, token);
                } else {
                    console.warn('Nenhum músico encontrado para este usuário.');
                }
            } catch (error) {
                console.error('Erro ao buscar informações de artista:', error);
                setError('Erro ao carregar seus contratos.');
            } finally {
                setLoading(false);
            }
        };

        carregarContratosArtista();
    }, [fetchMeusContratosArtista]);

    if (loading) {
        return <div>Carregando seus contratos...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="meus-contratos-artista-container">
            <h2>Meus Contratos como Artista</h2>
            {meusContratosArtista.length === 0 ? (
                <p>Você ainda não possui nenhum contrato.</p>
            ) : (
                <ul className="contratos-lista">
                    {meusContratosArtista.map(contrato => (
                        <li key={contrato.idContrato.contratoId} className="contrato-item">
                            <p><strong>Evento:</strong> <Link to={`/detalhes/${contrato.idContrato.evento.idEvento}`}>{contrato.idContrato.evento.nomeEvento || 'Nome não disponível'}</Link></p>
                            <p><strong>Valor:</strong> {contrato.valor}</p>
                            <p><strong>Detalhes:</strong> {contrato.detalhes || 'Nenhum detalhe fornecido'}</p>
                            <p><strong>Status:</strong> {contrato.status || 'Pendente'}</p>
                            {/* Adicione mais detalhes do contrato conforme necessário */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MeusContratos;
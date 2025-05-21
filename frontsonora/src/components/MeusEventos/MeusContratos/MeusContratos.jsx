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
                if (!token) {
                    setError('Token de autenticação não encontrado.');
                    setLoading(false);
                    return;
                }

                const userResponse = await axios.get('/auth/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                const musicosResponse = await axios.get('/musicos', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                const musicoLogado = musicosResponse.data.find(musico => musico.usuario?.id === userResponse.data.id);

                if (musicoLogado && musicoLogado.idMusico) {
                    setArtistaIdLogado(musicoLogado.idMusico);
                    fetchMeusContratosArtista(musicoLogado.idMusico, token);
                } else {
                    console.warn('Nenhum músico encontrado para este usuário.');
                    setError('Você não está associado a um perfil de músico.');
                }
            } catch (error) {
                console.error('Erro ao buscar informações de artista ou contratos:', error);
                setError('Erro ao carregar seus contratos. Verifique sua conexão ou tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        carregarContratosArtista();
    }, [fetchMeusContratosArtista]);

    const handleAceitarContrato = async (idEvento, idMusico) => {
        const confirmacao = window.confirm("Você tem certeza que deseja aceitar este contrato?");
        if (!confirmacao) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Token de autenticação não encontrado. Faça login novamente.');
                return;
            }

            await axios.put(`/contratos/${idEvento}/${idMusico}/activate`, {}, { // A URL no backend está como /ativar, corrigindo aqui
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Contrato aceito com sucesso!');
            if (artistaIdLogado) {
                fetchMeusContratosArtista(artistaIdLogado, token);
            }

        } catch (error) {
            console.error('Erro ao aceitar contrato:', error);
            if (error.response) {
                if (error.response.status === 404) {
                    alert('Contrato não encontrado. Ele pode ter sido removido.');
                } else if (error.response.status === 409) {
                    alert('Este contrato já foi aceito ou está em um estado inválido.');
                } else {
                    alert(`Erro ao aceitar contrato: ${error.response.status} - ${error.response.data?.message || 'Erro desconhecido'}`);
                }
            } else {
                alert('Erro ao aceitar contrato. Verifique sua conexão.');
            }
        }
    };

    const handleRecusarContrato = async (idEvento, idMusico) => {
        const confirmacao = window.confirm("Você tem certeza que deseja recusar e excluir este contrato? Esta ação é irreversível.");
        if (!confirmacao) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Token de autenticação não encontrado. Faça login novamente.');
                return;
            }

            await axios.delete(`/contratos/${idEvento}/${idMusico}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Contrato recusado e removido com sucesso!');
            if (artistaIdLogado) {
                fetchMeusContratosArtista(artistaIdLogado, token);
            }

        } catch (error) {
            console.error('Erro ao recusar contrato:', error);
            if (error.response) {
                if (error.response.status === 404) {
                    alert('Contrato não encontrado. Ele pode já ter sido removido.');
                } else {
                    alert(`Erro ao recusar contrato: ${error.response.status} - ${error.response.data?.message || 'Erro desconhecido'}`);
                }
            } else {
                alert('Erro ao recusar contrato. Verifique sua conexão.');
            }
        }
    };

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
                        <li key={`${contrato.idContrato.evento.idEvento}-${contrato.idContrato.musico.idMusico}`} className="contrato-item">
                            <p><strong>Evento:</strong> <Link to={`/detalhes/${contrato.idContrato.evento.idEvento}`}>{contrato.idContrato.evento.nomeEvento || 'Nome não disponível'}</Link></p>
                            <p><strong>Valor:</strong> R$ {contrato.valor ? contrato.valor.toFixed(2) : '0.00'}</p>
                            <p><strong>Detalhes:</strong> {contrato.detalhes || 'Nenhum detalhe fornecido'}</p>
                            <p><strong>Status:</strong> {contrato.status ? 'Aceito' : 'Pendente'}</p>

                            {!contrato.status && (
                                <div className="contrato-actions">
                                    <button
                                        className="accept-button"
                                        onClick={() => handleAceitarContrato(contrato.idContrato.evento.idEvento, contrato.idContrato.musico.idMusico)}
                                    >
                                        Aceitar Contrato
                                    </button>
                                    <button
                                        className="reject-button"
                                        onClick={() => handleRecusarContrato(contrato.idContrato.evento.idEvento, contrato.idContrato.musico.idMusico)}
                                    >
                                        Recusar Contrato
                                    </button>
                                </div>
                            )}
                            {contrato.status && (
                                <p className="accepted-message">Contrato aceito. Aguarde os detalhes do evento!</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MeusContratos;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MeusContratos.css';

function MeusContratos() {
    const [meusContratosArtista, setMeusContratosArtista] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [artistaIdLogado, setArtistaIdLogado] = useState(null);
    const [nomeArtistaLogado, setNomeArtistaLogado] = useState('');
    // Novo estado para controlar o carregamento/envio de cada contrato individualmente
    const [submittingContractId, setSubmittingContractId] = useState(null);


    const fetchMeusContratosArtista = useCallback(async (artistaId, token) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/contratos/musico/${artistaId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMeusContratosArtista(response.data);
        } catch (error) {
            console.error('Erro ao carregar meus contratos como artista:', error);
            setError('Erro ao carregar seus contratos. Por favor, tente novamente.');
            setMeusContratosArtista([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const carregarDadosIniciais = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Você precisa estar logado para ver seus contratos.');
                    setLoading(false);
                    return;
                }

                const [userResponse, musicosResponse] = await Promise.all([
                    axios.get('/auth/user/me', { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get('/musicos', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const musicoLogado = musicosResponse.data.find(musico => musico.usuario?.id === userResponse.data.id);

                if (musicoLogado && musicoLogado.idMusico) {
                    setArtistaIdLogado(musicoLogado.idMusico);
                    setNomeArtistaLogado(musicoLogado.nomeMusico || 'Artista Desconhecido');
                    await fetchMeusContratosArtista(musicoLogado.idMusico, token);
                } else {
                    console.warn('Nenhum perfil de músico encontrado para o usuário logado.');
                    setError('Você não possui um perfil de músico associado. Por favor, contate o suporte.');
                }
            } catch (error) {
                console.error('Erro ao carregar dados iniciais (usuário/músicos/contratos):', error);
                setError('Não foi possível carregar seus dados. Verifique sua conexão ou tente novamente.');
            }
        };

        carregarDadosIniciais();
    }, [fetchMeusContratosArtista]);

    const enviarNotificacao = async (idHost, mensagem, token) => {
        try {
            await axios.post(`/notifications/user/${idHost}`, {
                mensagem: mensagem
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Notificação enviada com sucesso ao host.');
        } catch (notificationError) {
            console.error('Erro ao enviar notificação ao host:', notificationError);
        }
    };

    const handleAceitarContrato = async (idEvento, idMusico, nomeEvento, idGeneroMusical) => {
        const confirmacao = window.confirm("Você tem certeza que deseja aceitar este contrato e ser escalado para o evento?");
        if (!confirmacao) {
            return;
        }

        const currentContractId = `${idEvento}-${idMusico}`;
        setSubmittingContractId(currentContractId);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sua sessão expirou. Faça login novamente.');
                return;
            }
            const escalaData = {
                idEvento: idEvento,
                idGeneroMusical: idGeneroMusical,
                idsMusicos: [idMusico]
            };
            console.log("JSON final a ser enviado:", JSON.stringify(escalaData, null, 2));

            await axios.post(`/escalas`, escalaData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Entrada na escala criada com sucesso!');

            await axios.put(`/contratos/${idEvento}/${idMusico}/activate`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Contrato aceito e sua participação no evento registrada!');

            setMeusContratosArtista(prevContratos =>
                prevContratos.map(contrato =>
                    (contrato.idContrato.evento.idEvento === idEvento && contrato.idContrato.musico.idMusico === idMusico)
                        ? { ...contrato, status: true }
                        : contrato
                )
            );

            const hostResponse = await axios.get(`/eventos/${idEvento}/host-id`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const idHost = hostResponse.data?.id || hostResponse.data;

            // 4. Enviar notificação ao host
            if (idHost) {
                const mensagem = `O artista ${nomeArtistaLogado} aceitou seu convite para o evento "${nomeEvento}" e está escalado!`;
                await enviarNotificacao(idHost, mensagem, token);
            } else {
                console.warn('Não foi possível encontrar o ID do host para o evento:', idEvento, '. Notificação não enviada.');
            }

        } catch (error) {
            console.error('Erro ao aceitar contrato ou criar escala:', error);
            let errorMessage = 'Ocorreu um erro ao processar sua aceitação do contrato.';

            if (axios.isAxiosError(error) && error.response) {
                const { status, data } = error.response;
                if (status === 401) {
                    errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
                } else if (status === 404) {
                    errorMessage = 'Contrato, Evento ou Gênero Musical não encontrado. Ele pode ter sido removido ou há dados inválidos.';
                } else if (status === 409) {
                    errorMessage = 'Este contrato já foi aceito, ou você já está escalado para este evento/gênero.';
                    setMeusContratosArtista(prevContratos =>
                        prevContratos.map(contrato =>
                            (contrato.idContrato.evento.idEvento === idEvento && contrato.idContrato.musico.idMusico === idMusico)
                                ? { ...contrato, status: true }
                                : contrato
                        )
                    );
                } else {
                    errorMessage = data?.message || `Erro do servidor (${status}).`;
                }
            } else {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
            }
            alert(errorMessage);
            if (artistaIdLogado && localStorage.getItem('token')) {
                fetchMeusContratosArtista(artistaIdLogado, localStorage.getItem('token'));
            }
        } finally {
            setSubmittingContractId(null);
        }
    };

    const handleRecusarContrato = async (idEvento, idMusico, nomeEvento) => {
        const confirmacao = window.confirm("Você tem certeza que deseja recusar e excluir este contrato? Esta ação é irreversível.");
        if (!confirmacao) {
            return;
        }

        const currentContractId = `${idEvento}-${idMusico}`;
        setSubmittingContractId(currentContractId);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sua sessão expirou. Faça login novamente.');
                return;
            }

            const hostResponse = await axios.get(`/eventos/${idEvento}/host-id`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const idHost = hostResponse.data?.id || hostResponse.data;

            await axios.delete(`/contratos/${idEvento}/${idMusico}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Contrato recusado e removido com sucesso!');

            setMeusContratosArtista(prevContratos =>
                prevContratos.filter(contrato =>
                    !(contrato.idContrato.evento.idEvento === idEvento && contrato.idContrato.musico.idMusico === idMusico)
                )
            );

            if (idHost) {
                const mensagem = `O artista ${nomeArtistaLogado} recusou seu convite para o evento "${nomeEvento}".`;
                await enviarNotificacao(idHost, mensagem, token);
            } else {
                console.warn('Não foi possível encontrar o ID do host para o evento:', idEvento, '. Notificação não enviada.');
            }

        } catch (error) {
            console.error('Erro ao recusar contrato:', error);
            let errorMessage = 'Ocorreu um erro ao recusar o contrato.';
            if (axios.isAxiosError(error) && error.response) {
                const { status, data } = error.response;
                if (status === 401) {
                    errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
                } else if (status === 404) {
                    errorMessage = 'Contrato ou Evento não encontrado. Ele pode já ter sido removido.';
                } else {
                    errorMessage = data?.message || `Erro do servidor (${status}).`;
                }
            } else {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
            }
            alert(errorMessage);
            if (artistaIdLogado && localStorage.getItem('token')) {
                fetchMeusContratosArtista(artistaIdLogado, localStorage.getItem('token'));
            }
        } finally {
            setSubmittingContractId(null);
        }
    };

    if (loading) {
        return <div className="loading-message">Carregando seus contratos...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="meus-contratos-artista-container">
            <h2>Meus Contratos como Artista</h2>
            {meusContratosArtista.length === 0 ? (
                <p className="no-contracts-message">Você ainda não possui nenhum contrato.</p>
            ) : (
                <ul className="contratos-lista">
                    {meusContratosArtista.map(contrato => {
                        const contractKey = `${contrato.idContrato.evento.idEvento}-${contrato.idContrato.musico.idMusico}`;
                        const isSubmitting = submittingContractId === contractKey; // Verifica se este contrato está em envio

                        return (
                            <li key={contractKey} className="contrato-item">
                                <p><strong>Evento:</strong> <Link to={`/detalhes/${contrato.idContrato.evento.idEvento}`}>{contrato.idContrato.evento.nomeEvento || 'Nome não disponível'}</Link></p>
                                <p><strong>Gênero Musical:</strong> {contrato.idContrato.evento.generoMusical?.nomeGenero || 'Não especificado'}</p>
                                <p><strong>Local:</strong> {contrato.idContrato.evento.localEvento?.local || 'Local não informado'}</p>
                                <p><strong>Data e Hora:</strong> {contrato.idContrato.evento.dataHora || 'Data não disponível'}</p>
                                <p><strong>Valor:</strong> R$ {contrato.valor ? contrato.valor.toFixed(2) : '0.00'}</p>
                                <p><strong>Detalhes:</strong> {contrato.detalhes || 'Nenhum detalhe fornecido'}</p>
                                <p><strong>Status:</strong> {contrato.status ? 'Aceito' : 'Pendente'}</p>

                                {!contrato.status && ( // Mostra os botões apenas se o contrato for pendente
                                    <div className="contrato-actions">
                                        <button
                                            className="accept-button"
                                            onClick={() => handleAceitarContrato(
                                                contrato.idContrato.evento.idEvento,
                                                contrato.idContrato.musico.idMusico,
                                                contrato.idContrato.evento.nomeEvento,
                                                contrato.idContrato.evento.generoMusical?.idGeneroMusical
                                            )}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Aceitando...' : 'Aceitar Contrato'}
                                        </button>
                                        <button
                                            className="reject-button"
                                            onClick={() => handleRecusarContrato(
                                                contrato.idContrato.evento.idEvento,
                                                contrato.idContrato.musico.idMusico,
                                                contrato.idContrato.evento.nomeEvento
                                            )}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Recusando...' : 'Recusar Contrato'}
                                        </button>
                                    </div>
                                )}
                                {contrato.status && (
                                    <p className="accepted-message">Contrato aceito. Aguarde os detalhes do evento!</p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default MeusContratos;
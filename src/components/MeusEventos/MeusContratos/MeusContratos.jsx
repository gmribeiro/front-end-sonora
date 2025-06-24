import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../api';
import { Link } from 'react-router-dom';

function MeusContratos() {
    const [meusContratosArtista, setMeusContratosArtista] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [artistaldLogado, setArtistaldLogado] = useState(null);
    const [nomeArtistaLogado, setNomeArtistaLogado] = useState(""); // Este será preenchido com nomeArtistico

    const [submittingContractId, setSubmittingContractId] = useState(null);

    const COLORS = {
        primary: '#564A72', // Roxo escuro
        secondary: '#342e5a', // Roxo mais escuro
        background: '#f8f2f8',
        borderLight: '#e0e0e0',
        textDark: '#333333',
        textMedium: '#666666',
        success: '#4CAF50',
        warning: '#FFC107',
        danger: '#EF4444',
        buttonPurpleLight: '#c2a0bb', // Rosa
        buttonPurpleDark: '#564A72', // Roxo
    };

    /**
     * Formata uma string de data e hora para o formato "DD/MM/AAAA HH:MM".
     * Esta função é robusta para strings no formato "DD/MM/AAAA HH:MM:SS".
     * @param {string} dateTimeString - A string de data e hora no formato "DD/MM/AAAA HH:MM:SS".
     * @returns {string} A data e hora formatada ou "Data/Hora inválida" em caso de erro.
     */
    const formatDateTime = useCallback((dateTimeString) => {
        if (!dateTimeString) return 'Não disponível';

        try {
            const [datePart, timePart] = dateTimeString.split(' ');
            const [day, month, year] = datePart.split('/');
            const [hours, minutes] = timePart.split(':'); // Ignora segundos se existirem, usa apenas HH:MM

            // Cria um objeto Date com base nos componentes para evitar problemas de fuso horário/parsing
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day),
                parseInt(hours), parseInt(minutes));

            if (isNaN(date.getTime())) {
                throw new Error('Data de entrada inválida');
            }

            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // Formato 24h
            };

            return new Intl.DateTimeFormat('pt-BR', options).format(date);

        } catch (error) {
            console.error('Erro ao formatar data no MeusContratos:', error);
            return 'Data/Hora inválida';
        }
    }, []); // useCallback para memorizar a função

    const fetchMeusContratosArtista = useCallback(async (artistaId, token) => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get(`/contratos/musico/${artistaId}`, {
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
            setError("");

            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('Você precisa estar logado para ver seus contratos.');
                    setLoading(false);
                    return;
                }

                // Usamos Promise.all para buscar ambos os dados em paralelo
                const [userResponse, musicosResponse] = await Promise.all([
                    api.get('/auth/user/me', { headers: { 'Authorization': `Bearer ${token}` } }),
                    api.get('/musicos', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                // console.log('Dados do Usuário logado (userResponse.data):', userResponse.data);
                // console.log('Lista de Músicos da API (/musicos):', musicosResponse.data);

                const musicoLogado = musicosResponse.data.find(musico => musico.usuario?.id === userResponse.data.id);

                // console.log('Objeto do Músico Logado Encontrado:', musicoLogado);
                // if (musicoLogado) {
                //     console.log('Valor de musicoLogado.nomeArtistico:', musicoLogado.nomeArtistico); // Verifique este nome
                //     console.log('Valor de musicoLogado.nomeMusico:', musicoLogado.nomeMusico); // Este provavelmente será undefined
                // }


                if (musicoLogado && musicoLogado.idMusico) {
                    setArtistaldLogado(musicoLogado.idMusico);
                    // CORREÇÃO APLICADA AQUI: USANDO 'nomeArtistico'
                    setNomeArtistaLogado(musicoLogado.nomeArtistico || 'Artista Desconhecido');
                    // console.log('Variável nomeArtistaLogado definida como:', musicoLogado.nomeArtistico || 'Artista Desconhecido');
                    await fetchMeusContratosArtista(musicoLogado.idMusico, token);
                } else {
                    console.warn('Nenhum perfil de músico encontrado para o usuário logado.');
                    setError('Você não possui um perfil de músico associado. Por favor, contate o suporte.');
                }
            } catch (error) {
                console.error('Erro ao carregar dados iniciais (usuário/músicos/contratos):', error);
                setError('Não foi possível carregar seus dados. Verifique sua conexão ou tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        carregarDadosIniciais();
    }, [fetchMeusContratosArtista]);

    const enviarNotificacao = async (idHost, mensagem, token) => {
        try {
            await api.post(`/notifications/user/${idHost}`, {
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

            const idMusicoQueEstaAceitando = artistaldLogado;
            if (!idMusicoQueEstaAceitando) {
                throw new Error("ID do músico logado não encontrado.");
            }

            let musicosExistenteNaEscala = [];
            try {
                const escalaResponse = await api.get(`/escalas/event/${idEvento}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (escalaResponse.data && Array.isArray(escalaResponse.data.musicos)) {
                    musicosExistenteNaEscala = escalaResponse.data.musicos.map(musico => musico.idMusico);
                } else if (escalaResponse.data && Array.isArray(escalaResponse.data.idsMusicos)) {
                    musicosExistenteNaEscala = escalaResponse.data.idsMusicos;
                } else {
                    console.warn('Estrutura de dados de escala inesperada, iniciando lista de músicos vazia.');
                    musicosExistenteNaEscala = [];
                }
            } catch (getError) {
                if (api.isAxiosError(getError) && getError.response && getError.response.status === 404) {
                    console.log("Nenhuma escala existente encontrada para este evento. Criando uma nova.");
                    musicosExistenteNaEscala = [];
                } else {
                    throw getError;
                }
            }

            const idsMusicosAtualizados = Array.from(new Set([...musicosExistenteNaEscala, idMusicoQueEstaAceitando]));

            const escalaData = {
                idEvento: idEvento,
                idGeneroMusical: idGeneroMusical,
                idsMusicos: idsMusicosAtualizados
            };
            console.log("JSON final a ser enviado para escala:", JSON.stringify(escalaData, null, 2));

            await api.post('/escalas', escalaData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Entrada na escala criada/atualizada com sucesso!');

            await api.put(`/contratos/${idEvento}/${idMusicoQueEstaAceitando}/activate`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Contrato aceito e sua participação no evento registrada!');

            setMeusContratosArtista(prevContratos =>
                prevContratos.map(contrato =>
                    (contrato.idContrato.evento.idEvento === idEvento &&
                        contrato.idContrato.musico.idMusico === idMusico)
                        ? { ...contrato, status: true }
                        : contrato
                )
            );

            const hostResponse = await api.get(`/eventos/${idEvento}/host-id`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const idHost = hostResponse.data?.id || hostResponse.data;

            if (idHost) {
                // 'nomeArtistaLogado' já está com o valor correto 'nomeArtistico'
                const mensagem = `O artista ${nomeArtistaLogado} aceitou seu convite para o evento "${nomeEvento}" e está escalado!`;
                await enviarNotificacao(idHost, mensagem, token);
            } else {
                console.warn('Não foi possível encontrar o ID do host para o evento:', idEvento, '. Notificação não enviada.');
            }
        } catch (error) {
            console.error('Erro ao aceitar contrato ou criar escala:', error);
            let errorMessage = 'Ocorreu um erro ao processar sua aceitação do contrato.';

            if (api.isAxiosError(error) && error.response) {
                const { status, data } = error.response;

                if (status === 401) {
                    errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
                } else if (status === 404) {
                    errorMessage = 'Contrato, Evento ou Gênero Musical não encontrado. Ele pode ter sido removido ou há dados inválidos.';
                } else if (status === 409) {
                    errorMessage = 'Este contrato já foi aceito, ou você já está escalado para este evento/gênero.';
                    setMeusContratosArtista(prevContratos =>
                        prevContratos.map(contrato =>
                            (contrato.idContrato.evento.idEvento === idEvento &&
                                contrato.idContrato.musico.idMusico === idMusico)
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
            if (artistaldLogado && localStorage.getItem('token')) {
                fetchMeusContratosArtista(artistaldLogado, localStorage.getItem('token'));
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

            const hostResponse = await api.get(`/eventos/${idEvento}/host-id`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const idHost = hostResponse.data?.id || hostResponse.data;

            await api.delete(`/contratos/${idEvento}/${idMusico}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Contrato recusado e removido com sucesso!');

            setMeusContratosArtista(prevContratos =>
                prevContratos.filter(contrato =>
                    !(contrato.idContrato.evento.idEvento === idEvento &&
                        contrato.idContrato.musico.idMusico === idMusico)
                )
            );

            if (idHost) {
                // 'nomeArtistaLogado' já está com o valor correto 'nomeArtistico'
                const mensagem = `O artista ${nomeArtistaLogado} recusou seu convite para o evento "${nomeEvento}".`;
                await enviarNotificacao(idHost, mensagem, token);
            } else {
                console.warn('Não foi possível encontrar o ID do host para o evento:', idEvento, '. Notificação não enviada.');
            }
        } catch (error) {
            console.error('Erro ao recusar contrato:', error);
            let errorMessage = 'Ocorreu um erro ao recusar o contrato.';

            if (api.isAxiosError(error) && error.response) {
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
            if (artistaldLogado && localStorage.getItem('token')) {
                fetchMeusContratosArtista(artistaldLogado, localStorage.getItem('token'));
            }
        } finally {
            setSubmittingContractId(null);
        }
    };

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat font-['Poppins',_sans-serif]"
                style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
            >
                <div className="bg-white p-8 rounded-3xl shadow-2xl text-center text-3xl font-bold !text-[#564A72] animate-pulse">
                    Carregando seus contratos...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat font-['Poppins',_sans-serif]"
                style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
            >
                <div className="bg-red-100 border !border-red-400 !text-red-700 px-8 py-6 rounded-3xl relative shadow-2xl text-center text-2xl font-semibold">
                    <p>{error}</p>
                    <Link
                        to="/"
                        className="mt-6 inline-block text-white px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-opacity-75 font-semibold text-lg"
                        style={{
                            backgroundColor: COLORS.buttonPurpleDark,
                            boxShadow: `0 4px 14px 0 ${COLORS.buttonPurpleLight}40`,
                            '--focus-ring-color': COLORS.buttonPurpleLight
                        }}
                    >
                        Voltar para Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-y-auto font-['Poppins',_sans-serif] !text-gray-800 p-8 md:p-12"
            style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 md:mb-20 gap-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg text-center md:text-left">Meus Contratos como Artista</h1>
                <Link
                    to="/"
                    className="flex-shrink-0 text-white px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-opacity-75 font-semibold text-xl"
                    style={{
                        backgroundColor: COLORS.buttonPurpleDark,
                        boxShadow: `0 4px 14px 0 ${COLORS.buttonPurpleLight}40`,
                        '--focus-ring-color': COLORS.buttonPurpleLight
                    }}
                >
                    ← Voltar para Home
                </Link>
            </div>

            {meusContratosArtista.length === 0 ? (
                <div className="!bg-white p-10 rounded-3xl shadow-xl border !border-gray-100 bg-opacity-95 backdrop-blur-sm text-center">
                    <p className="text-3xl" style={{ color: COLORS.primary, fontWeight: 'bold' }}>Você ainda não possui nenhum contrato.</p>
                    <p className="text-xl !text-gray-700 mt-4">Explore os artistas disponíveis e mostre seu talento!</p>
                    <Link
                        to="/artistas"
                        className="mt-8 inline-block !text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-opacity-75 font-semibold text-xl"
                        style={{
                            backgroundColor: COLORS.buttonPurpleDark,
                            boxShadow: `0 4px 14px 0 ${COLORS.buttonPurpleLight}40`,
                            '--focus-ring-color': COLORS.buttonPurpleLight
                        }}
                    >
                        Ver Artistas Disponíveis
                    </Link>
                </div>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {meusContratosArtista.map(contrato => {
                        const contractKey = `${contrato.idContrato.evento.idEvento}-${contrato.idContrato.musico.idMusico}`;
                        const isSubmitting = submittingContractId === contractKey;

                        return (
                            <li key={contractKey} className="bg-white rounded-3xl p-8 shadow-xl flex flex-col transform transition-transform duration-300 hover:scale-[1.03] border border-gray-100 bg-opacity-95 backdrop-blur-sm">
                                <h3 className="text-3xl font-bold mb-4 text-center" style={{ color: COLORS.primary }}>
                                    <Link
                                        to={`/detalhes/${contrato.idContrato.evento.idEvento}`}
                                        className="hover:underline transition-colors duration-200"
                                        style={{ color: COLORS.primary, '--hover-color': COLORS.secondary }}
                                    >
                                        {contrato.idContrato.evento.nomeEvento || 'Nome não disponível'}
                                    </Link>
                                </h3>

                                <div className="space-y-3 text-lg !text-gray-700 flex-grow">
                                    <p><strong>Gênero Musical:</strong> {contrato.idContrato.evento.generoMusical?.nomeGenero || 'Não especificado'}</p>
                                    <p><strong>Local:</strong> {contrato.idContrato.evento.localEvento?.local || 'Local não informado'}</p>
                                    {/* APLICAÇÃO DO formatDateTime AQUI */}
                                    <p><strong>Data e Hora:</strong> {contrato.idContrato.evento.dataHora ? formatDateTime(contrato.idContrato.evento.dataHora) : 'Data não disponível'}</p>
                                    <p><strong>Valor Proposto:</strong> <span className="font-semibold" style={{ color: COLORS.primary }}>R$ {contrato.valor ? contrato.valor.toFixed(2) : '0.00'}</span></p>
                                    <p><strong>Detalhes:</strong> {contrato.detalhes || 'Nenhum detalhe fornecido'}</p>
                                    <p className="flex items-center">
                                        <strong className="mr-2">Status:</strong>
                                        {contrato.status ? (
                                            <span className="text-base font-semibold px-3 py-1 rounded-full flex items-center" style={{ backgroundColor: `${COLORS.success}1A`, color: COLORS.success }}>
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                Aceito
                                            </span>
                                        ) : (
                                            <span className="text-base font-semibold px-3 py-1 rounded-full flex items-center" style={{ backgroundColor: `${COLORS.warning}1A`, color: COLORS.warning }}>
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                Pendente
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {!contrato.status && (
                                    <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
                                        <button
                                            onClick={() => handleAceitarContrato(
                                                contrato.idContrato.evento.idEvento,
                                                contrato.idContrato.musico.idMusico,
                                                contrato.idContrato.evento.nomeEvento,
                                                contrato.idContrato.evento.generoMusical?.idGeneroMusical
                                            )}
                                            disabled={isSubmitting}
                                            className="flex-1 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out font-semibold text-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: COLORS.success,
                                                '--focus-ring-color': COLORS.success
                                            }}
                                        >
                                            {isSubmitting ? 'Aceitando...' : 'Aceitar Contrato'}
                                        </button>
                                        <button
                                            onClick={() => handleRecusarContrato(
                                                contrato.idContrato.evento.idEvento,
                                                contrato.idContrato.musico.idMusico,
                                                contrato.idContrato.evento.nomeEvento
                                            )}
                                            disabled={isSubmitting}
                                            className="flex-1 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out font-semibold text-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                                backgroundColor: COLORS.danger,
                                                '--focus-ring-color': COLORS.danger
                                            }}
                                        >
                                            {isSubmitting ? 'Recusando...' : 'Recusar Contrato'}
                                        </button>
                                    </div>
                                )}

                                {contrato.status && (
                                    <p className="mt-8 text-center text-xl font-semibold bg-green-50 p-3 rounded-xl border border-green-200" style={{ color: COLORS.success }}>
                                        Contrato aceito. Aguarde os detalhes do evento!
                                    </p>
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
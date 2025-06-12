import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// import './MeusContratos.css'; // Removido para usar apenas Tailwind CSS

function MeusContratos() {
    const [meusContratosArtista, setMeusContratosArtista] = useState([]); // 
    const [loading, setLoading] = useState(true); // 
    const [error, setError] = useState(""); // 
    const [artistaldLogado, setArtistaldLogado] = useState(null); // 
    const [nomeArtistaLogado, setNomeArtistaLogado] = useState(""); // 

    // Novo estado para controlar o carregamento/envio de cada contrato individualmente
    const [submittingContractId, setSubmittingContractId] = useState(null); // 

    const fetchMeusContratosArtista = useCallback(async (artistald, token) => { // 
        setLoading(true); // 
        setError(""); // 
        try {
            // CUIDADO: '${artistald}' parece um erro de digitação. Mantido conforme o original.
            const response = await axios.get(`/contratos/musico/${artistald}`, { // 
                headers: { 'Authorization': `Bearer ${token}` } // 
            });
            setMeusContratosArtista(response.data); // 
        } catch (error) {
            console.error('Erro ao carregar meus contratos como artista:', error); // 
            setError('Erro ao carregar seus contratos. Por favor, tente novamente.'); // 
            setMeusContratosArtista([]); // 
        } finally {
            setLoading(false); // 
        }
    }, []); //  // As dependências estavam vazias no PDF, mantido assim.

    useEffect(() => {
        const carregarDadosIniciais = async () => {
            setLoading(true);
            setError(""); // 

            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('Você precisa estar logado para ver seus contratos.'); // 
                    setLoading(false); // 
                    return;
                }

                // CUIDADO: 'musicos Response' parece um erro de digitação. Mantido conforme o original.
                const [userResponse, musicosResponse] = await Promise.all([ // 
                    axios.get('/auth/user/me', { headers: { 'Authorization': `Bearer ${token}` } }), // 
                    axios.get('/musicos', { headers: { 'Authorization': `Bearer ${token}` } }) // 
                ]);

                const musicoLogado = musicosResponse.data.find(musico => musico.usuario?.id === userResponse.data.id); // 

                if (musicoLogado && musicoLogado.idMusico) {
                    setArtistaldLogado(musicoLogado.idMusico); // 
                    setNomeArtistaLogado(musicoLogado.nomeMusico || 'Artista Desconhecido'); // 
                    // CUIDADO: 'artistaldLogado' no lugar de 'artistaIdLogado'. Mantido conforme o original.
                    await fetchMeusContratosArtista(musicoLogado.idMusico, token); // 
                } else {
                    console.warn('Nenhum perfil de músico encontrado para o usuário logado.'); // 
                    setError('Você não possui um perfil de músico associado. Por favor, contate o suporte.'); // 
                }
            } catch (error) {
                console.error('Erro ao carregar dados iniciais (usuário/músicos/contratos):', error); // 
                setError('Não foi possível carregar seus dados. Verifique sua conexão ou tente novamente.'); // 
            }
        };

        carregarDadosIniciais();
    }, [fetchMeusContratosArtista]); // 

    const enviarNotificacao = async (idHost, mensagem, token) => { // 
        try {
            // CUIDADO: '/notifications/user/${idHost}' sem chaves. Mantido conforme o original.
            await axios.post(`/notifications/user/${idHost}`, { // 
                mensagem: mensagem // 
            }, {
                headers: {
                    'Content-Type': 'application/json', // 
                    'Authorization': `Bearer ${token}` // 
                }
            });
            console.log('Notificação enviada com sucesso ao host.'); // 
        } catch (notificationError) {
            console.error('Erro ao enviar notificação ao host:', notificationError); // 
        }
    };

    const handleAceitarContrato = async (idEvento, idMusico, nomeEvento, idGeneroMusical) => { // 
        const confirmacao = window.confirm("Você tem certeza que deseja aceitar este contrato e ser escalado para o evento?"); // 
        if (!confirmacao) { // 
            return; // 
        }

        // CUIDADO: '${idEvento}-${idMusico}' sem backticks. Corrigido para template literal.
        const currentContractId = `${idEvento}-${idMusico}`; // 
        setSubmittingContractId(currentContractId); // 

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sua sessão expirou. Faça login novamente.'); // 
                return; // 
            }

            const escalaData = {
                idEvento: idEvento, // 
                idGeneroMusical: idGeneroMusical, // 
                idsMusicos: [idMusico] // 
            };
            console.log("JSON final a ser enviado:", JSON.stringify(escalaData, null, 2)); // 

            await axios.post('/escalas', escalaData, { // 
                headers: {
                    'Content-Type': 'application/json', // 
                    'Authorization': `Bearer ${token}` // 
                }
            });
            console.log('Entrada na escala criada com sucesso!'); // 

            // CUIDADO: '/contratos/${idEvento}/${idMusico}/activate ' sem backticks. Corrigido para template literal.
            await axios.put(`/contratos/${idEvento}/${idMusico}/activate`, {}, { // 
                headers: { 'Authorization': `Bearer ${token}` } // 
            });

            alert('Contrato aceito e sua participação no evento registrada!'); // 

            // CUIDADO: 'setMeusContratos Artista' parece um erro de digitação. Mantido conforme o original.
            setMeusContratosArtista(prevContratos => // 
                prevContratos.map(contrato => // 
                    (contrato.idContrato.evento.idEvento === idEvento && // 
                        contrato.idContrato.musico.idMusico === idMusico) // 
                        ? { ...contrato, status: true } // 
                        : contrato // 
                )
            );

            // CUIDADO: '/eventos/${idEvento}/host-id ' sem backticks. Corrigido para template literal.
            const hostResponse = await axios.get(`/eventos/${idEvento}/host-id`, { // 
                headers: { 'Authorization': `Bearer ${token}` } // 
            });
            const idHost = hostResponse.data?.id || hostResponse.data; // 

            if (idHost) { // 
                // CUIDADO: `O artista ${nomeArtistaLogado} aceitou seu convite para o evento "${nomeEvento}" e está escalado!` sem backticks. Corrigido para template literal.
                const mensagem = `O artista ${nomeArtistaLogado} aceitou seu convite para o evento "${nomeEvento}" e está escalado!`; // 
                await enviarNotificacao(idHost, mensagem, token); // 
            } else {
                console.warn('Não foi possível encontrar o ID do host para o evento:', idEvento, '. Notificação não enviada.'); // 
            }
        } catch (error) { // 
            console.error('Erro ao aceitar contrato ou criar escala:', error); // 
            let errorMessage = 'Ocorreu um erro ao processar sua aceitação do contrato.'; // 

            if (axios.isAxiosError(error) && error.response) { // 
                const { status, data } = error.response; // 

                if (status === 401) { // 
                    errorMessage = 'Sessão expirada. Por favor, faça login novamente.'; // 
                } else if (status === 404) { // 
                    errorMessage = 'Contrato, Evento ou Gênero Musical não encontrado. Ele pode ter sido removido ou há dados inválidos.'; // 
                } else if (status === 409) { // 
                    errorMessage = 'Este contrato já foi aceito, ou você já está escalado para este evento/gênero.'; // 
                    // CUIDADO: 'setMeusContratos Artista' parece um erro de digitação. Mantido conforme o original.
                    setMeusContratosArtista(prevContratos => // 
                        prevContratos.map(contrato => // 
                            (contrato.idContrato.evento.idEvento === idEvento && // 
                                contrato.idContrato.musico.idMusico === idMusico) // 
                                ? { ...contrato, status: true } // 
                                : contrato // 
                        )
                    );
                } else {
                    // CUIDADO: `Erro do servidor (${status}). ;` está com erro de sintaxe. Corrigido para template literal.
                    errorMessage = data?.message || `Erro do servidor (${status}).`; // 
                }
            } else {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'; // 
            }
            alert(errorMessage); // 
            // CUIDADO: 'artistaldLogado' parece um erro de digitação. Mantido conforme o original.
            if (artistaldLogado && localStorage.getItem('token')) { // 
                // CUIDADO: 'fetchMeusContratos Artista' parece um erro de digitação. Mantido conforme o original.
                fetchMeusContratosArtista(artistaldLogado, localStorage.getItem('token')); // 
            }
        } finally {
            setSubmittingContractId(null); // 
        }
    };

    const handleRecusarContrato = async (idEvento, idMusico, nomeEvento) => { // 
        const confirmacao = window.confirm("Você tem certeza que deseja recusar e excluir este contrato? Esta ação é irreversível."); // 
        if (!confirmacao) { // 
            return; // 
        }

        // CUIDADO: '${idEvento}-${idMusico}' sem backticks. Corrigido para template literal.
        const currentContractId = `${idEvento}-${idMusico}`; // 
        setSubmittingContractId(currentContractId); // 

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sua sessão expirou. Faça login novamente.'); // 
                return; // 
            }

            // CUIDADO: '/eventos/${idEvento}/host-id ' sem backticks. Corrigido para template literal.
            const hostResponse = await axios.get(`/eventos/${idEvento}/host-id`, { // 
                headers: { 'Authorization': `Bearer ${token}` } // 
            });
            const idHost = hostResponse.data?.id || hostResponse.data; // 

            // CUIDADO: '/contratos/${idEvento}/${idMusico}' sem chaves. Corrigido para template literal.
            await axios.delete(`/contratos/${idEvento}/${idMusico}`, { // 
                headers: { 'Authorization': `Bearer ${token}` } // 
            });

            alert('Contrato recusado e removido com sucesso!'); // 

            // CUIDADO: 'setMeusContratos Artista' parece um erro de digitação. Mantido conforme o original.
            setMeusContratosArtista(prevContratos => // 
                prevContratos.filter(contrato => // 
                    !(contrato.idContrato.evento.idEvento === idEvento && // 
                        contrato.idContrato.musico.idMusico === idMusico) // 
                )
            );

            if (idHost) { // 
                // CUIDADO: `O artista ${nomeArtistaLogado} recusou seu convite para o evento "${nomeEvento}".'` com aspas extras. Corrigido.
                const mensagem = `O artista ${nomeArtistaLogado} recusou seu convite para o evento "${nomeEvento}".`; // 
                await enviarNotificacao(idHost, mensagem, token); // 
            } else {
                console.warn('Não foi possível encontrar o ID do host para o evento:', idEvento, '. Notificação não enviada.'); // 
            }
        } catch (error) { // 
            console.error('Erro ao recusar contrato:', error); // 
            let errorMessage = 'Ocorreu um erro ao recusar o contrato.'; // 

            if (axios.isAxiosError(error) && error.response) { // 
                const { status, data } = error.response; // 

                // CUIDADO: 'status == 401)' com erro de sintaxe. Corrigido para 'status === 401'.
                if (status === 401) { // 
                    errorMessage = 'Sessão expirada. Por favor, faça login novamente.'; // 
                } else if (status === 404) { // 
                    errorMessage = 'Contrato ou Evento não encontrado. Ele pode já ter sido removido.'; // 
                } else {
                    // CUIDADO: `Erro do servidor (${status}). ;` está com erro de sintaxe. Corrigido para template literal.
                    errorMessage = data?.message || `Erro do servidor (${status}).`; // 
                }
            } else {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'; // 
            }
            alert(errorMessage); // 
            // CUIDADO: 'artistaldLogado' parece um erro de digitação. Mantido conforme o original.
            if (artistaldLogado && localStorage.getItem('token')) { // 
                // CUIDADO: 'fetchMeusContratos Artista' parece um erro de digitação. Mantido conforme o original.
                fetchMeusContratosArtista(artistaldLogado, localStorage.getItem('token')); // 
            }
        } finally {
            setSubmittingContractId(null); // 
        }
    };

    if (loading) { // 
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat font-['Poppins',_sans-serif]"
                style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
            >
                <div className="bg-white p-8 rounded-3xl shadow-2xl text-center text-3xl font-bold text-[#5c2c90] animate-pulse">
                    Carregando seus contratos...
                </div>
            </div>
        );
    }

    if (error) { // 
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat font-['Poppins',_sans-serif]"
                style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
            >
                <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-3xl relative shadow-2xl text-center text-2xl font-semibold">
                    <p>{error}</p>
                    <Link
                        to="/"
                        className="mt-6 inline-block bg-gradient-to-r from-[#c79bdc] to-[#a06cb3] hover:from-[#b88bc9] hover:to-[#8e5a9c] text-white px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#c79bdc] focus:ring-opacity-75 font-semibold text-lg"
                    >
                        Voltar para Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-y-auto font-['Poppins',_sans-serif] text-gray-800 p-8 md:p-12"
            style={{ backgroundImage: "url('/images/fundocatalogo.png')" }}
        >
            {/* Cabeçalho da Página */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 md:mb-20 gap-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg text-center md:text-left">Meus Contratos como Artista</h1>
                <Link
                    to="/"
                    className="flex-shrink-0 bg-gradient-to-r from-[#c79bdc] to-[#a06cb3] hover:from-[#b88bc9] hover:to-[#8e5a9c] text-white px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#c79bdc] focus:ring-opacity-75 font-semibold text-xl"
                >
                    ← Voltar para Home
                </Link>
            </div>

            {meusContratosArtista.length === 0 ? ( // 
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 bg-opacity-95 backdrop-blur-sm text-center">
                    <p className="text-3xl text-[#5c2c90] font-bold">Você ainda não possui nenhum contrato.</p>
                    <p className="text-xl text-gray-700 mt-4">Explore os artistas disponíveis e mostre seu talento!</p>
                    <Link
                        to="/artistas"
                        className="mt-8 inline-block bg-gradient-to-r from-[#a06cb3] to-[#c79bdc] hover:from-[#8e5a9c] hover:to-[#b88bc9] text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#a06cb3] focus:ring-opacity-75 font-semibold text-xl"
                    >
                        Ver Artistas Disponíveis
                    </Link>
                </div>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {meusContratosArtista.map(contrato => { // 
                        // CUIDADO: '${contrato.idContrato.evento.idEvento}-${contrato.idContrato.musico.idMusico}' sem backticks. Corrigido para template literal.
                        const contractKey = `${contrato.idContrato.evento.idEvento}-${contrato.idContrato.musico.idMusico}`; // 
                        const isSubmitting = submittingContractId === contractKey; // 

                        return (
                            <li key={contractKey} className="bg-white rounded-3xl p-8 shadow-xl flex flex-col transform transition-transform duration-300 hover:scale-[1.03] border border-gray-100 bg-opacity-95 backdrop-blur-sm">
                                <h3 className="text-3xl font-bold text-[#5c2c90] mb-4 text-center">
                                    {/* CUIDADO: ` /detalhes/${contrato.idContrato.evento.idEvento}` sem backticks. Corrigido para template literal. */}
                                    <Link
                                        to={`/detalhes/${contrato.idContrato.evento.idEvento}`}
                                        className="hover:underline hover:text-[#a06cb3] transition-colors duration-200"
                                    >
                                        {contrato.idContrato.evento.nomeEvento || 'Nome não disponível'}
                                    </Link>
                                </h3>

                                <div className="space-y-3 text-lg text-gray-700 flex-grow">
                                    <p><strong>Gênero Musical:</strong> {contrato.idContrato.evento.generoMusical?.nomeGenero || 'Não especificado'}</p> {/*  */}
                                    <p><strong>Local:</strong> {contrato.idContrato.evento.localEvento?.local || 'Local não informado'}</p> {/*  */}
                                    <p><strong>Data e Hora:</strong> {contrato.idContrato.evento.dataHora ? new Date(contrato.idContrato.evento.dataHora).toLocaleString('pt-BR') : 'Data não disponível'}</p> {/*  */}
                                    <p><strong>Valor Proposto:</strong> <span className="font-semibold text-[#5c2c90]">R$ {contrato.valor ? contrato.valor.toFixed(2) : '0.00'}</span></p> {/*  */}
                                    <p><strong>Detalhes:</strong> {contrato.detalhes || 'Nenhum detalhe fornecido'}</p> {/*  */}
                                    <p className="flex items-center">
                                        <strong className="mr-2">Status:</strong>
                                        {contrato.status ? ( // 
                                            <span className="bg-green-100 text-green-700 text-base font-semibold px-3 py-1 rounded-full flex items-center">
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                Aceito
                                            </span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-700 text-base font-semibold px-3 py-1 rounded-full flex items-center">
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                Pendente
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Botões de Ação */}
                                {!contrato.status && ( // 
                                    <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
                                        <button
                                            onClick={() => handleAceitarContrato(
                                                contrato.idContrato.evento.idEvento,
                                                contrato.idContrato.musico.idMusico,
                                                contrato.idContrato.evento.nomeEvento,
                                                contrato.idContrato.evento.generoMusical?.idGeneroMusical
                                            )}
                                            disabled={isSubmitting}
                                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out font-semibold text-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out font-semibold text-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Recusando...' : 'Recusar Contrato'}
                                        </button>
                                    </div>
                                )}

                                {contrato.status && (
                                    <p className="mt-8 text-center text-xl text-green-700 font-semibold bg-green-50 p-3 rounded-xl border border-green-200">
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

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './meuperfil.css';

function MeuPerfil() {
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [userRole, setUserRole] = useState('');
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [exibirFormularioEvento, setExibirFormularioEvento] = useState(false);
    const [nomeEvento, setNomeEvento] = useState('');
    const [dataHora, setDataHora] = useState('');
    const [descricao, setDescricao] = useState('');
    const [nomeGenero, setNomeGenero] = useState('');
    const [localEventoNome, setLocalEventoNome] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const buscarInformacoesUsuario = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('/auth/user/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    setNomeUsuario(response.data.nome || 'Usuário');
                    setUserRole(response.data.role);
                    console.log("User Role:", response.data.role);
                } else {
                    setMensagem('Usuário não autenticado.');
                    navigate('/acesso');
                }
            } catch (error) {
                setMensagem('Erro ao buscar informações do usuário.');
                navigate('/acesso');
            }
        };

        buscarInformacoesUsuario();
    }, [navigate]);

    const handleAlterarSenha = async (event) => {
        event.preventDefault();
        setMensagem('');

        if (novaSenha !== confirmarNovaSenha) {
            setMensagem('A nova senha e a confirmação não coincidem.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.post('/auth/change-password', {
                    currentPassword: senhaAtual,
                    newPassword: novaSenha,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                setMensagem(response.data || 'Senha alterada com sucesso!');
                setSenhaAtual('');
                setNovaSenha('');
                setConfirmarNovaSenha('');
            } else {
                setMensagem('Usuário não autenticado.');
            }
        } catch (error) {
            setMensagem('Erro de conexão ao alterar a senha.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/acesso');
    };

    const handleCadastrarEventoClick = () => {
        setExibirFormularioEvento(true);
    };

    const handleCadastrarEventoSubmit = async (event) => {
        event.preventDefault();
        setMensagem('');

        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Primeiro, cadastrar o gênero
                const genreResponse = await axios.post('/genres', { nomeGenero }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const genreData = genreResponse.data;

                // Segundo, cadastrar o local
                const placeResponse = await axios.post('/places', { local: localEventoNome }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const placeData = placeResponse.data;

                // Terceiro, cadastrar o evento
                const eventResponse = await axios.post('/eventos', {
                    nomeEvento,
                    dataHora,
                    descricao,
                    generoMusical: { idGeneroMusical: genreData.idGeneroMusical },
                    localEvento: { idLocalEvento: placeData.idLocalEvento },
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                setMensagem('Evento cadastrado com sucesso!');
                setExibirFormularioEvento(false);
                setNomeEvento('');
                setDataHora('');
                setDescricao('');
                setNomeGenero('');
                setLocalEventoNome('');
            } else {
                setMensagem('Usuário não autenticado.');
            }
        } catch (error) {
            setMensagem(`Erro ao cadastrar evento: ${error.response?.data?.message || 'Erro desconhecido'}`);
        }
    };

    return (
        <div className="meu-perfil-container">
            <Link to="/" className="voltar-home-btn">
                Voltar para Home
            </Link>
            <h1>Meu Perfil</h1>
            <div className="bem-vindo">
                <h2>Bem-vindo(a), {nomeUsuario}!</h2>
            </div>

            {userRole === 'HOST' && (
                <div className="cadastrar-evento-container">
                    <button onClick={handleCadastrarEventoClick} className="cadastrar-evento-btn">
                        Cadastrar Evento
                    </button>

                    {exibirFormularioEvento && (
                        <div className="formulario-evento">
                            <h3>Cadastrar Novo Evento</h3>
                            <form onSubmit={handleCadastrarEventoSubmit}>
                                <div className="form-group">
                                    <label htmlFor="nomeEvento">Nome do Evento:</label>
                                    <input
                                        type="text"
                                        id="nomeEvento"
                                        value={nomeEvento}
                                        onChange={(e) => setNomeEvento(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dataHora">Data e Hora:</label>
                                    <input
                                        type="datetime-local"
                                        id="dataHora"
                                        value={dataHora}
                                        onChange={(e) => setDataHora(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="descricao">Descrição:</label>
                                    <textarea
                                        id="descricao"
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="generoMusical">Gênero:</label>
                                    <input
                                        type="text"
                                        id="generoMusical"
                                        value={nomeGenero}
                                        onChange={(e) => setNomeGenero(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="localEvento">Local do Evento:</label>
                                    <input
                                        type="text"
                                        id="localEvento"
                                        value={localEventoNome}
                                        onChange={(e) => setLocalEventoNome(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="cadastrar-evento-submit-btn">
                                    Cadastrar Evento
                                </button>
                                <button type="button" onClick={() => setExibirFormularioEvento(false)} className="cancelar-evento-btn">
                                    Cancelar
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            <div className="alterar-senha-container">
                <h3>Alterar Senha</h3>
                <form onSubmit={handleAlterarSenha}>
                    <div className="form-group">
                        <label htmlFor="senhaAtual">Senha Atual:</label>
                        <input
                            type="password"
                            id="senhaAtual"
                            value={senhaAtual}
                            onChange={(e) => setSenhaAtual(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="novaSenha">Nova Senha:</label>
                        <input
                            type="password"
                            id="novaSenha"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmarNovaSenha">Confirmar Nova Senha:</label>
                        <input
                            type="password"
                            id="confirmarNovaSenha"
                            value={confirmarNovaSenha}
                            onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="alterar-senha-btn">
                        Alterar Senha
                    </button>
                </form>
                {mensagem && <p className={`mensagem ${mensagem.includes('sucesso') ? 'sucesso' : 'erro'}`}>{mensagem}</p>}
            </div>

            <button onClick={handleLogout} className="logout-btn">
                Sair
            </button>
        </div>
    );
}

export default MeuPerfil;
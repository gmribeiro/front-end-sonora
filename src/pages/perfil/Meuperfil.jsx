import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importe Link
import './meuperfil.css'; // Importe o arquivo de estilos CSS

function MeuPerfil() {
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const buscarNomeUsuario = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await fetch('/auth/user/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setNomeUsuario(data.nome || 'Usuário');
                    } else {
                        setMensagem('Erro ao buscar informações do usuário.');
                        navigate('/acesso');
                    }
                } else {
                    setMensagem('Usuário não autenticado.');
                    navigate('/acesso');
                }
            } catch (error) {
                setMensagem('Erro de conexão ao buscar informações do usuário.');
            }
        };

        buscarNomeUsuario();
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
                const response = await fetch('/auth/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentPassword: senhaAtual,
                        newPassword: novaSenha,
                    }),
                });

                const data = await response.text();

                if (response.ok) {
                    setMensagem(data || 'Senha alterada com sucesso!');
                    setSenhaAtual('');
                    setNovaSenha('');
                    setConfirmarNovaSenha('');
                } else {
                    setMensagem(data || 'Erro ao alterar a senha.');
                }
            } else {
                setMensagem('Usuário não autenticado.');
                // Opcional: redirecionar para a página de login
                // navigate('/login');
            }
        } catch (error) {
            setMensagem('Erro de conexão ao alterar a senha.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/acesso');
    };

    return (
        <div className="meu-perfil-container">
            <Link to="/" className="voltar-home-btn"> {/* Adicionado o Link */}
                Voltar para Home
            </Link>
            <h1>Meu Perfil</h1>
            <div className="bem-vindo">
                <h2>Bem-vindo(a), {nomeUsuario}!</h2>
            </div>

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
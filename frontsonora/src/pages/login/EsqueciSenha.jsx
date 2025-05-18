import '../css/global.css';
import '../css/esquecisenha.css';
import React, { useState } from 'react';
import useTitle from '../../hooks/useTitle.js';
import axios from 'axios'; // Importar axios

function EsqueciSenha() {
    useTitle('Recuperar Senha - Sonora');
    const [email, setEmail] = useState('');
    const [emailVerificado, setEmailVerificado] = useState(false);
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
    const [mensagemFeedback, setMensagemFeedback] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const showFeedback = (text, type) => {
        setMensagemFeedback({ text, type });
        setTimeout(() => setMensagemFeedback({ text: '', type: '' }), 5000);
    };

    const handleEmailSubmit = async (event) => {
        event.preventDefault();
        setMensagemFeedback({ text: '', type: '' });
        setIsLoading(true);

        try {
            const response = await axios.get(`/auth/check-email?email=${email}`);

            if (response.status === 200) {
                setEmailVerificado(true);
                showFeedback('Email verificado com sucesso! Agora, por favor, insira sua nova senha.', 'sucesso');
            } else {
                showFeedback('Email não encontrado. Por favor, verifique e tente novamente.', 'erro');
            }
        } catch (error) {
            console.error('Erro ao verificar email:', error);
            if (error.response && error.response.status === 404) {
                showFeedback('Email não encontrado em nosso sistema.', 'erro');
            } else {
                showFeedback('Erro ao verificar o email. Tente novamente mais tarde.', 'erro');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (event) => {
        event.preventDefault();
        setMensagemFeedback({ text: '', type: '' });
        setIsLoading(true);

        if (novaSenha.length < 6) {
            showFeedback('A nova senha deve ter pelo menos 6 caracteres.', 'erro');
            setIsLoading(false);
            return;
        }

        if (novaSenha !== confirmarNovaSenha) {
            showFeedback('A nova senha e a confirmação não coincidem.', 'erro');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('/auth/reset-password', {
                email: email,
                newPassword: novaSenha,
            });

            if (response.status === 200) {
                showFeedback('Senha redefinida com sucesso! Você pode fazer login agora.', 'sucesso');
                setTimeout(() => {
                    window.location.href = '/Acesso';
                }, 2000);

                setEmailVerificado(false);
                setEmail('');
                setNovaSenha('');
                setConfirmarNovaSenha('');

            } else {
                showFeedback(response.data.message || 'Erro ao redefinir a senha. Tente novamente.', 'erro');
            }
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            showFeedback(error.response?.data?.message || 'Erro ao redefinir a senha. Tente novamente mais tarde.', 'erro');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="esqueci-senha-container">
            <button className='botao-voltar' onClick={() => window.location.href = '/Acesso'}>Voltar</button>
            <h1>Vamos recuperar sua senha:</h1>
            <img src="images/fundoesquecisenha.png" alt="" style={{ width: '100%', height: 'auto' }} />

            {mensagemFeedback.text && (
                <p className={`mensagem ${mensagemFeedback.type === 'sucesso' ? 'sucesso' : 'erro'}`}>
                    {mensagemFeedback.text}
                </p>
            )}

            {!emailVerificado ? (
                <form onSubmit={handleEmailSubmit}>
                    <label htmlFor="email">Digite seu email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Verificando...' : 'Enviar email de recuperação'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPasswordSubmit}>
                    <p className="texto-nova-senha">Defina sua nova senha para o email: <strong>{email}</strong></p>
                    <label htmlFor="novaSenha">Nova Senha:</label>
                    <input
                        type="password"
                        id="novaSenha"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <label htmlFor="confirmarNovaSenha">Confirmar Nova Senha:</label>
                    <input
                        type="password"
                        id="confirmarNovaSenha"
                        value={confirmarNovaSenha}
                        onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                    </button>
                    <button type="button" onClick={() => setEmailVerificado(false)} disabled={isLoading} className="cancelar-redefinicao">
                        Cancelar
                    </button>
                </form>
            )}
        </div>
    );
}

export default EsqueciSenha;
import { useState } from 'react';
import useTitle from '../../hooks/useTitle.js';
import axios from 'axios';

function EsqueciSenha() {
    useTitle('Definir nova senha - Sonora');

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
            const response = await axios.get(`/auth/validate-email?email=${email}`);
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
                showFeedback('Senha redefinida com sucesso! Essa página irá se fechar.', 'sucesso');
                setTimeout(() => {
                    window.close();
                    window.location.href = '/Acesso';
                }, 4000);

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
        <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 bg-white overflow-hidden z-[5]">
            <button
                className="absolute top-2 left-2 sm:top-4 sm:left-4 text-white bg-[#1F1536] px-6 py-2 sm:px-6 sm:py-3 rounded hover:bg-[#564a72] transition-colors duration-300 z-[10] text-sm sm:text-base"
                onClick={() => window.location.href = '/Acesso'}
            >
                Voltar
            </button>

            <h1 className="mb-4 !text-[#1F1536] text-xl sm:text-2xl font-bold z-[5] text-center sm:text-left">
                Vamos recuperar sua senha:
            </h1>

            <img
                src="images/fundoesquecisenha.png"
                alt=""
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
            />

            {mensagemFeedback.text && (
                <p
                    className={`z-[5] text-center mb-4 font-medium ${
                        mensagemFeedback.type === 'sucesso'
                            ? '!text-green-600'
                            : '!text-red-600'
                    }`}
                >
                    {mensagemFeedback.text}
                </p>
            )}

            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg 2xl:max-w-xl z-[5]">
                {!emailVerificado ? (
                    <form
                        onSubmit={handleEmailSubmit}
                        className="flex flex-col w-full"
                    >
                        <label htmlFor="email" className="mb-2 text-[#1F1536] text-sm sm:text-base">
                            Digite seu email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="p-3 mb-6 border border-[#1F1536] text-sm sm:text-base text-[#1F1536] focus:outline-none focus:ring-2 focus:ring-[#A48BB3] transition-all duration-300"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#1F1536] text-white px-4 py-3 rounded text-sm sm:text-lg transition-colors duration-300 hover:bg-[#564a72]"
                        >
                            {isLoading ? 'Só um momento...' : 'Recuperar'}
                        </button>
                    </form>
                ) : (
                    <form
                        onSubmit={handleResetPasswordSubmit}
                        className="flex flex-col w-full"
                    >
                        <p className="mb-4 !text-[#1F1536] text-sm sm:text-base">
                            Defina sua nova senha para o email: <strong>{email}</strong>
                        </p>
                        <label htmlFor="novaSenha" className="mb-2 text-[#1F1536] text-sm sm:text-base">
                            Nova Senha:
                        </label>
                        <input
                            type="password"
                            id="novaSenha"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            required
                            disabled={isLoading}
                            className="p-3 mb-6 border border-[#1F1536] text-sm sm:text-base text-[#1F1536] focus:outline-none focus:ring-2 focus:ring-[#A48BB3] transition-all duration-300"
                        />
                        <label htmlFor="confirmarNovaSenha" className="mb-2 text-[#1F1536] text-sm sm:text-base">
                            Confirmar Nova Senha:
                        </label>
                        <input
                            type="password"
                            id="confirmarNovaSenha"
                            value={confirmarNovaSenha}
                            onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                            required
                            disabled={isLoading}
                            className="p-3 mb-6 border border-[#1F1536] text-sm sm:text-base text-[#1F1536] focus:outline-none focus:ring-2 focus:ring-[#A48BB3] transition-all duration-300"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#1F1536] text-white px-4 py-3 rounded text-sm sm:text-lg transition-colors duration-300 hover:bg-[#564a72]"
                        >
                            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setEmailVerificado(false)}
                            disabled={isLoading}
                            className="mt-6 bg-gray-500 text-[#1F1536] px-3 py-2 rounded text-sm sm:text-base transition-colors duration-300 hover:bg-gray-400"
                        >
                            Cancelar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default EsqueciSenha;

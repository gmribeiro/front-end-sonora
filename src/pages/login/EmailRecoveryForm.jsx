// src/components/EmailRecoveryForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

function EmailRecoveryForm() {
    const [email, setEmail] = useState('');
    const [mensagemFeedback, setMensagemFeedback] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const showFeedback = (text, type) => {
        setMensagemFeedback({ text, type });
        setTimeout(() => setMensagemFeedback({ text: '', type: '' }), 5000);
    };

    const handleEmailSubmit = async (event) => {
        event.preventDefault();
        showFeedback('', '');
        setIsLoading(true);

        try {
            const response = await api.get(`/auth/check-email?email=${email}`);
            if (response.status === 200) {
                showFeedback(`Email para redefinição de senha enviado para o endereço: ${email}. Por favor, verifique sua caixa de entrada.`, 'sucesso');
                setEmail('');
            } else {
                showFeedback('Erro inesperado na verificação do email. Tente novamente.', 'erro');
            }
        } catch (error) {
            console.error('Erro ao verificar email ou enviar email de redefinição:', error);

            if (error.response) {
                if (error.response.status === 404) {
                    showFeedback('Email não encontrado em nosso sistema.', 'erro');
                } else if (error.response.status === 500) {
                    showFeedback('Ocorreu um erro ao enviar o email de redefinição. Tente novamente mais tarde.', 'erro');
                } else {
                    showFeedback(error.response.data.message || 'Erro do servidor. Tente novamente.', 'erro');
                }
            } else {
                showFeedback('Erro na comunicação com o servidor. Verifique sua conexão ou tente novamente mais tarde.', 'erro');
            }
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
                Recuperar acesso:
            </h1>

            <img
                src="images/fundoesquecisenha.png"
                alt="Fundo"
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
                <form onSubmit={handleEmailSubmit} className="flex flex-col w-full">
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
                        {isLoading ? 'Enviando...' : 'Enviar email de recuperação'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EmailRecoveryForm;

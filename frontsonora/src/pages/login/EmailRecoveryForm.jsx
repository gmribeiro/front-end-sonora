// src/components/EmailRecoveryForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

function EmailRecoveryForm() { // Não recebe mais props showFeedback, isLoading, setIsLoading
    const [email, setEmail] = useState('');
    const [mensagemFeedback, setMensagemFeedback] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Função showFeedback agora é local ao componente
    const showFeedback = (text, type) => {
        setMensagemFeedback({ text, type });
        setTimeout(() => setMensagemFeedback({ text: '', type: '' }), 5000);
    };

    const handleEmailSubmit = async (event) => {
        event.preventDefault();
        showFeedback('', ''); // Limpa feedback anterior
        setIsLoading(true);

        try {
            const response = await axios.get(`/auth/check-email?email=${email}`);
            if (response.status === 200) {
                // Mensagem específica para o envio do email de redefinição
                showFeedback(`Email para redefinição de senha enviado para o endereço: ${email}. Por favor, verifique sua caixa de entrada.`, 'sucesso');
                setEmail(''); // Opcional: limpa o campo do email após o envio
            } else {
                // Esta parte do else provavelmente não será alcançada com um status 200 do backend
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
        <form
            onSubmit={handleEmailSubmit}
            className="flex flex-col w-full"
        >
            {/* Mensagem de feedback exibida dentro do próprio componente */}
            {mensagemFeedback.text && (
                <p
                    className={`text-center mb-4 font-medium ${
                        mensagemFeedback.type === 'sucesso'
                            ? '!text-green-600'
                            : '!text-red-600'
                    }`}
                >
                    {mensagemFeedback.text}
                </p>
            )}

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
    );
}

export default EmailRecoveryForm;
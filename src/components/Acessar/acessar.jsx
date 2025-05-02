import './acessar.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Acessar = () => {
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });
    const [status, setStatus] = useState({
        loading: false,
        message: '',
        success: false
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, message: '', success: false });

        try {
            const response = await axios.post('http://localhost:8080/auth/login', formData);

            // Store both token and user data if available
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            } else {
                // Fallback for older API versions
                localStorage.setItem('token', response.data);
            }

            setStatus({
                loading: false,
                message: 'Login realizado com sucesso!',
                success: true
            });

            navigate('/perfil');
        } catch (error) {
            let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
            if (error.response) {
                errorMessage = error.response.data.message || error.response.data;
            } else if (error.request) {
                errorMessage = 'Sem resposta do servidor.';
            }

            setStatus({
                loading: false,
                message: errorMessage,
                success: false
            });
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        setStatus({ loading: true, message: '', success: false });

        try {
            const response = await axios.post('http://localhost:8080/auth/google', {
                token: credentialResponse.credential
            });

            // Handle both token and user data
            localStorage.setItem('token', response.data.token);
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            setStatus({
                loading: false,
                message: 'Login com Google realizado com sucesso!',
                success: true
            });

            navigate('/perfil');
        } catch (error) {
            console.error('Erro no login com Google:', error);

            let errorMessage = 'Erro ao autenticar com Google.';
            if (error.response?.data) {
                errorMessage = typeof error.response.data === 'string'
                    ? error.response.data
                    : error.response.data.message;
            }

            setStatus({
                loading: false,
                message: errorMessage,
                success: false
            });
        }
    };

    const handleGoogleLoginError = () => {
        setStatus({
            loading: false,
            message: 'Falha ao conectar com o Google. Tente novamente.',
            success: false
        });
    };

    return (
        <div className='fundo'>
            <button className='botao-voltar' onClick={() => navigate('/')}>Voltar</button>
            <img src="images/fundocadastro.png" alt="Fundo" />
            <div className='area-entrar'>
                <h1>Bem-vindo de volta!</h1>

                {status.message && (
                    <div className={`mensagem ${status.success ? 'sucesso' : 'erro'}`}>
                        {status.message}
                    </div>
                )}

                <form className="form-entrar" onSubmit={handleLogin}>
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Digite seu e-mail"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="senha">Senha</label>
                    <input
                        type="password"
                        id="senha"
                        name="senha"
                        placeholder="Digite sua senha"
                        value={formData.senha}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        className="botao-entrar"
                        disabled={status.loading}
                    >
                        {status.loading ? 'Carregando...' : 'Entrar'}
                    </button>
                </form>

                <h3>ou</h3>

                <GoogleLogin
                    clientId="514141073233-1e9hp32vikk8euh1hgoap2p0otbnvltp.apps.googleusercontent.com"
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    className="botao-google"
                    render={renderProps => (
                        <button
                            onClick={renderProps.onClick}
                            disabled={status.loading || renderProps.disabled}
                            className="botao-google-custom"
                        >
                            <img src="images/google-logo.png" alt="Google" className="google-icon" />
                            Entrar com Google
                        </button>
                    )}
                />

                <div className='sem-conta'>
                    Não tem uma conta?
                    <Link className='link' to="/cadastro"> Cadastrar</Link>
                </div>

                <div className='esqueci-senha'>
                    <Link className='link' to="/esqueci-senha">Esqueci a senha</Link>
                </div>
            </div>
        </div>
    );
};

export default Acessar;
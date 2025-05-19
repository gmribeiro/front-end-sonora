import './acessar.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import SelectorRole from "../../pages/select-roles/Selector-Role.jsx";

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
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkAuthStatus();
        }
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/auth/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.data.role && response.data.role !== 'CLIENT') {
                navigate('/perfil');
            }
        } catch (error) {
            console.log('User not authenticated or error:', error);
        }
    };

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
            // 1. Faz login (recebe apenas o token string)
            const { data: token } = await axios.post('/auth/login', formData);

            // 2. Validação básica do token
            if (!token || typeof token !== 'string') {
                throw new Error('Token inválido');
            }

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setStatus({
                loading: false,
                message: 'Login realizado com sucesso!',
                success: true
            });

            setTimeout(() => {
                navigate('/perfil');
            }, 1000);

        } catch (error) {
            console.error('Erro no login:', error);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];

            setStatus({
                loading: false,
                message: error.response?.status === 401
                    ? 'Email ou senha incorretos'
                    : 'Erro no servidor',
                success: false
            });
        }
    };


    const handleGoogleLoginSuccess = async (credentialResponse) => {
        setStatus({ loading: true, message: '', success: false });

        try {
            const authResponse = await axios.post('/auth/google', {
                token: credentialResponse.credential
            });

            localStorage.setItem('token', authResponse.data.token);
            const userResponse = await axios.get('/auth/user/me', {
                headers: {
                    'Authorization': `Bearer ${authResponse.data.token}`
                }
            });

            const userData = userResponse.data;

            if (!userData.id) {
                throw new Error('ID do usuário não retornado pela API');
            }

            localStorage.setItem('user', JSON.stringify(userData));

            if (userData.role === 'CLIENT') {
                setUserId(userData.id);
                setShowRoleSelector(true);
            } else {
                setStatus({
                    loading: false,
                    message: 'Login realizado com sucesso!',
                    success: true
                });
                navigate('/perfil');
            }

        } catch (error) {
            console.error('Erro no login:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            setStatus({
                loading: false,
                message: error.response?.data?.message || error.message || 'Erro durante o login',
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
        <>
            {showRoleSelector && (
                <div className="role-selector-overlay">
                    <SelectorRole
                        userId={userId}
                        onRoleSelected={() => {
                            setShowRoleSelector(false);
                            setStatus({
                                loading: false,
                                message: 'Perfil configurado com sucesso!',
                                success: true
                            });
                            navigate('/perfil');
                        }}
                    />
                </div>
            )}

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
                        <Link className='link' to="/esquecisenha">Esqueci a senha</Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Acessar;
import './acessar.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Acessar = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setCarregando(true);

        try {
            const response = await axios.post('http://localhost:8080/auth/login', {
                email,
                senha
            });

            localStorage.setItem('token', response.data);

            setMensagem('Login realizado com sucesso!');
            setTimeout(() => {
                navigate('/perfil');
            }, 1000);
        } catch (error) {
            setMensagem(error.response?.data || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setCarregando(false);
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        console.log('Credencial do Google:', credentialResponse);
        const token = credentialResponse.credential;

        if (token) {
            setCarregando(true);
            try {
                const response = await axios.post('http://localhost:8080/auth/google', { token });
                localStorage.setItem('token', response.data);
                setMensagem('Login com Google realizado com sucesso!');
                setTimeout(() => {
                    navigate('/perfil');
                }, 1000);
            } catch (error) {
                console.error('Erro ao fazer login com Google:', error);
                setMensagem(error.response?.data || 'Erro ao autenticar com Google.');
            } finally {
                setCarregando(false);
            }
        } else {
            setMensagem('Falha ao obter credencial do Google.');
        }
    };

    const handleGoogleLoginError = (error) => {
        console.error('Login com Google falhou:', error);
        setMensagem('Falha ao fazer login com o Google.');
    };

    return (
        <div className='fundo'>
            <button className='botao-voltar' onClick={() => navigate('/')}>Voltar</button>
            <img src="images/fundocadastro.png" alt="Fundo" />
            <div className='area-entrar'>
                <h1>Bem-vindo de volta!</h1>

                {mensagem && <div className={`mensagem ${mensagem.includes('sucesso') ? 'sucesso' : 'erro'}`}>{mensagem}</div>}

                <form className="form-entrar" onSubmit={handleLogin}>
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Digite seu e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="senha">Senha</label>
                    <input
                        type="password"
                        id="senha"
                        name="senha"
                        placeholder="Digite sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="botao-entrar"
                        disabled={carregando}
                    >
                        {carregando ? 'Carregando...' : 'Entrar'}
                    </button>
                </form>

                <h3>ou</h3>

                {/* Implementação do Login com Google */}
                <GoogleLogin
                    clientId="514141073233-1e9hp32vikk8euh1hgoap2p0otbnvltp.apps.googleusercontent.com"
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    className="botao-google"
                    render={renderProps => (
                        <button
                            onClick={renderProps.onClick}
                            disabled={carregando || renderProps.disabled}
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
import './acessar.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios'; // Você ainda pode usar axios para outras coisas

const Acessar = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    // Acessar.jsx
    const handleLogin = async (e) => {
        e.preventDefault();
        setCarregando(true);
        setMensagem('');
        try {
            const response = await axios.post('http://localhost:8080/auth/login', {
                email,
                senha
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('nomeUsuario', response.data.nome);
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

    const handleGoogleSuccess = (credentialResponse) => {
        // Redirecionar o navegador para o endpoint de autorização do Google no backend
        window.location.href = 'http://localhost:8080/auth/oauth2/authorization/google';
    };

    const handleGoogleError = () => {
        setMensagem('Falha no login com Google. Tente novamente.');
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

                <div className="google-login-container">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        text="continue_with"
                        shape="rectangular"
                        size="large"
                        width="350"
                        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                    />
                </div>

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
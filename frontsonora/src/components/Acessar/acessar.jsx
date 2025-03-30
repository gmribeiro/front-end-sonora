import './acessar.css';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Acessar = () => {
    return (
        <div className='fundo'>
            <button className='botao-voltar' onClick={() => window.location.href = '/'}>Voltar</button>
            <img src="/fundocadastro.png" alt="Fundo" />
            <div className='area-entrar'>
                <h1>Bem-vindo de volta!</h1>
                
                <form className="form-entrar">
                    <label htmlFor="email">E-mail</label>
                    <input type="email" id="email" name="email" placeholder="Digite seu e-mail" required />

                    <label htmlFor="senha">Senha</label>
                    <input type="password" id="senha" name="senha" placeholder="Digite sua senha" required />

                    <button type="submit" className="botao-entrar">Entrar</button>
                </form>

                <h3>ou</h3>

                <GoogleLogin
                    clientId="514141073233-1e9hp32vikk8euh1hgoap2p0otbnvltp.apps.googleusercontent.com"
                    onSuccess={credentialResponse => {
                        console.log(credentialResponse);
                        // login bem-sucedido
                    }}
                    onError={() => {
                        console.log('Login Failed');
                        // login falho
                    }}
                    className="botao-google"
                />

                <div className='sem-conta'>
                    Não tem uma conta?
                    <Link className='link' to="/Cadastro"> Cadastrar</Link>
                </div>

                <div className='esqueci-senha'>
                    <Link className='link' to="/EsqueciSenha">Esqueci a senha</Link>
                </div>
            </div>
        </div>
    );
};

export default Acessar;
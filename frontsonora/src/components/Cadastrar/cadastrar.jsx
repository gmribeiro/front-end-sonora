import './cadastrar.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Cadastrar = () => {
    const [tipoCadastro, setTipoCadastro] = useState(null);

    const handleTipoCadastro = (tipo) => {
        setTipoCadastro(tipo);
    };

    return (
        <div className='fundo'>
            <button className='botao-voltar' onClick={() => window.location.href = '/'}>Voltar</button>
            <img src="images/fundocadastro.png" alt="Fundo" />
            <div className='area-cadastro'>
                <h1>Conectamos você à música</h1>
                <h2>Escolha seu tipo de cadastro</h2>

                {!tipoCadastro && (
                    <div className="selecao-tipo-cadastro">
                        <button onClick={() => handleTipoCadastro('cliente')}>Cadastrar como Cliente</button>
                        <button onClick={() => handleTipoCadastro('musico')}>Cadastrar como Músico</button>
                    </div>
                )}

                {tipoCadastro === 'cliente' && (
                    <form className="form-cadastro">
                        <label htmlFor="nome">Nome</label>
                        <input type="text" id="nome" name="nome" placeholder="João Martins da Silva" required />

                        <label htmlFor="cpf">CPF</label>
                        <input type="text" id="cpf" name="cpf" placeholder="000.000.000-00" required />

                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" name="email" placeholder="joao@gmail.com" required />

                        <label htmlFor="senha">Senha</label>
                        <input type="text" id="senha" name="senha" placeholder="js12345" required />

                        <label htmlFor="telefone">Telefone</label>
                        <input type="tel" id="telefone" name="telefone" placeholder="(00) 00000-0000" required />

                        <button type="submit" className="botao-cadastrar">Cadastrar-se como Cliente</button>
                    </form>
                )}

                {tipoCadastro === 'musico' && (
                    <form className="form-cadastro">
                        <label htmlFor="nome">Nome Artístico</label>
                        <input type="text" id="nome" name="nome" placeholder="Lady Gaga" required />

                        <label htmlFor="genero">Gênero Musical</label>
                        <input type="text" id="genero" name="genero" placeholder="Pop" required />

                        <label htmlFor="email">E-mail comercial</label>
                        <input type="email" id="email" name="email" placeholder="gaga@gmail.com" required />

                        <label htmlFor="senha">Senha</label>
                        <input type="text" id="senha" name="senha" placeholder="abracadabra01" required />

                        <label htmlFor="telefone">Telefone</label>
                        <input type="tel" id="telefone" name="telefone" placeholder="(00) 00000-0000" required />

                        <button type="submit" className="botao-cadastrar">Cadastrar-se como Músico</button>
                    </form>
                )}

                <div className='sem-conta'>
                    Já tem uma conta?
                    <Link className='link' to="/Acesso"> Acesse aqui</Link>
                </div>
            </div>
        </div>
    );
};

export default Cadastrar;
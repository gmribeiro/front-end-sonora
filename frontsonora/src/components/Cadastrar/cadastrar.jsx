import './cadastrar.css';

const Cadastrar = () => {
    return (
        <div className='fundo'>
            <button className='botao-voltar' onClick={() => window.location.href = '/'}>Voltar</button>
            <img src="../public/fundocadastro.png" alt="Fundo" />
            <div className='area-cadastro'>
                <h1>Conectamos você à música</h1>
                <h2>Cadastre-se abaixo:</h2>
                
                <form className="form-cadastro">
                    <label htmlFor="nome">Nome</label>
                    <input type="text" id="nome" name="nome" placeholder="Digite seu nome" required />

                    <label htmlFor="cpf">CPF</label>
                    <input type="text" id="cpf" name="cpf" placeholder="000.000.000-00" required />

                    <label htmlFor="email">E-mail</label>
                    <input type="email" id="email" name="email" placeholder="Digite seu e-mail" required />

                    <label htmlFor="senha">Senha</label>
                    <input type="password" id="senha" name="senha" placeholder="Digite sua senha" required />

                    <label htmlFor="telefone">Telefone</label>
                    <input type="tel" id="telefone" name="telefone" placeholder="(00) 00000-0000" required />

                    <button type="submit" className="botao-cadastrar">Cadastrar-se</button>
                </form>
            </div>
        </div>
    );
};

export default Cadastrar;

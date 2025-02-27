import './cadastrar.css'

const Cadastrar = () => {
    return (
        <div className='fundo'>
            <button className='botao-voltar' onClick={() => window.location.href = '/'}>Voltar</button>
            <img src="../public/fundocadastro.png" alt="" />
            <div className='area-cadastro'>
                <h1>Realize seu cadastro e começe a curtir a música</h1>
                <h2>Escolha seu tipo de cadastro:</h2>
                <div className='botoes-cadastro'>
                    <button className='botao-musico'>Sou músico</button>
                    <button className='botao-cliente'>Sou cliente</button>
                </div>
            </div>
        </div>
    )
}

export default Cadastrar;

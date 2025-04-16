import './cadastrar.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cadastrar = () => {
    const [tipoCadastro, setTipoCadastro] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        senha: '',
        telefone: '',
        cpf: '',
        genero: '',
        tipoUsuario: ''
    });
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

    const handleTipoCadastro = (tipo) => {
        setTipoCadastro(tipo);
        setFormData({...formData, tipoUsuario: tipo.toUpperCase()});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8080/auth/register', formData);

            if (response.status === 200) {
                setMensagem('Cadastro realizado com sucesso!');
                setTimeout(() => {
                    navigate('/acesso');
                }, 2000);
            }
        } catch (error) {
            setMensagem(error.response?.data?.message || 'Erro ao cadastrar. Tente novamente.');
        }
    };

    return (
        <div className='fundo'>
            <button className='botao-voltar' onClick={() => navigate('/')}>Voltar</button>
            <img src="images/fundocadastro.png" alt="Fundo" />
            <div className='area-cadastro'>
                <h1>Conectamos você à música</h1>
                <h2>Escolha seu tipo de cadastro</h2>

                {mensagem && <div className="mensagem">{mensagem}</div>}

                {!tipoCadastro && (
                    <div className="selecao-tipo-cadastro">
                        <button onClick={() => handleTipoCadastro('cliente')}>Cadastrar como Cliente</button>
                        <button onClick={() => handleTipoCadastro('musico')}>Cadastrar como Músico</button>
                    </div>
                )}

                {tipoCadastro === 'cliente' && (
                    <form className="form-cadastro" onSubmit={handleSubmit}>
                        <label htmlFor="name">Nome</label>
                        <input
                            type="name"
                            id="name"
                            name="name"
                            placeholder="João Martins da Silva"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="cpf">CPF</label>
                        <input
                            type="text"
                            id="cpf"
                            name="cpf"
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="joao@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="senha">Senha</label>
                        <input
                            type="password"
                            id="senha"
                            name="senha"
                            placeholder="js12345"
                            value={formData.senha}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="telefone">Telefone</label>
                        <input
                            type="tel"
                            id="telefone"
                            name="telefone"
                            placeholder="(00) 00000-0000"
                            value={formData.telefone}
                            onChange={handleChange}
                            required
                        />

                        <button type="submit" className="botao-cadastrar">Cadastrar-se como Cliente</button>
                    </form>
                )}

                {tipoCadastro === 'musico' && (
                    <form className="form-cadastro" onSubmit={handleSubmit}>
                        <label htmlFor="nome">Nome Artístico</label>
                        <input
                            type="text"
                            id="nome"
                            name="nome"
                            placeholder="Lady Gaga"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="genero">Gênero Musical</label>
                        <input
                            type="text"
                            id="genero"
                            name="genero"
                            placeholder="Pop"
                            value={formData.genero}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="email">E-mail comercial</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="gaga@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="senha">Senha</label>
                        <input
                            type="password"
                            id="senha"
                            name="senha"
                            placeholder="abracadabra01"
                            value={formData.senha}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="telefone">Telefone</label>
                        <input
                            type="tel"
                            id="telefone"
                            name="telefone"
                            placeholder="(00) 00000-0000"
                            value={formData.telefone}
                            onChange={handleChange}
                            required
                        />

                        <button type="submit" className="botao-cadastrar">Cadastrar-se como Músico</button>
                    </form>
                )}

                <div className='sem-conta'>
                    Já tem uma conta?
                    <Link className='link' to="/acesso"> Acesse aqui</Link>
                </div>
            </div>
        </div>
    );
};

export default Cadastrar;
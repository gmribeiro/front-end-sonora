import './cadastrar.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cadastrar = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        senha: '',
        telefone: '',
        cpf: '',
        genero: '',
        role: 'CLIENT', // Valor padrão agora é CLIENT
        nomeArtistico: '', // Campo específico para Músico
        redesSociais: ''   // Campo específico para Músico
    });
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

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

                <form className="form-cadastro" onSubmit={handleSubmit}>
                    <label htmlFor="name">Nome</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Digite seu nome"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="email">E-mail</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="senha">Senha</label>
                    <input
                        type="password"
                        id="senha"
                        name="senha"
                        placeholder="Sua senha"
                        value={formData.senha}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="role">Tipo de Usuário</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="CLIENT">Cliente (Padrão)</option>
                        <option value="HOST">Anfitrião</option>
                        <option value="ARTISTA">Músico</option>
                    </select>



                    {formData.role === 'ARTISTA' && (
                        <>
                            <label htmlFor="nomeArtistico">Nome Artístico</label>
                            <input
                                type="text"
                                id="nomeArtistico"
                                name="nomeArtistico"
                                placeholder="Nome do Artista"
                                value={formData.nomeArtistico}
                                onChange={handleChange}
                                required
                            />

                            <label htmlFor="redesSociais">Redes Sociais</label>
                            <input
                                type="text"
                                id="redesSociais"
                                name="redesSociais"
                                placeholder="Links para suas redes sociais"
                                value={formData.redesSociais}
                                onChange={handleChange}
                            />

                        </>
                    )}

                    {formData.role === 'HOST' && (
                        <>
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
                            {/* Adicione aqui campos específicos para HOST, se necessário */}
                        </>
                    )}

                    <button type="submit" className="botao-cadastrar">Cadastrar-se</button>
                </form>

                <div className='sem-conta'>
                    Já tem uma conta?
                    <Link className='link' to="/acesso"> Acesse aqui</Link>
                </div>
            </div>
        </div>
    );
};

export default Cadastrar;
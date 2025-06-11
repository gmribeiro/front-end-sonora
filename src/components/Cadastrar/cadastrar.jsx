import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdCheckmarkCircle } from "react-icons/io";

const Cadastrar = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf: '',
    genero: '',
    role: 'CLIENT',
    nomeArtistico: '',
    redesSociais: '',
    bio: '' // Campo de bio
  });

  const [mensagem, setMensagem] = useState('');
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [fadeInTitulo, setFadeInTitulo] = useState(false);
  const [fadeInTexto, setFadeInTexto] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (cadastroConcluido) {
      const timer1 = setTimeout(() => setFadeInTitulo(true), 300);
      const timer2 = setTimeout(() => setFadeInTexto(true), 1300);
      const redirect = setTimeout(() => navigate('/acesso'), 3000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(redirect);
      };
    }
  }, [cadastroConcluido, navigate]);

  const formatTelefone = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 13);
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{4,5})(\d{0,4})$/);

    if (match) {
      const intl = match[1] ? `+${match[1]}` : '';
      const ddd = match[2] ? ` (${match[2]})` : '';
      const first = match[3] ? ` ${match[3]}` : '';
      const last = match[4] ? `-${match[4]}` : '';
      return `${intl}${ddd}${first}${last}`.trim();
    }
    return value;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefone') {
      const formatted = formatTelefone(value);
      setFormData(prev => ({ ...prev, telefone: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      setMensagem('As senhas não coincidem.');
      return;
    }

    try {
      const { confirmarSenha, ...payload } = formData;
      const response = await axios.post('http://localhost:8080/auth/register', payload);
      if (response.status >= 200 && response.status < 300) {
        setCadastroConcluido(true);
      }
    } catch (error) {
      setMensagem(error.response?.data?.message || 'Erro ao cadastrar. Tente novamente.');
    }
  };

  return (
      <div className="relative w-screen h-screen overflow-hidden font-sans bg-[#EDE6F2]">
        <button
            className="absolute bottom-2 right-2 bg-[#A48BB3] text-white py-2 px-6 text-sm sm:text-base rounded transition duration-300 hover:bg-[#1F1536] hover:scale-105 z-10"
            onClick={() => navigate('/')}
        >
          Voltar
        </button>

        <img
            src="images/fundocadastro.png"
            alt="Fundo"
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />

        <div className="absolute top-0 left-0 w-full md:w-1/2 min-w-[350px] h-full bg-[#EDE6F2] shadow-[5px_0_10px_rgba(0,0,0,0.2)] flex flex-col justify-center items-center p-6 sm:p-10 md:p-12">

          {cadastroConcluido ? (
              <div className="flex flex-col items-center justify-center text-center h-full w-full px-4 sm:px-8">
                <h1 className={`flex items-center gap-2 text-[#1F1536] text-3xl sm:text-4xl font-bold transition-all duration-1000
              ${fadeInTitulo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  Cadastro Concluído <IoMdCheckmarkCircle />
                </h1>
                <p className={`text-[#A48BB3] text-base sm:text-lg max-w-[80%] mt-4 transition-all duration-1000 delay-500
              ${fadeInTexto ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  Indo para a página de acesso...
                </p>
              </div>
          ) : (
              <>
                <h1 className="!text-[#1F1536] text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4">Conectamos você à música</h1>
                <h2 className="!text-[#1F1536] text-lg sm:text-xl mb-4 sm:mb-6">Escolha seu tipo de cadastro</h2>

                {mensagem && (
                    <div className={`w-full sm:w-4/5 p-3 sm:p-4 mb-6 rounded font-bold text-center text-sm sm:text-base
                ${mensagem.toLowerCase().includes('sucesso') ?
                        'bg-[#EDE6F2] border-2 border-[#A48BB3] text-[#1F1536]' :
                        'bg-[#FFEBEE] border-2 border-[#B00020] text-[#B00020]'}`}>
                      {mensagem}
                    </div>
                )}

                <form className="flex flex-col w-full sm:w-4/5" onSubmit={handleSubmit}>
                  <label htmlFor="name" className="font-bold mb-1 text-[#1F1536] text-sm sm:text-base">Nome</label>
                  <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Digite seu nome"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mb-3 sm:mb-4 px-3 py-2 border border-[#A48BB3] rounded text-[#1F1536]"
                  />

                  <label htmlFor="email" className="font-bold mb-1 text-[#1F1536] text-sm sm:text-base">E-mail</label>
                  <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mb-3 sm:mb-4 px-3 py-2 border border-[#A48BB3] rounded text-[#1F1536]"
                  />

                  <label htmlFor="senha" className="font-bold mb-1 text-[#1F1536] text-sm sm:text-base">Senha</label>
                  <input
                      type="password"
                      id="senha"
                      name="senha"
                      placeholder="Sua senha"
                      value={formData.senha}
                      onChange={handleChange}
                      required
                      className="mb-3 sm:mb-4 px-3 py-2 border border-[#A48BB3] rounded text-[#1F1536]"
                  />

                  <label htmlFor="confirmarSenha" className="font-bold mb-1 text-[#1F1536] text-sm sm:text-base">Confirmar Senha</label>
                  <input
                      type="password"
                      id="confirmarSenha"
                      name="confirmarSenha"
                      placeholder="Digite a senha novamente"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      required
                      className="mb-3 sm:mb-4 px-3 py-2 border border-[#A48BB3] rounded text-[#1F1536]"
                  />

                  <label htmlFor="role" className="font-bold mb-1 text-[#1F1536] text-sm sm:text-base">Tipo de Usuário</label>
                  <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="mb-3 sm:mb-4 px-3 py-2 border border-[#A48BB3] rounded text-[#1F1536]"
                  >
                    <option value="CLIENT">Cliente (Padrão)</option>
                    <option value="HOST">Anfitrião</option>
                    <option value="ARTISTA">Músico</option>
                  </select>

                  {/* Campos específicos para ARTISTA */}
                  {formData.role === 'ARTISTA' && (
                      <>
                        <label htmlFor="nomeArtistico" className="font-bold mb-1 text-[#1F1536] text-sm sm:text-base">Nome Artístico</label>
                        <input
                            type="text"
                            id="nomeArtistico"
                            name="nomeArtistico"
                            placeholder="Nome do Artista"
                            value={formData.nomeArtistico}
                            onChange={handleChange}
                            required
                            className="mb-3 sm:mb-4 px-3 py-2 border border-[#A48BB3] rounded text-[#1F1536]"
                        />

                        {/* Campo de BIO para ARTISTA (abaixo do Nome Artístico) */}
                        <label htmlFor="bio" className="font-bold mb-1 text-[#1F1536] text-sm sm:text-base">Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            placeholder="Conte um pouco sobre você e sua trajetória artística..."
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            className="mb-3 sm:mb-4 px-3 py-2 border border-[#A48BB3] rounded text-[#1F1536] resize-y"
                        ></textarea>

                        <label htmlFor="redesSociais" className="font-bold mb-1 text-[#1F1536] text-sm sm:text-base">Redes Sociais</label>
                        <input
                            type="text"
                            id="redesSociais"
                            name="redesSociais"
                            placeholder="Links para suas redes sociais"
                            value={formData.redesSociais}
                            onChange={handleChange}
                            className="mb-3 sm:mb-4 px-3 py-2 border border-[#A48BB3] rounded text-[#1F1536]"
                        />
                      </>
                  )}

                  {/* Campo de BIO para HOST (em sua própria seção) */}
                  {formData.role === 'HOST' && (
                      <>
                        <label htmlFor="telefone" className="font-bold mb-1 text-[#1F1536] text-sm sm:text-base">Telefone</label>
                        <input
                            type="tel"
                            id="telefone"
                            name="telefone"
                            placeholder="+55 (11) 91234-5678"
                            value={formData.telefone}
                            onChange={handleChange}
                            required
                            maxLength={20}
                            className="mb-3 sm:mb-4 px-3 py-2 border border-[#A48BB3] rounded text-[#1F1536]"
                        />
                        <label htmlFor="bio" className="font-bold mb-1 text-[#1F1536] text-sm sm:text-base">Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            placeholder="Conte um pouco sobre você e seu espaço..." // Texto adaptado para HOST
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            className="mb-3 sm:mb-4 px-3 py-2 border border-[#A48BB3] rounded text-[#1F1536] resize-y"
                        ></textarea>
                      </>
                  )}

                  <button
                      type="submit"
                      className="bg-[#1F1536] text-white py-3 rounded text-base sm:text-lg font-semibold cursor-pointer transition duration-300 hover:bg-[#A48BB3] hover:scale-105"
                  >
                    Cadastrar-se
                  </button>
                </form>

                <div className="mt-6 text-[#1F1536] text-sm sm:text-base text-center sm:text-left">
                  Já tem uma conta?
                  <Link to="/acesso" className="text-[#A48BB3] font-bold ml-1 hover:text-[#1F1536] hover:underline">
                    Acesse aqui
                  </Link>
                </div>
              </>
          )}
        </div>
      </div>
  );
};

export default Cadastrar;
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { IoMdCheckmarkCircle } from "react-icons/io";

const Cadastrar = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    genero: '',
    role: 'CLIENT',
    nomeArtistico: '',
    redesSociais: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});
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

  useEffect(() => {
    if (mensagem || Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setMensagem('');
        setErrors({});
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [mensagem, errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setMensagem('');
  };

  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validarCamposArtista = () => {
    const novosErros = {};
    if (formData.role === 'ARTISTA') {
      if (!formData.nomeArtistico || formData.nomeArtistico.trim().length < 3) {
        novosErros.nomeArtistico = 'Nome artístico deve ter pelo menos 3 caracteres.';
      }
      if (!formData.bio || formData.bio.trim().length < 10) {
        novosErros.bio = 'A bio deve conter pelo menos 10 caracteres.';
      }
    }
    return novosErros;
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.name || formData.name.trim().length < 3) {
      novosErros.name = 'Nome deve ter pelo menos 3 caracteres.';
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(formData.name)) {
      novosErros.name = 'Nome deve conter apenas letras e espaços.';
    }

    if (!formData.email || !validarEmail(formData.email)) {
      novosErros.email = 'Digite um e-mail válido.';
    }

    if (!formData.senha || formData.senha.length < 6) {
      novosErros.senha = 'Senha deve ter no mínimo 6 caracteres.';
    }

    if (formData.senha !== formData.confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas não coincidem.';
    }

    const errosArtista = validarCamposArtista();
    Object.assign(novosErros, errosArtista);

    setErrors(novosErros);

    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setMensagem('Por favor, corrija os erros antes de enviar.');
      return;
    }

    try {
      const { confirmarSenha, ...payload } = formData;
      const response = await api.post('/auth/register', payload);
      if (response.status >= 200 && response.status < 300) {
        setCadastroConcluido(true);
      }
    } catch (error) {
      setMensagem(error.response?.data?.message || 'Erro ao cadastrar. Tente novamente.');
    }
  };

  const inputClass = (field) => {
    const base =
      "mb-3 sm:mb-4 px-3 py-2 border rounded text-[#1F1536] focus:outline-none focus:ring-2 placeholder:text-[#564a72]";
    const erro = errors[field] ? 'border-[#B00020] focus:ring-[#B00020]' : 'border-[#A48BB3] focus:ring-[#A48BB3]';
    return `${base} ${erro}`;
  };

  const inputClassTextarea = (field) => {
    const base =
      "mb-3 sm:mb-4 px-3 py-1 border rounded text-[#1F1536] resize-y focus:outline-none focus:ring-2 placeholder:text-[#564a72]";
    const erro = errors[field] ? 'border-[#B00020] focus:ring-[#B00020]' : 'border-[#A48BB3] focus:ring-[#A48BB3]';
    return `${base} ${erro}`;
  };

  return (
    <div className="relative w-screen min-h-screen font-sans bg-[#EDE6F2] overflow-x-hidden">
      <div
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center z-0"
        style={{ backgroundImage: "url('images/fundocadastro.png')" }}
      ></div>

      <button
        className="hidden md:block absolute bottom-4 right-6 !bg-[#A48BB3] text-[#EDE6F2] py-2 px-6 text-sm md:text-base rounded transition duration-300 hover:!bg-[#1F1536] hover:scale-105 z-10"
        onClick={() => navigate('/')}
      >
        Voltar
      </button>

      <div className="relative z-10 top-0 left-0 w-full md:w-3/5 xl:w-1/2 min-w-[350px] min-h-screen bg-[#EDE6F2] shadow-[5px_0_10px_rgba(0,0,0,0.2)] flex flex-col justify-center items-center p-6 sm:p-8 md:p-10 lg:p-12">

        <button
          className="block md:hidden self-end mb-8 !bg-[#A48BB3] text-[#EDE6F2] py-2 px-6 text-sm sm:text-base rounded transition duration-300 hover:!bg-[#1F1536] hover:scale-105"
          onClick={() => navigate('/')}
        >
          Voltar
        </button>

        <div className="w-full max-w-lg flex flex-col items-center">
          {cadastroConcluido ? (
            <div className="flex flex-col items-center justify-center text-center w-full px-4 sm:px-8 py-12">
              <h1 className={`flex items-center gap-2 text-[#1F1536] text-3xl sm:text-4xl font-bold transition-all duration-1000 ${fadeInTitulo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Cadastro Concluído <IoMdCheckmarkCircle />
              </h1>
              <p className={`text-[#A48BB3] text-base sm:text-lg max-w-[80%] mt-4 transition-all duration-1000 delay-500 ${fadeInTexto ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Indo para a página de acesso...
              </p>
            </div>
          ) : (
            <>
              <h1 className="!text-[#564a72] text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold mb-3 sm:mb-4">Conectamos você à música</h1>
              <h2 className="!text-[#564a72] text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-4">Escolha seu tipo de cadastro</h2>

              {mensagem && (
                <div className="w-full sm:w-4/5 p-2 mb-6 font-bold text-center text-sm sm:text-base text-[#B00020]">
                  {mensagem}
                </div>
              )}

              <form className="flex flex-col w-full sm:w-4/5" onSubmit={handleSubmit}>
                <label htmlFor="name" className="font-bold mb-1 text-[#564a72] text-sm sm:text-base">Nome</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Digite seu nome"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass('name')}
                  required
                />
                {errors.name && <p className="text-[#B00020] text-xs sm:text-sm mt-0.25 mb-4">{errors.name}</p>}

                <label htmlFor="email" className="font-bold mb-1 text-[#564a72] text-sm sm:text-base">E-mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass('email')}
                  required
                />
                {errors.email && <p className="text-[#B00020] text-xs sm:text-sm mt-0.25 mb-4">{errors.email}</p>}

                <label htmlFor="senha" className="font-bold mb-1 text-[#564a72] text-sm sm:text-base">Senha</label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  placeholder="Sua senha"
                  value={formData.senha}
                  onChange={handleChange}
                  className={inputClass('senha')}
                  required
                />
                {errors.senha && <p className="text-[#B00020] text-xs sm:text-sm mt-0.25 mb-4">{errors.senha}</p>}

                <label htmlFor="confirmarSenha" className="font-bold mb-1 text-[#564a72] text-sm sm:text-base">Confirmar Senha</label>
                <input
                  type="password"
                  id="confirmarSenha"
                  name="confirmarSenha"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className={inputClass('confirmarSenha')}
                  required
                />
                {errors.confirmarSenha && <p className="text-[#B00020] text-xs sm:text-sm mt-0.25 mb-4">{errors.confirmarSenha}</p>}

                <label htmlFor="role" className="font-bold mb-1 text-[#564a72] text-sm sm:text-base">Tipo de Usuário</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={inputClass('role')}
                  required
                >
                  <option value="CLIENT">Cliente (Padrão)</option>
                  <option value="HOST">Anfitrião</option>
                  <option value="ARTISTA">Músico</option>
                </select>

                {formData.role === 'ARTISTA' && (
                  <>
                    <label htmlFor="nomeArtistico" className="font-bold mb-1 text-[#564a72] text-sm sm:text-base">Nome Artístico</label>
                    <input
                      type="text"
                      id="nomeArtistico"
                      name="nomeArtistico"
                      placeholder="Nome do Artista"
                      value={formData.nomeArtistico}
                      onChange={handleChange}
                      className={inputClass('nomeArtistico')}
                      required
                    />
                    {errors.nomeArtistico && <p className="text-[#B00020] text-xs sm:text-sm mt-0.25 mb-4">{errors.nomeArtistico}</p>}

                    <label htmlFor="bio" className="font-bold mb-1 text-[#564a72] text-sm sm:text-base">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      placeholder="Conte um pouco sobre você, como você trabalha e sua trajetória artística..."
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className={inputClassTextarea('bio')}
                    ></textarea>
                    {errors.bio && <p className="text-[#B00020] text-xs sm:text-sm mt-0.25 mb-4">{errors.bio}</p>}

                    <label htmlFor="redesSociais" className="font-bold mb-1 text-[#564a72] text-sm sm:text-base">
                      Redes Sociais (Opcional)
                    </label>
                    <input
                      type="text"
                      id="redesSociais"
                      name="redesSociais"
                      placeholder="Seus nomes nas redes sociais"
                      value={formData.redesSociais}
                      onChange={handleChange}
                      className="mb-2 sm:mb-4 px-3 py-1 border border-[#A48BB3] rounded !text-[#564a72] focus:outline-none focus:ring-2 focus:ring-[#A48BB3] placeholder:text-[#564a72]"
                    />
                  </>
                )}

                {formData.role === 'HOST' && (
                  <>
                    <label htmlFor="bio" className="font-bold mb-1 text-[#1F1536] text-sm sm:text-base">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      placeholder="Conte um pouco sobre você e seu espaço..."
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className={inputClassTextarea('bio')}
                    ></textarea>
                  </>
                )}

                <button
                  type="submit"
                  className="!bg-[#1F1536] text-[#EDE6F2] py-3 rounded text-base sm:text-lg font-semibold cursor-pointer transition duration-300 hover:!bg-[#A48BB3] hover:scale-105"
                >
                  Cadastrar-se
                </button>
              </form>

              <div className="mt-4 !text-[#1F1536] text-sm sm:text-base text-center sm:text-left">
                Já tem uma conta?
                <Link to="/acesso" className="!text-[#A48BB3] font-bold ml-1 hover:!text-[#1F1536] hover:underline">
                  Acesse aqui
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cadastrar;

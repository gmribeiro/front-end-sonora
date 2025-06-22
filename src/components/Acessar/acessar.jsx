import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../api/index.js';
import SelectorRole from "../../pages/select-roles/Selector-Role.jsx";

const Acessar = () => {
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [status, setStatus] = useState({ loading: false, message: '', success: false });
  const [validationErrors, setValidationErrors] = useState({});
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) checkAuthStatus();
  }, []);

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => setStatus(prev => ({ ...prev, message: '' })), 15000);
      return () => clearTimeout(timer);
    }
  }, [status.message]);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/auth/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.role && response.data.role !== 'CLIENT') {
        navigate('/perfil');
      }
    } catch (error) {
      console.log('User not authenticated or error:', error);
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errors.email = 'O e-mail é obrigatório.';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Digite um e-mail válido.';
    }

    if (!formData.senha.trim()) {
      errors.senha = 'A senha é obrigatória.';
    } else if (formData.senha.length < 6) {
      errors.senha = 'A senha deve ter pelo menos 6 caracteres.';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setStatus({ loading: true, message: '', success: false });

    try {
      const { data: token } = await api.post('/auth/login', formData);
      if (!token || typeof token !== 'string') throw new Error('Token inválido');
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setStatus({ loading: false, message: 'Login realizado com sucesso!', success: true });
      setTimeout(() => navigate('/perfil'), 1000);
    } catch (error) {
      console.error('Erro no login:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];

      let message = 'Erro inesperado. Tente novamente mais tarde.';

      if (error.response) {
        const { status } = error.response;
        if (status === 401 || status === 404) {
          message = 'E-mail ou senha incorretos. Verifique novamente.';
        } else if (error.response.data?.message) {
          message = error.response.data.message;
        }
      } else if (error.request) {
        message = 'E-mail ou senha incorretos. Verifique novamente.';
      } else if (error.message === 'Network Error') {
        message = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }

      setStatus({
        loading: false,
        message,
        success: false
      });
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setStatus({ loading: true, message: '', success: false });
    try {
      const authResponse = await api.post('/auth/google', { token: credentialResponse.credential });
      localStorage.setItem('token', authResponse.data.token);
      const userResponse = await api.get('/auth/user/me', {
        headers: { Authorization: `Bearer ${authResponse.data.token}` }
      });
      const userData = userResponse.data;
      if (!userData.id) throw new Error('ID do usuário não retornado pela API');
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.role === 'CLIENT') {
        setUserId(userData.id);
        setShowRoleSelector(true);
      } else {
        setStatus({ loading: false, message: 'Login realizado com sucesso!', success: true });
        navigate('/perfil');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setStatus({
        loading: false,
        message: error.response?.data?.message || error.message || 'Erro durante o login',
        success: false
      });
    }
  };

  const handleGoogleLoginError = () => {
    setStatus({ loading: false, message: 'Falha ao conectar com o Google. Tente novamente.', success: false });
  };

  return (
    <>
      {showRoleSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <SelectorRole
            userId={userId}
            onRoleSelected={() => {
              setShowRoleSelector(false);
              setStatus({ loading: false, message: 'Perfil configurado com sucesso!', success: true });
              navigate('/perfil');
            }}
          />
        </div>
      )}

      <div className="relative w-screen h-screen flex justify-center items-center overflow-hidden">
        <button
          onClick={() => navigate('/')}
          className="absolute bottom-5 right-15 !bg-[#A48BB3] text-white py-3 px-8 rounded-lg text-sm md:text-base lg:text-base transition transform duration-200 ease-in-out hover:!bg-[#1F1536] hover:scale-105 z-10"
        >
          Voltar
        </button>
        <img
          src="images/fundocadastro.png"
          alt="Fundo"
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
        <div className="bg-[#EDE6F2] w-[90vw] sm:w-[85vw] md:w-[65vw] lg:w-[30vw] max-w-md flex flex-col justify-center items-center p-3 sm:p-4 md:p-6 lg:p-10 rounded-none shadow-md !shadow-[#A48BB355] z-10">
          <h1 className="!text-[#1F1536] text-center mb-2 text-lg sm:text-xl md:text-2xl lg:text-3xl">Bem-vindo de volta!</h1>

          {status.message && (
            <div className={`w-full text-center py-2 mb-4 font-semibold text-sm sm:text-base ${status.success ? 'text-green-800' : 'text-[#B00020]'}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col w-full items-center">
            <label htmlFor="email" className="font-bold mb-1 text-[#1F1536] text-base sm:text-lg">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Digite seu e-mail"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-1.5 sm:p-2 rounded md:p-3 border text-base mb-1 !text-[#1F1536] focus:outline-none focus:ring-2 focus:ring-[#A48BB3] transition-all duration-300 ${
                validationErrors.email ? 'border-[#B00020] focus:ring-[#B00020]' : 'border-[#1F1536] focus:ring-[#A48BB3]'
              }`}
            />
            {validationErrors.email && (
              <span className="text-[#B00020] text-sm mb-4 mt-1">{validationErrors.email}</span>
            )}

            <label htmlFor="senha" className="font-bold mb-1 text-[#1F1536] text-base sm:text-lg">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              placeholder="Digite sua senha"
              value={formData.senha}
              onChange={handleChange}
              className={`w-full p-1.5 sm:p-2 rounded md:p-3 border text-base mb-1 !text-[#1F1536] focus:outline-none focus:ring-2 focus:ring-[#A48BB3] transition-all duration-300 ${
                validationErrors.senha ? 'border-[#B00020] focus:ring-[#B00020]' : 'border-[#1F1536] focus:ring-[#A48BB3]'
              }`}
            />
            {validationErrors.senha && (
              <span className="text-[#B00020] text-sm mb-4 mt-1">{validationErrors.senha}</span>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className="!bg-[#1F1536] text-[#EDE6F2] py-2 w-[85%] sm:w-4/5 mt-3 text-sm sm:text-base transition transform duration-300 rounded ease-in-out hover:!bg-[#A48BB3] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status.loading ? 'Carregando...' : 'Entrar'}
            </button>
          </form>

          <h3 className="text-[#1F1536] my-1 text-base sm:text-lg">ou</h3>

          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            useOneTap
          />

          <div className="mt-6 text-[#1F1536] text-center text-base sm:text-lg">
            Não tem uma conta?
            <Link to="/cadastro" className="text-[#A48BB3] ml-1 hover:!text-[#1F1536] hover:underline">Cadastrar</Link>
          </div>

          <div className="mt-2 text-[#1F1536] text-center text-base sm:text-lg">
            <Link to="/check-email" className="text-[#A48BB3] hover:!text-[#1F1536] hover:underline">Esqueci a senha</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Acessar;

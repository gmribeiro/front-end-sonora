import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaGuitar } from "react-icons/fa6";
import { TbBuildingCircus } from "react-icons/tb";

const RoleSelector = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nome_artistico: '',
        redes_sociais: ''
    });

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const checkUserAndRedirect = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (!token || !storedUser) {
                setLoading(false);
                return;
            }

            try {
                const user = JSON.parse(storedUser);

                if (user && user.profileCompleted === true) {
                    navigate('/perfil');
                } else {
                    setCurrentUser(user);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Erro ao fazer parse do usuário:', err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setError('Erro ao carregar dados do usuário. Faça login novamente.');
                setLoading(false);
            }
        };

        checkUserAndRedirect();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser || !currentUser.id) {
            setError('Dados do usuário não disponíveis. Tente fazer login novamente.');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userId = currentUser.id;

            if (!selectedRole) {
                setError('Por favor, selecione um papel.');
                setLoading(false);
                return;
            }

            const userUpdateDTO = {
                id: userId,
                name: currentUser.name || null,
                email: currentUser.email,
                senha: null,
                dataCriacao: currentUser.dataCriacao || null,
                googleId: currentUser.googleId || null,
                foto: currentUser.foto || null,
                role: selectedRole,
                profileCompleted: true,
                nomeArtistico: selectedRole === 'ARTISTA' ? formData.nome_artistico.trim() : null,
                redesSociais: selectedRole === 'ARTISTA' ? formData.redes_sociais.trim() : null
            };

            if (selectedRole === 'ARTISTA' && !userUpdateDTO.nomeArtistico) {
                setError('O nome artístico é obrigatório para artistas.');
                setLoading(false);
                return;
            }

            const response = await axios.put(
                `/users/${userId}`,
                userUpdateDTO,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const updatedUser = response.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            navigate('/perfil');
        } catch (err) {
            setError(err.response?.data || err.message || 'Erro ao atualizar perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setError('');
    };

    const handleContinueAsClient = async () => {
        if (!currentUser || !currentUser.id) {
            setError('Dados do usuário não disponíveis. Tente fazer login novamente.');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userId = currentUser.id;

            const userUpdateDTO = {
                id: userId,
                name: currentUser.name || null,
                email: currentUser.email,
                senha: null,
                dataCriacao: currentUser.dataCriacao || null,
                googleId: currentUser.googleId || null,
                foto: currentUser.foto || null,
                role: 'CLIENT',
                profileCompleted: true
            };

            const response = await axios.put(
                `/users/${userId}`,
                userUpdateDTO,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const updatedUser = response.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            navigate('/perfil');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erro ao continuar como cliente.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center text-gray-700 font-semibold">Carregando perfil...</div>;
    }

    if (!currentUser) {
        return <div className="text-red-600 text-center font-medium">Erro: Dados do usuário não carregados. Faça login novamente.</div>;
    }

    return (
        <div
            className="h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
            style={{ backgroundImage: "url('/images/fundoroleselector.jpg')" }}
        >
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md !text-[#564A72]">
            <h2 className="text-2xl font-bold mb-2 !text-[#564A72]">Complete seu cadastro</h2>
            <p className="!text-[#564A72] mb-4 text-xl">Selecione como deseja usar a plataforma:</p>

            <form onSubmit={handleSubmit}>
                <div className="flex gap-4 mb-6">
                    <div
                        className={`flex-1 p-4 border-3 rounded-lg cursor-pointer transition-all ${
                            selectedRole === 'HOST' ? 'border-[#564A72] bg-green-50' : 'border-gray-300'
                        }`}
                        onClick={() => handleRoleSelect('HOST')}
                    >
                        <div className="text-2xl mb-2"><TbBuildingCircus /></div>
                        <div>
                            <h4 className="!text-[#564A72] font-bold">Sou Organizador</h4>
                            <p className='!text-[#564A72]'>Quero criar e gerenciar eventos</p>
                        </div>
                    </div>

                    <div
                        className={`flex-1 p-4 border-3 rounded-lg cursor-pointer transition-all ${
                            selectedRole === 'ARTISTA' ? 'border-[#564A72] bg-green-50' : 'border-gray-300'
                        }`}
                        onClick={() => handleRoleSelect('ARTISTA')}
                    >
                        <div className="text-2xl mb-2"><FaGuitar /></div>
                        <div>
                            <h4 className="!text-[#564A72] font-bold">Sou Artista</h4>
                            <p className='!text-[#564A72]'>Quero me apresentar em eventos</p>
                        </div>
                    </div>
                </div>

                {selectedRole === 'ARTISTA' && (
                    <div>
                        <div className="mb-4">
                            <label htmlFor="nome_artistico" className="block font-semibold mb-1">Nome Artístico *</label>
                            <input
                                type="text"
                                id="nome_artistico"
                                name="nome_artistico"
                                value={formData.nome_artistico}
                                onChange={handleChange}
                                placeholder="Seu nome artístico"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#564A72]"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="redes_sociais" className="block font-semibold mb-1">Redes Sociais</label>
                            <input
                                type="text"
                                id="redes_sociais"
                                name="redes_sociais"
                                value={formData.redes_sociais}
                                onChange={handleChange}
                                placeholder="@seuinstagram"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#564A72]"
                            />
                        </div>
                    </div>
                )}

                {error && <div className="text-red-600 mb-4">{error}</div>}

                <div className="flex gap-4 mt-6">
                    <button
                        type="button"
                        onClick={handleContinueAsClient}
                        disabled={loading}
                        className="flex-1 px-3 py-3 bg-gray-200 text-[#564A72] border border-gray-300 rounded-md hover:bg-gray-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Continuar como Cliente
                    </button>

                    {selectedRole && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-3 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Salvando...' : 'Confirmar Perfil'}
                        </button>
                    )}
                </div>
            </form>
        </div>
        </div>
    );
};

export default RoleSelector;

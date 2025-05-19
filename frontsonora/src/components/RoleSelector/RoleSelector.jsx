import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RoleSelector.css';

const RoleSelector = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(true); // Começa como true para a verificação inicial
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nome_artistico: '',
        redes_sociais: ''
    });

    // useEffect para verificar o perfil do usuário ao carregar o componente
    useEffect(() => {
        const checkUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                // Se não há token, o usuário não está logado.
                // Permite que o componente seja exibido para que o usuário possa interagir.
                setLoading(false);
                // Opcional: Redirecionar para a página de login se a ausência de token for um erro
                // navigate('/login');
                return;
            }

            try {
                const userResponse = await axios.get('/auth/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const userRole = userResponse.data.role;

                // Se o papel do usuário já for 'HOST', 'ARTISTA' ou 'CLIENT',
                // navegue diretamente para '/perfil'.
                if (userRole === 'HOST' || userRole === 'ARTISTA' || userRole === 'CLIENT') {
                    navigate('/perfil');
                } else {
                    // Se o papel não for um dos "completos", permita que o usuário selecione um papel.
                    setLoading(false);
                }
            } catch (err) {
                console.error('Erro ao verificar o perfil do usuário:', err);
                // Em caso de erro na verificação (ex: token inválido, servidor fora do ar),
                // permite que o usuário prossiga com a seleção de papel ou trata o erro.
                setError('Não foi possível verificar seu perfil. Tente novamente.');
                setLoading(false);
            }
        };

        checkUserProfile();
    }, [navigate]); // navigate é uma dependência para useEffect

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Pega o ID do usuário logado
            const userResponse = await axios.get('/auth/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userId = userResponse.data.id;

            if (selectedRole) {
                // 1. Atualiza o papel do usuário no backend
                await axios.put(
                    `/users/${userId}`, // Endpoint para atualizar o usuário
                    {
                        role: selectedRole,
                        // 'id_usuario: userId' pode ser omitido aqui se o backend
                        // já obtém o userId pelo path variable ou token JWT.
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // 2. Se o papel selecionado for ARTISTA, cria ou verifica o registro de músico
                if (selectedRole === 'ARTISTA') {
                    let musicoExists = false;
                    try {
                        // Tenta verificar se já existe um músico associado a este userId
                        const musicoResponse = await axios.get(`http://localhost:8080/musicos/user/${userId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        // Se a requisição for bem-sucedida e retornar dados, o músico já existe
                        if (musicoResponse.data) {
                            musicoExists = true;
                        }
                    } catch (checkError) {
                        // Se o erro for 404 Not Found, significa que o músico não existe, o que é esperado.
                        // Outros erros (ex: 500 Internal Server Error) devem ser tratados.
                        if (checkError.response && checkError.response.status !== 404) {
                            console.error('Erro ao verificar existência do músico:', checkError);
                            setError('Erro ao verificar perfil de artista.');
                            setLoading(false);
                            return; // Interrompe o processo em caso de erro grave
                        }
                    }

                    if (!musicoExists) {
                        // Se o músico não existe, cria um novo registro de músico
                        await axios.post(
                            'http://localhost:8080/musicos',
                            {
                                nomeArtistico: formData.nome_artistico.trim(),
                                redesSociais: formData.redes_sociais.trim(),
                                idUsuario: userId
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                    } else {
                        // Se o músico já existe, não é necessário criar um novo.
                        // Opcional: Você pode adicionar aqui uma lógica para ATUALIZAR
                        // os dados do músico (nome artístico, redes sociais) se necessário.
                        console.log('Músico já existe para este usuário. Dados não serão recriados.');
                    }
                }
            }

            // Após todas as operações, navega para o perfil
            navigate('/perfil');
        } catch (err) {
            console.error('Erro ao atualizar perfil:', err);
            setError(err.response?.data?.message || err.message || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setError(''); // Limpa o erro ao selecionar um novo papel
    };

    const handleContinueAsClient = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                setLoading(true);
                // Pega o ID do usuário logado
                const userResponse = await axios.get('/auth/user/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userId = userResponse.data.id;

                // Define o papel do usuário como 'CLIENT' no backend
                await axios.put(
                    `/users/${userId}`,
                    {
                        role: 'CLIENT', // Define explicitamente o papel como 'CLIENT'
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                navigate('/perfil');
            } catch (err) {
                console.error('Erro ao continuar como cliente:', err);
                setError(err.response?.data?.message || err.message || 'Erro ao definir papel de cliente.');
            } finally {
                setLoading(false);
            }
        } else {
            // Se não há token, o usuário não está logado, então apenas navega.
            // Idealmente, a página de login deveria lidar com a falta de token.
            navigate('/perfil');
        }
    };

    // Exibe uma mensagem de carregamento enquanto o perfil está sendo verificado
    if (loading) {
        return <div className="loading-message">Carregando perfil...</div>;
    }

    return (
        <div className="role-selector-container">
            <h2>Complete seu cadastro</h2>
            <p>Selecione como deseja usar a plataforma:</p>

            <form onSubmit={handleSubmit}>
                <div className="role-options">
                    <div
                        className={`role-option ${selectedRole === 'HOST' ? 'selected' : ''}`}
                        onClick={() => handleRoleSelect('HOST')}
                    >
                        <div className="role-icon">🎪</div>
                        <div className="role-details">
                            <h4>Sou Organizador</h4>
                            <p>Quero criar e gerenciar eventos</p>
                        </div>
                    </div>
                    <div
                        className={`role-option ${selectedRole === 'ARTISTA' ? 'selected' : ''}`}
                        onClick={() => handleRoleSelect('ARTISTA')}
                    >
                        <div className="role-icon">🎵</div>
                        <div className="role-details">
                            <h4>Sou Artista</h4>
                            <p>Quero me apresentar em eventos</p>
                        </div>
                    </div>
                </div>

                {selectedRole === 'ARTISTA' && (
                    <div className="artist-fields">
                        <div className="form-group">
                            <label htmlFor="nome_artistico">Nome Artístico *</label>
                            <input
                                type="text"
                                id="nome_artistico"
                                name="nome_artistico"
                                value={formData.nome_artistico}
                                onChange={handleChange}
                                placeholder="Seu nome artístico"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="redes_sociais">Redes Sociais</label>
                            <input
                                type="text"
                                id="redes_sociais"
                                name="redes_sociais"
                                value={formData.redes_sociais}
                                onChange={handleChange}
                                placeholder="@seuinstagram"
                            />
                        </div>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <div className="action-buttons">
                    <button
                        type="button"
                        className="client-button"
                        onClick={handleContinueAsClient}
                    >
                        Continuar como Cliente
                    </button>

                    {selectedRole && (
                        <button
                            type="submit"
                            className="confirm-button"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Confirmar Perfil'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default RoleSelector;
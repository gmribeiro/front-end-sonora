import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RoleSelector.css';

const RoleSelector = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(true); // Começa como true para a verificação inicial do localStorage
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nome_artistico: '',
        redes_sociais: ''
    });

    // Estado para armazenar os dados do usuário, lidos do localStorage
    const [currentUser, setCurrentUser] = useState(null);

    // useEffect para verificar o perfil do usuário ao carregar o componente
    useEffect(() => {
        const checkUserAndRedirect = () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (!token || !storedUser) {
                // Se não há token ou informações de usuário, o usuário não está logado
                // Redireciona para o login ou permite a interação
                setLoading(false);
                // navigate('/login'); // Opcional: redirecionar para login
                return;
            }

            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user); // Define o usuário no estado

                // Se o papel do usuário já for 'HOST', 'ARTISTA' ou 'CLIENT',
                // navegue diretamente para '/perfil'.
                if (user.role === 'HOST' || user.role === 'ARTISTA' || user.role === 'CLIENT') {
                    navigate('/perfil');
                } else {
                    // Se o papel for outro (ex: NEW_USER, indefinido),
                    // permite que o usuário selecione o papel.
                    setLoading(false);
                }
            } catch (err) {
                console.error('Erro ao parsear dados do usuário do localStorage:', err);
                setError('Erro ao carregar dados do usuário. Tente fazer login novamente.');
                localStorage.removeItem('user'); // Limpa dados corrompidos
                localStorage.removeItem('token'); // Limpa o token também
                setLoading(false);
                // navigate('/login'); // Opcional: redirecionar para login
            }
        };

        checkUserAndRedirect();
    }, [navigate]); // navigate é uma dependência para useEffect

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verifica se currentUser está disponível
        if (!currentUser || !currentUser.userId) {
            setError('Dados do usuário não disponíveis. Tente fazer login novamente.');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userId = currentUser.userId; // Usa o userId do estado

            if (selectedRole) {
                // 1. Atualiza o papel do usuário no backend
                await axios.put(
                    `/users/${userId}`,
                    { role: selectedRole }, // Apenas o role é necessário para o PUT
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // 2. Se o papel selecionado for ARTISTA, verifica e cria/atualiza o registro de músico
                if (selectedRole === 'ARTISTA') {
                    let musicoExists = false;
                    try {
                        const musicoResponse = await axios.get(`http://localhost:8080/musicos/user/${userId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (musicoResponse.data) {
                            musicoExists = true;
                        }
                    } catch (checkError) {
                        if (checkError.response && checkError.response.status !== 404) {
                            console.error('Erro ao verificar existência do músico:', checkError);
                            setError('Erro ao verificar perfil de artista.');
                            setLoading(false);
                            return;
                        }
                    }

                    if (!musicoExists) {
                        await axios.post(
                            'http://localhost:8080/musicos',
                            {
                                nomeArtistico: formData.nome_artistico.trim(),
                                redesSociais: formData.redes_sociais.trim(),
                                idUsuario: userId // Envia o ID do usuário para o backend associar
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                    } else {
                        console.log('Músico já existe para este usuário.');
                        // Opcional: Adicionar lógica para ATUALIZAR dados do músico aqui se necessário
                    }
                }

                // Após a atualização bem-sucedida, atualiza o localStorage com o novo role
                const updatedUser = { ...currentUser, role: selectedRole };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

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
        setError('');
    };

    const handleContinueAsClient = async () => {
        // Verifica se currentUser está disponível
        if (!currentUser || !currentUser.userId) {
            setError('Dados do usuário não disponíveis. Tente fazer login novamente.');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userId = currentUser.userId;

            // Envia a atualização do papel para 'CLIENT' para o backend
            await axios.put(
                `/users/${userId}`,
                { role: 'CLIENT' },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Atualiza o localStorage com o novo role
            const updatedUser = { ...currentUser, role: 'CLIENT' };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            navigate('/perfil');
        } catch (err) {
            console.error('Erro ao continuar como cliente:', err);
            setError(err.response?.data?.message || err.message || 'Erro ao definir papel de cliente.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-message">Carregando perfil...</div>;
    }

    // Se o usuário já tiver um papel definido e não for "loading", não deve exibir o seletor.
    // Esta verificação já é feita no useEffect, então se chegamos aqui, o user.role NÃO é HOST, ARTISTA ou CLIENT.
    // No entanto, se houver um erro de parsing ou de usuário ausente, é bom ter um fallback.
    if (!currentUser) {
        return <div className="error-message">Erro: Dados do usuário não carregados. Por favor, tente fazer login novamente.</div>;
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RoleSelector.css';

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
                console.warn('Token ou dados do usuário ausentes no localStorage. Redirecionando ou aguardando autenticação.');
                setLoading(false);
                return;
            }

            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
                if (user.profileCompleted === true) {
                    console.log(`Usuário ${user.id} já completou o perfil. Redirecionando para /perfil.`);
                    navigate('/perfil');
                } else {
                    console.log(`Usuário ${user.id} ainda não completou o perfil. Exibindo seletor de papel.`);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Erro ao parsear dados do usuário do localStorage:', err);
                setError('Erro ao carregar dados do usuário. Tente fazer login novamente.');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
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

            const updatedUserFromBackend = response.data;
            localStorage.setItem('user', JSON.stringify(updatedUserFromBackend));

            navigate('/perfil');

        } catch (err) {
            console.error('Erro ao atualizar perfil:', err.response?.data || err.message || err);
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
            const updatedUserFromBackend = response.data;
            localStorage.setItem('user', JSON.stringify(updatedUserFromBackend));
            navigate('/perfil');

        } catch (err) {
            console.error('Erro ao continuar como cliente:', err.response?.data || err.message || err);
            setError(err.response?.data?.message || err.message || 'Erro ao continuar como cliente.');
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return <div className="loading-message">Carregando perfil...</div>;
    }
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
                        disabled={loading}
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
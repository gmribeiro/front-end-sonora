import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RoleSelector.css';

const RoleSelector = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nome_artistico: '',
        redes_sociais: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Obter ID do usuário logado
            const userResponse = await axios.get('http://localhost:8080/auth/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userId = userResponse.data.id;

            // Atualiza o role (apenas se não for CLIENT)
            if (selectedRole) {
                await axios.put(
                    `http://localhost:8080/users/${userId}`,
                    {
                        role: selectedRole,
                        id_usuario: userId
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // Se for ARTISTA, cria o registro de Músico
                if (selectedRole === 'ARTISTA') {
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
                }
            }

            navigate('/perfil');
        } catch (err) {
            console.error('Erro:', err);
            setError(err.response?.data?.message || err.message || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setError('');
    };

    const handleContinueAsClient = () => {
        navigate('/perfil');
    };

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
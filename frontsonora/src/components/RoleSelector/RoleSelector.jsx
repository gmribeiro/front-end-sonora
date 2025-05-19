import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RoleSelector.css'; // Certifique-se que seu CSS está configurado

const RoleSelector = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(true); // Começa como true para a verificação inicial
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nome_artistico: '',
        redes_sociais: ''
    });

    // Estado para armazenar os dados do usuário, lidos do localStorage
    const [currentUser, setCurrentUser] = useState(null);

    // Efeito para verificar o perfil do usuário ao carregar o componente
    useEffect(() => {
        const checkUserAndRedirect = () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (!token || !storedUser) {
                console.warn('Token ou dados do usuário ausentes no localStorage. Redirecionando para login ou aguardando autenticação.');
                setLoading(false);
                // navigate('/login'); // Descomente se você quer forçar um redirecionamento para a página de login
                return;
            }

            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user); // Define o usuário no estado

                // Lógica de Redirecionamento:
                // Usamos user.profileCompleted vindo do backend!
                // Se o usuário ainda não completou o perfil (profileCompleted é false ou undefined para users antigos)
                if (user.profileCompleted === true) {
                    console.log(`Usuário ${user.id} já completou o perfil. Redirecionando para /perfil.`);
                    navigate('/perfil');
                } else {
                    // Se profileCompleted é false (ou não existe para dados antigos), exibe o seletor.
                    console.log(`Usuário ${user.id} ainda não completou o perfil. Exibindo seletor de papel.`);
                    setLoading(false); // Exibe o seletor
                }

            } catch (err) {
                console.error('Erro ao parsear dados do usuário do localStorage:', err);
                setError('Erro ao carregar dados do usuário. Tente fazer login novamente.');
                localStorage.removeItem('user'); // Limpa dados corrompidos
                localStorage.removeItem('token'); // Limpa o token também
                setLoading(false);
                // navigate('/login'); // Descomente se você quer forçar um redirecionamento para a página de login
            }
        };

        checkUserAndRedirect();
    }, [navigate]); // navigate é uma dependência para useEffect

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Função auxiliar para finalizar a seleção de perfil e redirecionar
    // Ela enviará o PUT com o novo role E profileCompleted como true
    const completeProfileSelection = async (finalRole, extraArtistData = {}) => {
        if (!currentUser || !currentUser.id) { // Use currentUser.id
            setError('Dados do usuário não disponíveis para concluir perfil.');
            return;
        }
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userId = currentUser.id; // Use currentUser.id

            // Prepara o DTO com os campos necessários para o backend
            const userUpdateDTO = {
                id: userId, // Inclua o ID se seu UserDTO no backend espera
                role: finalRole,
                profileCompleted: true, // A chave: marca como concluído no backend
                // Inclua outros campos do currentUser que o backend possa precisar no UserDTO
                // Por exemplo, name, email, googleId, etc.
                name: currentUser.name || null, // Garanta que 'name' é passado se existir
                email: currentUser.email,
                googleId: currentUser.googleId || null,
                // Adicione os dados do músico se o papel for ARTISTA
                nomeArtistico: finalRole === 'ARTISTA' ? extraArtistData.nome_artistico : null,
                redesSociais: finalRole === 'ARTISTA' ? extraArtistData.redes_sociais : null,
            };

            // Envia PUT para atualizar o role E marcar profileCompleted como true
            const response = await axios.put(
                `/users/${userId}`, // Seu endpoint para atualizar o usuário
                userUpdateDTO, // Envia o UserDTO completo
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // A resposta do backend deve conter o UserDTO atualizado, incluindo profileCompleted
            const updatedUserFromBackend = response.data;

            // Atualiza o user no localStorage com os dados do backend
            localStorage.setItem('user', JSON.stringify(updatedUserFromBackend));

            navigate('/perfil');

        } catch (err) {
            console.error('Erro ao finalizar seleção de perfil:', err.response?.data || err.message || err);
            setError(err.response?.data?.message || err.message || 'Erro ao finalizar seleção de perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser || !currentUser.id) { // Use currentUser.id
            setError('Dados do usuário não disponíveis. Tente fazer login novamente.');
            return;
        }

        try {
            setLoading(true);

            if (!selectedRole) {
                setError('Por favor, selecione um papel.');
                setLoading(false);
                return;
            }

            let extraArtistData = {};
            if (selectedRole === 'ARTISTA') {
                if (!formData.nome_artistico.trim()) {
                    setError('O nome artístico é obrigatório para artistas.');
                    setLoading(false);
                    return;
                }
                extraArtistData = {
                    nome_artistico: formData.nome_artistico.trim(),
                    redes_sociais: formData.redes_sociais.trim()
                };

                // A lógica de criação/atualização do músico será tratada no backend
                // pelo seu UserService.updateUser() quando o role for ARTISTA.
                // Não precisamos de uma chamada axios.post/get separada aqui.
            }

            // Chama completeProfileSelection para enviar o role e profileCompleted,
            // e os dados extras do artista se for o caso.
            await completeProfileSelection(selectedRole, extraArtistData);

        } catch (err) {
            console.error('Erro no handleSubmit:', err.response?.data || err.message || err);
            setError(err.response?.data?.message || err.message || 'Erro ao atualizar perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setError(''); // Limpa o erro ao selecionar um papel
    };

    // Função para o botão "Skip"
    const handleSkip = async () => {
        if (!currentUser || !currentUser.id) { // Use currentUser.id
            setError('Dados do usuário não disponíveis. Tente fazer login novamente.');
            return;
        }

        // Chama completeProfileSelection para o papel CLIENT.
        // completeProfileSelection cuidará de enviar o PUT com profileCompleted: true
        // e de atualizar o localStorage e redirecionar.
        await completeProfileSelection('CLIENT');
    };

    // Exibe uma mensagem de carregamento enquanto verifica o localStorage e redireciona
    if (loading) {
        return <div className="loading-message">Carregando perfil...</div>;
    }

    // Se o usuário não for carregado, exibe uma mensagem de erro fatal
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
                                id="redes_sociais" // Mantido como redes_sociais
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
                    {/* Botão "Pular" */}
                    <button
                        type="button"
                        className="skip-button"
                        onClick={handleSkip}
                        disabled={loading}
                    >
                        Pular
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
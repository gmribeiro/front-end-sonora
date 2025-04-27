// Perfil.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Perfil.css'; // Importe o CSS

const Perfil = () => {
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [changePasswordMessage, setChangePasswordMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedNome = localStorage.getItem('nomeUsuario');

        if (storedToken) {
            if (storedNome) {
                setNomeUsuario(storedNome);
            } else {
                const fetchUserProfile = async () => {
                    try {
                        const response = await fetch('http://localhost:8080/api/user/me', {
                            headers: {
                                'Authorization': `Bearer ${storedToken}`,
                            },
                        });

                        if (response.ok) {
                            const userData = await response.json();
                            setNomeUsuario(userData.nome);
                            localStorage.setItem('nomeUsuario', userData.nome);
                        } else {
                            console.error('Erro ao buscar perfil:', response.status);
                            localStorage.removeItem('token');
                            localStorage.removeItem('nomeUsuario');
                            navigate('/acesso');
                        }
                    } catch (error) {
                        console.error('Erro ao buscar perfil:', error);
                        localStorage.removeItem('token');
                        localStorage.removeItem('nomeUsuario');
                        navigate('/acesso');
                    }
                };

                fetchUserProfile();
            }
        } else {
            navigate('/acesso');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nomeUsuario');
        navigate('/acesso');
    };

    const toggleChangePassword = () => {
        setShowChangePassword(!showChangePassword);
        setChangePasswordMessage('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setChangePasswordMessage('As novas senhas não coincidem.');
            return;
        }

        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            navigate('/acesso');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`,
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                }),
            });

            const data = await response.text(); // Ou response.json() se o backend retornar JSON
            if (response.ok) {
                setChangePasswordMessage('Senha alterada com sucesso!');
                setShowChangePassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                setChangePasswordMessage(data || 'Erro ao alterar a senha.');
            }
        } catch (error) {
            console.error('Erro ao alterar a senha:', error);
            setChangePasswordMessage('Erro ao comunicar com o servidor.');
        }
    };

    return (
        <div className="perfil-fundo">
            <button className="perfil-botao-voltar" onClick={() => navigate('/')}>Voltar</button>
            <div className="perfil-container">
                <h1>Bem-vindo, {nomeUsuario}!</h1>
                <button className="perfil-botao-acao" onClick={toggleChangePassword}>
                    {showChangePassword ? 'Cancelar Alterar Senha' : 'Alterar Senha'}
                </button>

                {showChangePassword && (
                    <div className="change-password-form">
                        <h3>Alterar Senha</h3>
                        {changePasswordMessage && <p className="change-password-message">{changePasswordMessage}</p>}
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label htmlFor="currentPassword">Senha Atual:</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">Nova Senha:</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmNewPassword">Confirmar Nova Senha:</label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="perfil-botao-salvar">Salvar Nova Senha</button>
                        </form>
                    </div>
                )}

                <button className="perfil-botao-logout" onClick={handleLogout}>Sair</button>
            </div>
        </div>
    );
};

export default Perfil;
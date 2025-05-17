import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './header.css';

function Header() {
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const navigate = useNavigate();

    const fetchProfileImage = useCallback(async (token) => {
        if (!token) {
            setProfileImageUrl(null);
            return;
        }
        try {
            const response = await axios.get('/auth/user/me/profile-image', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob'
            });

            const imageUrl = URL.createObjectURL(response.data);
            setProfileImageUrl(imageUrl);
            console.log("Foto de perfil do Header carregada.");
        } catch (error) {
            console.error('Erro ao buscar foto de perfil no Header:', error);
            setProfileImageUrl(null);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/auth/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 401) {
                            console.log('Token expirado ou inválido. Redirecionando para login.');
                            localStorage.removeItem('token');
                            navigate('/acesso');
                        }
                        throw new Error(`Erro HTTP: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => setNomeUsuario(data.nome || ''))
                .catch(error => console.error('Erro ao buscar nome do usuário:', error));
            fetchProfileImage(token);

        } else {
            setNomeUsuario('');
            setProfileImageUrl(null);
        }

        return () => {
            if (profileImageUrl) {
                URL.revokeObjectURL(profileImageUrl);
                console.log("URL de objeto da foto de perfil do Header revogada.");
            }
        };

    }, [navigate, fetchProfileImage]);

    const handleNomeClick = () => {
        if (nomeUsuario) {
            navigate('/perfil');
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <img
                    src="../images/logosemfundo.png"
                    alt="Logo"
                    className="logo"
                    style={{ maxHeight: '60px' }}
                />
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Pesquisar eventos, shows, teatros, cursos"
                        className="search-input"
                    />
                </div>
            </div>

            <div className="header-right">
                <div className="divider"></div>
                <nav className="nav">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/meusconvites" className="nav-link">Meus Convites</Link>
                    <Link to="/artistas" className="nav-link">Catálogo de Artistas</Link>
                </nav>
                {nomeUsuario ? (
                    <div className="user-info-container" onClick={handleNomeClick} style={{ cursor: 'pointer' }}>
                        {profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt="Foto de Perfil"
                                className="header-profile-pic"
                            />
                        ) : (
                            <div className="header-profile-pic-placeholder">
                                {nomeUsuario.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="user-greeting">{nomeUsuario}</span>
                    </div>
                ) : (
                    <Link to="/acesso" className="login-button">Entrar</Link>
                )}
            </div>
        </header>
    );
}

export default Header;
import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './headercadastrado.css';

function HeaderCadastrado() {
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
            console.log("Foto de perfil do HeaderCadastrado carregada.");
        } catch (error) {
            console.error('Erro ao buscar foto de perfil no HeaderCadastrado:', error);
            setProfileImageUrl(null);
        }
    }, []);

    useEffect(() => {
        const buscarInformacoesUsuario = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Fetch para o nome do usuário
                    const response = await fetch('/auth/user/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setNomeUsuario(userData.nome || 'Usuário');
                    } else {
                        // Lidar com erros de resposta HTTP (ex: 401 Unauthorized)
                        if (response.status === 401) {
                            console.log('Token expirado ou inválido. Redirecionando para login.');
                            localStorage.removeItem('token'); // Limpa token inválido
                            navigate('/acesso'); // Redireciona para login
                        }
                        console.error('Erro ao buscar informações do usuário:', response.statusText);
                        setNomeUsuario('Usuário'); // Pode definir para um valor padrão ou vazio
                    }

                    fetchProfileImage(token);

                } else {
                    setNomeUsuario('Usuário Não Logado');
                    setProfileImageUrl(null); // Limpa a imagem se não estiver logado
                }
            } catch (error) {
                console.error('Erro ao buscar informações do usuário:', error);
                setNomeUsuario('Erro ao Carregar');
                setProfileImageUrl(null);
            }
        };

        buscarInformacoesUsuario();

        return () => {
            if (profileImageUrl) {
                URL.revokeObjectURL(profileImageUrl);
                console.log("URL de objeto da foto de perfil do HeaderCadastrado revogada.");
            }
        };
    }, [navigate, fetchProfileImage]);

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="nav-link">
                    <img
                        src="../images/logosemfundo.png"
                        alt="Logo"
                        className="logo"
                        style={{ maxHeight: '60px' }}
                    />
                </Link>
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Pesquisar eventos, shows, teatros"
                        className="search-input"
                    />
                </div>
            </div>

            <div className="header-right">
                <div className="divider"></div>
                <nav className="nav">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/meusconvites" className="nav-link">Meus Convites</Link>
                </nav>
                <Link to="/perfil" className="perfil-link">
                    {profileImageUrl ? (
                        <img
                            src={profileImageUrl}
                            alt="Foto de Perfil"
                            className="perfil-foto"
                        />
                    ) : (

                        <div className="perfil-foto-placeholder">
                            {nomeUsuario.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="perfil-nome">{nomeUsuario}</span>
                </Link>
                <Link to="/notificacao" className="perfil-link">
                    <div className="icon-button">
                        <FaBell className="search-icon" />
                    </div>
                </Link>
            </div>
        </header>
    );
}

export default HeaderCadastrado;
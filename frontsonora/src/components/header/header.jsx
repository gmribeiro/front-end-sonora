import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './header.css';

function Header() {
    const [nomeUsuario, setNomeUsuario] = useState('');
    const navigate = useNavigate(); // Inicializa useNavigate

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/auth/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
                .then(response => response.json())
                .then(data => setNomeUsuario(data.nome || ''))
                .catch(error => console.error('Erro ao buscar nome do usuário:', error));
        }
    }, []);

    const handleNomeClick = () => {
        if (nomeUsuario) {
            navigate('/perfil');
        }
    };

    return (
        <header className="header">
            <div className="header-left">
            <Link to="/" className="logo">
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
                    <Link to="/artistas" className="nav-link">Catálogo de Artistas</Link> {/* Link adicionado */}
                </nav>
                {nomeUsuario ? (
                    <span className="user-greeting" onClick={handleNomeClick} style={{ cursor: 'pointer' }}>{nomeUsuario}</span>
                ) : (
                    <Link to="/acesso" className="login-button">Entrar</Link>
                )}
            </div>
        </header>
    );
}

export default Header;
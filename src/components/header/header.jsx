import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [nomeUsuario, setNomeUsuario] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedNome = localStorage.getItem('nomeUsuario');

        if (storedToken && storedNome) {
            setIsLoggedIn(true);
            setNomeUsuario(storedNome);
        } else {
            setIsLoggedIn(false);
            setNomeUsuario('');
        }

        // Adiciona um listener para mudanças no localStorage
        const handleStorageChange = () => {
            const newToken = localStorage.getItem('token');
            const newNome = localStorage.getItem('nomeUsuario');
            setIsLoggedIn(!!newToken && !!newNome);
            setNomeUsuario(newNome || '');
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nomeUsuario');
        setIsLoggedIn(false);
        setNomeUsuario('');
        navigate('/acesso');
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className="logo-link">
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
                </nav>
                {isLoggedIn ? (
                    <div className="user-info">
                        <span className="user-name">Olá, {nomeUsuario}</span>
                        <button className="logout-button" onClick={handleLogout}>Sair</button>
                    </div>
                ) : (
                    <Link to="/acesso" className="login-button">Entrar</Link>
                )}
            </div>
        </header>
    );
}

export default Header;
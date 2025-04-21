// Perfil.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Perfil.css'; // Importe o CSS

const Perfil = () => {
    const [nomeUsuario, setNomeUsuario] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedNome = localStorage.getItem('nomeUsuario');

        if (storedToken) {
            if (storedNome) {
                setNomeUsuario(storedNome);
            } else {
                // Lógica para buscar o nome do backend e armazenar no localStorage
                const fetchUserProfile = async () => {
                    try {
                        const response = await fetch('http://localhost:8080/api/user/me', {
                            headers: {
                                'Authorization': `Bearer ${storedToken}`,
                            },
                        });

                        if (response.ok) {
                            const userData = await response.json();
                            setNomeUsuario(userData.nome); // Assumindo que o backend retorna { nome: '...' }
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

    return (
        <div className="perfil-fundo">
            <button className="perfil-botao-voltar" onClick={() => navigate('/')}>Voltar</button>
            <div className="perfil-container">
                <h1>Bem-vindo, {nomeUsuario}!</h1>
                <button className="perfil-botao-logout" onClick={handleLogout}>Sair</button>
            </div>
        </div>
    );
};

export default Perfil;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MeusEventos from './MeusEventosHost.jsx';
import MinhasReservas from './MinhasReservas/MinhasReservas.jsx';
import MeusContratos from './MeusContratos/MeusContratos.jsx';

function Dashboard() {
    const [isHost, setIsHost] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isArtista, setIsArtista] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const verificarRole = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsHost(false);
                    setIsClient(false);
                    setIsArtista(false);
                    setLoading(false);
                    return;
                }
                const userResponse = await axios.get('/auth/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const userRole = userResponse.data.role;
                setIsHost(userRole === 'HOST');
                setIsClient(userRole === 'CLIENT');
                setIsArtista(userRole === 'ARTISTA');
            } catch (error) {
                console.error('Erro ao verificar role:', error);
                setError('Erro ao carregar informações.');
                setIsHost(false);
                setIsClient(false);
                setIsArtista(false);
            } finally {
                setLoading(false);
            }
        };

        verificarRole();
    }, []);

    if (loading) {
        return <div>Carregando informações...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div>
            {isHost && <MeusEventos />}
            {isClient && <MinhasReservas />}
            {isArtista && <MeusContratos />}
            {!(isHost || isClient || isArtista) && <div>Você não tem permissão para acessar esta página.</div>}
        </div>
    );
}

export default Dashboard;
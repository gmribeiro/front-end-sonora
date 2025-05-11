import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './meusEventosHost.css'; // You can create a CSS file for styling

function MeusEventosHost() {
    const [isHost, setIsHost] = useState(false);
    const [eventosFuturos, setEventosFuturos] = useState([]);
    const [eventosPassados, setEventosPassados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const verificarRoleEBuscarEventos = async () => {
            setLoading(true);
            setError('');

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsHost(false);
                    setLoading(false);
                    return;
                }

                // Verificar se o usuário é HOST
                const userResponse = await axios.get('/auth/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (userResponse.data.role === 'HOST') {
                    setIsHost(true);
                    const hostId = userResponse.data.id;

                    // Buscar eventos futuros do HOST
                    const futurosResponse = await axios.get(`/eventos/future`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    setEventosFuturos(futurosResponse.data);

                    // Buscar eventos passados do HOST
                    const passadosResponse = await axios.get(`/eventos/past`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    setEventosPassados(passadosResponse.data);
                } else {
                    setIsHost(false);
                }

            } catch (error) {
                console.error('Erro ao verificar role ou buscar eventos:', error);
                setError('Erro ao carregar seus eventos.');
            } finally {
                setLoading(false);
            }
        };

        verificarRoleEBuscarEventos();
    }, []);

    if (loading) {
        return <div>Carregando seus eventos...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!isHost) {
        return <div>Você não tem permissão para ver os eventos de um HOST.</div>;
    }

    return (
        <div className="meus-eventos-host-container">
            <h2>Seus Eventos como HOST</h2>

            <h3>Próximos Eventos</h3>
            {eventosFuturos.length > 0 ? (
                <ul>
                    {eventosFuturos.map(evento => (
                        <li key={evento.idEvento}>
                            <Link to={`/detalhes/${evento.idEvento}`}>{evento.nomeEvento}</Link>
                            {/* You might want to display the date and time here as well */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum evento futuro publicado.</p>
            )}

            <h3>Eventos Passados</h3>
            {eventosPassados.length > 0 ? (
                <ul>
                    {eventosPassados.map(evento => (
                        <li key={evento.idEvento}>
                            <Link to={`/evento/${evento.idEvento}`}>{evento.nomeEvento}</Link>
                            {/* You might want to display the date and time here as well */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum evento passado publicado.</p>
            )}
        </div>
    );
}

export default MeusEventosHost;
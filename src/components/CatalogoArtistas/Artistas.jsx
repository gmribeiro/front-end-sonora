import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Artistas.css';

const Artistas = () => {
    const [artistaIds, setArtistaIds] = useState([]);
    const [artistas, setArtistas] = useState([]);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const buscarArtistas = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get('/musicos');
                console.log("Resposta da API:", response); // Para depuração

                if (response && response.data && Array.isArray(response.data)) {
                    setArtistas(response.data);
                    const ids = response.data.map(artista => artista.idMusico);
                    setArtistaIds(ids);
                } else {
                    setError('Formato de dados inválido recebido do servidor.');
                    setArtistas([]);
                    setArtistaIds([]);
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Erro ao buscar artistas:', error);
                setError('Erro ao carregar os artistas.');
                setIsLoading(false);
                setArtistas([]);
                setArtistaIds([]);
            }
        };

        const buscarUsuario = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('/auth/user/me', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setUsuarioLogado(response.data);
                } catch (error) {
                    console.error('Erro ao buscar informações do usuário:', error);
                }
            }
        };

        buscarArtistas();
        buscarUsuario();
    }, []);

    const handleContratar = (artistaId) => {
        // Implemente a lógica para contratar o artista com o ID fornecido
        console.log(`Botão "Contratar" clicado para o artista com ID: ${artistaId}`);
        // Isso pode envolver abrir um modal, redirecionar para um formulário de contrato, etc.
    };

    return (
        <div className="artistas-container">
            <h2>Artistas Disponíveis</h2>
            {isLoading && <p>Carregando artistas...</p>}
            {error && <p className="error-message">{error}</p>}
            {!isLoading && !error && (
                <>
                    <div className="artistas-lista">
                        {artistas.map(artista => (
                            <div key={artista.idMusico} className="artista-card">
                                <h3>{artista.nomeArtistico}</h3>
                                {artista.redesSociais && (
                                    <p>Rede Social: <a href={artista.redesSociais} target="_blank" rel="noopener noreferrer">{artista.redesSociais}</a></p>
                                )}
                                {usuarioLogado?.role === 'HOST' && (
                                    <button onClick={() => handleContratar(artista.idMusico)} className="btn-contratar">
                                        Contratar
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Artistas;
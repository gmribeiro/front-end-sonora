import Acessar from '../../components/Acessar/acessar.jsx';
import '../css/global.css';
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import useTitle from '../../hooks/useTitle.js';

function Acesso() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    useTitle('Login - Sonora');
    return (
        
        <GoogleOAuthProvider clientId={googleClientId}>
            <>
                <Acessar />
            </>
        </GoogleOAuthProvider>
    );
}

export default Acesso;

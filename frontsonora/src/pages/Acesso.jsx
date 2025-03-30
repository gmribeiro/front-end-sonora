import Acessar from '../components/Acessar/acessar.jsx';
import './css/global.css';
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

function Acesso() {
    return (
        <GoogleOAuthProvider clientId="514141073233-1e9hp32vikk8euh1hgoap2p0otbnvltp.apps.googleusercontent.com">
            <>
                <Acessar />
            </>
        </GoogleOAuthProvider>
    );
}

export default Acesso;
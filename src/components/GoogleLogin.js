import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

function MeuComponenteDeLoginGoogle() {
    const onSuccess = (credentialResponse) => {
        console.log(credentialResponse);
        // Aqui você pode enviar o 'credentialResponse.credential' para o seu backend
        // para verificar o token e autenticar o usuário.
    };

    const onError = () => {
        console.error('Login com Google falhou');
    };

    return (
        <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            text="continue_with" // Texto do botão ("Continuar com Google")
            shape="rectangular" // Formato do botão ("rectangular" ou "pill")
            size="large"      // Tamanho do botão ("small", "medium" ou "large")
            width="350"       // Largura do botão (em pixels)
            // clientId é passado através do GoogleOAuthProvider no seu arquivo principal (index.js ou App.js)
        />
    );
}

export default MeuComponenteDeLoginGoogle;
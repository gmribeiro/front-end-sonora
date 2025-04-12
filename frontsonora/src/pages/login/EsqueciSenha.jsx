import '../css/global.css';
import '../css/esquecisenha.css';
import React, { useState } from 'react';

function EsqueciSenha() {
    const [email, setEmail] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Email para recuperação:', email);
    };

    return (
            <div className="esqueci-senha-container">
                <button className='botao-voltar' onClick={() => window.location.href = '/Acesso'}>Voltar</button>
                <h1>Vamos recuperar sua senha:</h1>
                <img src="images/fundoesquecisenha.png" alt="" />
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Digite seu email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Enviar email de recuperação</button>
                </form>
            </div>
    );
}

export default EsqueciSenha;
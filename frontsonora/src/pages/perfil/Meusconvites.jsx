import HeaderCadastrado from '../../components/HeaderCadastrado/headercadastrado';
import Footer from '../../components/Footer/footer';
import '../css/global.css';
import React from 'react';
import useTitle from '../../hooks/useTitle.js';
// import Eventos from '../../components/Eventos/eventos.jsx'; // You might not need this here
import MeusEventosHost from '../../components/MeusEventos/MeusEventosHost.jsx'; // Import the new component

function Meusconvites() {
    useTitle('Meus Convites - Sonora');
    return (
        <>
            <HeaderCadastrado />
            <MeusEventosHost /> {/* Render the MeusEventosHost component */}
            <Footer />
        </>
    );
}

export default Meusconvites;
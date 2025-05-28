import HeaderCadastrado from '../../components/HeaderCadastrado/headercadastrado';
import Footer from '../../components/Footer/footer';
import '../css/global.css';
import React from 'react';
import useTitle from '../../hooks/useTitle.js';
import Dashboard from '../../components/MeusEventos/Dashboard.jsx';

function Meusconvites() {
    useTitle('Meus Convites - Sonora');
    return (
        <>
            <HeaderCadastrado />
            <Dashboard />
            <Footer />
        </>
    );
}

export default Meusconvites;
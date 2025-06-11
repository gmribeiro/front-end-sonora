import Header from '../../components/Header/header';
import Footer from '../../components/Footer/footer';
import '../css/global.css';
import React from 'react';
import useTitle from '../../hooks/useTitle.js';
import Dashboard from '../../components/MeusEventos/Dashboard.jsx';

function Meusconvites() {
    useTitle('Meus Convites - Sonora');
    return (
        <>
            <Header />
            <Dashboard />
            <Footer />
        </>
    );
}

export default Meusconvites;
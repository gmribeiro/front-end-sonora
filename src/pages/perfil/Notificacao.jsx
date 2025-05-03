import HeaderCadastrado from '../../components/HeaderCadastrado/headercadastrado.jsx'
import Footer from '../../components/Footer/footer.jsx'
import '../css/global.css'
import React from 'react'
import Notificacao from '../../components/Notificacao/notificacao.jsx'
import Avaliacoes from "../../components/Avaliacoes/Avaliacoes.jsx";

function Meusconvites() {
  return (
    <>
        <HeaderCadastrado />
        <Notificacao />
        <Avaliacoes />
        <Footer />
    </>
  )
}

export default Meusconvites

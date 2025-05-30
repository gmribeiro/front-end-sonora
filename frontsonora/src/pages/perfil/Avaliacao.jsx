import Avaliacoes from '../../components/Avaliacoes/Avaliacoes.jsx';
import useTitle from '../../hooks/useTitle.js'

function Avaliacao() {
    useTitle('Avalie seu evento - Sonora');
    return (
        <>
            <Avaliacoes/>
        </>
    )
}
export default Avaliacao;
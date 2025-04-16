import { Link } from "react-router-dom";
import "./footer.css";

const Footer = () => {
    return (
        <footer className='footer'>
            <div className='footer-section'>
                <p>Email: Sonora@email.com</p>
                <p>Telefone: (11) 99509-5897</p>
            </div>

            <nav className='footer-section'>
                <ul>
                    <li><Link to="/sobrenos">Sobre Nós</Link></li>
                    <li><Link to="/termos">Termos de Serviço</Link></li>
                </ul>
            </nav>

            <div className='footer-section'>
                <ul>
                    <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Nosso Instagram</a></li>
                    <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Nosso Twitter</a></li>
                </ul>
            </div>
            
            <div className='footer-section footer-copyright'>
                <p>&copy; 2025 Sonora. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
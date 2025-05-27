import "./carrossel.css";
import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiCowboyBoot, GiThunderSkull, GiBrazilFlag, GiCigar, GiGrandPiano, GiTumbleweed } from "react-icons/gi";
import { TbHorseToy } from "react-icons/tb";
import { CgMusicSpeaker } from "react-icons/cg";
import { PiMicrophoneStageDuotone } from "react-icons/pi";
import { LuGuitar } from "react-icons/lu";
import axios from 'axios';


const Carrossel = ({ onGeneroSelecionado }) => {
    const carrosselRef = useRef(null);
    const [startIndex, setStartIndex] = useState(0);
    const [animate, setAnimate] = useState(false);
    const [generoAtivo, setGeneroAtivo] = useState(null);
    const [generosBackend, setGenerosBackend] = useState([]);
    const visibleItems = 5;

    const iconMap = {
        "POP": <PiMicrophoneStageDuotone />,
        "Sertanejo": <GiCowboyBoot />,
        "Indie": <LuGuitar />,
        "Rock'n roll": <GiThunderSkull />,
        "MPB": <GiBrazilFlag />,
        "Infantil": <TbHorseToy />,
        "Eletronica": <CgMusicSpeaker />,
        "Funk": <GiCigar />,
        "Reggae": <GiTumbleweed />,
        "Clássica": <GiGrandPiano />,
    };

    useEffect(() => {
        const fetchGeneros = async () => {
            try {
                const response = await axios.get('/genres');
                const generosRaw = response.data;
                const generosMapeados = generosRaw.map(genero => ({
                    id: genero.idGeneroMusical,
                    nome: genero.nomeGenero,
                    icone: iconMap[genero.nomeGenero] || <CgMusicSpeaker />
                }));
                setGenerosBackend(generosMapeados);
            } catch (error) {
                console.error('Erro ao carregar gêneros do backend:', error);
            }
        };

        fetchGeneros();
    }, []);

    useEffect(() => {
        setAnimate(true);
        const timer = setTimeout(() => setAnimate(false), 500);
        return () => clearTimeout(timer);
    }, [startIndex]);

    const scrollLeft = () => {
        const newIndex = Math.max(0, startIndex - 1);
        setStartIndex(newIndex);
        if (carrosselRef.current && carrosselRef.current.children.length > 0) {
            const itemWidth = carrosselRef.current.children[0].offsetWidth +
                parseInt(window.getComputedStyle(carrosselRef.current).gap);
            carrosselRef.current.scrollLeft = newIndex * itemWidth;
        }
    };

    const scrollRight = () => {
        const newIndex = Math.min(generosBackend.length - visibleItems, startIndex + 1);
        setStartIndex(newIndex);
        if (carrosselRef.current && carrosselRef.current.children.length > 0) {
            const itemWidth = carrosselRef.current.children[0].offsetWidth +
                parseInt(window.getComputedStyle(carrosselRef.current).gap);
            carrosselRef.current.scrollLeft = newIndex * itemWidth;
        }
    };

    const handleGeneroClick = (generoNome) => {
        if (generoNome === generoAtivo) {
            setGeneroAtivo(null);
            onGeneroSelecionado(null);
        } else {
            setGeneroAtivo(generoNome);
            onGeneroSelecionado(generoNome);
        }
    };

    return (
        <div className="carrossel-wrapper">
            <div className="carrossel-container">
                <button
                    className={`carrossel-btn left ${startIndex === 0 ? 'disabled' : ''}`}
                    onClick={scrollLeft}
                    disabled={startIndex === 0}
                >
                    <FaChevronLeft />
                </button>

                <div className="carrossel-viewport">
                    <div className="carrossel" ref={carrosselRef}>
                        {generosBackend.slice(startIndex, startIndex + visibleItems).map((categoria, index) => (
                            <div
                                key={categoria.id}
                                className={`categoria ${generoAtivo === categoria.nome ? 'ativo' : ''}`}
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    opacity: animate ? 0 : 1
                                }}
                                onClick={() => handleGeneroClick(categoria.nome)}
                            >
                                <span className="icone">{categoria.icone}</span>
                                <p>{categoria.nome}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    className={`carrossel-btn right ${startIndex === generosBackend.length - visibleItems || generosBackend.length <= visibleItems ? 'disabled' : ''}`}
                    onClick={scrollRight}
                    disabled={startIndex === generosBackend.length - visibleItems || generosBackend.length <= visibleItems}
                >
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

export default Carrossel;
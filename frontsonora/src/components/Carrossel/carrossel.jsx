import "./carrossel.css";
import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiCowboyBoot } from "react-icons/gi";
import { GiThunderSkull } from "react-icons/gi";
import { GiBrazilFlag } from "react-icons/gi";
import { TbHorseToy } from "react-icons/tb";
import { CgMusicSpeaker } from "react-icons/cg";
import { PiMicrophoneStageDuotone } from "react-icons/pi";
import { GiCigar } from "react-icons/gi";
import { FaCannabis } from "react-icons/fa6";
import { LuGuitar } from "react-icons/lu";
import { GiGrandPiano } from "react-icons/gi";

const categorias = [
    { nome: "POP", icone: <PiMicrophoneStageDuotone /> },
    { nome: "Sertanejo", icone: <GiCowboyBoot /> },
    { nome: "Indie", icone: <LuGuitar /> },
    { nome: "Rock'n roll", icone: <GiThunderSkull /> },
    { nome: "MPB", icone: <GiBrazilFlag /> },
    { nome: "Infantil", icone: <TbHorseToy /> },
    { nome: "Eletrônica", icone: <CgMusicSpeaker /> },
    { nome: "Funk", icone: <GiCigar /> },
    { nome: "Reggae", icone: <FaCannabis /> },
    { nome: "Clássica", icone: <GiGrandPiano /> },
];

const Carrossel = ({ onGeneroSelecionado }) => {
    const carrosselRef = useRef(null);
    const [startIndex, setStartIndex] = useState(0);
    const [animate, setAnimate] = useState(false);
    const [generoAtivo, setGeneroAtivo] = useState(null);
    const visibleItems = 5;

    useEffect(() => {
        setAnimate(true);
        const timer = setTimeout(() => setAnimate(false), 500);
        return () => clearTimeout(timer);
    }, [startIndex]);

    const scrollLeft = () => {
        const newIndex = Math.max(0, startIndex - 1);
        setStartIndex(newIndex);
        const itemWidth = carrosselRef.current.children[0].offsetWidth + 
                         parseInt(window.getComputedStyle(carrosselRef.current).gap);
        carrosselRef.current.scrollLeft = newIndex * itemWidth;
    };

    const scrollRight = () => {
        const newIndex = Math.min(categorias.length - visibleItems, startIndex + 1);
        setStartIndex(newIndex);
        const itemWidth = carrosselRef.current.children[0].offsetWidth + 
                         parseInt(window.getComputedStyle(carrosselRef.current).gap);
        carrosselRef.current.scrollLeft = newIndex * itemWidth;
    };

    const handleGeneroClick = (genero) => {
        if (genero === generoAtivo) {
            setGeneroAtivo(null);
            onGeneroSelecionado(null);
        } else {
            setGeneroAtivo(genero);
            onGeneroSelecionado(genero);
        }
    };

    return (
        <div className="carrossel-container">
            <button 
                className={`carrossel-btn left ${startIndex === 0 ? 'disabled' : ''}`} 
                onClick={scrollLeft}
                disabled={startIndex === 0}
            >
                <FaChevronLeft />
            </button>
            
            <div className="carrossel" ref={carrosselRef}>
                {categorias.slice(startIndex, startIndex + visibleItems).map((categoria, index) => (
                    <div 
                        key={startIndex + index} 
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

            <button 
                className={`carrossel-btn right ${startIndex === categorias.length - visibleItems ? 'disabled' : ''}`} 
                onClick={scrollRight}
                disabled={startIndex === categorias.length - visibleItems}
            >
                <FaChevronRight />
            </button>
        </div>
    );
};

export default Carrossel;
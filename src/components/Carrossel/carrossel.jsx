import "./carrossel.css";
import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiCarnivalMask } from "react-icons/gi";
import { GiCowboyBoot } from "react-icons/gi";
import { IoMdMicrophone } from "react-icons/io";
import { GiThunderSkull } from "react-icons/gi";
import { GiBrazilFlag } from "react-icons/gi";
import { TbHorseToy } from "react-icons/tb";



const categorias = [
    { nome: "Carnaval", icone: <GiCarnivalMask/> },
    { nome: "Sertanejo", icone: <GiCowboyBoot/>  },
    { nome: "Indie", icone: <IoMdMicrophone/> },
    { nome: "Rock'n roll", icone:  <GiThunderSkull/> },
    { nome: "MPB", icone: <GiBrazilFlag/> },
    { nome: "Infantil", icone: <TbHorseToy/> },
];

const Carrossel = () => {
    const carrosselRef = useRef(null);

    const scrollLeft = () => {
        carrosselRef.current.scrollBy({ left: -200, behavior: "smooth" });
    };

    const scrollRight = () => {
        carrosselRef.current.scrollBy({ left: 200, behavior: "smooth" });
    };

    return (
        <div className="carrossel-container">
            <button className="carrossel-btn left" onClick={scrollLeft}>
                <FaChevronLeft />
            </button>
            <div className="carrossel" ref={carrosselRef}>
                {categorias.map((categoria, index) => (
                    <div key={index} className="categoria">
                        <span className="icone">{categoria.icone}</span>
                        <p>{categoria.nome}</p>
                    </div>
                ))}
            </div>
            <button className="carrossel-btn right" onClick={scrollRight}>
                <FaChevronRight />
            </button>
        </div>
    );
};

export default Carrossel;

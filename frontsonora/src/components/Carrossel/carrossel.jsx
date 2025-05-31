import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  GiCowboyBoot,
  GiThunderSkull,
  GiBrazilFlag,
  GiCigar,
  GiGrandPiano,
  GiTumbleweed,
} from "react-icons/gi";
import { TbHorseToy } from "react-icons/tb";
import { CgMusicSpeaker } from "react-icons/cg";
import { PiMicrophoneStageDuotone } from "react-icons/pi";
import { LuGuitar } from "react-icons/lu";
import axios from "axios";
import PropTypes from "prop-types";

const Carrossel = ({ onGeneroSelecionado }) => {
  const carrosselRef = useRef(null);
  const [startIndex, setStartIndex] = useState(0);
  const [generoAtivo, setGeneroAtivo] = useState(null);
  const [generosBackend, setGenerosBackend] = useState([]);
  const [lastMoved, setLastMoved] = useState(null); // "left" ou "right"
  const visibleItems = 5;

  const iconMap = {
    POP: <PiMicrophoneStageDuotone />,
    Sertanejo: <GiCowboyBoot />,
    Indie: <LuGuitar />,
    "Rock'n roll": <GiThunderSkull />,
    MPB: <GiBrazilFlag />,
    Infantil: <TbHorseToy />,
    Eletronica: <CgMusicSpeaker />,
    Funk: <GiCigar />,
    Reggae: <GiTumbleweed />,
    Clássica: <GiGrandPiano />,
    "Hip-Hop": <GiGrandPiano />,
  };

  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        const response = await axios.get("/genres");
        const generosRaw = response.data;
        const generosMapeados = generosRaw.map((genero) => ({
          id: genero.idGeneroMusical,
          nome: genero.nomeGenero,
          icone: iconMap[genero.nomeGenero] || <CgMusicSpeaker />,
        }));
        setGenerosBackend(generosMapeados);
      } catch (error) {
        console.error("Erro ao carregar gêneros do backend:", error);
      }
    };

    fetchGeneros();
  }, []);

  // ScrollLeft
  const scrollLeft = () => {
    const newIndex = Math.max(0, startIndex - 1);
    if (newIndex !== startIndex) {
      setStartIndex(newIndex);
      setLastMoved("left");
      if (carrosselRef.current && carrosselRef.current.children.length > 0) {
        const itemWidth =
          carrosselRef.current.children[0].offsetWidth +
          parseInt(window.getComputedStyle(carrosselRef.current).gap);
        carrosselRef.current.scrollLeft = newIndex * itemWidth;
      }
    }
  };

  // ScrollRight
  const scrollRight = () => {
    const newIndex = Math.min(
      generosBackend.length - visibleItems,
      startIndex + 1
    );
    if (newIndex !== startIndex) {
      setStartIndex(newIndex);
      setLastMoved("right");
      if (carrosselRef.current && carrosselRef.current.children.length > 0) {
        const itemWidth =
          carrosselRef.current.children[0].offsetWidth +
          parseInt(window.getComputedStyle(carrosselRef.current).gap);
        carrosselRef.current.scrollLeft = newIndex * itemWidth;
      }
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

  // Itens visíveis no carrossel
  const itensVisiveis = generosBackend.slice(startIndex, startIndex + visibleItems);

  return (
    <div className="w-full py-8 bg-[#EDE6F2] my-20 relative overflow-visible">
      <div className="flex items-center max-w-[1000px] mx-auto px-5 relative overflow-visible">
        <button
          className={`bg-[#564a72] text-white rounded-full w-[50px] h-[50px] flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[-60px] z-10 transition-all duration-300 shadow-md hover:scale-110 hover:bg-[#C5B6D2] ${
            startIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={scrollLeft}
          disabled={startIndex === 0}
        >
          <FaChevronLeft />
        </button>

        <div className="w-full overflow-hidden px-[30px] sm:px-[30px]">
          <div
            className="flex gap-7 py-4 scroll-smooth w-full justify-center"
            ref={carrosselRef}
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {itensVisiveis.map((categoria, index) => {
              const isLast =
                (lastMoved === "right" && index === itensVisiveis.length - 1) ||
                (lastMoved === "left" && index === 0);

              return (
                <div
                  key={categoria.id}
                  onClick={() => handleGeneroClick(categoria.nome)}
                  className={`carrossel-item flex flex-col items-center justify-center text-center font-bold rounded-full flex-shrink-0 shadow-lg cursor-pointer
                    ${
                      generoAtivo === categoria.nome
                        ? "bg-[#C5B6D2] scale-105 shadow-[0_0_15px_rgba(197,182,210,0.8)]"
                        : "bg-[#564a72]"
                    }
                    w-[170px] h-[170px] md:w-[150px] md:h-[150px] sm:w-[130px] sm:h-[130px] xs:w-[120px] xs:h-[120px]
                    px-4 md:px-3 sm:px-2 hover:scale-105 transition-all duration-500 ease-in-out
                    ${isLast ? "fadeInScale" : ""}
                  `}
                >
                  <span
                    className={`text-[3rem] md:text-[2.6rem] sm:text-[2.2rem] xs:text-[2rem] mb-2 transition-colors duration-300 ${
                      generoAtivo === categoria.nome ? "text-[#564a72]" : "text-white"
                    }`}
                  >
                    {categoria.icone}
                  </span>
                  <p
                    className={`mt-2 transition-colors duration-300 text-[1rem] sm:text-[0.9rem] xs:text-[0.85rem] ${
                      generoAtivo === categoria.nome ? "text-[#564a72]" : "text-white"
                    }`}
                  >
                    {categoria.nome}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <button
          className={`bg-[#564a72] text-white rounded-full w-[50px] h-[50px] flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-[-60px] z-10 transition-all duration-300 shadow-md hover:scale-110 hover:bg-[#C5B6D2] ${
            startIndex === generosBackend.length - visibleItems ||
            generosBackend.length <= visibleItems
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={scrollRight}
          disabled={
            startIndex === generosBackend.length - visibleItems ||
            generosBackend.length <= visibleItems
          }
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

Carrossel.propTypes = {
  onGeneroSelecionado: PropTypes.func.isRequired,
};

export default Carrossel;

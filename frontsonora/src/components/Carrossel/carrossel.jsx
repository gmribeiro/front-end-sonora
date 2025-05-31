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
  const [lastMoved, setLastMoved] = useState(null);
  const [visibleItems, setVisibleItems] = useState(5);
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768 && width <= 1024) {
        setVisibleItems(3);
        setIsTablet(true);
        setIsMobile(false);
      } else if (width < 768) {
        setVisibleItems(3);
        setIsTablet(false);
        setIsMobile(true);
      } else {
        setVisibleItems(5);
        setIsTablet(false);
        setIsMobile(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollLeft = () => {
    const newIndex = Math.max(0, startIndex - 1);
    if (newIndex !== startIndex) {
      setStartIndex(newIndex);
      setLastMoved("left");
      if (carrosselRef.current?.children.length > 0) {
        const itemWidth =
          carrosselRef.current.children[0].offsetWidth +
          parseInt(window.getComputedStyle(carrosselRef.current).gap);
        carrosselRef.current.scrollLeft = newIndex * itemWidth;
      }
    }
  };

  const scrollRight = () => {
    const newIndex = Math.min(
      generosBackend.length - visibleItems,
      startIndex + 1
    );
    if (newIndex !== startIndex) {
      setStartIndex(newIndex);
      setLastMoved("right");
      if (carrosselRef.current?.children.length > 0) {
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

  const itensVisiveis = generosBackend.slice(startIndex, startIndex + visibleItems);

  return (
    <div className="w-full py-8 bg-[#EDE6F2] my-20 relative overflow-visible">
      <div className="flex items-center max-w-[1050px] mx-auto px-5 sm:px-10 relative overflow-visible">

        {/* Botão Esquerdo */}
        <button
          className={`bg-[#564a72] text-white rounded-full w-10 h-10 flex items-center justify-center absolute top-1/2 -translate-y-1/2 z-10 transition-all duration-300 shadow-md hover:scale-110 hover:bg-[#C5B6D2]
            ${startIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onClick={scrollLeft}
          disabled={startIndex === 0}
          style={{
            left: isMobile ? "-2px" : isTablet ? "0px" : "-60px",
          }}
        >
          <FaChevronLeft className="w-5 h-5" />
        </button>

        {/* Carrossel */}
        <div className="w-full overflow-hidden px-2 sm:px-[30px]">
          <div
            className="flex gap-3 sm:gap-5 py-4 scroll-smooth w-full justify-center"
            ref={carrosselRef}
            style={{
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              overflowX: "hidden",
            }}
          >
            {itensVisiveis.map((categoria, index) => {
              const isLast =
                (lastMoved === "right" && index === itensVisiveis.length - 1) ||
                (lastMoved === "left" && index === 0);

              const tamanhoBolinha = isTablet
                ? "w-[190px] h-[190px]"
                : isMobile
                ? "w-[100px] h-[100px]"
                : "w-[160px] h-[160px]";

              const textoIcone = isTablet
                ? "text-[3rem]"
                : isMobile
                ? "text-[2rem]"
                : "text-[3rem]";

              const textoGenero = isTablet
                ? "text-[1rem]"
                : isMobile
                ? "text-[0.8rem]"
                : "text-[1rem]";

              return (
                <div
                  key={categoria.id}
                  onClick={() => handleGeneroClick(categoria.nome)}
                  className={`flex flex-col items-center justify-center text-center font-bold rounded-full flex-shrink-0 shadow-lg cursor-pointer
                    ${generoAtivo === categoria.nome ? "bg-[#C5B6D2] scale-105 shadow-[0_0_15px_rgba(197,182,210,0.8)]" : "bg-[#564a72]"}
                    ${tamanhoBolinha} px-2 hover:scale-105 transition-all duration-500 ease-in-out ${isLast ? "fadeInScale" : ""}
                  `}
                  style={{
                    minWidth: isTablet ? "190px" : isMobile ? "100px" : "160px",
                    minHeight: isTablet ? "190px" : isMobile ? "100px" : "160px",
                  }}
                >
                  <span
                    className={`${textoIcone} mb-2 transition-colors duration-300 ${
                      generoAtivo === categoria.nome ? "!text-[#564a72]" : "text-white"
                    }`}
                  >
                    {categoria.icone}
                  </span>
                  <p
                    className={`mt-2 transition-colors duration-300 ${textoGenero} ${
                      generoAtivo === categoria.nome ? "!text-[#564a72]" : "text-white"
                    }`}
                  >
                    {categoria.nome}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botão Direito */}
        <button
          className={`bg-[#564a72] text-white rounded-full w-10 h-10 flex items-center justify-center absolute top-1/2 -translate-y-1/2 z-10 transition-all duration-300 shadow-md hover:scale-110 hover:bg-[#C5B6D2]
            ${
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
          style={{
            right: isMobile ? "-2px" : isTablet ? "0px" : "-60px",
          }}
        >
          <FaChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

Carrossel.propTypes = {
  onGeneroSelecionado: PropTypes.func.isRequired,
};

export default Carrossel;

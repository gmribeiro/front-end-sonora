import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="
        bg-[#272749] 
        w-full 
        px-5 sm:px-8 md:px-10 lg:px-16 
        py-12 
        text-[18px] 
        flex flex-col items-center 
        min-h-[120px]
      "
    >
      <div
        className="
          max-w-[1200px] w-full 
          flex flex-wrap 
          justify-center md:justify-around 
          items-center 
          gap-6 sm:gap-8 md:gap-10 lg:gap-12 
          text-center
        "
      >
        {/* Contato: empilhado em mobile, em linha em sm+ */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-10 items-center">
          <p className="!text-[#c2a0bb]">Email: suporte.sonora@email.com</p>
          <p className="!text-[#c2a0bb]">Telefone: (11) 99509-5897</p>
        </div>

        {/* Links: empilhados em mobile, em linha a partir de sm */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-10 items-center">
          <Link to="/sobrenos" className="text-[#c2a0bb] hover:underline">
            Sobre Nós
          </Link>
          <Link to="/termos" className="text-[#c2a0bb] hover:underline">
            Termos de Serviço
          </Link>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c2a0bb] hover:underline"
          >
            Nosso Instagram
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c2a0bb] hover:underline"
          >
            Nosso Twitter
          </a>
        </div>
      </div>

      {/* Copyright com margem topo ajustada para espaçamento */}
      <div className="w-full text-center text-sm mt-6 px-2 sm:px-0">
        <p className="!text-[#c2a0bb]">&copy; 2025 Sonora. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;

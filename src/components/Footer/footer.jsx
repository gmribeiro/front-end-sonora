import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#272749] w-full px-5 sm:px-8 md:px-10 lg:px-16 py-12 text-[18px] flex flex-col items-center min-h-[120px]">
      <div className="max-w-[1200px] w-full flex flex-wrap justify-center md:justify-around items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 text-center">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-10 items-center">
          <p className="!text-[#c2a0bb]">Email: suporte.sonora@email.com</p>
          <p className="!text-[#c2a0bb]">Telefone: (11) 99509-5897</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-10 items-center">
          {[
            { to: "/sobrenos", label: "Sobre Nós" },
            { to: "/termos", label: "Termos de Serviço" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="relative group text-[#c2a0bb] font-medium no-underline transition-transform duration-200 hover:scale-105 hover:!text-[#c2a0bb]"
            >
              <span className="transition-opacity duration-300 group-hover:opacity-80">
                {label}
              </span>
              <span className=" hover:!text-[#c2a0bb] absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#c2a0bb] transition-all duration-300 group-hover:w-full group-hover:left-0" />
            </Link>
          ))}

          {[
            { href: "https://instagram.com", label: "Nosso Instagram" },
            { href: "https://twitter.com", label: "Nosso Twitter" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group text-[#c2a0bb] hover:!text-[#c2a0bb] font-medium no-underline transition-transform duration-200 hover:scale-105"
            >
              <span className="transition-opacity duration-300 group-hover:opacity-80">
                {label}
              </span>
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#c2a0bb] transition-all duration-300 group-hover:w-full group-hover:left-0" />
            </a>
          ))}
        </div>
      </div>

      <div className="w-full text-center text-sm mt-6 px-2 sm:px-0">
        <p className="!text-[#c2a0bb]">&copy; 2025 Sonora. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;

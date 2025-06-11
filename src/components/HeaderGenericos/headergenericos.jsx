import { Link } from 'react-router-dom';

function HeaderGenericos() {
  return (
    <header className="bg-[#564A72] w-full py-2">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* LADO ESQUERDO - LOGO */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center justify-center">
            <img
              src="../images/logosemfundo.png"
              alt="Logo"
              className="h-[60px] w-auto object-contain"
            />
          </Link>
        </div>

        {/* LADO DIREITO - NAVEGAÇÃO */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Divisor vertical visível apenas em telas médias para cima */}
          <div className="hidden md:block h-[45px] w-[2px] bg-[#c2a0bb] mx-15" />

          {/* Links de navegação com hover animado */}
          <nav className="flex flex-wrap justify-center gap-30 whitespace-nowrap text-center">
            {[
              { to: "/", label: "Home" },
              { to: "/sobrenos", label: "Sobre Nós" },
              { to: "/termos", label: "Termos de Uso" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="relative group text-[#c2a0bb] font-semibold no-underline transition-colors duration-200 hover:text-[#c2a0bb]"
              >
                <span className="transition-opacity duration-300 group-hover:opacity-80">
                  {label}
                </span>
                <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[#c2a0bb] transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default HeaderGenericos;

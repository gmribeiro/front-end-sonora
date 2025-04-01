import "../css/sobrenos.css";
import React from "react";

const SobreNos = () => {
  return (
    <main className="sobre-nos-container">
      <section className="sobre-nos-banner">
        <h1>Sobre Nós</h1>
        <p>Conectando músicos, estabelecimentos e amantes da música.</p>
      </section>

      <section className="sobre-nos-content">
        <h2>Nossa História</h2>
        <p>
          O Sonora nasceu da paixão pela música ao vivo e da necessidade de facilitar 
          o encontro entre artistas, casas de shows e público. Nossa plataforma foi 
          criada para tornar a reserva de eventos mais acessível e eficiente.
        </p>
        <p>
          Desde o início, buscamos criar um espaço onde músicos possam encontrar 
          oportunidades, estabelecimentos possam organizar eventos com facilidade e 
          fãs de música possam descobrir novos shows e experiências inesquecíveis.
        </p>
      </section>

      <section className="sobre-nos-values">
        <h2>Nossos Valores</h2>
        <div className="values-grid">
          <div className="value-card">
            <h3>Conexão</h3>
            <p>
              Unimos artistas, produtores e público para fortalecer a cena musical.
            </p>
          </div>
          <div className="value-card">
            <h3>Facilidade</h3>
            <p>
              Criamos uma plataforma intuitiva para reservas rápidas e seguras.
            </p>
          </div>
          <div className="value-card">
            <h3>Acessibilidade</h3>
            <p>
              Democratizamos o acesso a eventos para todos os gostos e estilos.
            </p>
          </div>
          <div className="value-card">
            <h3>Paixão pela Música</h3>
            <p>
              Incentivamos a cultura musical e valorizamos talentos locais.
            </p>
          </div>
        </div>
      </section>

      <section className="sobre-nos-missao">
        <h2>Nossa Missão</h2>
        <p>
          Queremos transformar a maneira como as pessoas vivenciam a música ao vivo, 
          tornando cada evento uma experiência única. Nosso objetivo é conectar artistas 
          a oportunidades, ajudar estabelecimentos a organizarem eventos inesquecíveis e 
          garantir que o público encontre os melhores shows com facilidade.
        </p>
      </section>
    </main>
  );
};

export default SobreNos;

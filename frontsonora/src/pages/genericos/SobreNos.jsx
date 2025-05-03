import HeaderGenericos from "../../components/HeaderGenericos/headergenericos";
import "../css/sobrenos.css";
import React from "react";
import useTitle from '../../hooks/useTitle.js';

const SobreNos = () => {
  useTitle('Sobre Nós');
  return (
    <>
      <HeaderGenericos />
      <main className="sobre-nos-container">
        <section className="sobre-nos-banner">
          <div className="text-content">
            <h1>Sobre o Sonora</h1>
          </div>
          <img src="../images/logosobre.png" alt="Pessoas conversando sorrindo" />
        </section>

        <section className="sobre-nos-content">
          <p>
            O Sonora é mais do que uma simples plataforma de reservas musicais — é uma expressão do amor pela música e do desejo de transformar a cena musical brasileira. Criado em 2024 por seis jovens desenvolvedores — Luisa Helias de Melo, Gabriel de Melo Ribeiro, Maria Fernanda Spinula, Gabriel Henrique Mariotto, Vitor Conde Falcão e Lucas de Moraes Marçoli — o projeto nasceu dentro da Fundação Indaiatubana de Educação e Cultura (FIEC), na cidade de Indaiatuba, São Paulo.
          </p>

          <p>
            A FIEC, reconhecida pelo incentivo ao desenvolvimento de jovens talentos nas áreas técnicas e criativas, proporcionou o ambiente ideal para que essa ideia ganhasse forma. Foi dentro de suas salas, laboratórios e momentos de troca que os fundadores do Sonora identificaram um desafio comum no mercado musical: a dificuldade de artistas independentes encontrarem espaço para tocar e, por outro lado, a complexidade dos estabelecimentos em organizar eventos musicais de forma prática e eficiente.
          </p>

          <p>
            A proposta do Sonora surgiu, então, como uma solução direta e intuitiva: uma plataforma digital capaz de conectar músicos e casas de shows, bares, eventos e estabelecimentos diversos que valorizam apresentações ao vivo. Por meio de um sistema de agendamento e reservas inteligentes, a plataforma permite que artistas se cadastrem, apresentem seus trabalhos e sejam contratados com poucos cliques. Do outro lado, os estabelecimentos podem navegar entre perfis musicais, estilos e horários disponíveis, facilitando a organização da programação cultural.
          </p>

          <p>
            O Brasil é um país de ritmos, sons e histórias. A música brasileira é uma das mais ricas e reconhecidas do mundo, marcada por uma pluralidade que vai do samba ao rock, do pagode à música eletrônica, do sertanejo ao jazz, do forró ao indie. Cada região carrega suas particularidades, suas expressões culturais e seus talentos únicos. E é justamente essa diversidade que o Sonora busca destacar e valorizar.
          </p>

          <p>
            Um dos valores centrais da plataforma é o respeito à pluralidade musical. Aqui, todos os gêneros têm espaço, do mais tradicional ao mais alternativo. Acreditamos que a arte é feita da diferença, da mistura, da liberdade de expressão. Por isso, promovemos um ambiente inclusivo, onde artistas de todos os estilos podem ser vistos, ouvidos e contratados — sem filtros elitistas ou padrões impostos.
          </p>

          <p>
            Valorizamos o músico como profissional. Sabemos que por trás de cada apresentação há ensaio, dedicação, investimento e paixão. O Sonora respeita essa trajetória e busca oferecer um espaço digno, com ferramentas que facilitem a gestão da carreira artística. Nossa missão é criar oportunidades reais para músicos de todos os níveis — desde iniciantes até artistas com longa estrada.
          </p>

          <p>
            Nossa plataforma foi construída com base em três pilares fundamentais: **acessibilidade**, **conexão** e **eficiência**. Acreditamos que a tecnologia deve servir à cultura, não substituí-la. Por isso, o Sonora não é apenas um intermediador de eventos, mas um facilitador de experiências. Trabalhamos para que cada show, cada apresentação, seja uma ponte entre o artista e seu público.
          </p>

          <p>
            Entre nossos principais objetivos, estão: democratizar o acesso a eventos musicais, apoiar a cena artística local, modernizar o processo de contratação de músicos e criar uma rede sólida de artistas e produtores culturais. Além disso, queremos fortalecer Indaiatuba como um polo de inovação criativa e musical, projetando a cidade como referência em soluções culturais no interior paulista.
          </p>

          <p>
            O comprometimento do Sonora é com a música, com a arte e com a emoção que cada acorde pode provocar. Acreditamos que a música transforma ambientes, une pessoas, cria memórias. E, para que isso aconteça, é preciso valorizar quem faz a música acontecer. O Sonora é, acima de tudo, uma celebração ao talento brasileiro e à força da cultura que pulsa em cada canto do país.
          </p>


        </section>
      </main>
    </>
  );
};

export default SobreNos;

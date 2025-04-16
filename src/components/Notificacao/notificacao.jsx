import React from "react";
import "./notificacao.css";

const notificacoes = [
  { title: "Indaiatuba Fest", date: "10 de Abril de 2025", image: "../public/evento7.png" },
  { title: "Boom Bap Fest", date: "15 de Novembro de 2024", image: "../public/evento7.png" },
  { title: "Rock na Praça", date: "27 de Abril de 2025", image: "../public/evento7.png" },
  { title: "Rock na Praça", date: "27 de Abril de 2025", image: "../public/evento7.png" },
  { title: "Rock na Praça", date: "27 de Abril de 2025", image: "../public/evento7.png" },
  { title: "Indaiatuba Arts", date: "10 de Abril de 2025", image: "../public/evento7.png" },
  { title: "Boom Bap Fest", date: "15 de Novembro de 2024", image: "../public/evento7.png" },
  { title: "Rock na Praça", date: "27 de Abril de 2025", image: "../public/evento7.png" },
];

const Notificacao = () => {
  return (
    <main className="notifications-container">
      <h2 className="notifications-title">Notificações</h2>
      <div className="notifications-grid">
        {notificacoes.map((event, index) => (
          <div className="notification-card" key={index}>
            <img src={`/images/${event.image}`} alt={event.title} className="notification-image" />
            <h3>{event.title}</h3>
            <p>Data: {event.date}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Notificacao;

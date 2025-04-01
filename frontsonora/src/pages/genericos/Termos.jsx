import '../css/global.css';
import React from 'react';

const Termos = () => {
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
  
  export default Termos;
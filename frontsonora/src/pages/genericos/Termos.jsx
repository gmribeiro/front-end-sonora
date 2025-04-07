import HeaderGenericos from '../../components/HeaderGenericos/headergenericos';
import '../css/global.css';
import React from 'react';

const Termos = () => {
  const notificacoes = [
    {
      image: 'show1.jpg',
      title: 'Show do João Rock',
      date: '20/04/2025',
    },
    {
      image: 'evento2.jpg',
      title: 'Festival de Jazz',
      date: '05/05/2025',
    },
    {
      image: 'banda3.jpg',
      title: 'Banda Tributo Queen',
      date: '15/05/2025',
    },
  ];

  return (
    <>
      <HeaderGenericos />
      <main className="notifications-container">
        <h2 className="notifications-title">Notificações</h2>
        <div className="notifications-grid">
          {notificacoes.map((event, index) => (
            <div className="notification-card" key={index}>
              <img
                src={`/images/${event.image}`}
                alt={event.title}
                className="notification-image"
              />
              <h3>{event.title}</h3>
              <p>Data: {event.date}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Termos;

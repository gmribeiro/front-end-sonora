import React from "react";
import "./notificacao.css";
import { FaBullhorn, FaMusic, FaCalendarAlt, FaTag, FaClipboardList } from "react-icons/fa";

const notificacoes = [
  { 
    title: "Campanhas de bairro: conquiste novos clientes", 
    date: "17.05.2025", 
    category: "Marketing, Vendas, Dicas",
    type: "aviso",
    unread: true
  },
  { 
    title: "Novo estilo musical adicionado: Jazz Fusion", 
    date: "15.05.2025", 
    category: "Atualização",
    type: "musica",
    unread: true
  },
  { 
    title: "Evento próximo: Festival de Verão", 
    date: "10.05.2025", 
    category: "Evento",
    type: "evento",
    unread: false
  },
  { 
    title: "Promoção especial para membros", 
    date: "08.05.2025", 
    category: "Promoções",
    type: "promocao",
    unread: true
  },
  { 
    title: "Confirmação da sua reserva", 
    date: "05.05.2025", 
    category: "Reservas",
    type: "reserva",
    unread: false
  },
];

const iconMap = {
  aviso: <FaBullhorn className="notification-icon" />,
  musica: <FaMusic className="notification-icon" />,
  evento: <FaCalendarAlt className="notification-icon" />,
  promocao: <FaTag className="notification-icon" />,
  reserva: <FaClipboardList className="notification-icon" />
};

const Notificacao = () => {
  return (
    <main className="notifications-container">
      <div className="notifications-header">
        <h2 className="notifications-title">Notificações</h2>
        <div className="notifications-filters">
          <div className="filter-item">
            <span>Unidade</span>
          </div>
          <div className="filter-item">
            <span>Todas</span>
          </div>
        </div>
        <div className="unread-count">5 atualizações não visualizadas</div>
        <div className="last-update">03.05.2025 às 14:30</div>
      </div>

      <div className="notifications-list">
        {notificacoes.map((notif, index) => (
          <div className={`notification-item ${notif.unread ? 'unread' : ''}`} key={index}>
            <div className="notification-content">
              <h3>{notif.title}</h3>
              <div className="notification-category">{notif.category}</div>
              {notif.unread && <div className="unread-badge">Não Visualizada</div>}
            </div>
            <div className="notification-right">
              {iconMap[notif.type]}
              <div className="notification-date">{notif.date}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Notificacao;
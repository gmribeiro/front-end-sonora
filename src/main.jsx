
import './index.css';

import { createRoot } from 'react-dom/client';
import App from './App.jsx'


let startApp = () => {
 
  const root = createRoot(document.getElementById('root'));
  root.render( <App />);
 
}

// inside the useEffect
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        // Register the service worker as soon as the app loads
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js', { scope: '/firebase-cloud-messaging-push-scope' })
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((err) => {
            console.log('Service worker registration failed, error:', err);
          });
      });
    }
    

if (!window.cordova) {
    startApp();
} else {
    document.addEventListener('deviceready', startApp, false);
}

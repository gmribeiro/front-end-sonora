
import './index.css';

import App from './App.jsx'


let startApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render( <App />);
}

if (!window.cordova) {
    startApp();
} else {
    document.addEventListener('deviceready', startApp, false);
}

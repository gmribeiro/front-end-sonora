import React, {useState} from "react";
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "fir-3mod25.firebaseapp.com",
    projectId: "fir-3mod25",
    storageBucket: "fir-3mod25.firebasestorage.app",
    messagingSenderId: "769227253844",
    appId: "1:769227253844:web:a57702ba8f9aca555925c1",
    measurementId: "G-099LW1PGZ9"
  };
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const myGetToken =  (setTokenFound) => {
    return getToken(messaging, {vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY}).then((currentToken) => {
      if (currentToken) {
        console.log('current token for client: ', currentToken);
        setTokenFound(true);
        
        //usuarioService.updateUsuarioToken('fdef7e68-6f74-456f-b3ee-51e61bd87d66',{token:  currentToken}).then(r => console.log(r))
        // Track the token -> client mapping, by sending to backend server
        // show on the UI that permission is secured
      } else {
        console.log('No registration token available. Request permission to generate one.');
        setTokenFound(false);
        // shows on the UI that permission is required 
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
      // catch error while creating client token
    });
  }

  export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
});

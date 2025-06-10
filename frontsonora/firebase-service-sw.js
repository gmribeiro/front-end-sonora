importScripts("https://cdnjs.cloudflare.com/ajax/libs/firebase/10.11.1/firebase-app-compat.min.js");
importScripts("https://cdnjs.cloudflare.com/ajax/libs/firebase/10.11.1/firebase-messaging-compat.min.js");
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "fir-3mod25.firebaseapp.com",
    projectId: "fir-3mod25",
    storageBucket: "fir-3mod25.firebasestorage.app",
    messagingSenderId: "769227253844",
    appId: "1:769227253844:web:a57702ba8f9aca555925c1",
    measurementId: "G-099LW1PGZ9"
  };
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage (function(payload) {
    console.log(payload);
   
    const notification = JSON.parse(payload);
    const notificationOption = {
        body: notification.body,
        icon: notification.icon
    };
    return self.registration.showNotification(payload.notification.title, notificationOption);
});

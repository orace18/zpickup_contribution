importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAIbqvIy3x2sw5QECt1r6qaNeLmRBDBQd8",
  authDomain: "wt-zpickup.firebaseapp.com",
  projectId: "wt-zpickup",
  storageBucket: "wt-zpickup.firebasestorage.app",
  messagingSenderId: "631975086750",
  appId: "1:631975086750:web:df7d088146674577e9098f",
  measurementId: "G-YP9ZGLD6SR"
});

const messaging = firebase.messaging();

// Gestionnaire des notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('Message reçu en arrière-plan :', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icons/icon-128x128.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
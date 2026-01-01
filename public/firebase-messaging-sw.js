// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA5-s4mE-MotmVKvLweWW7x_8_x3Cz-ycE",
  authDomain: "lost-and-found-3daca.firebaseapp.com",
  projectId: "lost-and-found-3daca",
  storageBucket: "lost-and-found-3daca.firebasestorage.app",
  messagingSenderId: "355092040138",
  appId: "1:355092040138:web:375f4a195e997c1fc2a733"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/vite.svg"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
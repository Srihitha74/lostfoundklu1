// // Firebase configuration and initialization
// // Google Technology: Firebase SDK for Authentication and Cloud Messaging
// import { initializeApp } from 'firebase/app';
// import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
// import { getMessaging } from 'firebase/messaging';

// const firebaseConfig = {
//   apiKey: "AIzaSyA5-s4mE-MotmVKvLweWW7x_8_x3Cz-ycE",
//   authDomain: "lost-and-found-3daca.firebaseapp.com",
//   projectId: "lost-and-found-3daca",
//   storageBucket: "lost-and-found-3daca.firebasestorage.app",
//   messagingSenderId: "355092040138",
//   appId: "1:355092040138:web:375f4a195e997c1fc2a733"
// };

// // Firebase is now configured with actual values
// const isFirebaseConfigured = false;

// let app, auth, messaging;

// if (isFirebaseConfigured) {
//   // Initialize Firebase only if properly configured
//   app = initializeApp(firebaseConfig);
//   auth = getAuth(app);
//   setPersistence(auth, browserLocalPersistence);
//   messaging = getMessaging(app);
// } else {
//   // Export null/undefined for Firebase services when not configured
//   app = null;
//   auth = null;
//   messaging = null;
// }

// export { auth, messaging };
// export default app;
// Firebase configuration and initialization
// Google Technology: Firebase SDK for Authentication and Cloud Messaging
import { initializeApp } from 'firebase/app';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyA5-s4mE-MotmVKvLweWW7x_8_x3Cz-ycE",
  authDomain: "lost-and-found-3daca.firebaseapp.com",
  projectId: "lost-and-found-3daca",
  storageBucket: "lost-and-found-3daca.firebasestorage.app",
  messagingSenderId: "355092040138",
  appId: "1:355092040138:web:375f4a195e997c1fc2a733",
  measurementId: "G-PNVWBWJXBS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Cloud Messaging
export const messaging = getMessaging(app);

// Export sendEmailVerification for use in AuthModal
export { sendEmailVerification };

export default app;
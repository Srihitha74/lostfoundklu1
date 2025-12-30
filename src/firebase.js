// Firebase configuration and initialization
// Google Technology: Firebase SDK for Authentication and Cloud Messaging
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.apiKey &&
                            !firebaseConfig.apiKey.includes('your_') &&
                            firebaseConfig.apiKey.length > 10;

let app, auth, messaging;

if (isFirebaseConfigured) {
  // Initialize Firebase only if properly configured
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  messaging = getMessaging(app);
} else {
  // Export null/undefined for Firebase services when not configured
  app = null;
  auth = null;
  messaging = null;
}

export { auth, messaging };
export default app;
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';

// Firebase config for onxy-edge project
const firebaseConfig = {
  projectId: "onxy-edge",
  appId: "1:202409790208:web:146ec8498a1226024841e5",
  apiKey: "AIzaSyCCAVnKTCRutzFcjNLe2afy3_GLNTyryhc", 
  authDomain: "onxy-edge.firebaseapp.com",
  databaseURL: "https://onxy-edge-default-rtdb.firebaseio.com",
  storageBucket: "onxy-edge.firebasestorage.app",
  messagingSenderId: "202409790208",
  measurementId: "G-RSBFRZW8DT",
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db = getFirestore(app);
export const database = getDatabase(app, firebaseConfig.databaseURL);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Export config for use elsewhere
export { firebaseConfig };

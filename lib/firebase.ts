// lib/firebase.ts
// Fix: Use Firebase v9 modular syntax to resolve module export issues.
import { initializeApp } from "firebase/app";
// FIX: Use named imports for Firebase Auth functions as per v9 modular SDK.
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDZkZ4XhpzzYhuhEBbo12vmWCmt0DUlEYA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "trustora2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "trustora2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "trustora2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "366451977115",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:366451977115:web:f3c3991765b5afdf03cf3e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8F2JS0W17J"
};

// FIX: Initialize Firebase using the v9 modular syntax.
const app = initializeApp(firebaseConfig);

// Export Firebase modular services.
// FIX: Export Firebase services using the v9 modular syntax.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA_8-RdhF_UuxLeXFDKNwOcl9awFRrz6qU",
  authDomain: "loyalty-e883f.firebaseapp.com",
  projectId: "loyalty-e883f",
  storageBucket: "loyalty-e883f.firebasestorage.app",
  messagingSenderId: "603261005182",
  appId: "1:603261005182:web:f1da0df6b659e8b99c172f",
  measurementId: "G-CC6YZ3GSYR",
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const db = typeof window !== "undefined" ? getFirestore(app) : null;
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export { app, analytics, db, messaging };

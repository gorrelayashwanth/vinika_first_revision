// Firebase App Initialization
// IMPORTANT: Replace the placeholder values below with your actual Firebase project config.
// Get these from: Firebase Console → Project Settings → Your Apps → Web App → SDK setup

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAVoitXHtTDyisG7k6iF0ZvFgg_mwDDi2U",
  authDomain: "vinika-food-thoughts.firebaseapp.com",
  projectId: "vinika-food-thoughts",
  storageBucket: "vinika-food-thoughts.firebasestorage.app",
  messagingSenderId: "209973031388",
  appId: "1:209973031388:web:e36a1d1ac7b8b874291f19",
  measurementId: "G-1BCNBPP6RZ"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const getMessagingInstance = async () => {
  const supported = await isSupported();
  if (supported) return getMessaging(app);
  return null;
};

export default app;

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDgMSgZmW7y1q_eyYiYp0WTqEJ1kmcTZYs",
  authDomain: "dumbo-7dcd6.firebaseapp.com",
  projectId: "dumbo-7dcd6",
  storageBucket: "dumbo-7dcd6.firebasestorage.app",
  messagingSenderId: "993291703744",
  appId: "1:993291703744:web:0aaebb205392f909676425",
  measurementId: "G-TG0DHPF4WG"
};

// Initialize Firebase only if no apps exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
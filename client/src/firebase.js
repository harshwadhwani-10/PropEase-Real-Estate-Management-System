// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "real-estate-5f491.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "real-estate-5f491",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "real-estate-5f491.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "507527921755",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:507527921755:web:46220f49ad8795f2a73f7e",
};

// Check if Firebase API key is configured
if (!firebaseConfig.apiKey) {
  console.warn("⚠ Firebase API key not found. Google sign-in will not work.");
  console.warn("Please set VITE_FIREBASE_API_KEY in your .env file.");
  console.warn("See GOOGLE_AUTH_SETUP_GUIDE.md for setup instructions.");
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

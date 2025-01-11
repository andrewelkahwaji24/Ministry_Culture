import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAUjq0Qlyoaa8XAn_jnE-PS9tyb0vG9bJQ",
    authDomain: "ministryculture-57e28.firebaseapp.com",
    projectId: "ministryculture-57e28",
    storageBucket: "ministryculture-57e28.appspot.com",
    messagingSenderId: "436802724224",
    appId: "1:436802724224:web:151a19096197ef43b6e165", // Replace with the actual App ID from your Firebase console
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Firebase Authentication and Firestore Setup
const auth = getAuth(app);
const db = getFirestore(app);

// Export the Firebase authentication method and Firestore instance
export { auth, db, signInWithEmailAndPassword };

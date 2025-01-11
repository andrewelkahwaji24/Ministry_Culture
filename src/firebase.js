import { initializeApp } from 'firebase/app';
import {signInWithEmailAndPassword ,  getAuth, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';  // <-- Add these imports

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAUjq0Qlyoaa8XAn_jnE-PS9tyb0vG9bJQ",
    authDomain: "ministryculture-57e28.firebaseapp.com",
    projectId: "ministryculture-57e28",
    storageBucket: "ministryculture-57e28.appspot.com",
    messagingSenderId: "436802724224",
    appId: "1:436802724224:web:151a19096197ef43b6e165",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth, Firestore, and Storage
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  // <-- Initialize Firebase Storage

// Export the necessary Firebase services
export { signInWithEmailAndPassword , auth, db, storage, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateDoc, doc, ref, uploadBytes, getDownloadURL };

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login successful:", userCredential.user);
        return userCredential;
    } catch (error) {
        console.error("Error logging in:", error.message);
        throw error;
    }
};

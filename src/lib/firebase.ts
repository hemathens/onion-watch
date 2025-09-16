import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC_rqo9oNbu5mvG8KebHzoCPcrzuhZ3xL4",
  authDomain: "oniotech-5db0b.firebaseapp.com",
  projectId: "oniotech-5db0b",
  storageBucket: "oniotech-5db0b.firebasestorage.app",
  messagingSenderId: "577818016306",
  appId: "1:577818016306:web:ac67f4ea524ed0e3491a2b",
  measurementId: "G-QL1934KHZV" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signInWithEmail = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password);

export const createUserWithEmail = (email: string, password: string) => 
  createUserWithEmailAndPassword(auth, email, password);

export const signOutUser = () => signOut(auth);

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => 
  onAuthStateChanged(auth, callback);

export default app;

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsSNvOBk68ETGbR_qDvH3kWE7LNUfDG8Q",
  authDomain: "ecocollect-r8c29.firebaseapp.com",
  projectId: "ecocollect-r8c29",
  storageBucket: "ecocollect-r8c29.appspot.com",
  messagingSenderId: "777068145063",
  appId: "1:777068145063:web:6cb07cc0211832fb15ee82",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

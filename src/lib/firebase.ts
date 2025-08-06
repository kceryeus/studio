// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "ecocollect-r8c29",
  appId: "1:777068145063:web:6cb07cc0211832fb15ee82",
  storageBucket: "ecocollect-r8c29.firebasestorage.app",
  apiKey: "AIzaSyCsSNvOBk68ETGbR_qDvH3kWE7LNUfDG8Q",
  authDomain: "ecocollect-r8c29.firebaseapp.com",
  messagingSenderId: "777068145063",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };

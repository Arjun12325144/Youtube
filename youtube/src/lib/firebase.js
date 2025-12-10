
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDekciWCz6_l3qTv3yls-X4YzKzQtm_Esk",
  authDomain: "fir-5ee40.firebaseapp.com",
  projectId: "fir-5ee40",
  storageBucket: "fir-5ee40.firebasestorage.app",
  messagingSenderId: "161006291637",
  appId: "1:161006291637:web:19b2765ab8ec7ffaaf8cfc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export   {auth,provider};
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewagent-a2e34.firebaseapp.com",
  projectId: "interviewagent-a2e34",
  storageBucket: "interviewagent-a2e34.firebasestorage.app",
  messagingSenderId: "795508127193",
  appId: "1:795508127193:web:8709e2ec9d7c260a3115c8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider()

export { auth, provider}
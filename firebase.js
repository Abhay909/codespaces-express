// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC6hxz67DUH_WbFKKmB60eR1LT81-ZdgEI",
  authDomain: "signuplogin-7499b.firebaseapp.com",
  projectId: "signuplogin-7499b",
  storageBucket: "signuplogin-7499b.appspot.com",
  messagingSenderId: "713258908511",
  appId: "1:713258908511:web:b4cefa91c3ea4590b194ea",
  measurementId: "G-J8PK8LV7BX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

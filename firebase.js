// Импортируем ядро Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// ПОДКЛЮЧАЕМ АВТОРИЗАЦИЮ
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// ПОДКЛЮЧАЕМ FIRESTORE
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, setDoc, query, where, updateDoc } from "firebase/firestore";

// Твой проверенный Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA9AwC8-NSVPD-e3fpjq7cphquw-d80yHk",
  authDomain: "twoj-gniotek.firebaseapp.com",
  projectId: "twoj-gniotek",
  storageBucket: "twoj-gniotek.firebasestorage.app",
  messagingSenderId: "70839458696",
  appId: "1:70839458696:web:8c2ce646fdce9218f6b83d",
  measurementId: "G-HKW9ZJ9RQK"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Инициализируем Authentication
const auth = getAuth(app);

// Инициализируем Firestore
const db = getFirestore(app);

// Экспортируем всё нужное
export { 
    auth,
    db,
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    setDoc,
    query,
    where,
    updateDoc,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged
};
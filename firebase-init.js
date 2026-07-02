// ЕДИНАЯ ИНИЦИАЛИЗАЦИЯ FIREBASE ДЛЯ ВСЕГО САЙТА
// Этот файл должен быть загружен первым на всех страницах

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9AwC8-NSVPD-e3fpjq7cphquw-d80yHk",
  authDomain: "twoj-gniotek.firebaseapp.com",
  projectId: "twoj-gniotek",
  storageBucket: "twoj-gniotek.firebasestorage.app",
  messagingSenderId: "70839458696",
  appId: "1:70839458696:web:8c2ce646fdce9218f6b83d",
  measurementId: "G-HKW9ZJ9RQK",
  databaseURL: "https://twoj-gniotek-default-rtdb.europe-west1.firebasedatabase.app"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app); // Realtime Database вместо Firestore

// Экспортируем в глобальную область видимости для использования в других скриптах
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseReady = true;

// Логирование состояния авторизации
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Firebase Auth: User logged in as", user.email);
    window.firebaseUser = user;
  } else {
    console.log("Firebase Auth: No user logged in");
    window.firebaseUser = null;
  }
});

console.log("Firebase initialized successfully");

// Диспатчим событие что Firebase готов
window.dispatchEvent(new Event('firebase-ready'));

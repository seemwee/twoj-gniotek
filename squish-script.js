import { auth, db, doc, getDoc, setDoc, onAuthStateChanged } from "./firebase.js";

let currentUser = null;

// Отслеживаем состояние авторизации
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    // Загружаем сохраненное количество нажатий из Firestore
    const userDocRef = doc(db, "users", user.uid);
    getDoc(userDocRef).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const squishCount = userData.squishCount || 0;
        const squishCountEl = document.getElementById('squish-count');
        if (squishCountEl) {
          squishCountEl.textContent = squishCount;
          // Обновляем локальную переменную в script.js
          if (window.squishCount !== undefined) {
            window.squishCount = squishCount;
          }
        }
      }
    }).catch((error) => {
      console.error("Error loading squish count:", error);
    });
  }
});

// Перехватываем клики на интерактивный дамплинг для сохранения в Firestore
document.addEventListener('DOMContentLoaded', () => {
  const interactiveDumpling = document.getElementById('interactive-dumpling');
  
  if (interactiveDumpling) {
    interactiveDumpling.addEventListener('click', () => {
      if (currentUser) {
        const squishCountEl = document.getElementById('squish-count');
        if (squishCountEl) {
          const count = parseInt(squishCountEl.textContent) || 0;
          const userDocRef = doc(db, "users", currentUser.uid);
          setDoc(userDocRef, { squishCount: count }, { merge: true })
            .catch((error) => {
              console.error("Error saving squish count:", error);
            });
        }
      }
    });
  }
});

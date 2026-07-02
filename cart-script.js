import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let auth, db;
let currentUser = null;

// Ждем инициализации Firebase
function initCartScript() {
  if (!window.firebaseReady) {
    console.log("Cart script: Waiting for Firebase initialization...");
    setTimeout(initCartScript, 100);
    return;
  }

  auth = window.firebaseAuth;
  db = window.firebaseDb;
  
  console.log("Cart script initialized with Firebase");
  setupCartSync();
}

function setupCartSync() {
  // Отслеживаем состояние авторизации
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      loadUserCart(user.uid);
    }
  });

  // Загрузка корзины пользователя из Firestore
  async function loadUserCart(uid) {
    try {
      const userDocRef = doc(db, "accounts", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.cart) {
          const cart = userData.cart;
          localStorage.setItem('jellyCart', JSON.stringify(cart));
          // Обновляем UI если функция доступна
          if (window.updateCartLayout) {
            window.updateCartLayout();
          }
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  }

  // Сохранение корзины пользователя в Firestore
  async function saveUserCart(uid, cart) {
    try {
      const userDocRef = doc(db, "accounts", uid);
      await updateDoc(userDocRef, { cart: cart });
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }

  // Перехватываем изменения корзины
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.call(this, key, value);
    
    if (key === 'jellyCart' && currentUser) {
      const cart = JSON.parse(value);
      saveUserCart(currentUser.uid, cart);
    }
  };

  // Делаем функции доступными глобально
  window.loadUserCart = loadUserCart;
  window.currentUser = () => currentUser;
}

// Запускаем инициализацию
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCartScript);
} else {
  initCartScript();
}

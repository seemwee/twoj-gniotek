import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, push, set, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let auth, db;
let cart = JSON.parse(localStorage.getItem('jellyCart')) || [];
let currentUser = null;

// Ждем инициализации Firebase
function initCheckoutScript() {
  console.log("initCheckoutScript called, firebaseReady:", window.firebaseReady);
  
  if (!window.firebaseReady) {
    console.log("Checkout script: Waiting for Firebase initialization...");
    setTimeout(initCheckoutScript, 100);
    return;
  }

  auth = window.firebaseAuth;
  db = window.firebaseDb;
  
  console.log("Checkout script initialized with Firebase");
  console.log("Auth:", auth);
  console.log("DB:", db);
  console.log("Auth type:", typeof auth);
  console.log("DB type:", typeof db);
  
  if (!auth || !db) {
    console.error("Firebase auth or db is not available!");
    return;
  }
  
  setupCheckoutUI();
}

function setupCheckoutUI() {
  // Отслеживаем состояние авторизации
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      loadUserData(user.uid);
    }
  });

  // Загрузка данных пользователя для автозаполнения формы
  async function loadUserData(uid) {
    try {
      const userRef = ref(db, 'accounts/' + uid);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        
        // Автозаполняем email
        const emailInput = document.getElementById('c-email');
        if (emailInput && userData.email) {
          emailInput.value = userData.email;
        }
        
        // Если есть сохраненные данные доставки, заполняем их
        if (userData.deliveryData) {
          const nameInput = document.getElementById('c-name');
          const surnameInput = document.getElementById('c-surname');
          const phoneInput = document.getElementById('c-phone');
          const streetInput = document.getElementById('c-street');
          const houseNumberInput = document.getElementById('c-house-number');
          const apartmentInput = document.getElementById('c-apartment');
          const postalCodeInput = document.getElementById('c-postal-code');
          const cityInput = document.getElementById('c-city');
          const deliverySelect = document.getElementById('c-delivery');
          const parcelInput = document.getElementById('c-parcel-number');
          
          if (nameInput && userData.deliveryData.name) nameInput.value = userData.deliveryData.name;
          if (surnameInput && userData.deliveryData.surname) surnameInput.value = userData.deliveryData.surname;
          if (phoneInput && userData.deliveryData.phone) phoneInput.value = userData.deliveryData.phone;
          if (streetInput && userData.deliveryData.street) streetInput.value = userData.deliveryData.street;
          if (houseNumberInput && userData.deliveryData.houseNumber) houseNumberInput.value = userData.deliveryData.houseNumber;
          if (apartmentInput && userData.deliveryData.apartment) apartmentInput.value = userData.deliveryData.apartment;
          if (postalCodeInput && userData.deliveryData.postalCode) postalCodeInput.value = userData.deliveryData.postalCode;
          if (cityInput && userData.deliveryData.city) cityInput.value = userData.deliveryData.city;
          if (deliverySelect && userData.deliveryData.delivery) {
            deliverySelect.value = userData.deliveryData.delivery;
            // Триггерим change event чтобы показать поле номера paczkomatu
            deliverySelect.dispatchEvent(new Event('change'));
          }
          if (parcelInput && userData.deliveryData.parcelNumber) parcelInput.value = userData.deliveryData.parcelNumber;
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }

  // Логика переключения способов доставки на странице чекаута
  const deliverySelect = document.getElementById('c-delivery');
  const parcelContainer = document.getElementById('c-parcel-number-container');
  const parcelInput = document.getElementById('c-parcel-number');

  if (deliverySelect && parcelContainer) {
      deliverySelect.addEventListener('change', () => {
          if (deliverySelect.value === 'inpost' || deliverySelect.value === 'orlen') {
              parcelContainer.style.display = 'block';
              if (parcelInput) {
                  parcelInput.setAttribute('required', 'true');
                  parcelInput.placeholder = 'Wpisz numer swojego paczkomatu';
              }
          } else {
              parcelContainer.style.display = 'none';
              if (parcelInput) parcelInput.removeAttribute('required');
          }
      });
  }

  // Отправка формы чекаута
  const checkoutForm = document.getElementById('checkout-form');
  console.log("Checkout form found:", !!checkoutForm);
  
  if (checkoutForm) {
      checkoutForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          console.log("Form submitted");

          // Проверяем авторизацию
          console.log("Current user:", currentUser);
          console.log("Auth object:", auth);
          console.log("DB object:", db);
          
          if (!currentUser) {
              if (window.showToast) {
                  window.showToast('🔐 Musisz być zalogowany, aby złożyć zamówienie!', 'error');
              } else {
                  alert('🔐 Musisz być zalogowany, aby złożyć zamówienie! Przejdź do strony konta.');
              }
              window.location.href = 'account.html';
              return;
          }

          // Проверяем что корзина не пуста
          if (cart.length === 0) {
              if (window.showToast) {
                  window.showToast('🛒 Twój koszyk jest pusty!', 'error');
              } else {
                  alert('🛒 Twój koszyk jest pusty!');
              }
              return;
          }

          // Собираем данные формы
          const orderData = {
              userId: currentUser.uid,
              userEmail: currentUser.email,
              items: cart,
              totalPrice: cart.reduce((sum, item) => sum + item.price, 0).toFixed(2) + ' PLN',
              date: new Date().toLocaleDateString('pl-PL'),
              address: `${document.getElementById('c-street').value} ${document.getElementById('c-house-number').value}, ${document.getElementById('c-postal-code').value} ${document.getElementById('c-city').value}`,
              delivery: document.getElementById('c-delivery').value,
              parcelNumber: document.getElementById('c-parcel-number')?.value || '',
              name: document.getElementById('c-name').value,
              surname: document.getElementById('c-surname').value,
              phone: document.getElementById('c-phone').value,
              status: 'nowy (nieopłacony)'
          };

          console.log("Order data:", orderData);
          console.log("DB is available:", !!db);

          try {
              // Сохраняем заказ в Realtime Database
              console.log("Saving order to Realtime Database...");
              console.log("User UID:", currentUser.uid);
              
              console.log("Calling push...");
              console.log("Order data to save:", JSON.stringify(orderData, null, 2));
              
              // Пробуем записать заказ напрямую
              console.log("Attempting to save order directly...");
              const ordersRef = ref(db, 'orders');
              const orderRef = push(ordersRef);
              await set(orderRef, orderData);
              console.log("Order saved with ID:", orderRef.key);
              console.log("Full order ref:", orderRef);
              console.log("Order saved successfully");
              
              // Сохраняем данные доставки в профиль пользователя
              const deliveryData = {
                  name: document.getElementById('c-name').value,
                  surname: document.getElementById('c-surname').value,
                  phone: document.getElementById('c-phone').value,
                  street: document.getElementById('c-street').value,
                  houseNumber: document.getElementById('c-house-number').value,
                  apartment: document.getElementById('c-apartment').value,
                  postalCode: document.getElementById('c-postal-code').value,
                  city: document.getElementById('c-city').value,
                  delivery: document.getElementById('c-delivery').value,
                  parcelNumber: document.getElementById('c-parcel-number')?.value || ''
              };
              
              console.log("Saving delivery data...");
              const userRef = ref(db, 'accounts/' + currentUser.uid);
              await update(userRef, { deliveryData });
              console.log("Delivery data saved");

              // Очищаем корзину и редиректим без alert на мобильных
              cart = [];
              localStorage.setItem('jellyCart', JSON.stringify(cart));
              
              // Небольшая задержка для завершения операций
              setTimeout(() => {
                  window.location.href = 'index.html';
              }, 100);
          } catch (error) {
              console.error('Error saving order:', error);
              console.error('Error code:', error.code);
              console.error('Error message:', error.message);
              if (window.showToast) {
                  window.showToast('❌ Błąd podczas składania zamówienia: ' + error.message, 'error');
              } else {
                  alert('❌ Błąd podczas składania zamówienia: ' + error.message);
              }
          }
      });
  } else {
      console.error("Checkout form not found!");
  }

  // Обновление корзины
  function updateCartLayout() {
    const bagCount = document.getElementById('bag-count');
    const cartItemsFlow = document.getElementById('checkout-cart-items');
    const totalPriceEl = document.getElementById('checkout-total-price');

    localStorage.setItem('jellyCart', JSON.stringify(cart));
    
    if (bagCount) {
        bagCount.textContent = cart.length;
    }
    
    if (!cartItemsFlow) return;
    
    if (cart.length === 0) {
        cartItemsFlow.innerHTML = `<p style="text-align:center; color:#8c767a; margin-top:40px;">Twój koszyk jest pusty.</p>`;
        if (totalPriceEl) totalPriceEl.textContent = '0,00 PLN';
        return;
    }
    
    cartItemsFlow.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        total += item.price;
        const row = document.createElement('div');
        row.className = 'checkout-cart-item';
        
        const imgTag = item.img ? `<img src="${item.img}" alt="${item.name}" class="cart-item-img">` : '<div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;background:#fff;border-radius:8px;">📦</div>';

        const actionButton = `<button class="checkout-remove-btn" data-index="${index}">✕</button>`;

        row.innerHTML = `
          <div class="cart-item-info">
              ${imgTag}
              <div class="checkout-item-info">
                  <span class="checkout-item-name">${item.name}</span>
                  <span class="checkout-item-price">${item.price.toFixed(2)} PLN</span>
              </div>
          </div>
          ${actionButton}
        `;
        cartItemsFlow.appendChild(row);
    });
    
    if (totalPriceEl) {
        totalPriceEl.textContent = `${total.toFixed(2)} PLN`;
    }

    // Навешиваем обработчики удаления товара
    const removeButtons = document.querySelectorAll('.checkout-remove-btn');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCartLayout();
        });
    });
  }

  updateCartLayout();
}

// Запускаем инициализацию
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCheckoutScript);
} else {
  initCheckoutScript();
}

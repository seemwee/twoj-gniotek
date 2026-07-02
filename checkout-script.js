import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let auth, db;
let cart = JSON.parse(localStorage.getItem('jellyCart')) || [];
let currentUser = null;

// Ждем инициализации Firebase
function initCheckoutScript() {
  if (!window.firebaseReady) {
    console.log("Checkout script: Waiting for Firebase initialization...");
    setTimeout(initCheckoutScript, 100);
    return;
  }

  auth = window.firebaseAuth;
  db = window.firebaseDb;
  
  console.log("Checkout script initialized with Firebase");
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
      const userDocRef = doc(db, "accounts", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
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
  if (checkoutForm) {
      checkoutForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          // Проверяем авторизацию
          if (!currentUser) {
              alert('🔐 Musisz być zalogowany, aby złożyć zamówienie! Przejdź do strony konta.');
              window.location.href = 'account.html';
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
              status: 'Weryfikacja InPost'
          };

          try {
              // Сохраняем заказ в Firestore
              await addDoc(collection(db, "orders"), orderData);
              
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
              
              await updateDoc(doc(db, "accounts", currentUser.uid), { deliveryData });

              alert('🎉 Zamówienie złożone! Dziękujemy za zakup!');
              cart = [];
              localStorage.setItem('jellyCart', JSON.stringify(cart));
              window.location.href = 'index.html';
          } catch (error) {
              console.error('Error saving order:', error);
              alert('❌ Błąd podczas składania zamówienia. Spróbuj ponownie.');
          }
      });
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

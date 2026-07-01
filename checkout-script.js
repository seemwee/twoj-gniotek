import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9AwC8-NSVPD-e3fpjq7cphquw-d80yHk",
  authDomain: "twoj-gniotek.firebaseapp.com",
  projectId: "twoj-gniotek",
  storageBucket: "twoj-gniotek.firebasestorage.app",
  messagingSenderId: "70839458696",
  appId: "1:70839458696:web:8c2ce646fdce9218f6b83d",
  measurementId: "G-HKW9ZJ9RQK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let cart = JSON.parse(localStorage.getItem('jellyCart')) || [];
let currentUser = null;

// Отслеживаем состояние авторизации
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

document.addEventListener('DOMContentLoaded', () => {
  // Логика переключения способов доставки на странице чекаута
  const deliverySelect = document.getElementById('c-delivery');
  const parcelContainer = document.getElementById('c-parcel-number-container');
  const parcelInput = document.getElementById('c-parcel-number');

  if (deliverySelect && parcelContainer) {
      deliverySelect.addEventListener('change', () => {
          if (deliverySelect.value === 'inpost' || deliverySelect.value === 'orlen') {
              parcelContainer.style.display = 'block';
              if (parcelInput) parcelInput.setAttribute('required', 'true');
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
});

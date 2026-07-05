import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let auth, db;
let currentUser = null;

// Admin credentials
const ADMIN_EMAIL = "admin@twoj-gniotek.com";

function initAdminScript() {
  if (!window.firebaseReady) {
    console.log("Admin script: Waiting for Firebase initialization...");
    setTimeout(initAdminScript, 100);
    return;
  }

  auth = window.firebaseAuth;
  db = window.firebaseDb;
  
  console.log("Admin script initialized with Firebase");
  setupAdminPanel();
}

function setupAdminPanel() {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    
    if (!user) {
      if (window.showToast) window.showToast("🔐 Musisz być zalogowany jako administrator!", "error");
      else alert("🔐 Musisz być zalogowany jako administrator!");
      window.location.href = "account.html";
      return;
    }
    
    if (user.email !== ADMIN_EMAIL) {
      if (window.showToast) window.showToast("🚫 Dostęp tylko dla administratorów!", "error");
      else alert("🚫 Dostęp tylko dla administratorów!");
      window.location.href = "index.html";
      return;
    }
    
    console.log("Admin logged in:", user.email);
    loadAllData();
  });

  const logoutBtn = document.getElementById("admin-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "account.html";
      });
    });
  }

  const tabs = document.querySelectorAll(".admin-tab[data-tab]");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      document.querySelectorAll(".admin-tab[data-tab]").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".admin-section").forEach(section => section.classList.remove("active"));
      document.getElementById(`${tabName}-section`).classList.add("active");
    });
  });

  // Фильтрация заказов по кнопкам (Wszystkie, Zalogowani, Niezalogowani)
  const filterBtns = document.querySelectorAll(".admin-tab[data-filter]") || document.querySelectorAll("[data-filter]");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadOrders(filter);
    });
  });
}

async function loadAllData() {
  loadOrders("all");
  loadStats();
  loadUsers();
}

async function loadOrders(filter = "all") {
  const container = document.getElementById("orders-container") || document.querySelector('.all-orders-wrapper') || document.getElementById('admin-orders-list');
  if (!container) return;
  
  try {
    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);
    
    if (!snapshot.exists()) {
      container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Brak zamówień.</p>`;
      return;
    }
    
    const allOrders = snapshot.val();
    let filteredOrders = [];
    
    Object.keys(allOrders).forEach((orderId) => {
      const order = allOrders[orderId];
      
      // Адаптация под проверку авторизации при покупке
      const hasUserId = !!(order.userId || order.userEmail || order.promoCodeUsed);

      if (filter === "zalogowany" && hasUserId) {
        filteredOrders.push({ id: orderId, ...order });
      } else if (filter === "niezalogowany" && !hasUserId) {
        filteredOrders.push({ id: orderId, ...order });
      } else if (filter === "all") {
        filteredOrders.push({ id: orderId, ...order });
      }
    });
    
    if (filteredOrders.length === 0) {
      container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Brak zamówień spełniających kryteria.</p>`;
      return;
    }
    
    container.innerHTML = "";
    
    filteredOrders.forEach((order) => {
      const orderCard = createOrderCard(order.id, order);
      container.appendChild(orderCard);
    });
  } catch (error) {
    console.error("Error loading orders:", error);
    container.innerHTML = `<p style="text-align: center; color: red; font-weight: bold; padding: 20px;">Błąd ładowania zamówień.</p>`;
  }
}

function createOrderCard(orderId, order) {
  const card = document.createElement("div");
  card.className = "order-card";
  
  const statusClass = `status-${order.status?.toLowerCase().replace(/\s/g, '') || 'nowy'}`;
  const statusOptions = ['Nowe zamówienie', 'potwierdzony (opłacony)', 'w trakcie', 'gotowy'];
  
  // КРИТИЧЕСКИЙ ФИКС: Безопасный парсинг товаров из корзины (массив products из script.js)
  const orderItems = order.products || order.items || [];
  const itemsHtml = orderItems.map(i => {
      const price = parseFloat(i.price);
      return `• ${i.name || 'Gniotek'} (${isNaN(price) ? '0.00' : price.toFixed(2)} PLN)`;
  }).join("<br>") || "Brak danych o produktach";
  
  // Защита от неопределенных полей клиента
  const clientName = order.name || 'Klient';
  const clientSurname = order.surname || '';
  const clientPhone = order.phone || 'Brak';
  const clientDelivery = order.deliveryMethod || order.delivery || 'Kurier';
  const clientAddress = order.address || 'Brak adresu';
  const parcelInfo = order.parcelNumber ? ` (Paczkomat: ${order.parcelNumber})` : '';

  card.innerHTML = `
    <div class="order-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <div>
        <strong>Zamówienie #${orderId.substring(1, 9)}</strong>
        <span style="color: var(--text-muted); font-size: 0.9rem; margin-left: 10px;">${order.timestamp ? new Date(order.timestamp).toLocaleDateString('pl-PL') : (order.date || 'Brak daty')}</span>
      </div>
      <select class="order-status-select ${statusClass}" data-order-id="${orderId}" style="padding:6px 12px; border-radius:12px; font-weight:700;">
        ${statusOptions.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
    
    <div class="order-details" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
      <div class="order-detail-item">
        <div class="order-detail-label" style="font-size:0.8rem; color:var(--text-muted);">Użytkownik</div>
        <div class="order-detail-value" style="font-weight:600;">${order.userEmail || 'Niezalogowany'}</div>
      </div>
      <div class="order-detail-item">
        <div class="order-detail-label" style="font-size:0.8rem; color:var(--text-muted);">Imię i nazwisko</div>
        <div class="order-detail-value" style="font-weight:600;">${clientName} ${clientSurname}</div>
      </div>
      <div class="order-detail-item">
        <div class="order-detail-label" style="font-size:0.8rem; color:var(--text-muted);">Telefon</div>
        <div class="order-detail-value" style="font-weight:600;">${clientPhone}</div>
      </div>
      <div class="order-detail-item">
        <div class="order-detail-label" style="font-size:0.8rem; color:var(--text-muted);">Dostawa</div>
        <div class="order-detail-value" style="font-weight:600;">${clientDelivery}${parcelInfo}</div>
      </div>
      <div class="order-detail-item" style="grid-column: span 2;">
        <div class="order-detail-label" style="font-size:0.8rem; color:var(--text-muted);">Adres dostawy</div>
        <div class="order-detail-value" style="font-weight:600;">${clientAddress}</div>
      </div>
      <div class="order-detail-item">
        <div class="order-detail-label" style="font-size:0.8rem; color:var(--text-muted);">Użyty Kod</div>
        <div class="order-detail-value" style="font-weight:700; color:#2ec4b6;">${order.promoCodeUsed || 'BRAK'}</div>
      </div>
      <div class="order-detail-item">
        <div class="order-detail-label" style="font-size:0.8rem; color:var(--text-muted);">Suma końcowa</div>
        <div class="order-detail-value" style="color: var(--pink-jelly-deep); font-weight:800; font-size:1.2rem;">${order.totalPrice}</div>
      </div>
    </div>
    
    <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid rgba(0,0,0,0.05);">
      <div class="order-detail-label" style="font-size:0.8rem; color:var(--text-muted); font-weight:700; margin-bottom:5px;">Zawartość koszyka:</div>
      <div style="font-size: 0.9rem; font-weight:600; line-height:1.4;">${itemsHtml}</div>
    </div>
  `;
  
  const statusSelect = card.querySelector(".order-status-select");
  statusSelect.addEventListener("change", async (e) => {
    const newStatus = e.target.value;
    try {
      await update(ref(db, 'orders/' + orderId), { status: newStatus });
      statusSelect.className = `order-status-select status-${newStatus.toLowerCase().replace(/\s/g, '')}`;
      console.log("Status updated successfully:", orderId, newStatus);
    } catch (error) {
      console.error("Status update error:", error);
    }
  });
  
  return card;
}

async function loadStats() {
  try {
    const ordersRef = ref(db, 'orders');
    const ordersSnapshot = await get(ordersRef);
    const ordersData = ordersSnapshot.exists() ? ordersSnapshot.val() : {};
    
    const totalOrdersEl = document.getElementById("total-orders");
    if (totalOrdersEl) totalOrdersEl.textContent = Object.keys(ordersData).length;
    
    let totalRevenue = 0;
    Object.keys(ordersData).forEach(orderId => {
      const order = ordersData[orderId];
      // Очищаем строку цены от букв PLN и пробелов для корректного сложения
      const price = parseFloat(order.totalPrice?.replace(/[^\d.,]/g, '').replace(',', '.') || 0);
      totalRevenue += isNaN(price) ? 0 : price;
    });
    
    const totalRevenueEl = document.getElementById("total-revenue");
    if (totalRevenueEl) totalRevenueEl.textContent = totalRevenue.toFixed(2) + " PLN";
    
    const usersRef = ref(db, 'accounts');
    const usersSnapshot = await get(usersRef);
    const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
    
    const totalUsersEl = document.getElementById("total-users");
    if (totalUsersEl) totalUsersEl.textContent = Object.keys(usersData).length;
    
    // КРИТИЧЕСКИЙ ФИКС: Считаем сумму кликов по свойству clicks из Realtime DB
    let totalSquishes = 0;
    Object.keys(usersData).forEach(userId => {
      const user = usersData[userId];
      totalSquishes += user.clicks || user.squishCount || 0;
    });
    
    const totalSquishesEl = document.getElementById("total-squishes");
    if (totalSquishesEl) totalSquishesEl.textContent = totalSquishes;
    
    loadMiniGameStats(usersData);
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

function loadMiniGameStats(usersData) {
  const container = document.getElementById("mini-game-stats");
  if (!container) return;
  
  let usersList = [];
  Object.keys(usersData).forEach(userId => {
    const user = usersData[userId];
    if (user.email) {
      usersList.push({
        email: user.email,
        squishCount: user.clicks || user.squishCount || 0
      });
    }
  });
  
  usersList.sort((a, b) => b.squishCount - a.squishCount);
  const top10 = usersList.slice(0, 10);
  
  container.innerHTML = "";
  top10.forEach((user, index) => {
    const card = document.createElement("div");
    card.className = "order-card";
    card.style.marginBottom = "10px";
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px;">
        <div>
          <strong>#${index + 1}</strong>
          <span style="margin-left: 10px; font-weight:600;">${maskEmail(user.email)}</span>
        </div>
        <div style="font-size: 1.3rem; font-weight: 800; color: var(--pink-jelly-deep);">
          ${user.squishCount} 🎮
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function maskEmail(email) {
  if (!email) return "Anonim";
  const parts = email.split("@");
  if (parts[0].length <= 2) return email;
  return parts[0].substring(0, 2) + "***@" + parts[1];
}

async function loadUsers() {
  const tbody = document.getElementById("users-table-body");
  if (!tbody) return;
  
  try {
    const usersRef = ref(db, 'accounts');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px;">Brak użytkowników.</td></tr>`;
      return;
    }
    
    const usersData = snapshot.val();
    tbody.innerHTML = "";
    
    Object.keys(usersData).forEach(userId => {
      const user = usersData[userId];
      const row = document.createElement("tr");
      const userClicks = user.clicks || user.squishCount || 0;
      const userDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('pl-PL') : 'Brak danych';
      
      row.innerHTML = `
        <td style="padding:12px;">${user.email || 'Brak email'}</td>
        <td style="padding:12px;"><span class="user-type-badge user-zalogowany" style="background:rgba(46,196,182,0.1); color:#2ec4b6; padding:4px 10px; border-radius:12px; font-weight:700;">Zalogowany</span></td>
        <td style="padding:12px; font-weight:700;">${userClicks}</td>
        <td style="padding:12px; color:var(--text-muted);">${userDate}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading users:", error);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red; padding: 15px;">Błąd ładowania.</td></tr>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminScript);
} else {
  initAdminScript();
}

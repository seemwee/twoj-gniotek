import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let auth, db;
let currentUser = null;

// Admin credentials
const ADMIN_EMAIL = "admin@twoj-gniotek.com"; // Change to your admin email

// Ждем инициализации Firebase
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
  // Проверяем авторизацию
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    
    if (!user) {
      alert("🔐 Musisz być zalogowany jako administrator!");
      window.location.href = "account.html";
      return;
    }
    
    // Проверяем админа
    if (user.email !== ADMIN_EMAIL) {
      alert("🚫 Dostęp tylko dla administratorów!");
      window.location.href = "index.html";
      return;
    }
    
    console.log("Admin logged in:", user.email);
    loadAllData();
  });

  // Logout
  const logoutBtn = document.getElementById("admin-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "account.html";
      });
    });
  }

  // Tab switching
  const tabs = document.querySelectorAll(".admin-tab[data-tab]");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      
      // Update tab styles
      document.querySelectorAll(".admin-tab[data-tab]").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      // Show corresponding section
      document.querySelectorAll(".admin-section").forEach(section => {
        section.classList.remove("active");
      });
      document.getElementById(`${tabName}-section`).classList.add("active");
    });
  });

  // Order filtering
  const filterBtns = document.querySelectorAll(".admin-tab[data-filter]");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      
      document.querySelectorAll(".admin-tab[data-filter]").forEach(b => b.classList.remove("active"));
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
  const container = document.getElementById("orders-container");
  if (!container) return;
  
  try {
    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);
    
    if (!snapshot.exists()) {
      container.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Brak zamówień.</p>`;
      return;
    }
    
    const allOrders = snapshot.val();
    let filteredOrders = [];
    
    Object.keys(allOrders).forEach((orderId) => {
      const order = allOrders[orderId];
      if (filter === "zalogowany" && order.userId) {
        filteredOrders.push({ id: orderId, ...order });
      } else if (filter === "niezalogowany" && !order.userId) {
        filteredOrders.push({ id: orderId, ...order });
      } else if (filter === "all") {
        filteredOrders.push({ id: orderId, ...order });
      }
    });
    
    if (filteredOrders.length === 0) {
      container.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Brak zamówień.</p>`;
      return;
    }
    
    container.innerHTML = "";
    
    filteredOrders.forEach((order) => {
      const orderCard = createOrderCard(order.id, order);
      container.appendChild(orderCard);
    });
  } catch (error) {
    console.error("Error loading orders:", error);
    container.innerHTML = `<p style="text-align: center; color: red;">Błąd ładowania zamówień.</p>`;
  }
}

function createOrderCard(orderId, order) {
  const card = document.createElement("div");
  card.className = "order-card";
  
  const statusClass = `status-${order.status?.toLowerCase().replace(/\s/g, '') || 'nowy'}`;
  const statusOptions = ['nowy (nieopłacony)', 'potwierdzony (opłacony)', 'w trakcie', 'gotowy'];
  
  const itemsHtml = order.items?.map(i => `• ${i.name} (${i.price.toFixed(2)} PLN)`).join("<br>") || "Brak";
  
  card.innerHTML = `
    <div class="order-header">
      <div>
        <strong>Zamówienie #${orderId.substring(0, 8)}</strong>
        <span style="color: var(--text-muted); font-size: 0.9rem; margin-left: 10px;">${order.date || 'Brak daty'}</span>
      </div>
      <select class="order-status-select ${statusClass}" data-order-id="${orderId}">
        ${statusOptions.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
    
    <div class="order-details">
      <div class="order-detail-item">
        <div class="order-detail-label">Email</div>
        <div class="order-detail-value">${order.userEmail || 'Niezalogowany'}</div>
      </div>
      <div class="order-detail-item">
        <div class="order-detail-label">Imię i nazwisko</div>
        <div class="order-detail-value">${order.name} ${order.surname}</div>
      </div>
      <div class="order-detail-item">
        <div class="order-detail-label">Telefon</div>
        <div class="order-detail-value">${order.phone}</div>
      </div>
      <div class="order-detail-item">
        <div class="order-detail-label">Dostawa</div>
        <div class="order-detail-value">${order.delivery}</div>
      </div>
      <div class="order-detail-item">
        <div class="order-detail-label">Adres</div>
        <div class="order-detail-value">${order.address}</div>
      </div>
      <div class="order-detail-item">
        <div class="order-detail-label">Suma</div>
        <div class="order-detail-value" style="color: var(--pink-jelly-deep);">${order.totalPrice}</div>
      </div>
    </div>
    
    <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid rgba(0,0,0,0.05);">
      <div class="order-detail-label">Produkty:</div>
      <div style="font-size: 0.9rem;">${itemsHtml}</div>
    </div>
  `;
  
  // Status change handler
  const statusSelect = card.querySelector(".order-status-select");
  statusSelect.addEventListener("change", async (e) => {
    const newStatus = e.target.value;
    try {
      await update(ref(db, 'orders/' + orderId), { status: newStatus });
      statusSelect.className = `order-status-select status-${newStatus.toLowerCase().replace(/\s/g, '')}`;
      console.log("Order status updated:", orderId, newStatus);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Błąd podczas aktualizacji statusu");
    }
  });
  
  return card;
}

async function loadStats() {
  try {
    // Total orders
    const ordersRef = ref(db, 'orders');
    const ordersSnapshot = await get(ordersRef);
    const ordersData = ordersSnapshot.exists() ? ordersSnapshot.val() : {};
    document.getElementById("total-orders").textContent = Object.keys(ordersData).length;
    
    // Total revenue
    let totalRevenue = 0;
    Object.keys(ordersData).forEach(orderId => {
      const order = ordersData[orderId];
      const price = parseFloat(order.totalPrice?.replace(' PLN', '') || 0);
      totalRevenue += price;
    });
    document.getElementById("total-revenue").textContent = totalRevenue.toFixed(2) + " PLN";
    
    // Total users
    const usersRef = ref(db, 'accounts');
    const usersSnapshot = await get(usersRef);
    const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
    document.getElementById("total-users").textContent = Object.keys(usersData).length;
    
    // Total squishes
    let totalSquishes = 0;
    Object.keys(usersData).forEach(userId => {
      const user = usersData[userId];
      totalSquishes += user.squishCount || 0;
    });
    document.getElementById("total-squishes").textContent = totalSquishes;
    
    // Mini-game stats
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
    usersList.push({
      email: user.email,
      squishCount: user.squishCount || 0
    });
  });
  
  // Sort by squish count
  usersList.sort((a, b) => b.squishCount - a.squishCount);
  
  // Top 10
  const top10 = usersList.slice(0, 10);
  
  container.innerHTML = "";
  top10.forEach((user, index) => {
    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>#${index + 1}</strong>
          <span style="margin-left: 10px;">${maskEmail(user.email)}</span>
        </div>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--pink-jelly-deep);">
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
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Brak użytkowników.</td></tr>`;
      return;
    }
    
    const usersData = snapshot.val();
    tbody.innerHTML = "";
    
    Object.keys(usersData).forEach(userId => {
      const user = usersData[userId];
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.email}</td>
        <td><span class="user-type-badge user-zalogowany">Zalogowany</span></td>
        <td>${user.squishCount || 0}</td>
        <td>${new Date(user.createdAt).toLocaleDateString('pl-PL')}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading users:", error);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Błąd ładowania.</td></tr>`;
  }
}

// Запускаем инициализацию
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminScript);
} else {
  initAdminScript();
}

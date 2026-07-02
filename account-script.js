import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, getDocs, doc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let auth, db;

// Ждем инициализации Firebase
function initAccountScript() {
  if (!window.firebaseReady) {
    console.log("Account script: Waiting for Firebase initialization...");
    setTimeout(initAccountScript, 100);
    return;
  }

  auth = window.firebaseAuth;
  db = window.firebaseDb;
  
  console.log("Account script initialized with Firebase");
  setupAccountUI();
}

function setupAccountUI() {
    if (typeof lucide !== "undefined") lucide.createIcons();

    let currentUserId = null;

    const tabLoginBtn = document.getElementById("tab-login-btn");
    const tabRegisterBtn = document.getElementById("tab-register-btn");
    const btnExecuteAuth = document.getElementById("btn-execute-auth");
    let currentAuthMode = "login";

    if (tabLoginBtn && tabRegisterBtn && btnExecuteAuth) {
        tabLoginBtn.addEventListener("click", () => {
            currentAuthMode = "login";
            tabLoginBtn.classList.add("active");
            tabRegisterBtn.classList.remove("active");
            btnExecuteAuth.textContent = "Zaloguj się";
        });

        tabRegisterBtn.addEventListener("click", () => {
            currentAuthMode = "register";
            tabRegisterBtn.classList.add("active");
            tabLoginBtn.classList.remove("active");
            btnExecuteAuth.textContent = "Utwórz konto dropu";
        });
    }

    if (btnExecuteAuth) {
        btnExecuteAuth.addEventListener("click", async () => {
            const email = document.getElementById("auth-email").value.trim();
            const pass = document.getElementById("auth-password").value;

            if (!email || !pass) return alert("Wprowadź dane!");

            btnExecuteAuth.disabled = true;
            btnExecuteAuth.textContent = "Przetwarzanie...";

            try {
                if (currentAuthMode === "register") {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
                    await setDoc(doc(db, "accounts", userCredential.user.uid), {
                        email: email,
                        createdAt: new Date().toISOString(),
                        squishCount: 0,
                        cart: []
                    });
                    alert("Konto stworzone pomyślnie! Witamy w drop-strefie.");
                    // Принудительно переключаем UI
                    updateUIForUser(userCredential.user);
                } else {
                    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
                    alert("Pomyślnie zalogowano!");
                    // Принудительно переключаем UI
                    updateUIForUser(userCredential.user);
                }
            } catch (err) {
                console.error("Auth error:", err);
                alert("Błąd: " + err.message);
            } finally {
                btnExecuteAuth.disabled = false;
                btnExecuteAuth.textContent = currentAuthMode === "register" ? "Utwórz konto dropu" : "Zaloguj się";
            }
        });
    }

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            signOut(auth).then(() => {
                alert("Wylogowano z panelu.");
                // UI переключится автоматически через onAuthStateChanged
            });
        });
    }

    const authGateBox = document.getElementById("auth-gate-box");
    const accountDashboard = document.getElementById("account-dashboard");
    const userEmailDisplay = document.getElementById("user-email-display");

    // Функция для принудительного обновления UI
    function updateUIForUser(user) {
        currentUserId = user.uid;
        if (authGateBox) authGateBox.style.display = "none";
        if (accountDashboard) accountDashboard.style.display = "grid";
        if (userEmailDisplay) userEmailDisplay.textContent = user.email;
        
        fetchUserOrders(user.uid);
        console.log("UI updated for user:", user.email);
    }

    onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed:", user ? "Logged in as " + user.email : "Logged out");
        
        if (user) {
            updateUIForUser(user);
        } else {
            currentUserId = null;
            if (authGateBox) authGateBox.style.display = "block";
            if (accountDashboard) accountDashboard.style.display = "none";
        }
    });

    async function fetchUserOrders(uid) {
        const feedWrapper = document.getElementById("user-orders-feed");
        const countBadge = document.getElementById("orders-count-badge");
        if (!feedWrapper) return;
        
        try {
            const q = query(collection(db, "orders"), where("userId", "==", uid));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                feedWrapper.innerHTML = `
                    <div class="empty-orders-state">
                        <p>Brak dotychczasowych zamówień. Czas złapać pierwszy drop!</p>
                    </div>`;
                if (countBadge) countBadge.textContent = "0";
                return;
            }

            feedWrapper.innerHTML = "";
            if (countBadge) countBadge.textContent = querySnapshot.size;

            querySnapshot.forEach((doc) => {
                const order = doc.data();
                const itemsHtml = order.items.map(i => `• <strong>${i.name}</strong> (${i.price.toFixed(2)} PLN)`).join("<br>");

                const card = document.createElement("div");
                card.className = "db-order-card";
                card.innerHTML = `
                    <div class="order-card-top">
                        <span>Data: <strong>${order.date || 'Dziś'}</strong></span>
                        <span class="order-status-badge">Weryfikacja InPost</span>
                    </div>
                    <div>
                        <div style="font-size:0.95rem; margin-bottom: 8px;">${itemsHtml}</div>
                        <div style="font-size:0.85rem; color:var(--text-muted);">Dostawa na adres / Paczkomat: ${order.address}</div>
                    </div>
                    <div style="text-align: right; font-weight:700; border-top:1px solid rgba(0,0,0,0.03); padding-top:10px;">
                        Suma: <span style="color:var(--pink-jelly-deep); font-size:1.1rem;">${order.totalPrice}</span>
                    </div>
                `;
                feedWrapper.appendChild(card);
            });

        } catch (error) {
            console.error("Error fetching orders: ", error);
            feedWrapper.innerHTML = `<p style="color:red; text-align:center;">Błąd ładowania danych.</p>`;
        }
    }
}

// Запускаем инициализацию
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAccountScript);
} else {
  initAccountScript();
}

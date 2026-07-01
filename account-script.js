import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, collection, getDocs, query, where } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined") lucide.createIcons();

    // Переключение вкладок (Логин / Регистрация)
    const tabLoginBtn = document.getElementById("tab-login-btn");
    const tabRegisterBtn = document.getElementById("tab-register-btn");
    const btnExecuteAuth = document.getElementById("btn-execute-auth");
    let currentAuthMode = "login"; // по умолчанию режим входа

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

    // Экзекуция кнопки авторизации
    btnExecuteAuth.addEventListener("click", () => {
        const email = document.getElementById("auth-email").value.trim();
        const pass = document.getElementById("auth-password").value;

        if (!email || !pass) return alert("Wprowadź dane!");

        if (currentAuthMode === "register") {
            createUserWithEmailAndPassword(auth, email, pass)
                .then(() => alert("Konto stworzone pomyślnie! Witamy w drop-strefie."))
                .catch(err => alert("Błąd rejestracji: " + err.message));
        } else {
            signInWithEmailAndPassword(auth, email, pass)
                .then(() => alert("Pomyślnie zalogowano!"))
                .catch(err => alert("Błąd logowania: " + err.message));
        }
    });

    // Выход из системы
    document.getElementById("btn-logout").addEventListener("click", () => {
        signOut(auth).then(() => alert("Wylogowano z panelu."));
    });

    // МОНИТОРИНГ СЕССИИ ЮЗЕРА
    const authGateBox = document.getElementById("auth-gate-box");
    const accountDashboard = document.getElementById("account-dashboard");
    const userEmailDisplay = document.getElementById("user-email-display");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            authGateBox.style.display = "none";
            accountDashboard.style.style.display = "grid";
            userEmailDisplay.textContent = user.email;
            
            // Загружаем его личные заказы из Firestore
            fetchUserOrders(user.uid);
        } else {
            authGateBox.style.display = "block";
            accountDashboard.style.display = "none";
        }
    });

    // ФУНКЦИЯ ВЫТЯГИВАНИЯ ЗАКАЗОВ ЮЗЕРА ИЗ FIRESTORE
    async function fetchUserOrders(uid) {
        const feedWrapper = document.getElementById("user-orders-feed");
        const countBadge = document.getElementById("orders-count-badge");
        
        try {
            // Делаем селекцию документов, где userId равен ID вошедшего юзера
            const q = query(collection(db, "orders"), where("userId", "==", uid));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                feedWrapper.innerHTML = `
                    <div class="empty-orders-state">
                        <p>Brak dotychczasowych zamówień. Czas złapać pierwszy drop!</p>
                    </div>`;
                countBadge.textContent = "0";
                return;
            }

            feedWrapper.innerHTML = "";
            countBadge.textContent = querySnapshot.size;

            querySnapshot.forEach((doc) => {
                const order = doc.data();
                
                // Рендерим список купленных товаров в строчку
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
});
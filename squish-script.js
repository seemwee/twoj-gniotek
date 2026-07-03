import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let currentUser = null;
let globalBaseCount = 0;    
let localSessionClicks = 0; 
let saveTimeout = null;
let auth, db;

// Ждем инициализации Firebase
function initSquishScript() {
  if (!window.firebaseReady) {
    console.log("Waiting for Firebase initialization...");
    setTimeout(initSquishScript, 100);
    return;
  }

  auth = window.firebaseAuth;
  db = window.firebaseDb;
  
  console.log("Squish script initialized with Firebase");
  setupAuthListener();
  setupClickListener();
  loadLeaderboard();
}

// Маскирование имейлов
function maskEmail(email) {
  if (!email) return "Anonim";
  const parts = email.split("@");
  if (parts[0].length <= 2) return email;
  return parts[0].substring(0, 2) + "***@" + parts[1];
}

// Добавь эту переменную на самый верх файла к остальным let (к currentUser, globalBaseCount и т.д.)
let levelUpTriggered = false; 
let messageTimeout = null;

function checkLevel() {
  const img1 = document.getElementById('squishy-stage-1');
  const img2 = document.getElementById('squishy-stage-2');
  const msg = document.getElementById('level-up-message');

  if (!img1 || !img2 || !msg) return;

  const totalClicks = globalBaseCount + localSessionClicks;

  if (totalClicks >= 1000) {
    img1.style.display = 'none';
    img2.style.display = 'block';
    
    // Проверяем: если порог пройден, НО сообщение в этой сессии ЕЩЕ НЕ ПОКАЗЫВАЛОСЬ
    if (!levelUpTriggered) {
      levelUpTriggered = true; // Сразу блокируем повторные вызовы
      msg.style.display = 'block';

      // Удаляем сообщение ровно через 3 секунды
      clearTimeout(messageTimeout);
      messageTimeout = setTimeout(() => {
        msg.style.display = 'none';
      }, 3000);
    }
  } else {
    // Если кликов меньше 1000 (например, зашел новый юзер с 0 кликов), сбрасываем всё назад
    img1.style.display = 'block';
    img2.style.display = 'none';
    msg.style.display = 'none';
    levelUpTriggered = false; 
    clearTimeout(messageTimeout);
  }
}

// Загрузка таблицы лидеров
async function loadLeaderboard() {
  const leaderboardBody = document.getElementById("leaderboard-body");
  const userStatusEl = document.getElementById("user-leaderboard-status");
  if (!leaderboardBody) return;

  try {
    console.log("Loading leaderboard...");
    const accountsRef = ref(db, 'accounts');
    const snapshot = await get(accountsRef);
    
    let usersList = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((userId) => {
        const userData = data[userId];
        usersList.push({
          id: userId,
          email: userData.email || "Anonim",
          nickname: userData.nickname || userData.email || "Anonim",
          squishCount: Number(userData.squishCount) || 0
        });
      });
    }

    usersList.sort((a, b) => b.squishCount - a.squishCount);

    let leaderboardHtml = "";
    let userRank = 0;
    let userClicks = 0;

    usersList.forEach((user, index) => {
      const count = index + 1;
      const displayName = user.nickname || maskEmail(user.email);

      if (count <= 10) {
        leaderboardHtml += `
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.02); font-size: 0.95rem;">
            <td style="padding: 10px; font-weight: bold;">${count === 1 ? '🥇' : count === 2 ? '🥈' : count === 3 ? '🥉' : count}</td>
            <td style="padding: 10px;">${displayName}</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: var(--pink-jelly-deep);">${user.squishCount}</td>
          </tr>
        `;
      }

      if (currentUser && user.id === currentUser.uid) {
        userRank = count;
        userClicks = user.squishCount;
      }
    });

    leaderboardBody.innerHTML = leaderboardHtml || "<tr><td colspan='3' style='text-align:center; padding:10px;'>Brak danych</td></tr>";

    if (userStatusEl) {
      if (currentUser) {
        if (userRank > 0) {
          userStatusEl.innerHTML = `Twój wynik: <strong>#${userRank}</strong> miejsce w tabeli (${userClicks + localSessionClicks} ścisków)`;
        } else {
          userStatusEl.innerHTML = `Twój wynik: Kliknij gniotka, aby trafić do tabeli!`;
        }
      } else {
        userStatusEl.innerHTML = `Zaloguj się, aby zobaczyć swoje miejsce w tabeli!`;
      }
    }
  } catch (error) {
    console.error("Błąd ładowania tabeli liderów:", error);
    leaderboardBody.innerHTML = "<tr><td colspan='3' style='text-align:center; color:red; padding:10px;'>Błąd ładowania...</td></tr>";
  }
}

// Отслеживание состояния авторизации
function setupAuthListener() {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const squishCountEl = document.getElementById('squish-count');
    const userStatusEl = document.getElementById("user-leaderboard-status");

    if (user) {
      console.log("Zalogowano jako:", user.email);
      const userRef = ref(db, 'accounts/' + user.uid);
      
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          globalBaseCount = Number(userData.squishCount) || 0;
          
          if (squishCountEl) {
            squishCountEl.textContent = globalBaseCount + localSessionClicks;
          }
        }
        checkLevel(); // Проверяем уровень после загрузки данных игрока
        loadLeaderboard();
      }).catch((error) => {
        console.error("Error loading account data:", error);
        checkLevel();
        loadLeaderboard();
      });
    } else {
      console.log("Użytkownik niezalogowany");
      globalBaseCount = 0;
      localSessionClicks = 0;
      if (squishCountEl) squishCountEl.textContent = "0";
      if (userStatusEl) userStatusEl.innerHTML = "Zaloguj się, aby zobaczyć swoje miejsce w tabeli!";
      checkLevel(); // Сбрасываем картинки, если никто не залогинен
      loadLeaderboard();
    }
  });
}

// Логика кликов
function setupClickListener() {
  const interactiveDumpling = document.getElementById('interactive-dumpling');
  const squishCountEl = document.getElementById('squish-count');
  
  console.log("Setting up click listener, element found:", !!interactiveDumpling);
  
  if (interactiveDumpling) {
    const handleSquish = (e) => {
      e.preventDefault();
      
      if (!currentUser) {
        if (window.showToast) {
          window.showToast("Zaloguj się, aby zbierać ściski!", "error");
        } else {
          alert("Zaloguj się, aby zbierać ściski!");
        }
        return;
      }
      
      localSessionClicks++;
      
      if (squishCountEl) {
        squishCountEl.textContent = globalBaseCount + localSessionClicks;
      }

      checkLevel(); // Моментально проверяем уровень при каждом клике!

      const userStatusEl = document.getElementById("user-leaderboard-status");
      if (userStatusEl) {
        const currentText = userStatusEl.innerText;
        const match = currentText.match(/#\d+/);
        if (match) {
          userStatusEl.innerHTML = `Twój wynik: <strong>${match[0]}</strong> miejsce w tabeli (${globalBaseCount + localSessionClicks} ścisków)`;
        } else {
          userStatusEl.innerHTML = `Twój wynik: Zapisywanie... (${globalBaseCount + localSessionClicks} ścisków)`;
        }
      }

      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(async () => {
        const clicksToSubmit = localSessionClicks;
        console.log("Saving clicks to Realtime Database:", clicksToSubmit);

        if (clicksToSubmit > 0 && currentUser) {
          try {
            const userRef = ref(db, 'accounts/' + currentUser.uid);
            const snapshot = await get(userRef);
            
            let currentCount = 0;
            if (snapshot.exists()) {
              const userData = snapshot.val();
              currentCount = Number(userData.squishCount) || 0;
            }
            
            await update(userRef, {
              squishCount: currentCount + clicksToSubmit
            });

            globalBaseCount += clicksToSubmit;
            localSessionClicks -= clicksToSubmit;
            
            console.log(`Zsynchronizowano! Łącznie: ${globalBaseCount}`);
            checkLevel(); // На всякий случай проверяем после синхронизации с базой
            loadLeaderboard(); 
          } catch (error) {
            console.error("Error saving squish count:", error);
          }
        }
      }, 2000);
    };

    interactiveDumpling.addEventListener('click', handleSquish);
    interactiveDumpling.addEventListener('touchstart', handleSquish, { passive: false });
  } else {
    console.error("Interactive dumpling element not found!");
  }
}

// Запускаем инициализацию
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSquishScript);
} else {
  initSquishScript();
}

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// === КОНФИГУРАЦИЯ УРОВНЕЙ СКВИША ===
// 16 уровней (от 0 до 1 000 000+ кликов). Замени пути к картинкам (pics/...) на реальные файлы в твоем проекте.
const SQUISH_LEVELS = [
  { minClicks: 0,       name: "mochi",      img: "pics/lvls/1.png" },
  { minClicks: 1000,    name: "Simple dimple ",    img: "pics/lvls/2.png" },
  { minClicks: 5000,    name: "TABA ŁAPKA",   img: "pics/lvls/3.png" },
  { minClicks: 15000,   name: "POP IT",      img: "pics/lvls/4.png" },
  { minClicks: 30000,   name: "AKSOLOTL",          img: "pics/lvls/5.png" },
  { minClicks: 50000,   name: "CZEKOLADA",        img: "pics/lvls/6.png" },
  { minClicks: 75000,   name: "SUPER SER",      img: "pics/lvls/7.png" },
  { minClicks: 100000,  name: "BUTTER",   img: "pics/lvls/8.png" },
  { minClicks: 150000,  name: "DUMPLING", img: "pics/lvls/9.png" },
  { minClicks: 200000,  name: "CHLEBEK",     img: "pics/lvls/10.png" },
  { minClicks: 300000,  name: "NEE DOH",     img: "pics/lvls/11.png" },
  { minClicks: 450000,  name: "BIG TRUSKAWKA",  img: "pics/lvls/12.png" },
  { minClicks: 600000,  name: "BANANA XXL", img: "pics/lvls/13.png" },
  { minClicks: 750000,  name: "MEGA BUTTER",     img: "pics/lvls/14.png" },
  { minClicks: 900000,  name: "GOLDEN DUMPLING",  img: "pics/lvls/15.png" },
  { minClicks: 1000000, name: "GODNESS DUMPLING",  img: "pics/lvls/16.png" }
];

// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let currentUser = null;
let globalBaseCount = 0;    
let localSessionClicks = 0; 
let saveTimeout = null;
let auth, db;

let currentLevelIndex = 0; // Запоминаем текущий уровень, чтобы отследить момент апа
let messageTimeout = null; // Для таймера на 3 секунды

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

// === УЛУЧШЕННАЯ ЛОГИКА АПГРЕЙДА УРОВНЯ ===
function checkLevel() {
  const squishImg = document.getElementById('jelly-interactive-render'); // ID из твоего HTML
  const squishName = document.getElementById('squishy-name');             // Название над сквишем
  const msg = document.getElementById('level-up-message');                // Твой блок уведомления

  if (!squishImg || !squishName || !msg) return;

  const totalClicks = globalBaseCount + localSessionClicks;

  // Рассчитываем, на каком уровне находится игрок
  let targetLevelIndex = 0;
  for (let i = SQUISH_LEVELS.length - 1; i >= 0; i--) {
    if (totalClicks >= SQUISH_LEVELS[i].minClicks) {
      targetLevelIndex = i;
      break;
    }
  }

  const currentLevel = SQUISH_LEVELS[targetLevelIndex];

  // Меняем название, если перешли на новый уровень
  if (squishName.textContent !== currentLevel.name) {
    squishName.textContent = currentLevel.name;
  }
  
  // Меняем картинку сквиша под уровень
  if (squishImg.getAttribute('src') !== currentLevel.img) {
    squishImg.src = currentLevel.img;
  }

  // Если уровень стал выше, чем был в текущей сессии — запускаем коммуникат
  if (targetLevelIndex > currentLevelIndex) {
    msg.style.display = 'block';

    // Прячем коммуникат ровно через 3 секунды (3000 мс)
    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
      msg.style.display = 'none';
    }, 3000);
  } 
  // Сброс, если зашел неавторизованный юзер или сбросились клики
  else if (totalClicks === 0) {
    msg.style.display = 'none';
    clearTimeout(messageTimeout);
  }

  // Фиксируем текущий индекс для последующих сравнений
  currentLevelIndex = targetLevelIndex;
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
        // Чтобы плашка "Ура!" не вылезала сама по себе просто при первоначальном входе в аккаунт:
        currentLevelIndex = 999; 
        checkLevel(); 
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
      currentLevelIndex = 0;
      if (squishCountEl) squishCountEl.textContent = "0";
      if (userStatusEl) userStatusEl.innerHTML = "Zaloguj się, aby zobaczyć swoje miejsce w tabeli!";
      checkLevel();
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
          alert("Zaloguj się, aby zbieraть ściski!");
        }
        return;
      }
      
localSessionClicks++;

// ДОВАВЬТЕ ЭТОТ БЛОК СЮДА:
interactiveDumpling.classList.add('squeezed');
setTimeout(() => {
  interactiveDumpling.classList.remove('squeezed');
}, 100); // Возвращаем форму gniotka обратно через 100мс
      
      if (squishCountEl) {
        squishCountEl.textContent = globalBaseCount + localSessionClicks;
      }

      checkLevel(); // Моментально проверяем уровень и меняем визуал на каждый клик!

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
            checkLevel(); 
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

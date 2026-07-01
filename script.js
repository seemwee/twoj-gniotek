// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyA9AwC8-NSVPD-e3fpjq7cphquw-d80yHk",
//   authDomain: "twoj-gniotek.firebaseapp.com",
//   projectId: "twoj-gniotek",
//   storageBucket: "twoj-gniotek.firebasestorage.app",
//   messagingSenderId: "70839458696",
//   appId: "1:70839458696:web:8c2ce646fdce9218f6b83d",
//   measurementId: "G-HKW9ZJ9RQK"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// /// FIREBASE ^

// Inicjalizacja ikon w całym dokumencie
if (window.lucide) {
  lucide.createIcons();
}

// --- FLOATING PARTICLES BACKGROUND ---
function createFloatingParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const particleCount = 20;
  const colors = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700', '#ff6b6b'];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-delay: ${Math.random() * 15}s;
      animation-duration: ${Math.random() * 10 + 10}s;
    `;
    container.appendChild(particle);
  }
}

createFloatingParticles();

// --- SQUISHY SQUEEZE ANIMATION ---
const jellyObject = document.getElementById('jelly-core-object');
if (jellyObject) {
  // Анимация сжатия при клике
  jellyObject.addEventListener('click', () => {
    gsap.to(jellyObject, {
      scale: 0.6,
      scaleX: 1.4,
      scaleY: 0.5,
      rotation: Math.random() * 20 - 10,
      duration: 0.12,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(jellyObject, {
          scale: 1,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.3)"
        });
      }
    });

    // Анимация давления
    const pressureFill = document.getElementById('pressure-fill');
    if (pressureFill) {
      gsap.to(pressureFill, {
        width: '100%',
        duration: 0.2,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(pressureFill, {
            width: '30%',
            duration: 0.8,
            ease: "power2.out"
          });
        }
      });
    }
  });

  // Анимация при наведении мышью
  jellyObject.addEventListener('mouseenter', () => {
    gsap.to(jellyObject, {
      scale: 1.1,
      rotation: -3,
      duration: 0.4,
      ease: "power2.out"
    });
  });

  jellyObject.addEventListener('mouseleave', () => {
    gsap.to(jellyObject, {
      scale: 1,
      rotation: 0,
      duration: 0.4,
      ease: "power2.out"
    });
  });

  // Параллакс эффект при движении мыши
  document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) / 50;
    const moveY = (e.clientY - window.innerHeight / 2) / 50;
    gsap.to(jellyObject, {
      x: moveX,
      y: moveY,
      duration: 0.5,
      ease: "power2.out"
    });
  });
}

// --- INTELLIGENT JELLY MOUSE POINTER ---
const cursor = document.getElementById('jelly-pointer');
if (cursor && window.innerWidth > 768) {
  window.addEventListener('mousemove', (e) => {
      gsap.to(cursor, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power2.out"
      });
  });
}

// --- GSAP KINETIC INTERACTION ARENA SYSTEM ---
// Rejestracja rozszerzenia ScrollTrigger w silniku głównym
gsap.registerPlugin(ScrollTrigger);

// Budowa osi czasu dla sekwencji scrollowania - работает на всех устройствах
const arenaTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: ".visual-scroller-arena",
        start: "top top",
        end: window.innerWidth > 768 ? "+=180%" : "+=120%",
        pin: true,     // Przyklejenie ekranu na czas animации
        scrub: 1,      // Płynna interpolacja z ruchem palca/myszki
    }
});

arenaTimeline
    // 1. Rozsuwanie napisów tytułowych w osi poziomej X
    .to(".text-part-left", { x: window.innerWidth > 768 ? "-50vw" : "-30vw", opacity: 0, ease: "power2.inOut" }, 0)
    .to(".text-part-right", { x: window.innerWidth > 768 ? "50vw" : "30vw", opacity: 0, ease: "power2.inOut" }, 0)
    .to(".jelly-subtitle", { opacity: 0, y: -20, ease: "power2.inOut" }, 0)

    // 2. Wprowadzenie i aktywacja kontenera z Dumplingiem
    .to(".jelly-viewport-stage", { opacity: 1, ease: "power2.out" }, 0.1)
    .fromTo("#jelly-core-object",
        { scale: 0.2, rotation: -25, y: 300 },
        { scale: 1, rotation: 0, y: 0, ease: "back.out(1.1)" },
        0.15
    )

    // 3. Розблеск и выезд стрелочек позиционирующих с характеристиками продукта
    .to(".squish-pointer", {
        opacity: 1,
        scale: 1,
        stagger: 0.08,
        ease: "back.out(1.4)"
    }, 0.45)

    // 4. Показание карты ASMR и заполнение полосы давления под объектом
    .to("#crush-zone-overlay", { bottom: "4%", opacity: 1, ease: "power2.out" }, 0.6)
    .to("#pressure-fill", { width: "100%", ease: "none" }, 0.8)

    // 5. Анимация сжатия дамплинга во время скролла
    .to("#jelly-core-object", {
        scale: 0.85,
        scaleX: 1.15,
        scaleY: 0.75,
        rotation: 3,
        ease: "power2.inOut"
    }, 0.7)
      .to("#jelly-core-object", {
          scale: 1,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          ease: "elastic.out(1, 0.5)"
      }, 0.9);

// --- CONFETTI EFFECT FOR MYSTERY BOX ---
function createConfetti() {
  const colors = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700', '#ff6b6b'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(confetti);
    
    gsap.to(confetti, {
      y: window.innerHeight + 20,
      x: (Math.random() - 0.5) * 200,
      rotation: Math.random() * 720,
      duration: Math.random() * 2 + 1,
      ease: "power1.out",
      onComplete: () => confetti.remove()
    });
  }
}

// --- SHOPPING BAG CONTROLLER ---
const cartTrigger = document.getElementById('cart-trigger');
const cartPanel = document.getElementById('jelly-cart');
const cartCloseBtn = document.getElementById('cart-close-btn');
const buyButtons = document.querySelectorAll('.jelly-buy-btn');
const bagCount = document.getElementById('bag-count');
const cartItemsFlow = document.getElementById('jelly-cart-items');
const totalPriceEl = document.getElementById('jelly-total-price');

let cart = JSON.parse(localStorage.getItem('jellyCart')) || [];

// Initialize cart on page load
updateCartLayout();

buyButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));

      cart.push({ name, price });
      updateCartLayout();

      // Enhanced button animation
      gsap.to(btn, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });

      // Cart bounce animation
      gsap.fromTo("#cart-trigger",
        { scale: 0.6, rotation: -20 },
        { scale: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" }
      );
      
      // Update cart count display
      if (bagCount) {
          bagCount.textContent = cart.length;
      }

      // Small particle explosion
      createButtonParticles(btn);
  });
});

function createButtonParticles(btn) {
  const rect = btn.getBoundingClientRect();
  const colors = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700'];

  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(particle);

    const angle = (Math.PI * 2 * i) / 8;
    const distance = 50 + Math.random() * 30;

    gsap.to(particle, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      scale: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => particle.remove()
    });
  }
}

// --- SCROLL ANIMATIONS FOR NEW SECTIONS ---
// Desktop animations
if (window.innerWidth > 768) {
  // Product cards animation (all sections)
  gsap.from(".jelly-product-card", {
    scrollTrigger: {
      trigger: ".catalog-jelly-section",
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse"
    },
    y: 60,
    opacity: 0,
    stagger: 0.15,
    duration: 0.7,
    ease: "power3.out"
  });

  // Section titles animation
  gsap.from(".catalog-jelly-title", {
    scrollTrigger: {
      trigger: ".catalog-jelly-title",
      start: "top 85%",
      toggleActions: "play none none reverse"
    },
    y: 40,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out"
  });

  // Interactive ending animation
  gsap.from(".interactive-ending", {
    scrollTrigger: {
      trigger: ".interactive-ending",
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse"
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
  });
} else {
  // Mobile animations - simpler and more performant
  gsap.from(".jelly-product-card", {
    scrollTrigger: {
      trigger: ".catalog-jelly-section",
      start: "top 85%",
      toggleActions: "play none none reverse"
    },
    y: 40,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    ease: "power2.out"
  });

  gsap.from(".interactive-squishy", {
    scrollTrigger: {
      trigger: ".catalog-jelly-section",
      start: "top 85%",
      toggleActions: "play none none reverse"
    },
    y: 40,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    ease: "power2.out"
  });

  gsap.from(".interactive-squishy", {
    scrollTrigger: {
      trigger: ".interactive-ending",
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    scale: 0.5,
    opacity: 0,
    duration: 0.6,
    ease: "back.out(1.5)"
  });
}

// --- INTERACTIVE PRODUCT CARDS ---
const productCards = document.querySelectorAll('.jelly-product-card');
productCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    gsap.to(card.querySelector('.prod-img'), {
      scale: 1.2,
      rotation: 10,
      duration: 0.4,
      ease: "power2.out"
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card.querySelector('.prod-img'), {
      scale: 1,
      rotation: 0,
      duration: 0.4,
      ease: "power2.out"
    });
  });
});

// --- INTERACTIVE ENDING SQUISHY ---
const interactiveDumpling = document.getElementById('interactive-dumpling');
const squishCountEl = document.getElementById('squish-count');
let squishCount = 0;

if (interactiveDumpling && squishCountEl) {
  interactiveDumpling.addEventListener('click', () => {
    squishCount++;
    squishCountEl.textContent = squishCount;

    // Squish animation
    gsap.to(interactiveDumpling, {
      scale: 0.7,
      scaleX: 1.3,
      scaleY: 0.6,
      rotation: Math.random() * 20 - 10,
      duration: 0.1,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(interactiveDumpling, {
          scale: 1,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.4)"
        });
      }
    });

    // Create particles
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700'][Math.floor(Math.random() * 4)]};
        border-radius: 50%;
        left: ${interactiveDumpling.getBoundingClientRect().left + interactiveDumpling.offsetWidth / 2}px;
        top: ${interactiveDumpling.getBoundingClientRect().top + interactiveDumpling.offsetHeight / 2}px;
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(particle);

      const angle = (Math.PI * 2 * i) / 5;
      gsap.to(particle, {
        x: Math.cos(angle) * 80,
        y: Math.sin(angle) * 80,
        opacity: 0,
        scale: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => particle.remove()
      });
    }

    // Milestone celebrations
    if (squishCount === 10) {
      createConfetti();
      setTimeout(() => alert('🎉 Świetnie! Ścisnąłeś gniotka 10 razy!'), 100);
    } else if (squishCount === 50) {
      createConfetti();
      setTimeout(() => alert('🏆 Wow! 50 ścisknięć! Jesteś mistrzem!'), 100);
    } else if (squishCount === 100) {
      createConfetti();
      setTimeout(() => alert('👑 LEGENDA! 100 ścisknięć!'), 100);
    }
  });
}

function updateCartLayout() {
  if (!bagCount || !cartItemsFlow || !totalPriceEl) return;
  
  bagCount.textContent = cart.length;
  
  // Save to localStorage
  localStorage.setItem('jellyCart', JSON.stringify(cart));
  
  if (cart.length === 0) {
      cartItemsFlow.innerHTML = `<p style="text-align:center; color:#8c767a; margin-top:40px;">Twój koszyk jest pusty.</p>`;
      totalPriceEl.textContent = '0,00 PLN';
      return;
  }
  
  cartItemsFlow.innerHTML = '';
  let total = 0;
  
  cart.forEach(item => {
      total += item.price;
      const row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML = `<span>${item.name}</span><strong>${item.price.toFixed(2)} PLN</strong>`;
      cartItemsFlow.appendChild(row);
  });
  
  totalPriceEl.textContent = `${total.toFixed(2)} PLN`;
}

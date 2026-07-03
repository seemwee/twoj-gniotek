// Inicjalizacja ikon w całym dokumencie
if (window.lucide) {
  lucide.createIcons();
}

// Проверка на мобильное устройство (чтобы не вешать лишние слушатели)
const isMobile = window.innerWidth <= 768;

// --- GLOBAL SHOPPING BAG STATE ---
let cart = JSON.parse(localStorage.getItem('jellyCart')) || [];

// --- FLOATING PARTICLES BACKGROUND ---
function createFloatingParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  // На мобилках уменьшаем количество частиц до 4 для экономии батареи и CPU
  const particleCount = isMobile ? 4 : 8; 
  const colors = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700', '#ff6b6b'];
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 6 + 4}px;
      height: ${Math.random() * 6 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-delay: ${Math.random() * 5}s;
      animation-duration: ${Math.random() * 6 + 8}s;
    `;
    fragment.appendChild(particle);
  }
  container.appendChild(fragment);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingParticles);
} else {
  setTimeout(createFloatingParticles, 200);
}

// --- SQUISHY SQUEEZE ANIMATION ---
document.addEventListener("DOMContentLoaded", () => {
  const jellyObject = document.getElementById('jelly-core-object');
  if (jellyObject) {
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

      const pressureFill = document.getElementById('pressure-fill');
      if (pressureFill) {
        // ОПТИМИЗАЦИЯ: Вместо width анимируем scaleX (работает через GPU)
        gsap.to(pressureFill, {
          scaleX: 1,
          transformOrigin: "left center",
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(pressureFill, {
              scaleX: 0.3,
              duration: 0.8,
              ease: "power2.out"
            });
          }
        });
      }
    });

    // На мобильных hover-эффекты не нужны и вызывают баги
    if (!isMobile) {
      jellyObject.addEventListener('mouseenter', () => {
        gsap.to(jellyObject, { scale: 1.1, rotation: -3, duration: 0.4, ease: "power2.out" });
      });

      jellyObject.addEventListener('mouseleave', () => {
        gsap.to(jellyObject, { scale: 1, rotation: 0, duration: 0.4, ease: "power2.out" });
      });

      // Мышь отслеживаем ТОЛЬКО на десктопе
      let ticking = false;
      document.addEventListener('mousemove', (e) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const moveX = (e.clientX - window.innerWidth / 2) / 50;
            const moveY = (e.clientY - window.innerHeight / 2) / 50;
            gsap.to(jellyObject, { x: moveX, y: moveY, duration: 0.5, ease: "power2.out" });
            ticking = false;
          });
          ticking = true;
        }
      });
    }
  }
});

// --- INTELLIGENT JELLY MOUSE POINTER ---
const cursor = document.getElementById('jelly-pointer');
if (cursor && !isMobile) { // Полностью отключаем на мобилках
  let cursorTicking = false;
  window.addEventListener('mousemove', (e) => {
    if (!cursorTicking) {
      window.requestAnimationFrame(() => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
        cursorTicking = false;
      });
      cursorTicking = true;
    }
  });
}

// --- GSAP KINETIC INTERACTION ARENA SYSTEM ---
if (document.querySelector(".visual-scroller-arena")) {
  gsap.registerPlugin(ScrollTrigger);

  const arenaTimeline = gsap.timeline({
      scrollTrigger: {
          trigger: ".visual-scroller-arena",
          start: "top top",
          end: isMobile ? "+=120%" : "+=180%",
          pin: true,     
          scrub: 1,
          invalidateOnRefresh: true // Пересчитывает координаты при смене ориентации экрана
      }
  });

  arenaTimeline
      .to(".text-part-left", { x: isMobile ? "-30vw" : "-50vw", opacity: 0, ease: "power2.inOut" }, 0)
      .to(".text-part-right", { x: isMobile ? "30vw" : "50vw", opacity: 0, ease: "power2.inOut" }, 0)
      .to(".jelly-subtitle", { opacity: 0, y: -20, ease: "power2.inOut" }, 0)
      .to(".jelly-viewport-stage", { opacity: 1, ease: "power2.out" }, 0.1)
      .fromTo("#jelly-core-object",
          { scale: 0.2, rotation: -25, y: 300 },
          { scale: 1, rotation: 0, y: 0, ease: "back.out(1.1)" },
          0.15
      )
      .to(".squish-pointer", {
          opacity: 1,
          scale: 1,
          stagger: isMobile ? 0.04 : 0.08, // Быстрее на мобилках
          ease: "back.out(1.4)"
      }, 0.45)
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

  // ОПТИМИЗАЦИЯ: Вместо анимирования свойства "bottom", используйте yPercent или y (выносит в GPU)
  if (document.getElementById("crush-zone-overlay")) {
      arenaTimeline.to("#crush-zone-overlay", { y: "-10%", opacity: 1, ease: "power2.out" }, 0.6);
  }

  // ОПТИМИЗАЦИЯ: Вместо width -> scaleX
  if (document.getElementById("pressure-fill")) {
      gsap.set("#pressure-fill", { transformOrigin: "left center" });
      arenaTimeline.to("#pressure-fill", { scaleX: 1, ease: "none" }, 0.8);
  }
}

// --- CONFETTI EFFECT FOR MYSTERY BOX ---
function createConfetti() {
  const colors = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700', '#ff6b6b'];
  const confettiCount = isMobile ? 12 : 30; // Ещё сильнее урезаем на мобилках
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -20px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      z-index: 1000;
      pointer-events: none;
    `;
    document.body.appendChild(confetti);
    
    gsap.to(confetti, {
      y: window.innerHeight + 20,
      x: (Math.random() - 0.5) * 150,
      rotation: Math.random() * 360,
      duration: Math.random() * 1.5 + 1,
      ease: "power1.out",
      onComplete: () => confetti.remove()
    });
  }
}

// --- SHOPPING BAG CONTROLLER ---
const buyButtons = document.querySelectorAll('.jelly-buy-btn');
buyButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));
      const img = btn.getAttribute('data-img') || ''; 

      cart.push({ name, price, img }); 
      updateCartLayout();

      gsap.to(btn, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" });

      if (document.getElementById('cart-trigger')) {
        gsap.fromTo("#cart-trigger",
          { scale: 0.6, rotation: -20 },
          { scale: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" }
        );
      }
      if (!isMobile) createButtonParticles(btn); // Частицы при клике только для десктопа
  });
});

function createButtonParticles(btn) {
  const rect = btn.getBoundingClientRect();
  const colors = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700'];

  for (let i = 0; i < 6; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: 6px;
      height: 6px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(particle);

    const angle = (Math.PI * 2 * i) / 6;
    const distance = 40 + Math.random() * 20;

    gsap.to(particle, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      scale: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => particle.remove()
    });
  }
}

function updateCartLayout() {
  const bagCount = document.getElementById('bag-count');
  const cartItemsFlow = document.getElementById('jelly-cart-items') || document.getElementById('checkout-cart-items');
  const totalPriceEl = document.getElementById('jelly-total-price') || document.getElementById('checkout-total-price');

  localStorage.setItem('jellyCart', JSON.stringify(cart));
  if (bagCount) bagCount.textContent = cart.length;
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
      const isCheckout = !!document.getElementById('checkout-cart-items');
      row.className = isCheckout ? 'checkout-cart-item' : 'cart-item-row';
      
      const imgTag = item.img ? `<img src="${item.img}" alt="${item.name}" class="cart-item-img">` : '<div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;background:#fff;border-radius:8px;">📦</div>';
      const actionButton = isCheckout ? `<button class="checkout-remove-btn" data-index="${index}">✕</button>` : '';

      row.innerHTML = `
        <div class="cart-item-info">
            ${imgTag}
            <div class="checkout-item-info">
                <span class="checkout-item-name">${item.name}</span>
                ${isCheckout ? `<span class="checkout-item-price">${item.price.toFixed(2)} PLN</span>` : ''}
            </div>
        </div>
        ${isCheckout ? actionButton : `<strong>${item.price.toFixed(2)} PLN</strong>`}
      `;
      cartItemsFlow.appendChild(row);
  });
  
  if (totalPriceEl) totalPriceEl.textContent = `${total.toFixed(2)} PLN`;

  document.querySelectorAll('.checkout-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
          const index = parseInt(btn.getAttribute('data-index'));
          cart.splice(index, 1);
          updateCartLayout();
      });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartLayout();
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

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
          e.preventDefault();
          alert('🎉 Zamówienie złożone! Dziękujemy za zakup!');
          cart = [];
          localStorage.setItem('jellyCart', JSON.stringify(cart));
          window.location.href = 'index.html';
      });
  }
});

// --- SCROLL ANIMATIONS FOR NEW SECTIONS ---
// Инициализируем анимации карточек сразу, полагаясь на мощь ScrollTrigger вместо setTimeout
if (document.querySelector(".catalog-jelly-section") || document.querySelector(".interactive-ending")) {
  const productCards = document.querySelectorAll(".jelly-product-card");
  const catalogSection = document.querySelector(".catalog-jelly-section");
  
  if (!isMobile && productCards.length > 0 && catalogSection) {
    gsap.from(".jelly-product-card", {
      scrollTrigger: {
        trigger: ".catalog-jelly-section",
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      y: 60,
      opacity: 0,
      stagger: 0.1,
      duration: 0.4,
      ease: "power3.out"
    });
  } else if (isMobile && productCards.length > 0 && catalogSection) {
    gsap.from(".jelly-product-card", {
      scrollTrigger: {
        trigger: ".catalog-jelly-section",
        start: "top 90%",
        toggleActions: "play none none reverse"
      },
      y: 30,
      opacity: 0,
      stagger: 0.05,
      duration: 0.3,
      ease: "power2.out"
    });
  }
}

// --- INTERACTIVE PRODUCT CARDS (Desktop only) ---
if (!isMobile) {
  document.querySelectorAll('.jelly-product-card').forEach(card => {
    const img = card.querySelector('.prod-img');
    if (img) {
      card.addEventListener('mouseenter', () => gsap.to(img, { scale: 1.2, rotation: 10, duration: 0.4, ease: "power2.out" }));
      card.addEventListener('mouseleave', () => gsap.to(img, { scale: 1, rotation: 0, duration: 0.4, ease: "power2.out" }));
    }
  });
}

// --- INTERACTIVE ENDING SQUISHY ---
const interactiveDumpling = document.getElementById('interactive-dumpling');
const squishCountEl = document.getElementById('squish-count');
let squishCount = 0;

if (interactiveDumpling && squishCountEl) {
  interactiveDumpling.addEventListener('click', () => {
    squishCount++;
    squishCountEl.textContent = squishCount;

    gsap.to(interactiveDumpling, {
      scale: 0.7,
      scaleX: 1.3,
      scaleY: 0.6,
      rotation: Math.random() * 20 - 10,
      duration: 0.1,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(interactiveDumpling, { scale: 1, scaleX: 1, scaleY: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      }
    });

    if (squishCount === 10 || squishCount === 50 || squishCount === 100) {
      createConfetti();
    }
  });
}

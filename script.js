initLucideIcons();

// --- GLOBAL SHOPPING BAG STATE ---
let cart = JSON.parse(localStorage.getItem('jellyCart')) || [];

// --- FLOATING PARTICLES BACKGROUND ---
function createFloatingParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const particleCount = 15; // Reduced from 20 for better performance
  const colors = JELLY_COLORS;
  const fragment = document.createDocumentFragment();

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
    fragment.appendChild(particle);
  }
  container.appendChild(fragment);
}
createFloatingParticles();

// --- SQUISHY SQUEEZE ANIMATION ---
const jellyObject = document.getElementById('jelly-core-object');
if (jellyObject) {
  jellyObject.addEventListener('click', () => {
    squishElement(jellyObject, {
      squishScale: 0.6,
      stretchX: 1.4,
      stretchY: 0.5,
      rotationRange: 20,
      squishDuration: 0.12,
      bounceDuration: 0.6,
      elasticity: 0.3,
    });

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

  setupHoverAnimation(jellyObject, jellyObject, { hoverScale: 1.1, hoverRotation: -3 });

  // Оптимизация: используем requestAnimationFrame для mousemove
  let ticking = false;
  document.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const moveX = (e.clientX - window.innerWidth / 2) / 50;
        const moveY = (e.clientY - window.innerHeight / 2) / 50;
        gsap.to(jellyObject, {
          x: moveX,
          y: moveY,
          duration: 0.5,
          ease: "power2.out"
        });
        ticking = false;
      });
      ticking = true;
    }
  });
}

// --- INTELLIGENT JELLY MOUSE POINTER ---
const cursor = document.getElementById('jelly-pointer');
if (cursor && window.innerWidth > 768) {
  let cursorTicking = false;
  window.addEventListener('mousemove', (e) => {
    if (!cursorTicking) {
      window.requestAnimationFrame(() => {
        gsap.to(cursor, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power2.out"
        });
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
          end: window.innerWidth > 768 ? "+=180%" : "+=120%",
          pin: true,     
          scrub: 1,      
      }
  });

  arenaTimeline
      .to(".text-part-left", { x: window.innerWidth > 768 ? "-50vw" : "-30vw", opacity: 0, ease: "power2.inOut" }, 0)
      .to(".text-part-right", { x: window.innerWidth > 768 ? "50vw" : "30vw", opacity: 0, ease: "power2.inOut" }, 0)
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
          stagger: 0.08,
          ease: "back.out(1.4)"
      }, 0.45)
      .to("#crush-zone-overlay", { bottom: "4%", opacity: 1, ease: "power2.out" }, 0.6)
      .to("#pressure-fill", { width: "100%", ease: "none" }, 0.8)
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
}

// --- CONFETTI EFFECT FOR MYSTERY BOX ---
function createConfetti() {
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    const size = Math.random() * 10 + 5;
    const el = createParticleElement({
      x: 0,
      y: 0,
      size,
      color: randomFrom(JELLY_COLORS),
      extraStyles: `
        left: ${Math.random() * 100}vw;
        top: -20px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      `,
    });

    gsap.to(el, {
      y: window.innerHeight + 20,
      x: (Math.random() - 0.5) * 200,
      rotation: Math.random() * 720,
      duration: Math.random() * 2 + 1,
      ease: 'power1.out',
      onComplete: () => el.remove(),
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

      gsap.to(btn, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });

      if (document.getElementById('cart-trigger')) {
        gsap.fromTo("#cart-trigger",
          { scale: 0.6, rotation: -20 },
          { scale: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" }
        );
      }

      createButtonParticles(btn);
  });
});

function createButtonParticles(btn) {
  const rect = btn.getBoundingClientRect();
  spawnParticleBurst({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    count: 8,
    spread: 50,
  });
}

// --- СВЕРХ-УНИВЕРСАЛЬНАЯ ФУНКЦИЯ КОРЗИНЫ (РАБОТАЕТ НА ВСЕХ СТРАНИЦАХ) ---
function updateCartLayout() {
  const bagCount = document.getElementById('bag-count');
  const cartItemsFlow = document.getElementById('jelly-cart-items') || document.getElementById('checkout-cart-items');
  const totalPriceEl = document.getElementById('jelly-total-price') || document.getElementById('checkout-total-price');

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
      
      // Настраиваем разные классы строк для адаптива корзины
      const isCheckout = !!document.getElementById('checkout-cart-items');
      row.className = isCheckout ? 'checkout-cart-item' : 'cart-item-row';
      
      const imgTag = item.img ? `<img src="${item.img}" alt="${item.name}" class="cart-item-img">` : '<div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;background:#fff;border-radius:8px;">📦</div>';

      // Если мы на странице оформления заказа — добавляем кнопку удаления товара (крестик)
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
  
  if (totalPriceEl) {
      totalPriceEl.textContent = `${total.toFixed(2)} PLN`;
  }

  // Навешиваем обработчики удаления товара для чекаута
  const removeButtons = document.querySelectorAll('.checkout-remove-btn');
  removeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
          const index = parseInt(btn.getAttribute('data-index'));
          cart.splice(index, 1);
          updateCartLayout();
      });
  });
}

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
  updateCartLayout();

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
if (document.querySelector(".catalog-jelly-section") || document.querySelector(".interactive-ending")) {
  if (window.innerWidth > 768) {
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
}

// --- INTERACTIVE PRODUCT CARDS ---
const productCards = document.querySelectorAll('.jelly-product-card');
productCards.forEach(card => {
  const img = card.querySelector('.prod-img');
  if (img) {
    setupHoverAnimation(card, img, { hoverScale: 1.2, hoverRotation: 10 });
  }
});

// --- INTERACTIVE ENDING SQUISHY ---
const interactiveDumpling = document.getElementById('interactive-dumpling');
const squishCountEl = document.getElementById('squish-count');
let squishCount = 0;

if (interactiveDumpling && squishCountEl) {
  interactiveDumpling.addEventListener('click', () => {
    squishCount++;
    squishCountEl.textContent = squishCount;

    squishElement(interactiveDumpling, {
      squishScale: 0.7,
      stretchX: 1.3,
      stretchY: 0.6,
      rotationRange: 20,
      squishDuration: 0.1,
      bounceDuration: 0.5,
      elasticity: 0.4,
    });

    const dRect = interactiveDumpling.getBoundingClientRect();
    spawnParticleBurst({
      x: dRect.left + interactiveDumpling.offsetWidth / 2,
      y: dRect.top + interactiveDumpling.offsetHeight / 2,
      count: 5,
      size: 10,
      spread: 80,
    });

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

//

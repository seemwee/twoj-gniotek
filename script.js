// Inicjalizacja ikon w całym dokumencie
if (window.lucide) {
  lucide.createIcons();
}

// --- GLOBAL SHOPPING BAG STATE ---
let cart = JSON.parse(localStorage.getItem('jellyCart')) || [];

// --- FLOATING PARTICLES BACKGROUND ---
function createFloatingParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  // Reduced particle count for better performance
  const particleCount = 8; 
  const colors = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700', '#ff6b6b'];
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-delay: ${Math.random() * 10}s;
      animation-duration: ${Math.random() * 8 + 8}s;
    `;
    fragment.appendChild(particle);
  }
  container.appendChild(fragment);
}

// Defer particle creation for better initial load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingParticles);
} else {
  setTimeout(createFloatingParticles, 100);
}

// --- SQUISHY SQUEEZE ANIMATION ---
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
  const colors = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700', '#ff6b6b'];
  const confettiCount = 30; // Reduced from 50 for mobile performance
  
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
      z-index: 1000;
      pointer-events: none;
      touch-action: none;
    `;
    document.body.appendChild(confetti);
    
    gsap.to(confetti, {
      y: window.innerHeight + 20,
      x: (Math.random() - 0.5) * 200,
      rotation: Math.random() * 720,
      duration: Math.random() * 2 + 1,
      ease: "power1.out",
      onComplete: () => {
        confetti.remove();
      }
    });
  }
  
  // Force cleanup after 5 seconds to prevent blocking
  setTimeout(() => {
    const allConfetti = document.querySelectorAll('[style*="position: fixed"]');
    allConfetti.forEach(el => {
      if (el.style.zIndex === '1000' || el.style.zIndex === '9999') {
        el.remove();
      }
    });
  }, 5000);
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
// Defer scroll animations to prevent blocking initial scroll
setTimeout(() => {
  if (document.querySelector(".catalog-jelly-section") || document.querySelector(".interactive-ending")) {
    const productCards = document.querySelectorAll(".jelly-product-card");
    const catalogSection = document.querySelector(".catalog-jelly-section");
    
    if (window.innerWidth > 768 && productCards.length > 0 && catalogSection) {
      gsap.from(".jelly-product-card", {
        scrollTrigger: {
          trigger: ".catalog-jelly-section",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        },
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 0.4,
        ease: "power3.out"
      });

      const catalogTitle = document.querySelector(".catalog-jelly-title");
      if (catalogTitle) {
        gsap.from(".catalog-jelly-title", {
          scrollTrigger: {
            trigger: ".catalog-jelly-title",
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          y: 40,
          opacity: 0,
          duration: 0.3,
          ease: "power3.out"
        });
      }

      const interactiveEnding = document.querySelector(".interactive-ending");
      if (interactiveEnding) {
        gsap.from(".interactive-ending", {
          scrollTrigger: {
            trigger: ".interactive-ending",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          },
          y: 50,
          opacity: 0,
          duration: 0.4,
          ease: "power3.out"
        });
      }
    } else {
      if (productCards.length > 0 && catalogSection) {
        gsap.from(".jelly-product-card", {
          scrollTrigger: {
            trigger: ".catalog-jelly-section",
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          y: 40,
          opacity: 0,
          stagger: 0.05,
          duration: 0.3,
          ease: "power2.out"
        });
      }

      const interactiveSquishy = document.querySelector(".interactive-squishy");
      if (interactiveSquishy && catalogSection) {
        gsap.from(".interactive-squishy", {
          scrollTrigger: {
            trigger: ".catalog-jelly-section",
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          y: 40,
          opacity: 0,
          stagger: 0.05,
          duration: 0.3,
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
          duration: 0.3,
          ease: "back.out(1.5)"
        });
      }
    }
  }
}, 500);

// --- INTERACTIVE PRODUCT CARDS ---
const interactiveProductCards = document.querySelectorAll('.jelly-product-card');
interactiveProductCards.forEach(card => {
  const img = card.querySelector('.prod-img');
  if (img) {
    card.addEventListener('mouseenter', () => {
      gsap.to(img, {
        scale: 1.2,
        rotation: 10,
        duration: 0.4,
        ease: "power2.out"
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(img, {
        scale: 1,
        rotation: 0,
        duration: 0.4,
        ease: "power2.out"
      });
    });
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

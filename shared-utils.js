// --- SHARED CONSTANTS & UTILITIES ---

const JELLY_COLORS = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700', '#ff6b6b'];
const JELLY_COLORS_SHORT = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700'];

function initLucideIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generic fixed-position particle element factory
function createParticleElement({ x, y, size, color, extraStyles }) {
  const el = document.createElement('div');
  const base = `
    position: fixed;
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    border-radius: 50%;
    left: ${x}px;
    top: ${y}px;
    z-index: 9999;
    pointer-events: none;
  `;
  el.style.cssText = extraStyles ? base + extraStyles : base;
  document.body.appendChild(el);
  return el;
}

// Radial burst of particles from a point (used by buy-button and squish interactions)
function spawnParticleBurst({ x, y, count, colors, size, spread }) {
  colors = colors || JELLY_COLORS_SHORT;
  size = size || 8;
  spread = spread || 60;

  for (let i = 0; i < count; i++) {
    const el = createParticleElement({ x, y, size, color: randomFrom(colors) });
    const angle = (Math.PI * 2 * i) / count;
    const dist = spread + Math.random() * (spread * 0.5);

    gsap.to(el, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      opacity: 0,
      scale: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => el.remove(),
    });
  }
}

// Squish-and-bounce-back animation for any element
function squishElement(
  element,
  { squishScale, stretchX, stretchY, rotationRange, squishDuration, bounceDuration, elasticity }
) {
  squishScale = squishScale || 0.7;
  stretchX = stretchX || 1.3;
  stretchY = stretchY || 0.6;
  rotationRange = rotationRange || 20;
  squishDuration = squishDuration || 0.1;
  bounceDuration = bounceDuration || 0.5;
  elasticity = elasticity || 0.4;

  gsap.to(element, {
    scale: squishScale,
    scaleX: stretchX,
    scaleY: stretchY,
    rotation: Math.random() * rotationRange - rotationRange / 2,
    duration: squishDuration,
    ease: 'power2.out',
    onComplete: () => {
      gsap.to(element, {
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        duration: bounceDuration,
        ease: `elastic.out(1, ${elasticity})`,
      });
    },
  });
}

// Hover scale/rotation animation for any element pair
function setupHoverAnimation(triggerEl, targetEl, { hoverScale, hoverRotation, duration }) {
  hoverScale = hoverScale || 1.1;
  hoverRotation = hoverRotation || 0;
  duration = duration || 0.4;

  triggerEl.addEventListener('mouseenter', () => {
    gsap.to(targetEl, {
      scale: hoverScale,
      rotation: hoverRotation,
      duration,
      ease: 'power2.out',
    });
  });

  triggerEl.addEventListener('mouseleave', () => {
    gsap.to(targetEl, {
      scale: 1,
      rotation: 0,
      duration,
      ease: 'power2.out',
    });
  });
}

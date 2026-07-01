/**
 * Particles & confetti utility module.
 * Provides pure-logic helpers for particle/confetti generation
 * that can be tested without a real DOM or GSAP.
 */

const DEFAULT_COLORS = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700', '#ff6b6b'];
const BUTTON_PARTICLE_COLORS = ['#ff8fa3', '#ff4d6d', '#93e1d8', '#ffd700'];

/**
 * Generate particle style properties for floating background particles.
 * @param {number} count - number of particles
 * @param {string[]} colors - color palette
 * @returns {Array<{left: string, width: string, height: string, background: string, animationDelay: string, animationDuration: string}>}
 */
function generateParticleStyles(count, colors = DEFAULT_COLORS) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 10 + 5;
    particles.push({
      left: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: colors[Math.floor(Math.random() * colors.length)],
      animationDelay: `${Math.random() * 15}s`,
      animationDuration: `${Math.random() * 10 + 10}s`,
    });
  }
  return particles;
}

/**
 * Generate confetti style properties.
 * @param {number} count - number of confetti pieces
 * @param {string[]} colors - color palette
 * @returns {Array<{width: string, height: string, background: string, left: string, borderRadius: string}>}
 */
function generateConfettiStyles(count, colors = DEFAULT_COLORS) {
  const pieces = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      width: `${Math.random() * 10 + 5}px`,
      height: `${Math.random() * 10 + 5}px`,
      background: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}vw`,
      borderRadius: Math.random() > 0.5 ? '50%' : '0',
    });
  }
  return pieces;
}

/**
 * Calculate positions for button particles arranged in a circle.
 * @param {number} count - number of particles
 * @param {{x: number, y: number}} center - center position
 * @param {number} baseDistance - base distance from center
 * @returns {Array<{angle: number, x: number, y: number, color: string}>}
 */
function calculateButtonParticlePositions(count, center, baseDistance = 50) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const distance = baseDistance + Math.random() * 30;
    positions.push({
      angle,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      color: BUTTON_PARTICLE_COLORS[Math.floor(Math.random() * BUTTON_PARTICLE_COLORS.length)],
    });
  }
  return positions;
}

/**
 * Determine squish milestone message based on count.
 * @param {number} count - current squish count
 * @returns {string|null} message to show, or null if no milestone
 */
function getSquishMilestoneMessage(count) {
  if (count === 10) return '\uD83C\uDF89 \u015Awietnie! \u015Acisn\u0105\u0142e\u015B gniotka 10 razy!';
  if (count === 50) return '\uD83C\uDFC6 Wow! 50 \u015Bci\u015Bkni\u0119\u0107! Jeste\u015B mistrzem!';
  if (count === 100) return '\uD83D\uDC51 LEGENDA! 100 \u015Bci\u015Bkni\u0119\u0107!';
  return null;
}

module.exports = {
  DEFAULT_COLORS,
  BUTTON_PARTICLE_COLORS,
  generateParticleStyles,
  generateConfettiStyles,
  calculateButtonParticlePositions,
  getSquishMilestoneMessage,
};

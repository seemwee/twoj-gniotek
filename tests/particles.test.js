const {
  DEFAULT_COLORS,
  BUTTON_PARTICLE_COLORS,
  generateParticleStyles,
  generateConfettiStyles,
  calculateButtonParticlePositions,
  getSquishMilestoneMessage,
} = require('../src/particles');

describe('Particles Module', () => {
  describe('DEFAULT_COLORS', () => {
    it('should have 5 colors', () => {
      expect(DEFAULT_COLORS).toHaveLength(5);
    });

    it('should contain valid hex color codes', () => {
      DEFAULT_COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('BUTTON_PARTICLE_COLORS', () => {
    it('should have 4 colors', () => {
      expect(BUTTON_PARTICLE_COLORS).toHaveLength(4);
    });
  });

  describe('generateParticleStyles', () => {
    it('should generate the requested number of particles', () => {
      const result = generateParticleStyles(20);
      expect(result).toHaveLength(20);
    });

    it('should generate zero particles when count is 0', () => {
      const result = generateParticleStyles(0);
      expect(result).toHaveLength(0);
    });

    it('should generate particles with valid left percentages', () => {
      const result = generateParticleStyles(50);
      result.forEach(p => {
        const pct = parseFloat(p.left);
        expect(pct).toBeGreaterThanOrEqual(0);
        expect(pct).toBeLessThan(100);
        expect(p.left).toMatch(/^[\d.]+%$/);
      });
    });

    it('should generate particles with size between 5px and 15px', () => {
      const result = generateParticleStyles(100);
      result.forEach(p => {
        const width = parseFloat(p.width);
        const height = parseFloat(p.height);
        expect(width).toBeGreaterThanOrEqual(5);
        expect(width).toBeLessThan(15);
        expect(height).toBeGreaterThanOrEqual(5);
        expect(height).toBeLessThan(15);
      });
    });

    it('should use colors from the provided palette', () => {
      const customColors = ['#000000', '#ffffff'];
      const result = generateParticleStyles(30, customColors);
      result.forEach(p => {
        expect(customColors).toContain(p.background);
      });
    });

    it('should use default colors when no palette provided', () => {
      const result = generateParticleStyles(30);
      result.forEach(p => {
        expect(DEFAULT_COLORS).toContain(p.background);
      });
    });

    it('should have animation delay between 0s and 15s', () => {
      const result = generateParticleStyles(50);
      result.forEach(p => {
        const delay = parseFloat(p.animationDelay);
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThan(15);
      });
    });

    it('should have animation duration between 10s and 20s', () => {
      const result = generateParticleStyles(50);
      result.forEach(p => {
        const duration = parseFloat(p.animationDuration);
        expect(duration).toBeGreaterThanOrEqual(10);
        expect(duration).toBeLessThan(20);
      });
    });
  });

  describe('generateConfettiStyles', () => {
    it('should generate the requested number of confetti pieces', () => {
      const result = generateConfettiStyles(50);
      expect(result).toHaveLength(50);
    });

    it('should generate zero pieces when count is 0', () => {
      const result = generateConfettiStyles(0);
      expect(result).toHaveLength(0);
    });

    it('should produce valid left values in vw', () => {
      const result = generateConfettiStyles(30);
      result.forEach(p => {
        expect(p.left).toMatch(/^[\d.]+vw$/);
        const vw = parseFloat(p.left);
        expect(vw).toBeGreaterThanOrEqual(0);
        expect(vw).toBeLessThan(100);
      });
    });

    it('should have borderRadius of either "50%" or "0"', () => {
      const result = generateConfettiStyles(100);
      result.forEach(p => {
        expect(['50%', '0']).toContain(p.borderRadius);
      });
    });

    it('should use colors from the provided palette', () => {
      const palette = ['#ff0000', '#00ff00'];
      const result = generateConfettiStyles(20, palette);
      result.forEach(p => {
        expect(palette).toContain(p.background);
      });
    });

    it('should produce size between 5px and 15px', () => {
      const result = generateConfettiStyles(50);
      result.forEach(p => {
        const w = parseFloat(p.width);
        const h = parseFloat(p.height);
        expect(w).toBeGreaterThanOrEqual(5);
        expect(w).toBeLessThan(15);
        expect(h).toBeGreaterThanOrEqual(5);
        expect(h).toBeLessThan(15);
      });
    });
  });

  describe('calculateButtonParticlePositions', () => {
    it('should generate the correct number of positions', () => {
      const result = calculateButtonParticlePositions(8, { x: 100, y: 100 });
      expect(result).toHaveLength(8);
    });

    it('should distribute angles evenly around a circle', () => {
      const result = calculateButtonParticlePositions(4, { x: 0, y: 0 });
      const expectedAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      result.forEach((p, i) => {
        expect(p.angle).toBeCloseTo(expectedAngles[i]);
      });
    });

    it('should produce x/y offsets based on cos/sin of angle', () => {
      const result = calculateButtonParticlePositions(4, { x: 50, y: 50 }, 50);
      // First particle at angle 0: x should be positive, y ≈ 0
      expect(result[0].x).toBeGreaterThan(0);
      expect(Math.abs(result[0].y)).toBeLessThan(result[0].x);
    });

    it('should use colors from BUTTON_PARTICLE_COLORS', () => {
      const result = calculateButtonParticlePositions(20, { x: 0, y: 0 });
      result.forEach(p => {
        expect(BUTTON_PARTICLE_COLORS).toContain(p.color);
      });
    });

    it('should handle zero particles', () => {
      const result = calculateButtonParticlePositions(0, { x: 0, y: 0 });
      expect(result).toHaveLength(0);
    });
  });

  describe('getSquishMilestoneMessage', () => {
    it('should return message at 10 squishes', () => {
      const msg = getSquishMilestoneMessage(10);
      expect(msg).toContain('10 razy');
    });

    it('should return message at 50 squishes', () => {
      const msg = getSquishMilestoneMessage(50);
      expect(msg).toContain('50');
      expect(msg).toContain('mistrzem');
    });

    it('should return message at 100 squishes', () => {
      const msg = getSquishMilestoneMessage(100);
      expect(msg).toContain('LEGENDA');
      expect(msg).toContain('100');
    });

    it('should return null for non-milestone counts', () => {
      expect(getSquishMilestoneMessage(1)).toBeNull();
      expect(getSquishMilestoneMessage(9)).toBeNull();
      expect(getSquishMilestoneMessage(11)).toBeNull();
      expect(getSquishMilestoneMessage(49)).toBeNull();
      expect(getSquishMilestoneMessage(51)).toBeNull();
      expect(getSquishMilestoneMessage(99)).toBeNull();
      expect(getSquishMilestoneMessage(101)).toBeNull();
    });

    it('should return null for 0', () => {
      expect(getSquishMilestoneMessage(0)).toBeNull();
    });
  });
});

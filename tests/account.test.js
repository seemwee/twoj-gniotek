const {
  AUTH_MODES,
  AUTH_LABELS,
  validateAuthCredentials,
  getAuthButtonLabel,
  getTabState,
  formatOrderItems,
  getOrderDate,
} = require('../src/account');

describe('Account Module', () => {
  describe('AUTH_MODES', () => {
    it('should have LOGIN and REGISTER modes', () => {
      expect(AUTH_MODES.LOGIN).toBe('login');
      expect(AUTH_MODES.REGISTER).toBe('register');
    });
  });

  describe('AUTH_LABELS', () => {
    it('should have label for login mode', () => {
      expect(AUTH_LABELS.login).toBe('Zaloguj się');
    });

    it('should have label for register mode', () => {
      expect(AUTH_LABELS.register).toBe('Utwórz konto dropu');
    });
  });

  describe('validateAuthCredentials', () => {
    it('should return valid for correct email and password', () => {
      const result = validateAuthCredentials('user@example.com', 'password123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when email is empty', () => {
      const result = validateAuthCredentials('', 'password123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email jest wymagany');
    });

    it('should fail when email is only spaces', () => {
      const result = validateAuthCredentials('   ', 'password123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email jest wymagany');
    });

    it('should fail for invalid email format', () => {
      const invalidEmails = ['notanemail', 'missing@', '@nodomain', 'spaces in@email.com'];
      invalidEmails.forEach(email => {
        const result = validateAuthCredentials(email, 'password123');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Nieprawidłowy format email');
      });
    });

    it('should fail when password is empty', () => {
      const result = validateAuthCredentials('user@example.com', '');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Hasło jest wymagane');
    });

    it('should fail when password is too short', () => {
      const result = validateAuthCredentials('user@example.com', '12345');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Hasło musi mieć co najmniej 6 znaków');
    });

    it('should pass for password exactly 6 characters', () => {
      const result = validateAuthCredentials('user@example.com', '123456');
      expect(result.valid).toBe(true);
    });

    it('should collect multiple errors', () => {
      const result = validateAuthCredentials('', '');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2);
    });

    it('should handle null/undefined gracefully', () => {
      const result = validateAuthCredentials(null, undefined);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getAuthButtonLabel', () => {
    it('should return login label for login mode', () => {
      expect(getAuthButtonLabel('login')).toBe('Zaloguj się');
    });

    it('should return register label for register mode', () => {
      expect(getAuthButtonLabel('register')).toBe('Utwórz konto dropu');
    });

    it('should default to login label for unknown mode', () => {
      expect(getAuthButtonLabel('unknown')).toBe('Zaloguj się');
    });

    it('should default to login label for undefined', () => {
      expect(getAuthButtonLabel(undefined)).toBe('Zaloguj się');
    });
  });

  describe('getTabState', () => {
    it('should set loginActive true for login mode', () => {
      const state = getTabState('login');
      expect(state.loginActive).toBe(true);
      expect(state.registerActive).toBe(false);
    });

    it('should set registerActive true for register mode', () => {
      const state = getTabState('register');
      expect(state.loginActive).toBe(false);
      expect(state.registerActive).toBe(true);
    });

    it('should set both false for unknown mode', () => {
      const state = getTabState('other');
      expect(state.loginActive).toBe(false);
      expect(state.registerActive).toBe(false);
    });
  });

  describe('formatOrderItems', () => {
    it('should format a single item', () => {
      const items = [{ name: 'Pink Squishy', price: 29.99 }];
      const result = formatOrderItems(items);
      expect(result).toContain('Pink Squishy');
      expect(result).toContain('29.99 PLN');
      expect(result).toContain('\u2022');
      expect(result).toContain('<strong>');
    });

    it('should join multiple items with <br>', () => {
      const items = [
        { name: 'Item A', price: 10.00 },
        { name: 'Item B', price: 20.00 },
      ];
      const result = formatOrderItems(items);
      expect(result).toContain('<br>');
      expect(result).toContain('Item A');
      expect(result).toContain('Item B');
    });

    it('should return empty string for empty array', () => {
      expect(formatOrderItems([])).toBe('');
    });

    it('should format price with two decimal places', () => {
      const items = [{ name: 'Test', price: 5 }];
      const result = formatOrderItems(items);
      expect(result).toContain('5.00 PLN');
    });
  });

  describe('getOrderDate', () => {
    it('should return the date string when provided', () => {
      expect(getOrderDate('2024-01-15')).toBe('2024-01-15');
    });

    it('should return "Dziś" when date is null', () => {
      expect(getOrderDate(null)).toBe('Dziś');
    });

    it('should return "Dziś" when date is undefined', () => {
      expect(getOrderDate(undefined)).toBe('Dziś');
    });

    it('should return "Dziś" when date is empty string', () => {
      expect(getOrderDate('')).toBe('Dziś');
    });

    it('should preserve date format as-is', () => {
      expect(getOrderDate('15.01.2024')).toBe('15.01.2024');
    });
  });
});

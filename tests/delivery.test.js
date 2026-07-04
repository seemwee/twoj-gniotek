const {
  requiresParcelNumber,
  validateCheckoutForm,
} = require('../src/delivery');

describe('Delivery Module', () => {
  describe('requiresParcelNumber', () => {
    it('should return true for "inpost"', () => {
      expect(requiresParcelNumber('inpost')).toBe(true);
    });

    it('should return true for "orlen"', () => {
      expect(requiresParcelNumber('orlen')).toBe(true);
    });

    it('should return false for "courier"', () => {
      expect(requiresParcelNumber('courier')).toBe(false);
    });

    it('should return false for "pickup"', () => {
      expect(requiresParcelNumber('pickup')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(requiresParcelNumber('')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(requiresParcelNumber(undefined)).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(requiresParcelNumber('InPost')).toBe(false);
      expect(requiresParcelNumber('INPOST')).toBe(false);
    });
  });

  describe('validateCheckoutForm', () => {
    const validFields = {
      name: 'Jan Kowalski',
      email: 'jan@example.com',
      phone: '123456789',
      address: 'ul. Testowa 1, Warszawa',
      delivery: 'courier',
    };

    it('should return valid for complete form with courier delivery', () => {
      const result = validateCheckoutForm(validFields);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid for inpost with parcel number', () => {
      const fields = { ...validFields, delivery: 'inpost', parcelNumber: 'WAW123' };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when name is empty', () => {
      const fields = { ...validFields, name: '' };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Imię i nazwisko jest wymagane');
    });

    it('should fail when name is only whitespace', () => {
      const fields = { ...validFields, name: '   ' };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Imię i nazwisko jest wymagane');
    });

    it('should fail when email is empty', () => {
      const fields = { ...validFields, email: '' };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email jest wymagany');
    });

    it('should fail when email format is invalid', () => {
      const fields = { ...validFields, email: 'not-an-email' };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Nieprawidłowy format email');
    });

    it('should accept valid email formats', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co', 'a@b.pl'];
      validEmails.forEach(email => {
        const fields = { ...validFields, email };
        const result = validateCheckoutForm(fields);
        expect(result.valid).toBe(true);
      });
    });

    it('should fail when phone is empty', () => {
      const fields = { ...validFields, phone: '' };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Numer telefonu jest wymagany');
    });

    it('should fail when address is empty', () => {
      const fields = { ...validFields, address: '' };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Adres jest wymagany');
    });

    it('should fail when delivery is not selected', () => {
      const fields = { ...validFields, delivery: '' };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Wybierz sposób dostawy');
    });

    it('should fail when inpost is selected without parcel number', () => {
      const fields = { ...validFields, delivery: 'inpost', parcelNumber: '' };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Numer paczkomatu jest wymagany');
    });

    it('should fail when orlen is selected without parcel number', () => {
      const fields = { ...validFields, delivery: 'orlen' };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Numer paczkomatu jest wymagany');
    });

    it('should collect multiple errors', () => {
      const fields = { name: '', email: '', phone: '', address: '', delivery: '' };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(5);
    });

    it('should handle null/undefined fields gracefully', () => {
      const fields = { name: null, email: undefined, phone: null, address: undefined, delivery: null };
      const result = validateCheckoutForm(fields);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

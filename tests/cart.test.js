const {
  STORAGE_KEY,
  loadCart,
  saveCart,
  addItem,
  removeItem,
  calculateTotal,
  formatPrice,
  clearCart,
  getCartCount,
  buildCartItemHTML,
} = require('../src/cart');

// Mock localStorage
function createMockStorage(initialData = {}) {
  const store = { ...initialData };
  return {
    getItem: jest.fn((key) => store[key] ?? null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  };
}

describe('Cart Module', () => {
  describe('STORAGE_KEY', () => {
    it('should be "jellyCart"', () => {
      expect(STORAGE_KEY).toBe('jellyCart');
    });
  });

  describe('loadCart', () => {
    it('should return an empty array when storage is empty', () => {
      const storage = createMockStorage();
      expect(loadCart(storage)).toEqual([]);
    });

    it('should return an empty array when stored value is null', () => {
      const storage = createMockStorage({ jellyCart: null });
      expect(loadCart(storage)).toEqual([]);
    });

    it('should parse stored cart items', () => {
      const items = [{ name: 'Squishy', price: 29.99, img: '' }];
      const storage = createMockStorage({ jellyCart: JSON.stringify(items) });
      expect(loadCart(storage)).toEqual(items);
    });

    it('should return empty array for invalid JSON', () => {
      const storage = createMockStorage({ jellyCart: '{invalid json' });
      expect(loadCart(storage)).toEqual([]);
    });

    it('should return empty array when stored value is "null"', () => {
      const storage = createMockStorage({ jellyCart: 'null' });
      expect(loadCart(storage)).toEqual([]);
    });
  });

  describe('saveCart', () => {
    it('should save cart to storage as JSON', () => {
      const storage = createMockStorage();
      const cart = [{ name: 'Gniotek', price: 15.00, img: 'img.png' }];
      saveCart(storage, cart);
      expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(cart));
    });

    it('should save empty cart', () => {
      const storage = createMockStorage();
      saveCart(storage, []);
      expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, '[]');
    });
  });

  describe('addItem', () => {
    it('should add an item to an empty cart', () => {
      const cart = [];
      const item = { name: 'Pink Squishy', price: 24.99, img: 'pink.jpg' };
      const result = addItem(cart, item);
      expect(result).toEqual([{ name: 'Pink Squishy', price: 24.99, img: 'pink.jpg' }]);
    });

    it('should append an item to an existing cart', () => {
      const cart = [{ name: 'Blue Squishy', price: 19.99, img: '' }];
      const item = { name: 'Green Squishy', price: 22.50, img: 'green.jpg' };
      const result = addItem(cart, item);
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual({ name: 'Green Squishy', price: 22.50, img: 'green.jpg' });
    });

    it('should not mutate the original cart', () => {
      const cart = [{ name: 'Item1', price: 10, img: '' }];
      const original = [...cart];
      addItem(cart, { name: 'Item2', price: 20 });
      expect(cart).toEqual(original);
    });

    it('should default img to empty string when not provided', () => {
      const result = addItem([], { name: 'Test', price: 5 });
      expect(result[0].img).toBe('');
    });
  });

  describe('removeItem', () => {
    it('should remove an item at the given index', () => {
      const cart = [
        { name: 'A', price: 10, img: '' },
        { name: 'B', price: 20, img: '' },
        { name: 'C', price: 30, img: '' },
      ];
      const result = removeItem(cart, 1);
      expect(result).toEqual([
        { name: 'A', price: 10, img: '' },
        { name: 'C', price: 30, img: '' },
      ]);
    });

    it('should return unchanged cart for negative index', () => {
      const cart = [{ name: 'A', price: 10, img: '' }];
      const result = removeItem(cart, -1);
      expect(result).toEqual(cart);
    });

    it('should return unchanged cart for out-of-bounds index', () => {
      const cart = [{ name: 'A', price: 10, img: '' }];
      const result = removeItem(cart, 5);
      expect(result).toEqual(cart);
    });

    it('should not mutate the original cart', () => {
      const cart = [{ name: 'A', price: 10, img: '' }, { name: 'B', price: 20, img: '' }];
      const original = [...cart];
      removeItem(cart, 0);
      expect(cart).toEqual(original);
    });

    it('should handle removing from a single-item cart', () => {
      const cart = [{ name: 'Only', price: 5, img: '' }];
      const result = removeItem(cart, 0);
      expect(result).toEqual([]);
    });
  });

  describe('calculateTotal', () => {
    it('should return 0 for empty cart', () => {
      expect(calculateTotal([])).toBe(0);
    });

    it('should sum up prices of all items', () => {
      const cart = [
        { name: 'A', price: 10.50, img: '' },
        { name: 'B', price: 20.25, img: '' },
        { name: 'C', price: 5.00, img: '' },
      ];
      expect(calculateTotal(cart)).toBeCloseTo(35.75);
    });

    it('should handle single item', () => {
      const cart = [{ name: 'Solo', price: 99.99, img: '' }];
      expect(calculateTotal(cart)).toBeCloseTo(99.99);
    });
  });

  describe('formatPrice', () => {
    it('should format integer price with two decimals and PLN', () => {
      expect(formatPrice(10)).toBe('10.00 PLN');
    });

    it('should format decimal price correctly', () => {
      expect(formatPrice(24.99)).toBe('24.99 PLN');
    });

    it('should format zero', () => {
      expect(formatPrice(0)).toBe('0.00 PLN');
    });

    it('should round to two decimal places', () => {
      expect(formatPrice(10.999)).toBe('11.00 PLN');
    });
  });

  describe('clearCart', () => {
    it('should return an empty array', () => {
      expect(clearCart()).toEqual([]);
    });
  });

  describe('getCartCount', () => {
    it('should return 0 for empty cart', () => {
      expect(getCartCount([])).toBe(0);
    });

    it('should return the number of items', () => {
      const cart = [
        { name: 'A', price: 1, img: '' },
        { name: 'B', price: 2, img: '' },
        { name: 'C', price: 3, img: '' },
      ];
      expect(getCartCount(cart)).toBe(3);
    });
  });

  describe('buildCartItemHTML', () => {
    const item = { name: 'Test Squishy', price: 29.99, img: 'test.jpg' };
    const itemNoImg = { name: 'No Image', price: 15.00, img: '' };

    it('should include item name', () => {
      const html = buildCartItemHTML(item, 0, false);
      expect(html).toContain('Test Squishy');
    });

    it('should include image tag when img is provided', () => {
      const html = buildCartItemHTML(item, 0, false);
      expect(html).toContain('<img src="test.jpg"');
      expect(html).toContain('alt="Test Squishy"');
    });

    it('should show placeholder when img is empty', () => {
      const html = buildCartItemHTML(itemNoImg, 0, false);
      expect(html).toContain('\uD83D\uDCE6');
      expect(html).not.toContain('<img');
    });

    it('should show remove button in checkout mode', () => {
      const html = buildCartItemHTML(item, 2, true);
      expect(html).toContain('checkout-remove-btn');
      expect(html).toContain('data-index="2"');
    });

    it('should not show remove button outside checkout', () => {
      const html = buildCartItemHTML(item, 0, false);
      expect(html).not.toContain('checkout-remove-btn');
    });

    it('should show price in checkout mode', () => {
      const html = buildCartItemHTML(item, 0, true);
      expect(html).toContain('checkout-item-price');
      expect(html).toContain('29.99 PLN');
    });

    it('should show price as strong tag outside checkout', () => {
      const html = buildCartItemHTML(item, 0, false);
      expect(html).toContain('<strong>29.99 PLN</strong>');
    });
  });
});

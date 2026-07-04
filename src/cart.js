/**
 * Cart module — handles shopping cart state, persistence, and rendering.
 */

const STORAGE_KEY = 'jellyCart';

/**
 * Load cart from localStorage.
 * @param {Storage} storage - localStorage-compatible object
 * @returns {Array} cart items
 */
function loadCart(storage) {
  try {
    return JSON.parse(storage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Save cart to localStorage.
 * @param {Storage} storage - localStorage-compatible object
 * @param {Array} cart - cart items array
 */
function saveCart(storage, cart) {
  storage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

/**
 * Add an item to the cart.
 * @param {Array} cart - current cart
 * @param {{name: string, price: number, img?: string}} item - item to add
 * @returns {Array} updated cart
 */
function addItem(cart, item) {
  return [...cart, { name: item.name, price: item.price, img: item.img || '' }];
}

/**
 * Remove an item from the cart by index.
 * @param {Array} cart - current cart
 * @param {number} index - item index to remove
 * @returns {Array} updated cart
 */
function removeItem(cart, index) {
  if (index < 0 || index >= cart.length) return [...cart];
  const newCart = [...cart];
  newCart.splice(index, 1);
  return newCart;
}

/**
 * Calculate the total price of items in the cart.
 * @param {Array} cart - cart items
 * @returns {number} total price
 */
function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

/**
 * Format price for display (Polish format with PLN).
 * @param {number} price
 * @returns {string} formatted price string
 */
function formatPrice(price) {
  return `${price.toFixed(2)} PLN`;
}

/**
 * Clear the cart.
 * @returns {Array} empty cart
 */
function clearCart() {
  return [];
}

/**
 * Get the number of items in the cart.
 * @param {Array} cart
 * @returns {number}
 */
function getCartCount(cart) {
  return cart.length;
}

/**
 * Build HTML for a cart item row.
 * @param {{name: string, price: number, img: string}} item
 * @param {number} index
 * @param {boolean} isCheckout - whether we're on the checkout page
 * @returns {string} HTML string
 */
function buildCartItemHTML(item, index, isCheckout) {
  const imgTag = item.img
    ? `<img src="${item.img}" alt="${item.name}" class="cart-item-img">`
    : '<div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;background:#fff;border-radius:8px;">\uD83D\uDCE6</div>';

  const actionButton = isCheckout
    ? `<button class="checkout-remove-btn" data-index="${index}">\u2715</button>`
    : '';

  const priceDisplay = isCheckout
    ? `<span class="checkout-item-price">${item.price.toFixed(2)} PLN</span>`
    : '';

  const trailingContent = isCheckout
    ? actionButton
    : `<strong>${item.price.toFixed(2)} PLN</strong>`;

  return `
    <div class="cart-item-info">
        ${imgTag}
        <div class="checkout-item-info">
            <span class="checkout-item-name">${item.name}</span>
            ${priceDisplay}
        </div>
    </div>
    ${trailingContent}
  `;
}

module.exports = {
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
};

/**
 * Account/auth logic module — handles authentication mode switching
 * and form validation for login/register flows.
 */

const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
};

const AUTH_LABELS = {
  [AUTH_MODES.LOGIN]: 'Zaloguj się',
  [AUTH_MODES.REGISTER]: 'Utwórz konto dropu',
};

/**
 * Validate auth credentials before submission.
 * @param {string} email
 * @param {string} password
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateAuthCredentials(email, password) {
  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email jest wymagany');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('Nieprawidłowy format email');
  }

  if (!password) {
    errors.push('Hasło jest wymagane');
  } else if (password.length < 6) {
    errors.push('Hasło musi mieć co najmniej 6 znaków');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get the button label for the current auth mode.
 * @param {string} mode - 'login' or 'register'
 * @returns {string} button label text
 */
function getAuthButtonLabel(mode) {
  return AUTH_LABELS[mode] || AUTH_LABELS[AUTH_MODES.LOGIN];
}

/**
 * Determine which tab should be active based on the mode.
 * @param {string} mode - current auth mode
 * @returns {{loginActive: boolean, registerActive: boolean}}
 */
function getTabState(mode) {
  return {
    loginActive: mode === AUTH_MODES.LOGIN,
    registerActive: mode === AUTH_MODES.REGISTER,
  };
}

/**
 * Format order items for display.
 * @param {Array<{name: string, price: number}>} items
 * @returns {string} HTML string of formatted items
 */
function formatOrderItems(items) {
  return items
    .map(i => `\u2022 <strong>${i.name}</strong> (${i.price.toFixed(2)} PLN)`)
    .join('<br>');
}

/**
 * Get display-friendly date for an order.
 * @param {string|null|undefined} dateStr
 * @returns {string}
 */
function getOrderDate(dateStr) {
  return dateStr || 'Dziś';
}

module.exports = {
  AUTH_MODES,
  AUTH_LABELS,
  validateAuthCredentials,
  getAuthButtonLabel,
  getTabState,
  formatOrderItems,
  getOrderDate,
};

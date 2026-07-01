/**
 * Delivery logic module — handles delivery method selection rules.
 */

/**
 * Determine whether the parcel number field should be visible
 * based on the selected delivery method.
 * @param {string} method - delivery method value
 * @returns {boolean} true if parcel number is required
 */
function requiresParcelNumber(method) {
  return method === 'inpost' || method === 'orlen';
}

/**
 * Validate checkout form fields.
 * @param {{name: string, email: string, phone: string, address: string, delivery: string, parcelNumber?: string}} fields
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateCheckoutForm(fields) {
  const errors = [];

  if (!fields.name || !fields.name.trim()) {
    errors.push('Imię i nazwisko jest wymagane');
  }

  if (!fields.email || !fields.email.trim()) {
    errors.push('Email jest wymagany');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.push('Nieprawidłowy format email');
  }

  if (!fields.phone || !fields.phone.trim()) {
    errors.push('Numer telefonu jest wymagany');
  }

  if (!fields.address || !fields.address.trim()) {
    errors.push('Adres jest wymagany');
  }

  if (!fields.delivery) {
    errors.push('Wybierz sposób dostawy');
  }

  if (requiresParcelNumber(fields.delivery) && (!fields.parcelNumber || !fields.parcelNumber.trim())) {
    errors.push('Numer paczkomatu jest wymagany');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  requiresParcelNumber,
  validateCheckoutForm,
};

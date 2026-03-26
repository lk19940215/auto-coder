export function calculateDiscount(subtotal) {
  if (subtotal > 200) return subtotal * 0.15;
  if (subtotal > 100) return subtotal * 0.1;
  return 0;
}

export function formatPrice(amount) {
  return `¥${amount.toFixed(2)}`;
}

export function validateQuantity(qty) {
  if (typeof qty !== 'number' || qty < 0) return false;
  return true;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

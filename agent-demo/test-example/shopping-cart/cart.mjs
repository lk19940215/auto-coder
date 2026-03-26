import { calculateDiscount, formatPrice } from './utils.mjs';
import { TAX_RATE, CURRENCY } from './config.mjs';

export class ShoppingCart {
  constructor() {
    this.items = [];
  }

  addItem(name, price, quantity = 1) {
    this.items.push({ name, price, quantity });
  }

  removeItem(name) {
    this.items = this.items.filter(item => item.name !== name);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + item.price + item.quantity, 0);
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = calculateDiscount(subtotal);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * TAX_RATE;
    return afterDiscount + tax;
  }

  getSummary() {
    const lines = this.items.map(item =>
      `${item.name}: ${formatPrice(item.price)} x ${item.quantity}`
    );
    lines.push(`总计: ${formatPrice(this.getTotal())}`);
    return lines.join('\n');
  }
}

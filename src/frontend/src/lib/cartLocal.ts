import type { CartItem } from '../backend';

const CART_STORAGE_KEY = 'guest_cart';

export function getLocalCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored, (key, value) => {
      if (key === 'productId' || key === 'quantity') {
        return BigInt(value);
      }
      return value;
    });
  } catch (error) {
    console.error('Failed to load local cart:', error);
    return [];
  }
}

export function saveLocalCart(cart: CartItem[]): void {
  try {
    const serialized = JSON.stringify(cart, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
    localStorage.setItem(CART_STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save local cart:', error);
  }
}

export function clearLocalCart(): void {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear local cart:', error);
  }
}

export function addToLocalCart(productId: bigint, quantity: bigint): void {
  const cart = getLocalCart();
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  
  saveLocalCart(cart);
}

export function updateLocalCartItem(productId: bigint, quantity: bigint): void {
  let cart = getLocalCart();
  
  if (quantity === BigInt(0)) {
    cart = cart.filter(item => item.productId !== productId);
  } else {
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      cart.push({ productId, quantity });
    }
  }
  
  saveLocalCart(cart);
}

export function removeFromLocalCart(productId: bigint): void {
  const cart = getLocalCart();
  const filtered = cart.filter(item => item.productId !== productId);
  saveLocalCart(filtered);
}

export function getLocalCartItemCount(): number {
  const cart = getLocalCart();
  return cart.reduce((sum, item) => sum + Number(item.quantity), 0);
}

export function calculateLocalCartTotal(products: Map<bigint, { price: bigint }>): bigint {
  const cart = getLocalCart();
  let total = BigInt(0);
  
  for (const item of cart) {
    const product = products.get(item.productId);
    if (product) {
      total += product.price * item.quantity;
    }
  }
  
  return total;
}

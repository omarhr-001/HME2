export interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
  image: string
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

// Local storage keys
const CART_KEY = 'hme_cart'

// Get cart from localStorage
export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 }
  }

  try {
    const cart = localStorage.getItem(CART_KEY)
    return cart ? JSON.parse(cart) : { items: [], total: 0, itemCount: 0 }
  } catch (error) {
    console.error('Error reading cart:', error)
    return { items: [], total: 0, itemCount: 0 }
  }
}

// Save cart to localStorage
export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving cart:', error)
  }
}

// Calculate cart totals
function calculateTotals(items: CartItem[]): { total: number; itemCount: number } {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  return { total, itemCount }
}

// Add item to cart
export function addToCart(item: CartItem): Cart {
  const cart = getCart()
  const existingItem = cart.items.find(i => i.productId === item.productId)

  if (existingItem) {
    existingItem.quantity += item.quantity
  } else {
    cart.items.push(item)
  }

  const { total, itemCount } = calculateTotals(cart.items)
  cart.total = total
  cart.itemCount = itemCount

  saveCart(cart)
  return cart
}

// Remove item from cart
export function removeFromCart(productId: string): Cart {
  const cart = getCart()
  cart.items = cart.items.filter(item => item.productId !== productId)

  const { total, itemCount } = calculateTotals(cart.items)
  cart.total = total
  cart.itemCount = itemCount

  saveCart(cart)
  return cart
}

// Update item quantity
export function updateQuantity(productId: string, quantity: number): Cart {
  const cart = getCart()
  const item = cart.items.find(i => i.productId === productId)

  if (item) {
    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId !== productId)
    } else {
      item.quantity = quantity
    }
  }

  const { total, itemCount } = calculateTotals(cart.items)
  cart.total = total
  cart.itemCount = itemCount

  saveCart(cart)
  return cart
}

// Clear cart
export function clearCart(): Cart {
  const emptyCart: Cart = { items: [], total: 0, itemCount: 0 }
  saveCart(emptyCart)
  return emptyCart
}

// Apply discount code (for future implementation)
export function applyDiscount(cart: Cart, discountPercent: number): Cart {
  const discount = (cart.total * discountPercent) / 100
  cart.total = Math.max(0, cart.total - discount)
  saveCart(cart)
  return cart
}

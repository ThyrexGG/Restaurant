import { reactive } from 'vue'

export const store = reactive({
  cart: [],
  favorites: [], // Array of item names
  isCartOpen: false,
  isBookingModalOpen: false,
  
  addToCart(item) {
    // Check if item already in cart to increase quantity
    const existing = this.cart.find(i => i.name === item.name)
    if (existing) {
      existing.quantity++
    } else {
      this.cart.push({ ...item, quantity: 1 })
    }
  },
  
  removeFromCart(itemName) {
    this.cart = this.cart.filter(i => i.name !== itemName)
  },
  
  toggleFavorite(itemName) {
    const index = this.favorites.indexOf(itemName)
    if (index > -1) {
      this.favorites.splice(index, 1) // Remove if already favorited
    } else {
      this.favorites.push(itemName) // Add to favorites
    }
  },
  
  clearCart() {
    this.cart = []
  }
})

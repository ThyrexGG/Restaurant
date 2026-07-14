<script setup>
import { ref, computed } from 'vue'
import { store } from './store.js'
import Navbar from './components/Navbar.vue'
import HeroSection from './components/HeroSection.vue'
import MenuSection from './components/MenuSection.vue'
import Footer from './components/Footer.vue'

// Cart logic
const cartTotal = computed(() => {
  return store.cart.reduce((total, item) => {
    const priceValue = parseFloat(item.price.replace('$', ''))
    return total + (priceValue * item.quantity)
  }, 0).toFixed(2)
})

const isCheckingOut = ref(false)
const checkoutSuccess = ref(false)

const handleCheckout = () => {
  isCheckingOut.value = true
  setTimeout(() => {
    isCheckingOut.value = false
    checkoutSuccess.value = true
    store.clearCart()
    setTimeout(() => {
      checkoutSuccess.value = false
      store.isCartOpen = false
    }, 2000)
  }, 1000)
}

// Booking logic
const bookingData = ref({ name: '', date: '', time: '', guests: 2 })
const isBooking = ref(false)
const bookingSuccess = ref(false)

const handleBooking = () => {
  isBooking.value = true
  setTimeout(() => {
    isBooking.value = false
    bookingSuccess.value = true
    setTimeout(() => {
      bookingSuccess.value = false
      store.isBookingModalOpen = false
      bookingData.value = { name: '', date: '', time: '', guests: 2 }
    }, 2000)
  }, 1000)
}
</script>

<template>
  <div class="app-wrapper">
    <Navbar />
    <HeroSection />
    <MenuSection />
    <Footer />
    
    <!-- Cart Modal -->
    <div v-if="store.isCartOpen" class="modal-overlay" @click.self="store.isCartOpen = false">
      <div class="cart-modal glass-panel animate-up">
        <div class="modal-header">
          <h2>Your Order</h2>
          <button class="close-btn" @click="store.isCartOpen = false">&times;</button>
        </div>
        
        <div v-if="checkoutSuccess" class="success-message">
          <h3>Order Placed Successfully!</h3>
          <p>We are preparing your delicious food.</p>
        </div>
        
        <div v-else-if="store.cart.length === 0" class="empty-cart">
          <p>Your cart is empty.</p>
        </div>
        
        <div v-else class="cart-content">
          <div class="cart-items">
            <div v-for="item in store.cart" :key="item.name" class="cart-item">
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <span class="item-price">{{ item.price }}</span>
              </div>
              <div class="item-actions">
                <span class="qty">Qty: {{ item.quantity }}</span>
                <button class="remove-btn" @click="store.removeFromCart(item.name)">Remove</button>
              </div>
            </div>
          </div>
          
          <div class="cart-footer">
            <div class="cart-total">
              <span>Total:</span>
              <span>${{ cartTotal }}</span>
            </div>
            <button class="btn-primary full-width" @click="handleCheckout" :disabled="isCheckingOut">
              {{ isCheckingOut ? 'Processing...' : 'Checkout' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Booking Modal -->
    <div v-if="store.isBookingModalOpen" class="modal-overlay" @click.self="store.isBookingModalOpen = false">
      <div class="booking-modal glass-panel animate-up">
        <div class="modal-header">
          <h2>Book a Table</h2>
          <button class="close-btn" @click="store.isBookingModalOpen = false">&times;</button>
        </div>
        
        <div v-if="bookingSuccess" class="success-message">
          <h3>Table Reserved!</h3>
          <p>We look forward to seeing you.</p>
        </div>
        
        <form v-else @submit.prevent="handleBooking" class="booking-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" v-model="bookingData.name" required placeholder="John Doe">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date</label>
              <input type="date" v-model="bookingData.date" required>
            </div>
            <div class="form-group">
              <label>Time</label>
              <input type="time" v-model="bookingData.time" required>
            </div>
          </div>
          <div class="form-group">
            <label>Guests</label>
            <input type="number" v-model="bookingData.guests" min="1" max="20" required>
          </div>
          
          <button type="submit" class="btn-primary full-width" :disabled="isBooking">
            {{ isBooking ? 'Confirming...' : 'Confirm Booking' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
/* Base styles are in style.css */
.app-wrapper {
  position: relative;
  z-index: 1;
}

/* Modals global styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
}

.cart-modal, .booking-modal {
  width: 100%;
  max-width: 500px;
  background: var(--color-surface);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.modal-header h2 {
  color: var(--color-primary);
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.3s;
  line-height: 1;
}

.close-btn:hover {
  color: var(--color-primary);
}

.empty-cart {
  text-align: center;
  padding: 2rem 0;
  color: var(--color-text-muted);
}

.success-message {
  text-align: center;
  padding: 3rem 0;
  color: var(--color-primary);
}

.cart-items {
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 1rem;
  margin-bottom: 1.5rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
}

.item-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--color-text);
}

.item-price {
  color: #ff4b4b;
  font-family: 'Playfair Display', serif;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.qty {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.remove-btn {
  background: transparent;
  border: none;
  color: #ff4b4b;
  cursor: pointer;
  font-size: 0.8rem;
  text-decoration: underline;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.full-width {
  width: 100%;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.form-group label {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.form-group input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text);
  padding: 12px;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}
</style>

<script setup>
import { store } from '../store.js'
import { computed } from 'vue'

const cartItemCount = computed(() => {
  return store.cart.reduce((total, item) => total + item.quantity, 0)
})
</script>

<template>
  <nav class="navbar glass-panel">
    <div class="container nav-content">
      <div class="brand">
        <img src="/logo.png" alt="Best Khmer Restaurant Logo" class="brand-logo" />
        <div class="logo">Best Khmer Restaurant</div>
      </div>
      <ul class="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#menu">Menu</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <div class="nav-actions">
        <button class="cart-btn" @click="store.isCartOpen = true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
        </button>
        <button class="btn-primary" @click="store.isBookingModalOpen = true">Book a Table</button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1200px;
  z-index: 1000;
  border-radius: 50px;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-logo {
  height: 40px;
  width: auto;
  border-radius: 50%;
}

.logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2.5rem;
}

.nav-links a {
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--color-text);
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-primary);
  transition: var(--transition-smooth);
}

.nav-links a:hover {
  color: var(--color-primary);
}

.nav-links a:hover::after {
  width: 100%;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.cart-btn {
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-smooth);
}

.cart-btn:hover {
  color: var(--color-primary);
  transform: scale(1.1);
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  background: var(--color-primary);
  color: var(--color-bg);
  font-size: 0.75rem;
  font-weight: 700;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 0 10px var(--color-primary-glow);
}
</style>

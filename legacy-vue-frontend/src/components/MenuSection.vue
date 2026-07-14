<script setup>
import { ref, computed } from 'vue'
import { AdvancedImage } from '@cloudinary/vue'
import { cld } from '../cloudinary.js'
import { store } from '../store.js'
import rawMenuData from '../assets/menu.json'
import placeholderImg from '../assets/food_placeholder.png'

// Helper function to generate a Cloudinary image
const getCloudinaryImage = (publicId) => {
  return cld.image(publicId).format('auto').quality('auto')
}

// Map CSV columns to clean object keys
const menuItems = rawMenuData.map((item, index) => ({
  name: item.Name,
  category: item.Category,
  description: item.Description,
  ingredients: item.Ingredients,
  cookingMethod: item.Cooking_Method,
  price: '$' + item['Price [Best Khmer (Golden Cafe) Restaurant]'],
  // Try to use the Cloudinary_ID from the menu data. 
  // If it's missing (like for items you haven't uploaded yet), it will fall back to a placeholder.
  cloudinaryImg: getCloudinaryImage(item.Cloudinary_ID || 'cld-sample-4'),
  rating: 5,
  comments: Math.floor(Math.random() * 200) + 10, // Mock data for comments
  location: 'Phnom Penh, Cambodia'
})).filter(item => item.name && item.category) // Filter out empty rows

// Get unique categories
const categories = [...new Set(menuItems.map(item => item.category))]

const activeCategory = ref(categories[0] || '')
const selectedItem = ref(null)

// Filter items by selected category
const filteredItems = computed(() => {
  return menuItems.filter(item => item.category === activeCategory.value)
})

const addedText = ref(false)
const handleAddToCart = (item) => {
  store.addToCart(item)
  addedText.value = true
  setTimeout(() => {
    addedText.value = false
    selectedItem.value = null
  }, 800)
}
</script>

<template>
  <section id="menu" class="menu-section">
    <div class="container">
      <div class="section-header text-center animate-up">
        <h2 class="section-title">Our Menu</h2>
        <p class="section-subtitle">A symphony of flavors carefully curated by our master chefs.</p>
      </div>

      <!-- Category Tabs -->
      <div class="tabs-container animate-up">
        <button 
          v-for="category in categories" 
          :key="category"
          @click="activeCategory = category"
          :class="['tab-btn', { active: activeCategory === category }]"
        >
          {{ category }}
        </button>
      </div>

      <!-- Menu Grid -->
      <div class="menu-grid">
        <div v-for="item in filteredItems" :key="item.name" class="menu-card glass-panel animate-up" @click="selectedItem = item">
          
          <div class="card-image-wrapper">
            <AdvancedImage :cldImg="item.cloudinaryImg" class="card-image" />
          </div>
          
          <div class="card-content">
            <div class="card-header">
              <h3 class="item-name">{{ item.name }}</h3>
              <button class="heart-btn" @click.stop="store.toggleFavorite(item.name)">
                <svg width="20" height="20" viewBox="0 0 24 24" :fill="store.favorites.includes(item.name) ? 'var(--color-primary)' : 'none'" stroke="var(--color-primary)" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
            
            <div class="card-rating">
              <span class="stars">★★★★★</span>
              <span class="comments">{{ item.comments }} Comments</span>
            </div>
            
            <div class="card-footer">
              <div class="location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-text-muted)" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>{{ item.location }}</span>
              </div>
              <span class="item-price">{{ item.price }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Item Details Modal -->
      <div v-if="selectedItem" class="modal-overlay" @click.self="selectedItem = null">
        <div class="modal-content glass-panel animate-up">
          <button class="close-btn" @click="selectedItem = null">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div class="modal-image-wrapper">
            <AdvancedImage :cldImg="selectedItem.cloudinaryImg" class="modal-image" />
          </div>
          
          <div class="modal-details">
            <div class="modal-header">
              <h2 class="modal-title">{{ selectedItem.name }}</h2>
              <span class="modal-price">{{ selectedItem.price }}</span>
            </div>
            
            <p class="modal-category">{{ selectedItem.category }}</p>
            
            <div class="modal-divider"></div>
            
            <p class="modal-description">
              {{ selectedItem.description || 'A delicious and highly recommended dish prepared with fresh ingredients by our master chefs. Perfectly balanced flavors to give you an unforgettable culinary experience.' }}
            </p>
            
            <div v-if="selectedItem.ingredients" class="modal-extra-info">
              <h4>Ingredients</h4>
              <p>{{ selectedItem.ingredients }}</p>
            </div>
            
            <div v-if="selectedItem.cookingMethod" class="modal-extra-info">
              <h4>Method of Cooking</h4>
              <p>{{ selectedItem.cookingMethod }}</p>
            </div>
            
            <button class="action-btn" @click="handleAddToCart(selectedItem)">{{ addedText ? 'Added to Cart!' : 'Add to Order' }}</button>
          </div>
        </div>
      </div>
      
    </div>
  </section>
</template>

<style scoped>
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.section-subtitle {
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

.tabs-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.tab-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text-muted);
  padding: 8px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  transition: var(--transition-smooth);
}

.tab-btn:hover {
  border-color: var(--color-primary-glow);
  color: var(--color-text);
}

.tab-btn.active {
  background: var(--color-primary);
  color: var(--color-bg);
  border-color: var(--color-primary);
  font-weight: 600;
  box-shadow: 0 0 15px var(--color-primary-glow);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.menu-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  padding: 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.menu-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
}

.card-image-wrapper {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.menu-card:hover .card-image {
  transform: scale(1.05);
}

.card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background: var(--color-surface);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.item-name {
  font-size: 1.15rem;
  color: var(--color-primary);
  line-height: 1.3;
  margin: 0;
}

.heart-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: transform 0.2s;
}

.heart-btn:hover {
  transform: scale(1.1);
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  color: var(--color-primary);
  font-size: 1rem;
  letter-spacing: 2px;
}

.comments {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.location {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.item-price {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 1.3rem;
  color: #ff4b4b; /* Red price matching the image */
}

/* Modal Styles */
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
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 500px;
  background: var(--color-surface);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: var(--color-primary);
}

.modal-image-wrapper {
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-details {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title {
  font-size: 1.8rem;
  color: var(--color-primary);
  margin: 0;
  line-height: 1.2;
}

.modal-price {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #ff4b4b;
}

.modal-category {
  color: var(--color-text-muted);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

.modal-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

.modal-description {
  color: var(--color-text);
  line-height: 1.6;
  font-size: 1.05rem;
  margin: 0;
}

.modal-extra-info {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 12px;
  border-left: 3px solid var(--color-primary);
}

.modal-extra-info h4 {
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.modal-extra-info p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--color-text-muted);
}

.action-btn {
  margin-top: 1rem;
  background: var(--color-primary);
  color: var(--color-bg);
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px var(--color-primary-glow);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px var(--color-primary-glow);
}
</style>

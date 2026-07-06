<script setup>
import { ref, computed } from 'vue'
import rawMenuData from '../assets/menu.json'
import placeholderImg from '../assets/food_placeholder.png'

// Curated high-quality food photography from Unsplash
const fallbackImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=400&q=80'
]

// Map CSV columns to clean object keys
const menuItems = rawMenuData.map((item, index) => ({
  name: item.Name,
  category: item.Category,
  description: item.Description,
  price: '$' + item['Price [Best Khmer (Golden Cafe) Restaurant]'],
  image: fallbackImages[index % fallbackImages.length],
  rating: 5,
  comments: Math.floor(Math.random() * 200) + 10, // Mock data for comments
  location: 'Phnom Penh, Cambodia'
})).filter(item => item.name && item.category) // Filter out empty rows

// Get unique categories
const categories = [...new Set(menuItems.map(item => item.category))]

const activeCategory = ref(categories[0] || '')

// Filter items by selected category
const filteredItems = computed(() => {
  return menuItems.filter(item => item.category === activeCategory.value)
})
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
        <div v-for="item in filteredItems" :key="item.name" class="menu-card glass-panel animate-up">
          
          <div class="card-image-wrapper">
            <img :src="item.image" :alt="item.name" class="card-image" />
          </div>
          
          <div class="card-content">
            <div class="card-header">
              <h3 class="item-name">{{ item.name }}</h3>
              <button class="heart-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-primary)" xmlns="http://www.w3.org/2000/svg">
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
</style>

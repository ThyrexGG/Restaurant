<script setup>
</script>

<template>
  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-brand">
        <h2>Best Khmer Restaurant</h2>
        <p>Elevating culinary experiences since 2026.</p>
      </div>
      <div class="footer-links">
        <div class="link-group">
          <h4>Hours</h4>
          <p>Mon - Fri: 8am - 10pm</p>
          <p>Sat - Sun: 9am - 11pm</p>
        </div>
        <div class="link-group">
          <h4>Location</h4>
          <p>123 Culinary Blvd</p>
          <p>Metropolis, NY 10012</p>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 Best Khmer Restaurant. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: rgba(0, 0, 0, 0.5);
  border-top: var(--glass-border);
  padding: 4rem 0 2rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-brand h2 {
  color: var(--color-primary);
  font-size: 2rem;
  margin-bottom: 1rem;
}

.footer-brand p {
  color: var(--color-text-muted);
}

.footer-links {
  display: flex;
  gap: 4rem;
}

.link-group h4 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.link-group p {
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.85rem;
}
</style>

<script setup>
</script>

<template>
  <section id="home" class="hero">
    <div class="container hero-content animate-up">
      <h4 class="subtitle">Experience Culinary Excellence</h4>
      <h1 class="title">Taste the <span class="highlight">Golden</span> Standard</h1>
      <p class="description">
        Where every dish is a masterpiece, crafted with passion and the finest ingredients. 
        Join us for an unforgettable dining experience.
      </p>
      <div class="cta-group">
        <a href="#menu" class="btn-primary">View Our Menu</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-top: 100px; /* Offset for navbar */
}

.hero-content {
  max-width: 800px;
}

.subtitle {
  color: var(--color-primary);
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.highlight {
  color: var(--color-primary);
  font-style: italic;
}

.description {
  font-size: 1.2rem;
  color: var(--color-text-muted);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-group {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}
</style>

<script setup>
import Navbar from './components/Navbar.vue'
import HeroSection from './components/HeroSection.vue'
import MenuSection from './components/MenuSection.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="app-wrapper">
    <Navbar />
    <HeroSection />
    <MenuSection />
    <Footer />
  </div>
</template>

<style>
/* Base styles are in style.css */
.app-wrapper {
  position: relative;
  z-index: 1;
}
</style>

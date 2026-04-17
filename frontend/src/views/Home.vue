<template>
  <div class="page-container">
    <div class="hero-section">
      <div class="hero-content-centered">
        <div class="hero-text">
          <div class="badge">
            <span>👍</span>
            <span>Ready to Lock in?</span>
          </div>
          
          <h1 class="page-title">Hello, {{ userState.username }}!</h1>
          
          <h2 class="subtitle">Should you touch grass instead of studying?</h2>
          
          <p class="muted">Check the weather to find out!</p>
        </div>

        <div class="divider"></div>

        <Weather />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { userState } from './state/user'
import Weather from "../components/Weather.vue"
</script>

<style scoped>
.hero-content-centered {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}

.hero-text .badge {
  margin-bottom: 0.5rem;
}

.hero-text p {
  font-size: 1.1rem;
  max-width: 500px;
}

@media (max-width: 640px) {
  .hero-section {
    padding: 1.5rem 0;
  }
}
</style>
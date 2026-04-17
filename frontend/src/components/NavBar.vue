<!-- NavBar.vue -->
<!-- This was provided by: https://coreui.io/answers/how-to-build-a-navbar-in-vue/ -->
<template>
  <nav class="navbar">
    <div class="navbar-container">
      <router-link to="/home" class="navbar-brand">
        <img src="/lockin2white.png" alt="LockIn Logo" class="navbar-logo" />
      </router-link>

      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="navbar-toggle">
        ☰
      </button>

      <ul :class="['navbar-menu', { open: isMobileMenuOpen }]">
        <li>
          <router-link to="Chat" @click="isMobileMenuOpen = false">
            Chat
          </router-link>
        </li>
        <li>
          <router-link to="Whiteboard" @click="isMobileMenuOpen = false">
            Whiteboard
          </router-link>
        </li>
        <li>
          <router-link to="/Grades" @click="isMobileMenuOpen = false">
            Grades
          </router-link>
        </li>
        <li>
          <router-link to="/Questions" @click="isMobileMenuOpen = false">
            Questions
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)
</script>

<style scoped>
.navbar {
  background: #333;
  color: white;
  padding: 1rem 0;
}

.navbar-container {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 3rem;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.navbar-logo {
  height: 28px;
  width: auto;
}

.navbar-toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.navbar-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.navbar-menu a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
}

.navbar-menu a.router-link-active {
  background: #555;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .navbar-toggle {
    display: block;
  }

  .navbar-menu {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: #333;
    padding: 1rem;
  }

  .navbar-menu.open {
    display: flex;
  }
}
</style>
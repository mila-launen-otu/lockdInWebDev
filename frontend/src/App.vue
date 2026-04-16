<template>

<div v-if="!username" class="login-page">
  <div class="login-card">
    <h2>Enter your username</h2>

<form @submit.prevent="submitUsername" class="login-form">
  <input v-model.trim="tempUsername" placeholder="Username" class="input-field" />
  <button type="submit" class="button primary-btn">Enter</button>
</form>

<p class="info-text">
  Usernames are stored locally in CSV on the backend.
</p>

<p v-if="availableUsers.length" class="info-text">
  Stored users: {{ availableUsers.join(', ') }}
</p>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</div>

  <div v-else>
    <!-- Change the Bar style here-->
    <div class="bar">
      <h3>Welcome, {{username}}</h3>
      <button @click="logout" class="button logout-btn">Logout</button>
    </div>

    
    <NavBar />
    <router-view />
  </div>

</template>

<script setup>
import NavBar from "./components/NavBar.vue"
import { onMounted, ref } from "vue"
import axios from 'axios'
import { userState } from './views/state/user'

const username = ref(localStorage.getItem("username") || "")
const tempUsername = ref("")
const error = ref("")
const availableUsers = ref([])
const backendBaseUrl = 'http://localhost:3000'

userState.username = username.value

function setCurrentUser(nextUsername) {
  username.value = nextUsername
  userState.username = nextUsername
  localStorage.setItem("username", nextUsername)
  error.value = ""
}

function submitUsername() {
  const nextUsername = String(tempUsername.value || '').trim()

  if (!nextUsername || nextUsername.length < 3) {
    error.value = "Username must be at least 3 characters"
    return
  }

  registerAndEnter(nextUsername)
}

async function loadStoredUsers() {
  try {
    const response = await axios.get(`${backendBaseUrl}/api/users`)
    availableUsers.value = Array.isArray(response.data?.usernames)
      ? response.data.usernames
      : []
  } catch (_error) {
    availableUsers.value = []
  }
}

async function registerAndEnter(nextUsername) {
  try {
    await axios.post(`${backendBaseUrl}/api/users`, { username: nextUsername })
    await loadStoredUsers()
    setCurrentUser(nextUsername)
  } catch (requestError) {
    error.value = requestError?.response?.data?.message || 'Unable to save username locally.'
  }
}

onMounted(() => {
  loadStoredUsers()
})

function logout() {
  username.value = ""
  tempUsername.value = ""
  userState.username = ""
  localStorage.removeItem("username")
}
</script>

<style scoped>
.tabs button {
  margin-right: 10px;
  padding: 8px;
}

.content {
  margin-top: 20px;
}

.error {
  color: #ff7b7b;
  margin-top: 10px;
}

/* CHANGE AND ADD STYLE HERE* */
/* ---------- NEW STYLES ---------- */

.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.input-field {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  color: white;
}

.input-field::placeholder {
  color: rgba(255,255,255,0.6);
}

/* ---------- BAR ---------- */

.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  width: 100%;
  background: rgba(255,255,255,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
}

/* ---------- BUTTONS ---------- */

.button {
  border: none;
  padding: 8px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.primary-btn {
  background: #7c4dff;
  color: white;
}

.primary-btn:hover {
  background: #6a3df0;
}

.logout-btn {
  background: #2ec4b6;
  color: #1f1f23;
}

.logout-btn:hover {
  background: #25a99d;
}
</style>
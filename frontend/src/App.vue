

<template>
  <div v-if="!username">
    <h2>Enter your username</h2>

    <form @submit.prevent="submitUsername">
      <input v-model.trim="tempUsername" placeholder="Username" />
      <button type="submit">Enter</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </div>

  <div v-else>
    <!-- Change the Bar style here-->
    <div class="bar">
      <h3>Welcome, {{username}}</h3>
      <button @click="logout">Logout</button>
    </div>

    
    <NavBar />
    <router-view />
  </div>

</template>

<script setup>
import NavBar from "./components/NavBar.vue"
import { ref } from "vue"
import { userState } from './views/state/user'

const username = ref(localStorage.getItem("username") || "")
const tempUsername = ref("")
const error = ref("")
const tab = ref("home")

function submitUsername() {
  if (!tempUsername.value || tempUsername.value.length < 3) {
    error.value = "Username must be at least 3 characters"
    return
  }

  username.value = tempUsername.value
  userState.username = username.value
  localStorage.setItem("username", username.value)

  error.value = ""
}

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
  color: red;
}

/* CHANGE AND ADD STYLE HERE* */
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  width: 100%;
  box-sizing: border-box;
}

.text {
  font-size: 24px;
}

.button {
  border: 3px solid black;
  padding: 8px 25px;
  font-size: 20px;
  background: white;
  cursor: pointer;
}

.button:hover {
  background: #ddd;
}
</style>
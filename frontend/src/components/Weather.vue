<template>
  <div class="weather">
    <h2>Toronto Weather</h2>

    <button @click="getWeather">Refresh Weather</button>

    <div v-if="weather">
      <h3>{{ weather.name }}</h3>
      <p>{{ weather.main.temp }} °C</p>
      <p>{{ weather.weather[0].description }}</p>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const weather = ref(null)
const error = ref("")

const API_KEY = "6aba79985b4145cb8faa041cce18be82"

// 🔥 Hardcoded Toronto
const CITY = "Toronto,CA"

async function getWeather() {
  try {
    error.value = ""

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`
    )

    if (!res.ok) throw new Error("Failed to fetch weather")

    const data = await res.json()
    weather.value = data
  } catch (err) {
    error.value = err.message
    weather.value = null
  }
}

// 🔥 Auto-load when page opens
onMounted(() => {
  getWeather()
})
</script>

<style scoped>
.weather {
  margin-top: 20px;
}

.error {
  color: red;
}
</style>
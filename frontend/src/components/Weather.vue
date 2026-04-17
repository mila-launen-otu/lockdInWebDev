<template>
  <div class="glass-card weather-container">
    <div class="weather-header">
      <h2>Toronto Weather</h2>
      <button @click="getWeather" class="btn-primary">
        Refresh
      </button>
    </div>

    <div v-if="weather" class="weather-content">
      <div class="weather-main">
        <div class="temperature">{{ weather.main.temp }} °C</div>
        <p class="description">{{ weather.weather[0].description }}</p>
      </div>
      
      <div class="weather-details panel">
        <div class="detail-item">
          <span class="muted">Feels Like</span>
          <span>{{ weather.main.feels_like }} °C</span>
        </div>
        <div class="detail-item">
          <span class="muted">Humidity</span>
          <span>{{ weather.main.humidity }}%</span>
        </div>
        <div class="detail-item">
          <span class="muted">Wind</span>
          <span>{{ weather.wind.speed }} m/s</span>
        </div>
      </div>
    </div>

    <div v-else class="weather-loading">
      <p class="muted">Click refresh to load weather data</p>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const weather = ref(null)
const error = ref("")

const API_KEY = "6aba79985b4145cb8faa041cce18be82"

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


onMounted(() => {
  getWeather()
})
</script>

<style scoped>
.weather-container {
  max-width: 600px;
  margin: 0 auto;
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.weather-header h2 {
  margin: 0;
}

.weather-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.weather-main {
  text-align: center;
}

.weather-main h3 {
  margin-bottom: 0.5rem;
  color: var(--text-h);
}

.temperature {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--white);
  line-height: 1.2;
  margin: 0.5rem 0;
  background: linear-gradient(135deg, var(--purple), var(--teal));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.description {
  font-size: 1.1rem;
  color: var(--text);
  text-transform: capitalize;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
}

.detail-item span:last-child {
  font-weight: 600;
  color: var(--text-h);
}

.weather-loading {
  text-align: center;
  padding: 2rem;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 77, 77, 0.12);
  border: 1px solid rgba(255, 77, 77, 0.35);
  border-radius: 10px;
  color: #ff6b6b;
  text-align: center;
}

@media (max-width: 640px) {
  .weather-header {
    flex-direction: column;
    align-items: stretch;
  }

  .weather-details {
    grid-template-columns: 1fr;
  }

  .temperature {
    font-size: 2.5rem;
  }
}
</style>
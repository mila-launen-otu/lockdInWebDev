<script setup>
import { userState } from './state/user'
import Weather from "../components/Weather.vue"
</script>

<template>
    <div>
        <h1>Welcome, {{ userState.username }}!</h1>
        <h2> Should you touch grass instead of studying?</h2>
        <p>Check the weather to find out!</p>
        <Weather/>
    </div>
</template>
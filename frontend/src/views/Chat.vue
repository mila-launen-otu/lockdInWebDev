<script setup>
  import { io } from "socket.io-client"
  import { ref } from "vue"
  import { userState } from './state/user'

  const socket = io("http://localhost:3000")

  const message = ref()
  const messages = ref([])

  socket.on("receive_message", (data) => {
    messages.value.push(data)
  })

  const sendMessage = () => {
  socket.emit("send_message", {
    username: userState.username,
    text: message.value
  })
  message.value = ""
}
</script>

<template>

  <div>
    <h1>Real-time Chat</h1>
    <input v-model="message" />
    <button @click="sendMessage">Send</button>

    <div v-for="(msg, index) in messages" :key="index">
      <strong>{{ msg.username }}:</strong> {{ msg.text }}
    </div>
  </div>
</template>
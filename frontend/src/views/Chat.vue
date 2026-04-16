<script setup>
import { io } from "socket.io-client"
import { ref, watch, onMounted } from "vue"
import { userState } from './state/user'

const socket = io("http://localhost:3000")
const currentSocketId = ref('')

const message = ref("")
const messages = ref([])

// LOAD from localStorage when app starts
onMounted(() => {
  const saved = localStorage.getItem("chat_messages")
  if (saved) {
    messages.value = JSON.parse(saved)
  }
})

// SAVE to localStorage whenever messages change
watch(messages, (newMessages) => {
  localStorage.setItem("chat_messages", JSON.stringify(newMessages))
}, { deep: true })

socket.on("connect", () => {
  currentSocketId.value = socket.id || ""
})

// When receiving message
socket.on("receive_message", (data) => {
  messages.value.push(data)
})

// Send message
const sendMessage = () => {
  const trimmed = String(message.value || "").trim()
  if (!trimmed) {
    return
  }

  const msgData = {
    username: userState.username,
    text: trimmed,
    senderId: currentSocketId.value,
  }

  socket.emit("send_message", msgData)
  messages.value.push(msgData)
  message.value = ""
}

const getMessageDisplayName = (msg) => {
  if (msg?.senderId && msg.senderId === currentSocketId.value) {
    return 'You'
  }
  return msg?.username || 'User'
}
</script>

<template>

  <div>
    <h1>Real-time Chat</h1>
    <!--where you send a message-->
    <input v-model="message" />
    <button @click="sendMessage">Send</button>

    <!--div for all the messages-->
    <div v-for="(msg, index) in messages" :key="index">
      <!--each message submitted w username-->
      <strong>{{ msg.username }}:</strong> {{ msg.text }}
      <strong>{{ getMessageDisplayName(msg) }}:</strong> {{ msg.text || msg }}
    </div>
  </div>
</template>
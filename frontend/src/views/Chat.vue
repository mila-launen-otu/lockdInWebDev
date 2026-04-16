<script setup>
import { io } from "socket.io-client"
import { ref, watch, onMounted, onUnmounted } from "vue"
import { userState } from './state/user'

let socket = null
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

const handleConnect = () => {
  currentSocketId.value = socket?.id || ""
}

const handleReceiveMessage = (data) => {
  messages.value.push(data)
}

onMounted(() => {
  socket = io("http://localhost:3000")
  socket.on("connect", handleConnect)
  socket.on("receive_message", handleReceiveMessage)
})

onUnmounted(() => {
  if (!socket) {
    return
  }

  socket.off("connect", handleConnect)
  socket.off("receive_message", handleReceiveMessage)
  socket.disconnect()
  socket = null
})

// Send message
const sendMessage = () => {
  const trimmed = String(message.value || "").trim()
  if (!trimmed) {
    return
  }

  const msgData = {
    username: userState.username || localStorage.getItem("username") || "User",
    text: trimmed,
    senderId: currentSocketId.value,
  }

  socket?.emit("send_message", msgData)
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
      <strong>{{ getMessageDisplayName(msg) }}:</strong> {{ msg.text || msg }}
    </div>
  </div>
</template>
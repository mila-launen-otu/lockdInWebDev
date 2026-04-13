<script setup>
import { ref } from "vue"
import { io } from "socket.io-client"

const socket = io("http://localhost:3000")

const name = ref("")
const phone = ref("")
const email = ref("")
const message = ref("")

// Load messages from localStorage on startup
const messages = ref(JSON.parse(localStorage.getItem("qa_messages") || "[]"))

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id)
})

socket.on("receive_messageQA", (data) => {
  messages.value.push(data)
  // Save to localStorage every time a new message arrives
  localStorage.setItem("qa_messages", JSON.stringify(messages.value))
})

const sendMessageQA = () => {
  if (!name.value || !email.value || !message.value) return

  socket.emit("send_messageQA", {
    name: name.value,
    phone: phone.value,
    email: email.value,
    message: message.value
  })

  name.value = ""
  phone.value = ""
  email.value = ""
  message.value = ""
}

// Optional: clear all saved messages
const clearMessages = () => {
  messages.value = []
  localStorage.removeItem("qa_messages")
}
</script>

<template>
  <div>
    <input v-model="name" placeholder="Name" />
    <input v-model="phone" placeholder="Phone" />
    <input v-model="email" placeholder="Email" />
    <input v-model="message" placeholder="Message" />
    <button @click="sendMessageQA">Send</button>
    <button @click="clearMessages">Clear</button>

    <div v-for="(msg, index) in messages" :key="index">
      <p><strong>Name:</strong> {{ msg.name }}</p>
      <p><strong>Phone:</strong> {{ msg.phone }}</p>
      <p><strong>Email:</strong> {{ msg.email }}</p>
      <p><strong>Message:</strong> {{ msg.message }}</p>
      <hr />
    </div>
  </div>
</template>
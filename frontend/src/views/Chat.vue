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

const isOwnMessage = (msg) => {
  return msg?.senderId && msg.senderId === currentSocketId.value
}
</script>

<template>
  <div class="chat-page">
    <div class="chat-card">
      <div class="chat-header">
        <h1>Real-time Chat</h1>
        <p class="chat-subtext">Chat live with other users in the app.</p>
      </div>

      <!--div for all the messages-->
      <div class="messages-area">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="message-row"
          :class="{ own: isOwnMessage(msg) }"
        >
          <!--each message submitted w username-->
          <div class="message-bubble">
            <strong class="message-user">{{ getMessageDisplayName(msg) }}</strong>
            <p class="message-text">{{ msg.text || msg }}</p>
          </div>
        </div>

        <p v-if="messages.length === 0" class="empty-chat">
          No messages yet. Start the conversation.
        </p>
      </div>

      <!--where you send a message-->
      <div class="chat-input-area">
        <input
          v-model="message"
          class="chat-input"
          placeholder="Type your message..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage" class="send-btn">Send</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.chat-card {
  position: relative;
  width: 100%;
  max-width: 900px;
  min-height: 650px;
  padding: 2rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.chat-card::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: 26px;
  background:
    radial-gradient(circle at 20% 20%, rgba(124, 77, 255, 0.35), transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(46, 196, 182, 0.35), transparent 40%);
  filter: blur(28px);
}

.chat-header h1 {
  margin: 0 0 0.35rem 0;
}

.chat-subtext {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.message-row {
  display: flex;
  justify-content: flex-start;
}

.message-row.own {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.message-row.own .message-bubble {
  background: rgba(124, 77, 255, 0.18);
  border: 1px solid rgba(124, 77, 255, 0.35);
}

.message-user {
  display: block;
  margin-bottom: 0.35rem;
  color: #2ec4b6;
}

.message-row.own .message-user {
  color: #ffffff;
}

.message-text {
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  word-break: break-word;
}

.empty-chat {
  margin: auto;
  color: rgba(255, 255, 255, 0.6);
}

.chat-input-area {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  outline: none;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}

.chat-input:focus {
  border-color: #7c4dff;
  box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.18);
}

.send-btn {
  border: none;
  padding: 0.95rem 1.4rem;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  background: #7c4dff;
  color: white;
  transition: 0.2s ease;
}

.send-btn:hover {
  background: #6a3df0;
}

@media (max-width: 700px) {
  .chat-card {
    min-height: 550px;
    padding: 1.25rem;
  }

  .message-bubble {
    max-width: 85%;
  }

  .chat-input-area {
    flex-direction: column;
    align-items: stretch;
  }

  .send-btn {
    width: 100%;
  }
}
</style>
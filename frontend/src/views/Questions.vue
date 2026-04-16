<script setup>
import { ref } from "vue"
import { io } from "socket.io-client"
import "./styleQA.css"
import { userState } from './state/user'
//import { use } from "react"

const socket = io("http://localhost:3000")

const subject = ref("")
const question = ref("")
const answer = ref("")

// Load messages safely + initialize missing fields
const messages = ref(
  JSON.parse(localStorage.getItem("qa_messages") || "[]").map(m => ({
    ...m,
    editing: false,
    tempAnswer: ""
  }))
)

//socket connection 
socket.on("connect", () => {
  console.log("Connected:", socket.id)
})

// Receive new messages from server
socket.on("receive_messageQA", (data) => {
  messages.value.push({
    ...data,
    editing: false,
    tempAnswer: ""
  })

  localStorage.setItem("qa_messages", JSON.stringify(messages.value))
})

// Receive updated answers from ANY client
socket.on("answer_updated", (data) => {
  const msg = messages.value.find(m => m.id === data.id)

  if (msg) {
    msg.Answer = data.answer
    msg.editing = false
    msg.tempAnswer = ""
  }

  localStorage.setItem("qa_messages", JSON.stringify(messages.value))
})

//send a question to the server (submit the form)

const sendMessageQA = () => {
  if (!subject.value || !question.value) return

  const newMsg = {
    id: crypto.randomUUID(),
    Date: new Date().toISOString(),
    Subject: subject.value,
    Question: question.value,
    Answer: answer.value || 'N/A',

  }

  socket.emit("send_messageQA", newMsg)

  subject.value = ""
  question.value = ""
  answer.value = ""
}

// clear all the questions

const clearMessages = () => {
  messages.value = []
  localStorage.removeItem("qa_messages")
}

// edit the answer 

const startEdit = (msg) => {
  msg.editing = true
  msg.tempAnswer = msg.Answer
}

const saveAnswer = (msg) => {
  msg.Answer = msg.tempAnswer
  msg.editing = false

  socket.emit("update_answer", {
    id: msg.id,
    answer: msg.Answer,
    user: msg.user
  })

  localStorage.setItem("qa_messages", JSON.stringify(messages.value))
}
</script>

<template>
  
  <div class="container"> 
    
    <div class="forumPanel scroll-box">
      <!-- Put the submitted questions here-->

        <!--START OF SUBMISSION-->
      <div v-for="msg in messages" :key="msg.id">
        <div :class="['msg-card', msg.Answer === 'N/A' ? 'msg-card.red-bg' : 'msg-card.green-bg']">
          <!-- Display the message details here -->
              <p class = "qa-text"><strong>Date:</strong> {{ new Date(msg.Date).toLocaleString() }}</p>
              <p class = "qa-text"><strong>Subject:</strong> {{ msg.Subject }}</p>
              <p class = "qa-text"><strong>Question:</strong> {{ msg.Question }}</p>

              <div v-if="msg.editing">
                <input v-model="msg.tempAnswer" />
                <button class="aero color-green" @click="saveAnswer(msg)">Save</button>
              </div>

              <div v-else-if="msg.Answer === 'N/A'">
                <button class="aero color-green" @click="startEdit(msg)">Solve Me!</button>
              </div>

              <div v-else>
                <p><strong>Answer:</strong></p>
                {{ msg.Answer }}
                <button class= "aero color-blue" @click="startEdit(msg)">Edit Answer</button>
              </div>

        </div>

      </div>
      <!--END OF SUBMISSION-->

    </div>

    <div class = "inputPanel hover-button">
      <!-- Put the input fields here-->

      <input class="input" v-model="subject" placeholder="Subject" />
      <input class="input" v-model="question" placeholder="Question" />
      <input class="textarea" v-model="answer" placeholder="Answer" />

      <div class = "buttons">
        <button class="aero color-green" @click="sendMessageQA">Send</button>
        <button class="aero color-red" @click="clearMessages">Clear</button>
      </div>
      

    </div>
  </div>
</template>
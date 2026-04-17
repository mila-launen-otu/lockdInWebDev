# Features

LockdIn² is built around **four core features** that power collaborative studying in real time. Here's a deep dive into each one.

---

## 💬 Real-Time Chat

<div class="feature-card">
  <div class="feature-text">
    <span class="feature-badge">Live • Socket.IO</span>
    <h3>Instant Group Messaging</h3>
    <p>LockdIn²'s chat connects everyone in your study session with zero latency. Powered by <strong>Socket.IO</strong>, messages emit from the sender and broadcast to all connected clients in milliseconds.</p>
    <p>No page refreshes. No polling. Just a clean, live feed of your study group's conversation.</p>
    <ul>
      <li>Real-time bidirectional messaging</li>
      <li>Persistent connection via Socket.IO</li>
      <li>Lightweight Vue 3 Composition API component</li>
      <li>Instant message delivery to all connected users</li>
    </ul>
  </div>
  <div>
    <img src="/hero.svg" alt="LockdIn² Chat Feature" />
  </div>
</div>

---

## 🎨 Collaborative Whiteboard

<div class="feature-card reverse">
  <div>
    <img src="/hero.svg" alt="LockdIn² Whiteboard Feature" />
  </div>
  <div class="feature-text">
    <span class="feature-badge">Live • SVG • Socket.IO</span>
    <h3>Draw Together in Real Time</h3>
    <p>The whiteboard is an SVG-based drawing canvas where every stroke you make is instantly visible to all other connected users. Perfect for diagrams, brainstorming, and visual explanations.</p>
    <p>Built entirely with Vue 3 and SVG — no canvas libraries, just clean reactive drawing.</p>
    <ul>
      <li><strong>8 drawing colors</strong> — black, red, orange, yellow, green, blue, purple, pink</li>
      <li><strong>3 brush thicknesses</strong> — fine, medium, thick</li>
      <li><strong>Eraser tool</strong> with memory (restores last color)</li>
      <li><strong>Clear board</strong> broadcast to all users</li>
      <li>Full stroke sync over Socket.IO</li>
      <li>Loads existing whiteboard state on connect</li>
    </ul>
  </div>
</div>

---

## ❓ Questions & Answers Board

<div class="feature-card">
  <div class="feature-text">
    <span class="feature-badge">Persistent • Socket.IO • localStorage</span>
    <h3>Post Questions, Get Answers</h3>
    <p>The Q&A board lets students submit homework questions. The questions broadcast to all connected users via Socket.IO, and are saved to <strong>localStorage</strong> so they persist across page refreshes.</p>
    <p>Great for asynchronous help — post a question and come back to answers later.</p>
    <ul>
      <li>Submit questions</li>
      <li>Real-time broadcast to all connected users</li>
      <li>Persisted via <code>localStorage</code> — survives refreshes</li>
      <li>One-click <strong>Clear</strong> to reset the board</li>
      <li>Form validation — required fields must be filled</li>
    </ul>
  </div>
  <div>
    <img src="/hero.svg" alt="LockdIn² Questions Feature" />
  </div>
</div>

---

## 📊 Grades Tracker

<div class="feature-card reverse">
  <div>
    <img src="/hero.svg" alt="LockdIn Grades Feature" style="padding: 16px;" />
  </div>
  <div class="feature-text">
    <span class="feature-badge">Live • D3.js • REST API • CSV</span>
    <h3>Full Academic Grade Tracking</h3>
    <p>The Grades module is a complete academic performance tracker. Log in with your username, add your classes, and enter each assignment with a score and optional weight. The app handles all the math — automatically computing your weighted average, letter grade, and GPA.</p>
    <ul>
      <li><strong>Per-class assignment tables</strong> — title, score (0–100), and weight (%)</li>
      <li><strong>Weighted grade calculation</strong> — auto-distributes equal weights if none set</li>
      <li><strong>Letter grade + GPA points</strong> — resolved against a customizable GPA scale</li>
      <li><strong>Overall GPA</strong> — averaged across all saved classes</li>
      <li><strong>D3.js bar charts</strong> — per-class score visualization and a grade distribution chart across all classes</li>
      <li><strong>CSV persistence</strong> — grades saved server-side via <code>POST /api/grades</code> and reloaded on login via <code>GET /api/grades</code></li>
      <li><strong>Customizable GPA scale</strong> — edit letter cutoffs and GPA point values, add new letters</li>
      <li><strong>User system</strong> — usernames stored in <code>users.csv</code> via <code>/api/users</code></li>
    </ul>
  </div>
</div>

---

## ⚡ Technical Features

Beyond the four main user-facing features, LockdIn² is built with a solid technical foundation:

### Vue 3 Single Page Application
The entire frontend is a **Vue 3 SPA** using the Composition API (`<script setup>`). Vue Router manages navigation between pages with no full-page reloads.

### Socket.IO Real-Time Backend
All live features — chat, whiteboard, and Q&A — are powered by a shared **Socket.IO** server running on Node.js/Express. A single connection handles all real-time events.

### Responsive Navigation
The **NavBar component** (`NavBar.vue`) is fully responsive with a hamburger menu on mobile, built using Vue's reactive data binding.

### Local Storage Persistence
The Q&A board saves messages to **`localStorage`** on the client side, meaning your questions history survives page refreshes and browser restarts without needing a database.

### Vite Dev Server
The frontend is served by **Vite** for instant hot module replacement during development and blazing-fast production builds.



# How to Run LockdIn²

LockdIn² has two parts: a **frontend** (Vue 3 + Vite) and a **backend** (Node.js + Socket.IO). Both need to run simultaneously for the app to work.

---

## Run Locally

Running LockdIn² on your own computer requires **Node.js** and a terminal. Follow these steps carefully.

### Prerequisites

Before starting, make sure you have the following installed:

| Requirement | Version | Download |
|---|---|---|
| **Node.js** | v18 or later | [nodejs.org](https://nodejs.org) |
| **npm** | Included with Node.js | — |
| A terminal | Any (Terminal, PowerShell, Git Bash) | — |

---

### Step-by-Step Instructions

<div class="step-card">
  <div class="step-number">Step 1 — Download</div>
  <h3>Get the Project Files</h3>
  <p>Download the project ZIP, extract it and open a terminal in the project folder.</p>

</div>

<div class="step-card">
  <div class="step-number">Step 2 — Install Backend Dependencies</div>
  <h3>Set Up the Server</h3>
  <p>Navigate into the <code>backend</code> folder and install the required Node packages:</p>

```bash
cd backend
npm install
```

This installs **Express** and **Socket.IO** (and any other server dependencies listed in `package.json`).
</div>

<div class="step-card">
  <div class="step-number">Step 3 — Start the Backend Server</div>
  <h3>Run the Node.js Server</h3>
  <p>While still in the <code>backend</code> folder, start the server:</p>

```bash
node server.js
```

You should see a message indicating the server is running — typically on **port 3000**. Leave this terminal open!
</div>

<div class="step-card">
  <div class="step-number">Step 4 — Install Frontend Dependencies</div>
  <h3>Set Up the Vue App</h3>
  <p>Open a <strong>second terminal window</strong>, navigate to the <code>frontend</code> folder, and install dependencies:</p>

```bash
cd frontend
npm install
```
</div>

<div class="step-card">
  <div class="step-number">Step 5 — Start the Frontend</div>
  <h3>Launch the Vite Dev Server</h3>
  <p>Still in the <code>frontend</code> folder, start the development server:</p>

```bash
npm run dev
```

Vite will output a local URL — usually **[http://localhost:5173](http://localhost:5173)**. 
</div>

<div class="step-card">
  <div class="step-number">Step 6 — Open & Collaborate</div>
  <h3>You're Live!</h3>
  <p>Open <strong>http://localhost:5173</strong> (the local URL you're given) in your browser. To test real-time features (chat, whiteboard, Q&A), open the same local URL in a second browser tab or window — they'll be connected via the local Socket.IO server.</p>
</div>

---

## Main Project Structure

```
lockdInWebDev/
├── backend/
│   ├── server.js          ← Node.js + Socket.IO + REST API (grades, users)
│   ├── public/
│   │   ├── grades.csv     ← Grade data (auto-created)
│   │   └── users.csv      ← User list (auto-created)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.vue        ← Root component + router-view
│   │   ├── main.js        ← App entry point
│   │   ├── router/
│   │   │   └── index.js   ← Vue Router config
│   │   ├── components/
│   │   │   └── NavBar.vue ← Responsive navigation
│   │   └── views/
│   │       ├── Chat.vue       ← Real-time chat
│   │       ├── Whiteboard.vue ← SVG drawing canvas
│   │       ├── Questions.vue  ← Q&A board
│   │       └── Grades.vue     ← Grades tracker
│   ├── public/
│   └── package.json
│
└── vitepress/             ← This documentation site
```

---

## Troubleshooting

### ❌ The chat / whiteboard isn't working

Make sure the **backend server is running** (`node server.js` in the `backend` folder). The frontend connects to `http://localhost:3000` — if the server isn't on, real-time features won't work.

### ❌ `npm install` fails

Make sure you have **Node.js v18 or later** installed. Run `node --version` to check.

### ❌ Port conflict

If port 3000 or 5173 is already in use, check `server.js` and `vite.config.js` for port settings and change them as needed.

### ❌ CORS errors in the browser console

This may happen if the backend and frontend are on different ports than expected. Check the `io()` connection URL in `Chat.vue`, `Whiteboard.vue`, and `Questions.vue` — it should match your actual backend URL.

### ❌ Grades not saving / loading

The Grades feature uses a REST API (`POST /api/grades`, `GET /api/grades`, `GET /api/users`, `POST /api/users`). Make sure the **backend server is running** — grades are written to `backend/public/grades.csv` and `backend/public/users.csv`, which are created automatically on first save.

---

<div class="callout tip">
  <strong>🆘 Still stuck?</strong> Check the <a href="/about/contributors">Contributors</a> page and reach out to the team for help.
</div>

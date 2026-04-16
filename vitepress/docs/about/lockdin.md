# About LockdIn²

## What is LockdIn²?

**LockdIn²** is a real-time, collaborative studying web application designed for students who want to study *with* each other — not just next to each other.

The idea is simple: studying alone is hard. But studying together, in a shared digital space where you can talk, draw, and question in real time, makes it easier, more engaging, and more effective.

LockdIn² brings together the tools students actually need:

- **Live chat** to communicate instantly
- **Shared whiteboard** to draw, diagram, and brainstorm
- **Questions board** to post and answer homework problems
- **Grades tracker** to stay on top of your academic performance

All of this runs on a single connected platform, powered by **Vue 3**, **Vite**, **Node.js**, and **Socket.IO**.

---

## The Application

Here's a look at LockdIn² in action:

<div style="margin: 2rem 0; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(124,58,237,0.2); border: 2px solid rgba(124,58,237,0.2);">
  <img src="/hero.svg" alt="LockdIn² Application Screenshot" style="width: 100%; display: block; margin: 0;" />
</div>

> _Screenshot of the LockdIn² web application interface._

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vue 3, Vue Router, Vite |
| **Backend** | Node.js, Express.js |
| **Real-time** | Socket.IO |
| **Storage** | CSV files (server-side via REST API) + localStorage |
| **Styling** | CSS, Scoped component styles |
| **Data Viz** | D3.js (grade bar charts) |
| **HTTP Client** | Axios (grades API calls) |
| **Build Tool** | Vite |
| **Documentation** | VitePress |

---

## Application Pages

### 💬 Chat
The chat page connects all online users in real time. Messages are emitted and broadcast via Socket.IO — everything you type appears instantly for every connected user. A sleek, always-on communication channel for your study group.

### 🎨 Whiteboard
A fully interactive SVG-based collaborative whiteboard. Users can:
- Select from 8 different drawing colors
- Choose between three brush thicknesses
- Use an eraser
- Clear the entire board

All strokes are shared live across every connected user's screen.

### ❓ Questions Board
A structured Q&A board where students submit questions with subject of question, the question and optionl section-the answer they think. Submissions persist in `localStorage` so they survive page refreshes. Includes a clear button to reset the board.

### 📊 Grades
A fully-featured academic tracking module. Students log in with a username, then add classes and assignments with scores (0–100) and optional weights (%). The app computes a **weighted grade percentage**, converts it to a **letter grade** and **GPA points** using a customizable GPA scale, and calculates an **overall GPA** across all saved classes. Each class renders a **D3.js bar chart** visualizing assignment performance. All grade data is **persisted to a CSV file** on the backend via a REST API (`POST /api/grades`) and reloaded on login.

---

<div class="callout tip">
  <strong>🌱 Want to run it yourself?</strong> Head to the <a href="/how-to-run">How to Run</a> page for full instructions.
</div>

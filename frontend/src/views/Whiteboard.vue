<template>
  <div class="whiteboard-container">
    <nav class="whiteboard-toolbar">
      
      <div class="group">
        <button :class="{ active: !isEraser }" @click="setEraser(false)">
          <span class="material-symbols-outlined">stylus</span>
        </button>
        <button :class="{ active: isEraser }" @click="setEraser(true)">
          <span class="material-symbols-outlined">ink_eraser</span>
        </button>
        <button @click="clearBoard">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="v-divider"></div>

      <div class="group">
        <button 
          v-for="color in ['#000000', '#e53935', '#ff9800', '#fbc02d', '#4caf50', '#1e88e5', '#8e24aa', '#f48fb1']" 
          :key="color"
          class="color-dot"
          :style="{ backgroundColor: color, '--dot-color': color }"
          :class="{ active: currentColor === color && !isEraser }"
          @click="selectColor(color)"
        ></button>
      </div>

      <div class="v-divider"></div>

      <div class="group">
        <button 
          v-for="sizeOpt in [ 
            { s: 2, icon: 'pen_size_2' }, 
            { s: 6, icon: 'pen_size_3' }, 
            { s: 12, icon: 'pen_size_5' } 
          ]" 
          :key="sizeOpt.s" 
          class="size-btn"
          :class="{ active: currentThickness === sizeOpt.s }"
          @click="currentThickness = sizeOpt.s"
        >
          <span class="material-symbols-outlined">{{ sizeOpt.icon }}</span>
        </button>
      </div>
    </nav>


    <svg 
      class="canvas" 
      @mousedown="startDrawing" 
      @mousemove="draw" 
      @mouseup="stopDrawing" 
      @mouseleave="stopDrawing"
    >
      <!-- Render all shared lines -->
      <polyline
        v-for="line in lines"
        :key="line.id"
        :points="formatPoints(line.points)"
        :stroke="line.color"
        :stroke-width="line.thickness"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <!-- Render the line currently being drawn by local user before sending -->
      <polyline
        v-if="currentLine"
        :points="formatPoints(currentLine.points)"
        :stroke="currentLine.color"
        :stroke-width="currentLine.thickness"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');
const lines = ref([]);
const currentLine = ref(null);
const isDrawing = ref(false);

const currentColor = ref('#000000');
const currentThickness = ref(3);

const isEraser = ref(false);
const lastColor = ref('#000000'); // To remember color when switching back from eraser

function selectColor(color) {
  isEraser.value = false;
  currentColor.value = color;
  lastColor.value = color;
}

function setEraser(status) {
  isEraser.value = status;
  if (status) {
    currentColor.value = '#ffffff'; // Assuming white background
  } else {
    currentColor.value = lastColor.value; // Restore the color they had
  }
}

function formatPoints(points) {
  return points.map(p => `${p.x},${p.y}`).join(' ');
}

function getCoordinates(e) {
  // Use currentTarget to ensure we get bounds of the SVG, not its child polylines
  const svg = e.currentTarget;
  const rect = svg.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// When connecting, get the existing whiteboard state
socket.on('load_whiteboard', (existingLines) => {
  lines.value = existingLines;
});

// Receive a new line drawn by another user
socket.on('draw_line', (newLine) => {
  lines.value.push(newLine);
});

// Receive a clear event
socket.on('clear_whiteboard', () => {
  lines.value = [];
});

onUnmounted(() => {
  socket.disconnect();
});


function startDrawing(e) {
  isDrawing.value = true;
  const { x, y } = getCoordinates(e);
  
  currentLine.value = {
    id: Date.now() + Math.random().toString(),
    color: currentColor.value,
    thickness: isEraser.value ? currentThickness.value * 3 : currentThickness.value,
    points: [{ x, y }]
  };
}

function draw(e) {
  if (!isDrawing.value || !currentLine.value) return;
  const { x, y } = getCoordinates(e);
  currentLine.value.points.push({ x, y });
}

function stopDrawing() {
  if (!isDrawing.value || !currentLine.value) return;
  isDrawing.value = false;
  
  // Save permanently in local state
  lines.value.push(currentLine.value);
  
  // Broadcast to other clients
  socket.emit('draw_line', currentLine.value);
  
  // Reset
  currentLine.value = null;
}

function clearBoard() {
  socket.emit('clear_whiteboard');
}
</script>


<style scoped>
.whiteboard-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #f1f5f9;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.whiteboard-toolbar {
  position: absolute;
  top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgb(249, 249, 249);
  padding: 8px 14px;
  z-index: 100;
  border-radius: 12px;
}

.group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.v-divider {
  width: 2px;
  height: 28px;
  background-color: #000;
  margin: 0 6px;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
  color: #000;
}

button:hover { background-color: #e6e9ee; }
button.active { background-color: #e2e8f0; }

.material-symbols-outlined {
  font-size: 26px;
  font-variation-settings: 'wght' 400;
  font-weight: 400;
}

/* Styling for the color dots */
.color-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  padding: 0; 
}

.color-dot.active {
  background-clip: padding-box;
  border: 2px solid rgb(249, 249, 249);
  outline: 2px solid var(--dot-color);
  transform: scale(1.15);
}

/* Styling for size picker icons */
.size-btn {
  width: 32px;
  height: 32px;
}

.canvas {
  width: 100%;
  height: 100%;
  background-color: white;
  cursor: crosshair;
  touch-action: none;
}
</style>
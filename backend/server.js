const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  },
});

let whiteboardLines = [];

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // Send existing lines to the new client
  socket.emit('load_whiteboard', whiteboardLines);

  socket.on('draw_line', (line) => {
    whiteboardLines.push(line);
    socket.broadcast.emit('draw_line', line);
  });

  socket.on('clear_whiteboard', () => {
    whiteboardLines = [];
    io.emit('clear_whiteboard');
  });


  socket.on('send_message', (data) => {
    console.log('Message received:', data);
    io.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });

  socket.on('send_messageQA', (data) => {
  console.log("QA: ",data.name, data.phone, data.email, data.message)

  // data is already the full object, just broadcast it
  io.emit('receive_messageQA', data)


})
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
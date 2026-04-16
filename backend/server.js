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

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('send_message', (data) => {
    console.log('Message received:', data);
    io.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });

  socket.on('send_messageQA', (data) => {
  console.log("QA: ",data.subject, data.question, data.answer, data.message, data.user)

  // data is already the full object, just broadcast it
  io.emit('receive_messageQA', data)


})
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
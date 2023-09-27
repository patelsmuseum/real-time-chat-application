const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/views'));

const chatMessages = []

io.on('connection', (socket) => {
  socket.on('join', (data) => {
    // Handle user joining a chat room
    socket.join(data.room);
    socket.username = data.username;
    socket.room = data.room; // Save the room name for the user
    socket.emit('chatHistory', chatMessages);
    io.to(data.room).emit('userJoined', `${data.username} joined the chat`);

    // Emit the updated user list to all clients in the room
    updateUsersInRoom(data.room);
  });

  socket.on('sendMessage', (data) => {
    // Handle sending messages
    const messageData = { username: socket.username, message: data.message };
    chatMessages.push(messageData);
    io.to(data.room).emit('message', { username: socket.username, message: data.message });
  });

  socket.on('disconnect', () => {
    // Handle user disconnect
    if (socket.username) {
      io.to(socket.room).emit('userLeft', `${socket.username} left the chat`);
      
      // Emit the updated user list to all clients in the room
      updateUsersInRoom(socket.room);
    }
  });
});

function updateUsersInRoom(room) {
  const usersInRoom = [];
  const clientsInRoom = io.sockets.adapter.rooms.get(room);

  if (clientsInRoom) {
    clientsInRoom.forEach((clientId) => {
      const clientSocket = io.sockets.sockets.get(clientId);
      usersInRoom.push(clientSocket.username);
    });
  }

  io.to(room).emit('updateUserList', usersInRoom);
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

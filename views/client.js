const socket = io();

$(document).ready(() => {
  let username, room;

  $('#joinButton').click(() => {
    username = $('#usernameInput').val();
    room = $('#roomInput').val();

    if (username && room) {
      // Hide the join form and display the chat
      $('#joinForm').hide();
      $('#chat').show();

      socket.emit('join', { username, room });

      $('#messages').append(`<p>Connected to the chat as ${username}</p>`);
    } else {
      alert('Please enter both username and room name.');
    }
  });

  $('#sendButton').click(() => {
    const message = $('#messageInput').val();
    if (message) {
      socket.emit('sendMessage', { message, room });
      $('#messageInput').val('');
    }
  });

  socket.on('userJoined', (data) => {
    $('#messages').append(`<p>${data}</p>`);
  });

  socket.on('chatHistory', (chatHistory) => {
    chatHistory.forEach((messageData) => {
      $('#messages').append(`<p><strong>${messageData.username}:</strong> ${messageData.message}</p>`);
    });
  });

  socket.on('message', (data) => {
    $('#messages').append(`<p><strong>${data.username}:</strong> ${data.message}</p>`);
  });

  socket.on('userLeft', (data) => {
    $('#messages').append(`<p>${data}</p>`);
  });

  socket.on('connect', () => {
    // This is now handled after joining the room
  });

  socket.on('disconnect', () => {
    $('#messages').append(`<p>Disconnected from the chat</p>`);
  });

  socket.on('updateUserList', (users) => {
    $('#users').empty();
    users.forEach((user) => {
      $('#users').append(`<li>${user}</li>`);
    });
  });
});

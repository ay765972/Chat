const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3001;
const publicDirectory = path.join(__dirname, "../public");
const {
  generateMessagess,
  generateLocationMessage
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");
app.use(express.static(publicDirectory));

let count = 0;

io.on("connection", socket => {
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessagess("Admin", "Welcome"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessagess("Admin", `${user.username} has joined`)
      );
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessagess(user.username, message));
    callback("Delivered");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessagess("Admin", `${user.username} has left!`)
      );
    }
  });

  socket.on("sendLocation", (coords, callback) => {
    const getuser = getUser(socket.id);
    io.to(getuser.room).emit(
      "locationMsg",
      generateLocationMessage(
        getuser.username,
        `https://google.com/maps?q=${coords.lat},${coords.long}`
      )
    );
    callback();
  });
});
server.listen(port, () => {
  console.log(`serve on port ${port}`);
});

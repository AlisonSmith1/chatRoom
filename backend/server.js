const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // 允許前端跨域
});

// 當有使用者連線
io.on("connection", (socket) => {
  console.log("新使用者連線:", socket.id);

  socket.on("chat message", (msg) => {
    console.log("訊息:", msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("使用者斷線:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server 啟動在 http://localhost:3000");
});

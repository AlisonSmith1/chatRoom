const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const passport = require("passport");
require("./config/passport")(passport);
const pool = require("./db");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const usersRouter = require("./routes/users");
const chatRoomRoute = require("./routes/chatRoom");

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", usersRouter);
app.use(
  "/chatRoom",
  passport.authenticate("jwt", { session: false }),
  chatRoomRoute
);

app.use(express.static(path.join(__dirname, "../vue/dist")));

app.get(/^.*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../vue/dist/index.html"));
});
//如果只用/會導向到首頁，無法使用vue-router的其他路由

io.use((socket, next) => {
  let token = socket.handshake.auth.token;

  if (!token) return next(new Error("No token"));

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    socket.data.userId = payload.id;
    socket.data.username = payload.username;
    next();
  } catch (err) {
    console.error("JWT 驗證錯誤:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", async (socket) => {
  socket.on("join room", async (roomId) => {
    socket.join(roomId); // 加入房間

    try {
      const result = await pool.query(
        `SELECT m.id, u.username, m.content
         FROM messages m
         JOIN users u ON m.user_id = u.id
         WHERE m.room_id = $1
         ORDER BY m.id ASC
         LIMIT 100`,
        [roomId]
      );

      const messages = result.rows;
      socket.emit("chat history", messages); // 只發給這個 socket
    } catch (err) {
      console.error("載入歷史訊息錯誤:", err.message);
    }
  });
  socket.on("chat message", async ({ content, roomId }) => {
    try {
      const result = await pool.query(
        `WITH inserted AS (
           INSERT INTO messages (user_id, content, room_id)
           VALUES ($1, $2, $3)
           RETURNING id, user_id, content
         )
         SELECT i.id, u.username, i.content
         FROM inserted i
         JOIN users u ON i.user_id = u.id;`,
        [socket.data.userId, content, roomId]
      );

      // 廣播給同房間的人
      io.to(roomId).emit("chat message", result.rows[0]);
    } catch (err) {
      console.error("訊息處理錯誤:", err.message);
      socket.emit("error message", { message: "訊息送出失敗，請稍後再試" });
    }
  });
  socket.on("disconnect", () => {
    console.log("使用者斷線:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Server 啟動在 http://localhost:4000");
});

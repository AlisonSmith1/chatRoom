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
const chatRoomRouter = require("./routes/chatRoom");

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", usersRouter);
app.use(
  "/chat",
  passport.authenticate("jwt", { session: false }),
  chatRoomRouter
);

app.use(express.static(path.join(__dirname, "../vue/dist")));

app.get(/^.*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../vue/dist/index.html"));
});

// JWT 驗證
io.use((socket, next) => {
  let token = socket.handshake.auth.token;

  if (!token) return next(new Error("No token"));

  try {
    const payload = jwt.verify(
      token.replace(/^Bearer\s+/i, ""),
      process.env.JWT_SECRET
    );
    socket.data.userId = payload.id;
    socket.data.username = payload.username;
    next();
  } catch (err) {
    console.error("JWT 驗證錯誤:", err.message);
    next(new Error("Authentication error"));
  }
});

// 等待隨機配對的用戶
const waitingQueue = [];

io.on("connection", async (socket) => {
  console.log("使用者連線:", socket.id);

  // 加入一般聊天室房間
  socket.on("join room", async (roomId) => {
    socket.join(roomId);

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

      socket.emit("chat history", result.rows);
    } catch (err) {
      console.error("載入歷史訊息錯誤:", err.message);
    }
  });

  // 一般聊天室訊息
  socket.on("chat message", async ({ content, roomId }, callback) => {
    console.log(roomId);
    try {
      await pool.query(
        `INSERT INTO chat_rooms (id, name)
       VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
        [roomId, `Room ${roomId}`]
      );

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

      const msg = result.rows[0];
      io.to(roomId).emit("chat message", msg);
      if (callback) callback({ status: "ok" });
    } catch (err) {
      console.error("訊息處理錯誤:", err.message);
      if (callback)
        callback({ status: "error", message: "訊息送出失敗，請稍後再試" });
      socket.emit("error message", { message: "訊息送出失敗，請稍後再試" });
    }
  });

  // 隨機一對一配對
  socket.on("find random chat", () => {
    if (waitingQueue.length > 0) {
      const partnerSocket = waitingQueue.shift();
      const roomId = `private_${socket.id}_${partnerSocket.id}`;

      socket.join(roomId);
      partnerSocket.join(roomId);

      socket.emit("matched", { roomId });
      partnerSocket.emit("matched", { roomId });
    } else {
      waitingQueue.push(socket);
      socket.emit("waiting");
    }
  });

  // 私人訊息
  socket.on("private message", async ({ roomId, content }, callback) => {
    io.to(roomId).emit("private message", {
      username: socket.data.username,
      content,
    });
    if (callback) callback({ status: "ok" });
  });

  socket.on("disconnect", (roomId) => {
    const index = waitingQueue.indexOf(socket);
    if (index !== -1) waitingQueue.splice(index, 1);
    console.log("使用者斷線:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Server 啟動在 http://localhost:4000");
});

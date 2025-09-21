const express = require("express");
const helmet = require("helmet");
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
const uploadRoute = require("./routes/upload");

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    },
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", usersRouter);
app.use("/chat", express.static(path.join(__dirname, "../vue/dist")));
app.use(
  "/api/chat",
  passport.authenticate("jwt", { session: false }),
  chatRoomRouter
);
app.use("/upload", uploadRoute);

app.use(express.static(path.join(__dirname, "../vue/dist")));

app.get(/^.*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../vue/dist/index.html"));
});

// JWT 驗證
io.use((socket, next) => {
  let token = socket.handshake.auth.token;

  if (!token) return next(new Error("No token"));

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

// 等待隨機配對的用戶
const waitingQueue = [];

io.on("connection", async (socket) => {
  console.log("使用者連線:", socket.id);

  // 加入一般聊天室房間
  socket.on("join room", async (roomId) => {
    socket.join(roomId);

    try {
      const result = await pool.query(
        `SELECT 
         m.id, 
         u.username, 
         m.content,
         m.file_url,
         m.file_type
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

  // 使用者正在輸入
  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("typing", {
      username: socket.data.username,
    });
  });

  // 使用者停止輸入
  socket.on("stop typing", (roomId) => {
    socket.to(roomId).emit("stop typing", {
      username: socket.data.username,
    });
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

  socket.on("send file", async ({ roomId, fileUrl, fileType }) => {
    try {
      const result = await pool.query(
        `WITH inserted AS (
         INSERT INTO messages (user_id, content, room_id, file_url, file_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, content, file_url, file_type
       )
       SELECT i.id, u.username, i.content, i.file_url, i.file_type
       FROM inserted i
       JOIN users u ON i.user_id = u.id;`,
        [socket.data.userId, null, roomId, fileUrl, fileType]
      );

      const msg = result.rows[0];
      console.log(msg);
      io.to(roomId).emit("file message", msg);
    } catch (e) {
      console.error(e);
    }
  });

  // 隨機一對一配對
  socket.on("find random chat", () => {
    // 找等待隊列中不是自己（userId 不同）的對象
    const partnerIndex = waitingQueue.findIndex(
      (s) => s.data.userId !== socket.data.userId
    );

    if (partnerIndex !== -1) {
      const partnerSocket = waitingQueue.splice(partnerIndex, 1)[0];
      const roomId = `private_${socket.data.userId}_${partnerSocket.data.userId}`;

      socket.join(roomId);
      partnerSocket.join(roomId);

      socket.emit("matched", { roomId });
      partnerSocket.emit("matched", { roomId });

      console.log(
        `配對成功: ${socket.data.userId} <-> ${partnerSocket.data.userId}`
      );
    } else {
      // 如果沒有其他人，自己加入等待隊列（避免重複加入）
      if (!waitingQueue.includes(socket)) waitingQueue.push(socket);
      socket.emit("waiting");
      console.log(`等待配對: ${socket.data.userId}`);
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

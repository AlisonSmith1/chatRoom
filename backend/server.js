const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const passport = require("passport");
require("./config/passport")(passport);
const pool = require("./db");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const { json } = require("node:stream/consumers");
const jwt = require("jsonwebtoken");

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", require("./routes/users"));
app.use(
  "/chatRoom",
  passport.authenticate("jwt", { session: false }),
  require("./routes/chatRoom")
);

io.use((socket, next) => {
  let token = socket.handshake.auth.token;
  console.log("收到 token:", token);

  if (!token) return next(new Error("No token"));

  if (token.startsWith("Bearer ")) {
    token = token.slice(7); // 只留下真正的 jwt
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.id;
    socket.username = payload.username;
    next();
  } catch (err) {
    console.error("JWT 驗證錯誤:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", async (socket) => {
  console.log("新使用者連線:", socket.id);

  // 讀取歷史訊息
  // 讀取所有歷史訊息
  const result = await pool.query(
    `SELECT m.id, m.user_id, m.content, u.username
   FROM messages m
   JOIN users u ON m.user_id = u.id
   ORDER BY m.id ASC`
  );

  result.rows.forEach((row) => {
    socket.emit("chat message", {
      id: row.id,
      userId: row.user_id,
      username: row.username,
      content: row.content,
    });
  });

  // 接收訊息
  socket.on("chat message", async (msg) => {
    const result = await pool.query(
      "INSERT INTO messages (user_id, content) VALUES ($1, $2) RETURNING id",
      [socket.userId, msg]
    );

    io.emit("chat message", {
      id: result.rows[0].id,
      userId: socket.userId,
      username: socket.username,
      content: msg,
    });
  });

  socket.on("disconnect", () => {
    console.log("使用者斷線:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server 啟動在 http://localhost:3000");
});

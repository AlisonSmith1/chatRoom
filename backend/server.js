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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../vue/dist/index.html"));
});

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
  console.log("新使用者連線:", socket.id);
  try {
    const result = await pool.query(
      `SELECT m.id, u.username, m.content
     FROM messages m
     JOIN users u ON m.user_id = u.id
     ORDER BY m.id DESC
     LIMIT 100`
    );

    const messages = result.rows.reverse();

    socket.emit("chat history", messages);
  } catch (err) {
    console.error("載入歷史訊息錯誤:", err.message);
  }

  // 接收訊息
  socket.on("chat message", async (msg) => {
    try {
      const result = await pool.query(
        `WITH inserted AS (
     INSERT INTO messages (user_id, content)
     VALUES ($1, $2)
     RETURNING id, user_id, content
   )
   SELECT i.id, u.username, i.content
   FROM inserted i
   JOIN users u ON i.user_id = u.id;`,
        [socket.data.userId, msg]
      );

      io.emit("chat message", result.rows[0]);
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

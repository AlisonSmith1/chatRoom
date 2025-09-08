const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const passport = require("passport");
require("./config/passport")(passport);
const pool = require("./db");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

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

io.on("connection", async (socket) => {
  console.log("新使用者連線:", socket.id);

  // 讀取歷史訊息
  const lastReadId = 0; // 或從前端傳來的最後已讀 ID
  const rows = await pool.query(
    "SELECT id, user_id, content FROM messages WHERE id > $1 ORDER BY id ASC",
    [lastReadId]
  );

  rows.rows.forEach((row) => {
    socket.emit("chat message", row.content, row.id, row.user_id);
  });

  // 接收訊息
  socket.on("chat message", async (msg) => {
    const result = await pool.query(
      "INSERT INTO messages (user_id, content) VALUES ($1, $2) RETURNING id",
      [socket.userId, msg]
    );
    io.emit("chat message", msg, result.rows[0].id, socket.userId);
  });

  socket.on("disconnect", () => {
    console.log("使用者斷線:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server 啟動在 http://localhost:3000");
});

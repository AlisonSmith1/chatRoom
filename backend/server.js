const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const passport = require("passport");
require("./config/passport")(passport);
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let db;

async function main() {
  db = await open({
    filename: "chat.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        content TEXT
    );
  `);

  // 啟動伺服器
  server.listen(3000, () => {
    console.log("Server 啟動在 http://localhost:3000");
  });
}

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
  const rows = await db.all("SELECT id, content FROM messages ORDER BY id ASC");
  rows.forEach((row) => {
    socket.emit("chat message", row.content, row.id);
  });

  // 接收訊息
  socket.on("chat message", async (msg) => {
    console.log("訊息:", msg);
    try {
      const result = await db.run(
        "INSERT INTO messages (content) VALUES (?)",
        msg
      );
      io.emit("chat message", msg, result.lastID);
    } catch (e) {
      console.error("資料庫儲存失敗:", e);
    }
  });

  socket.on("disconnect", () => {
    console.log("使用者斷線:", socket.id);
  });
});

main();

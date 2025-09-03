const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const server = http.createServer(app);
const passport = require("passport");
const io = new Server(server, {
  cors: { origin: "*" },
});

const userRouter = require("./routes/user");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", passport.authenticate("jwt", { session: false }), userRouter);

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
  console.log("Server 啟動在 http://localhost:4000");
});

app.listen(3000, () => {
  console.log("伺服器已啟動：http://localhost:3000");
});

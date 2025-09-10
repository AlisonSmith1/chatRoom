"# chatRoom"
前端 (Vue)
────────────────────────────────────

1. 首頁

   - 開頭介紹

2. 註冊頁

   - 輸入帳號密碼 → POST /register

3. 登入頁

   - 輸入帳號密碼 → POST /login
   - 成功後拿到 JWT / Session

4. 聊天頁
   - 建立 socket.io 連線
     - io("http://localhost:4000", { auth: { token: JWT } })
   - 顯示訊息列表
   - 送訊息給 server
     ────────────────────────────────────

後端 (Node.js + Express + socket.io)
────────────────────────────────────

1. HTTP Route

   - POST /login
     - 驗證帳號密碼 → passport-jwt
     - 成功 → 回傳 JWT
   - GET /account
     - 取得歷史訊息

2. WebSocket (socket.io)
   - io.use((socket, next) => { 驗證 JWT })
   - io.on('connection', (socket) => { - 監聽 chat message - 廣播訊息給其他使用者 - 可以存資料庫
     })
     ────────────────────────────────────

資料庫 (PostgreSQL)
────────────────────────────────────

- users
  - id, username, password(hashed)
- messages
  - id, senderId, content, timestamp, room_id
    ────────────────────────────────────

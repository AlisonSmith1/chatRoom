const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userQuery = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    const user = userQuery.rows[0];
    if (!user) {
      return res.status(400).json({ error: "帳號或密碼錯誤" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    //(使用者輸入的明文密碼,資料庫存的密碼)
    //bcrypt 把明文密碼轉成 不可逆的雜湊值
    if (!isMatch) {
      return res.status(400).json({ error: "帳號或密碼錯誤" });
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    //（有效負載， secretOrPrivateKey， [選項， 回呼]）
    return res.json({
      message: "登入成功",
      token: "Bearer " + token,
      user: {
        username: user.username,
      },
    });
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ error: "伺服器錯誤" });
  }
});

module.exports = router;

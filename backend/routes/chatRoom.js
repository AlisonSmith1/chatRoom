const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const pool = require("../db");

router.get("/", authenticateToken, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "無法取得聊天資料" });
  }
});

module.exports = router;

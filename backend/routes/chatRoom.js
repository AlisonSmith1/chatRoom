const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = router;

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "chatRoom",
  password: "1234",
  port: 5432,
  ssl: false,
});

module.exports = pool;

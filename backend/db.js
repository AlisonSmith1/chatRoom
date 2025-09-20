const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "chatRoom",
//   password: "password",
//   port: 5432,
//   ssl: false,
// });

module.exports = pool;

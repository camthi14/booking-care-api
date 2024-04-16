import mysql from "mysql2";
import config from "../config/index.js";

const pool = mysql
  .createPool({
    host: config.db.host,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    connectionLimit: 10,
  })
  .promise();

export default pool;

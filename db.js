const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hostel_management_system',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

const pool = mysql.createPool(dbConfig);

// Helper function to initialize database if missing
async function ensureDatabaseExists() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL database "${dbConfig.database}" on ${dbConfig.host}:${dbConfig.port}!`);
    connection.release();
  } catch (err) {
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.log(`[Database] Database "${dbConfig.database}" does not exist. Creating it automatically...`);
      try {
        const rootConnection = await mysql.createConnection({
          host: dbConfig.host,
          user: dbConfig.user,
          password: dbConfig.password,
          port: dbConfig.port
        });
        await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        await rootConnection.end();
        console.log(`[Database] Database "${dbConfig.database}" created successfully!`);
      } catch (createErr) {
        console.error('[Database] Failed to create database automatically:', createErr.message);
      }
    } else {
      console.error('[Database] Connection failed:', err.message);
      console.error('[Database] Hint: Ensure XAMPP Control Panel is open and MySQL service is running on port ' + dbConfig.port);
    }
  }
}

ensureDatabaseExists();

module.exports = pool;


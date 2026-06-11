const { Pool } = require('pg');

let poolConfig;
if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    max: 5,
    idleTimeoutMillis: 30000,
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    max: 5,
    idleTimeoutMillis: 30000,
  };
}
const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Postgres pool error:', err);
});

module.exports = pool;

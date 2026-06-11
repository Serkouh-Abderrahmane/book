require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

(async () => {
  try {
    await client.connect();
    console.log('DB connected successfully');
    const result = await client.query('SELECT NOW() as now, version() as ver');
    console.log('Query result:', JSON.stringify(result.rows));
    await client.end();
  } catch (err) {
    console.error('DB error:', err.code, err.message);
    console.error('Host from URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1]?.split('/')[0] : 'no url');
    process.exitCode = 1;
  }
})();

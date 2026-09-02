const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'safenepal',
  password: 'safenepal_secret',
  database: 'safenepal',
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected to PostgreSQL database');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect,
};
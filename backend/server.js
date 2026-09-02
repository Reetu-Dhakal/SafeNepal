const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
const disasterRoutes = require('./app/api/v1/disaster');
const newsRoutes = require('./app/api/v1/news');

app.use('/api/v1/disasters', disasterRoutes);
app.use('/api/v1/news', newsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'SafeNepal API is running', version: '1.0.0' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize database pool (non-blocking - won't prevent server start)
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'safenepal',
  password: 'safenepal_secret',
  database: 'safenepal',
});

pool
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    app.set('db', { query: (text, params) => pool.query(text, params) });
  })
  .catch((err) => {
    console.warn('Database connection skipped (running without DB)', err.message);
  });

module.exports = app;
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'SafeNepal API is running', version: '1.0.0' });
});

// Disaster endpoints
app.get('/api/v1/disasters/active', (req, res) => {
  res.json([
    {
      id: 1,
      type: 'flood',
      title: 'Flood in Terai Region',
      severity: 'high',
      affected_areas: ['Bara', 'Parsa'],
      reported_at: new Date(),
    },
    {
      id: 2,
      type: 'landslide',
      title: 'Landslide in hilly region',
      severity: 'medium',
      affected_areas: ['Syangja', 'Palpa'],
      reported_at: new Date(),
    },
  ]);
});

// Specific disaster by ID
app.get('/api/v1/disasters/:id', (req, res) => {
  const disasterId = parseInt(req.params.id);
  res.json({
    id: disasterId,
    type: 'flood',
    title: `Disaster event #${disasterId}`,
    severity: 'medium',
    affected_areas: [],
    reported_at: new Date(),
  });
});

// Create disaster report
app.post('/api/v1/disasters', (req, res) => {
  const disaster = req.body;
  res.status(201).json({
    message: 'Disaster report created',
    disaster,
  });
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
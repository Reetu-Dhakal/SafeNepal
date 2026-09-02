const express = require('express');
const router = express.Router();

// Health endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root endpoint
router.get('/', (req, res) => {
  res.json({ message: 'SafeNepal API v1' });
});

// Disaster events (mock data for development)
router.get('/disasters/active', (req, res) => {
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

module.exports = router;
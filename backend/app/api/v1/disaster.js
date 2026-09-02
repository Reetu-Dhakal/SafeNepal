const express = require('express');
const router = express.Router();

// Active disasters - data format matches Home.tsx expectations
router.get('/active', (req, res) => {
  res.json([
    {
      id: "1",
      title: "Flood in Terai Region",
      disaster_type: "flood",
      risk_level: "high",
      risk_score: 85,
      confidence: "high",
      summary: "River overflow affecting Bara and Parsa districts",
      started_at: new Date().toISOString(),
      location: { name: "Terai Region", province: "Province 2" },
      affected_people: 15000,
      sources: ["NDMA", "Local News"],
    },
    {
      id: "2",
      title: "Landslide in hilly region",
      disaster_type: "landslide",
      risk_level: "medium",
      risk_score: 60,
      confidence: "medium",
      summary: "Soil instability after heavy rains in Syangja district",
      started_at: new Date(Date.now() - 86400000).toISOString(),
      location: { name: "Hilly Region", province: "Gandaki Province" },
      affected_people: 3000,
      sources: ["District Administration"],
    },
  ]);
});

// Specific disaster by ID
router.get('/:id', (req, res) => {
  const disasterId = req.params.id;
  res.json({
    id: disasterId,
    title: `Disaster event #${disasterId}`,
    disaster_type: "flood",
    risk_level: "medium",
    risk_score: 50,
    confidence: "low",
    summary: "Sample disaster event",
    started_at: new Date().toISOString(),
    location: { name: "Unknown", province: "Unknown" },
    affected_people: null,
    sources: [],
  });
});

// Create disaster report
router.post('/', (req, res) => {
  const disaster = req.body;
  res.status(201).json({ 
    message: 'Disaster report created', 
    disaster 
  });
});

module.exports = router;
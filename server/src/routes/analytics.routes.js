const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/stats', (req, res) => {
  res.json({
    totalDreams: 15,
    thisMonth: 7,
    avgLucidity: 6.5,
    recurringCount: 3,
    patterns: []
  });
});

router.get('/mood-trends', (req, res) => {
  res.json([
    { date: '2024-01-01', mood: 'positive', count: 3 },
    { date: '2024-01-02', mood: 'neutral', count: 2 },
    { date: '2024-01-03', mood: 'mysterious', count: 4 }
  ]);
});

module.exports = router;
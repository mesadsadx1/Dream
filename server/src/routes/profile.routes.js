const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email
  });
});

router.get('/stats', (req, res) => {
  res.json({
    totalDreams: 0,
    avgLucidity: 0,
    recurringCount: 0,
    thisMonth: 0
  });
});

module.exports = router;
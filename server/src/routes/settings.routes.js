const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { getDatabase } = require('../database/db');

const db = getDatabase();

router.use(authMiddleware);

// Получить настройки
router.get('/', (req, res) => {
  const userId = req.user.id;
  
  db.get(
    'SELECT preferences FROM users WHERE id = ?',
    [userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const preferences = row?.preferences ? JSON.parse(row.preferences) : {};
      res.json(preferences);
    }
  );
});

// Обновить настройки
router.put('/', (req, res) => {
  const userId = req.user.id;
  const settings = req.body;
  
  db.run(
    'UPDATE users SET preferences = ?, updated_at = datetime("now") WHERE id = ?',
    [JSON.stringify(settings), userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Settings updated' });
    }
  );
});

// Экспорт данных
router.get('/export/data', (req, res) => {
  const userId = req.user.id;
  
  // Получаем все данные пользователя
  const userData = {};
  
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    userData.profile = user;
    
    db.all('SELECT * FROM dreams WHERE user_id = ?', [userId], (err, dreams) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      userData.dreams = dreams;
      userData.exportDate = new Date().toISOString();
      
      res.json(userData);
    });
  });
});

module.exports = router;
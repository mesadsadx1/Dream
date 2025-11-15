const { getDatabase } = require('../database/db');
const ollamaService = require('../services/ollama.service');

class DreamController {
  constructor() {
    this.db = getDatabase();
  }

  async createDream(req, res) {
    const { title, content, mood, tags, isRecurring, lucidityLevel, sleepQuality } = req.body;
    const userId = req.user.id;

    try {
      const interpretation = await ollamaService.generateInterpretation(content, {});
      
      const query = `
        INSERT INTO dreams (user_id, title, content, interpretation, mood, tags, is_recurring, lucidity_level, sleep_quality)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        userId, 
        title || `Сон от ${new Date().toLocaleDateString()}`, 
        content, 
        JSON.stringify(interpretation),
        mood || 'neutral',
        JSON.stringify(tags || []), 
        isRecurring ? 1 : 0,
        lucidityLevel || 0, 
        sleepQuality || 5
      ], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json({
          id: this.lastID,
          interpretation: interpretation.structured,
          rawInterpretation: interpretation.rawResponse
        });
      });
    } catch (error) {
      console.error('Dream creation error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getDreams(req, res) {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;
    
    const query = `SELECT * FROM dreams WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
    this.db.all(query, [userId, parseInt(limit), parseInt(offset)], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const dreams = rows.map(row => ({
        ...row,
        interpretation: row.interpretation ? JSON.parse(row.interpretation) : null,
        tags: row.tags ? JSON.parse(row.tags) : []
      }));
      
      res.json(dreams);
    });
  }

  async getDreamById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    
    this.db.get('SELECT * FROM dreams WHERE id = ? AND user_id = ?', [id, userId], (err, dream) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!dream) {
        return res.status(404).json({ error: 'Dream not found' });
      }
      
      dream.interpretation = dream.interpretation ? JSON.parse(dream.interpretation) : null;
      dream.tags = dream.tags ? JSON.parse(dream.tags) : [];
      
      res.json(dream);
    });
  }

  async deleteDream(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    
    this.db.run('DELETE FROM dreams WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Dream not found' });
      }
      res.json({ message: 'Dream deleted successfully' });
    });
  }

  async getDreamPatterns(req, res) {
    res.json({ patterns: [], message: 'Pattern analysis coming soon' });
  }
}

module.exports = new DreamController();
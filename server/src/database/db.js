const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;

const getDatabase = () => {
  if (!db) {
    const dbPath = path.join(__dirname, 'dreams.db');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      }
    });
  }
  return db;
};

module.exports = { getDatabase };
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'dreams.db');

const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    // Create tables
    db.serialize(() => {
      // Users table с полем is_admin
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          phone TEXT,
          birth_date TEXT,
          avatar TEXT,
          preferences TEXT,
          is_admin INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
        } else {
          console.log('Users table ready');
        }
      });

      // Dreams table
      db.run(`
        CREATE TABLE IF NOT EXISTS dreams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT,
          content TEXT NOT NULL,
          interpretation TEXT,
          mood TEXT,
          tags TEXT,
          symbols TEXT,
          is_recurring BOOLEAN DEFAULT 0,
          lucidity_level INTEGER DEFAULT 0,
          sleep_quality INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('Error creating dreams table:', err);
        else console.log('Dreams table ready');
      });

      // Dream categories
      db.run(`
        CREATE TABLE IF NOT EXISTS dream_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dream_id INTEGER,
          category TEXT,
          confidence REAL,
          FOREIGN KEY (dream_id) REFERENCES dreams(id)
        )
      `, (err) => {
        if (err) console.error('Error creating dream_categories table:', err);
        else console.log('Dream categories table ready');
      });

      // User sessions
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          token TEXT UNIQUE,
          expires_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('Error creating sessions table:', err);
        else console.log('Sessions table ready');
      });

      // Dream patterns
      db.run(`
        CREATE TABLE IF NOT EXISTS dream_patterns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          pattern_type TEXT,
          pattern_data TEXT,
          frequency INTEGER,
          last_occurrence DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) console.error('Error creating dream_patterns table:', err);
        else console.log('Dream patterns table ready');
        
        // После создания всех таблиц создаем админа
        createAdminAccount(db, () => {
          console.log('Database initialization complete');
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            }
            resolve();
          });
        });
      });
    });
  });
};

// Создание админского аккаунта
async function createAdminAccount(db, callback) {
  const adminPassword = await bcrypt.hash('admin', 10);
  
  // Проверяем, существует ли админ
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (err) {
      console.error('Error checking admin account:', err);
      callback();
      return;
    }
    
    if (!row) {
      // Создаем админа
      db.run(`
        INSERT INTO users (username, email, password, is_admin, created_at, updated_at)
        VALUES ('admin', 'admin@dreamai.com', ?, 1, datetime('now'), datetime('now'))
      `, [adminPassword], (err) => {
        if (err) {
          console.error('Error creating admin account:', err);
        } else {
          console.log('✅ Admin account created successfully (login: admin, password: admin)');
        }
        callback();
      });
    } else {
      console.log('✅ Admin account already exists');
      callback();
    }
  });
}

module.exports = initDatabase;
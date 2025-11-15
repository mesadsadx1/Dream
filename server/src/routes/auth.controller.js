const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/dreams.db'));

class AuthController {
  // Регистрация
  async register(req, res) {
    const { username, email, password } = req.body;

    try {
      // Проверка на существующего пользователя
      db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка базы данных', error: err.message });
        }

        if (user) {
          return res.status(400).json({ message: 'Пользователь с таким email или именем уже существует' });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const query = `
          INSERT INTO users (username, email, password, created_at, updated_at)
          VALUES (?, ?, ?, datetime('now'), datetime('now'))
        `;

        db.run(query, [username, email, hashedPassword], function(err) {
          if (err) {
            return res.status(500).json({ message: 'Ошибка при создании пользователя', error: err.message });
          }

          // Создание токена
          const token = jwt.sign(
            { id: this.lastID, username, email },
            process.env.JWT_SECRET || 'your_secret_key_here',
            { expiresIn: '7d' }
          );

          // Сохранение сессии
          const sessionQuery = `
            INSERT INTO sessions (user_id, token, expires_at, created_at)
            VALUES (?, ?, datetime('now', '+7 days'), datetime('now'))
          `;

          db.run(sessionQuery, [this.lastID, token], (sessionErr) => {
            if (sessionErr) {
              console.error('Session error:', sessionErr);
            }
          });

          res.status(201).json({
            message: 'Регистрация успешна',
            token,
            user: {
              id: this.lastID,
              username,
              email
            }
          });
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  // Вход
  async login(req, res) {
    const { email, password } = req.body;

    try {
      // Проверка на админа
      if (email === 'admin' && password === 'admin') {
        // Создаем или получаем админский аккаунт
        db.get('SELECT * FROM users WHERE username = ?', ['admin'], async (err, admin) => {
          if (!admin) {
            // Создаем админа если его нет
            const hashedPassword = await bcrypt.hash('admin', 10);
            const insertQuery = `
              INSERT INTO users (username, email, password, is_admin, created_at, updated_at)
              VALUES ('admin', 'admin@dreamai.com', ?, 1, datetime('now'), datetime('now'))
            `;
            
            db.run(insertQuery, [hashedPassword], function(err) {
              if (err) {
                return res.status(500).json({ message: 'Ошибка создания админа' });
              }

              const token = jwt.sign(
                { id: this.lastID, username: 'admin', email: 'admin@dreamai.com', isAdmin: true },
                process.env.JWT_SECRET || 'your_secret_key_here',
                { expiresIn: '7d' }
              );

              return res.json({
                message: 'Добро пожаловать, администратор!',
                token,
                user: {
                  id: this.lastID,
                  username: 'admin',
                  email: 'admin@dreamai.com',
                  isAdmin: true
                }
              });
            });
          } else {
            // Админ уже существует
            const token = jwt.sign(
              { id: admin.id, username: admin.username, email: admin.email, isAdmin: true },
              process.env.JWT_SECRET || 'your_secret_key_here',
              { expiresIn: '7d' }
            );

            return res.json({
              message: 'Добро пожаловать, администратор!',
              token,
              user: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                isAdmin: true
              }
            });
          }
        });
        return;
      }

      // Обычная авторизация
      db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, email], async (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Ошибка базы данных' });
        }

        if (!user) {
          return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        // Создание токена
        const token = jwt.sign(
          { 
            id: user.id, 
            username: user.username, 
            email: user.email,
            isAdmin: user.is_admin === 1
          },
          process.env.JWT_SECRET || 'your_secret_key_here',
          { expiresIn: '7d' }
        );

        // Сохранение сессии
        const sessionQuery = `
          INSERT INTO sessions (user_id, token, expires_at, created_at)
          VALUES (?, ?, datetime('now', '+7 days'), datetime('now'))
        `;

        db.run(sessionQuery, [user.id, token]);

        res.json({
          message: 'Вход выполнен успешно',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.is_admin === 1
          }
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  }

  // Получить текущего пользователя
  async getMe(req, res) {
    const userId = req.user.id;

    db.get('SELECT id, username, email, phone, birth_date, avatar, created_at FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка базы данных' });
      }

      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      res.json(user);
    });
  }

  // Выход
  async logout(req, res) {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      db.run('DELETE FROM sessions WHERE token = ?', [token], (err) => {
        if (err) {
          console.error('Logout error:', err);
        }
      });
    }

    res.json({ message: 'Выход выполнен успешно' });
  }
}

module.exports = new AuthController();
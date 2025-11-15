const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/db');

class AuthController {
  constructor() {
    this.db = getDatabase();
  }

  async register(req, res) {
    const { username, email, password } = req.body;
    const db = this.db; // Сохраняем ссылку на db
    
    console.log('Register attempt:', { username, email });

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    try {
      // Используем промисы для лучшей обработки ошибок
      await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM users WHERE email = ? OR username = ?', 
          [email, username], 
          (err, user) => {
            if (err) {
              reject(err);
              return;
            }
            if (user) {
              reject(new Error('Пользователь уже существует'));
              return;
            }
            resolve();
          }
        );
      });

      const hashedPassword = await bcrypt.hash(password, 10);
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (username, email, password, created_at, updated_at)
           VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
          [username, email, hashedPassword],
          function(err) {
            if (err) {
              reject(err);
              return;
            }
            
            const token = jwt.sign(
              { id: this.lastID, username, email },
              process.env.JWT_SECRET || 'your_secret_key_here',
              { expiresIn: '7d' }
            );
            
            resolve({
              token,
              user: {
                id: this.lastID,
                username,
                email
              }
            });
          }
        );
      }).then(result => {
        console.log('Registration successful:', result.user);
        res.status(201).json({
          message: 'Регистрация успешна',
          ...result
        });
      });

    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'Пользователь уже существует') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ 
        message: 'Ошибка сервера при регистрации',
        error: error.message 
      });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    const db = this.db; // Сохраняем ссылку на db
    
    console.log('Login attempt:', { email });

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    try {
      // Специальная проверка для админа
      if (email === 'admin' && password === 'admin') {
        console.log('Admin login detected');
        
        // Проверяем существует ли админ в БД
        const admin = await new Promise((resolve, reject) => {
          db.get(
            'SELECT * FROM users WHERE username = ? AND is_admin = 1', 
            ['admin'], 
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });

        if (!admin) {
          console.log('Creating admin account...');
          // Создаем админа
          const hashedPassword = await bcrypt.hash('admin', 10);
          
          const newAdmin = await new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO users (username, email, password, is_admin, created_at, updated_at)
               VALUES ('admin', 'admin@dreamai.com', ?, 1, datetime('now'), datetime('now'))`,
              [hashedPassword],
              function(err) {
                if (err) {
                  console.error('Error creating admin:', err);
                  reject(err);
                  return;
                }
                resolve({
                  id: this.lastID,
                  username: 'admin',
                  email: 'admin@dreamai.com',
                  is_admin: 1
                });
              }
            );
          });

          const token = jwt.sign(
            { 
              id: newAdmin.id, 
              username: 'admin', 
              email: 'admin@dreamai.com', 
              isAdmin: true 
            },
            process.env.JWT_SECRET || 'your_secret_key_here',
            { expiresIn: '7d' }
          );

          return res.json({
            message: 'Добро пожаловать, администратор!',
            token,
            user: newAdmin
          });
        }

        // Админ существует, выдаем токен
        const token = jwt.sign(
          { 
            id: admin.id, 
            username: admin.username, 
            email: admin.email, 
            isAdmin: true 
          },
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

      // Обычный вход
      const user = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM users WHERE email = ? OR username = ?', 
          [email, email], 
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!user) {
        console.log('User not found:', email);
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        console.log('Invalid password for user:', email);
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }

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

      console.log('Login successful for:', user.username);

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

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Ошибка сервера при входе',
        error: error.message 
      });
    }
  }

  async getMe(req, res) {
    const userId = req.user.id;
    const db = this.db; // Сохраняем ссылку на db
    
    try {
      const user = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id, username, email, phone, birth_date, avatar, created_at FROM users WHERE id = ?', 
          [userId], 
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      res.json(user);
    } catch (error) {
      console.error('GetMe error:', error);
      res.status(500).json({ message: 'Ошибка получения пользователя' });
    }
  }

  async logout(req, res) {
    res.json({ message: 'Выход выполнен успешно' });
  }
}

module.exports = new AuthController();
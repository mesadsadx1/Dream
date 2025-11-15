const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database/dreams.db'));

const register = async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Register:', { username, email });

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (username, email, password, created_at, updated_at)
     VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
    [username, email, hashedPassword],
    function(err) {
      if (err) {
        console.error('Registration error:', err);
        return res.status(400).json({ message: 'Пользователь уже существует' });
      }

      const token = jwt.sign(
        { id: this.lastID, username, email },
        'your_secret_key_here',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Регистрация успешна',
        token,
        user: { id: this.lastID, username, email }
      });
    }
  );
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login:', email);

  // Админ вход
  if (email === 'admin' && password === 'admin') {
    const token = jwt.sign(
      { id: 1, username: 'admin', email: 'admin@dreamai.com', isAdmin: true },
      'your_secret_key_here',
      { expiresIn: '7d' }
    );

    console.log('Admin login successful');

    return res.json({
      message: 'Добро пожаловать, администратор!',
      token,
      user: { 
        id: 1, 
        username: 'admin', 
        email: 'admin@dreamai.com', 
        isAdmin: true 
      }
    });
  }

  // Обычный вход
  db.get(
    'SELECT * FROM users WHERE email = ? OR username = ?',
    [email, email],
    async (err, user) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Ошибка сервера' });
      }

      if (!user) {
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({ message: 'Неверный логин или пароль' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        'your_secret_key_here',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Вход выполнен',
        token,
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email 
        }
      });
    }
  );
};

const getMe = (req, res) => {
  console.log('GetMe called for user:', req.user);
  
  // Для админа возвращаем фиксированные данные
  if (req.user.isAdmin) {
    console.log('Returning admin data');
    return res.json({
      id: 1,
      username: 'admin',
      email: 'admin@dreamai.com',
      isAdmin: true
    });
  }

  // Для обычных пользователей
  const userId = req.user.id;
  
  db.get(
    'SELECT id, username, email, phone, birth_date, avatar, created_at FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        console.error('GetMe error:', err);
        return res.status(500).json({ message: 'Ошибка базы данных' });
      }
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      console.log('Returning user data:', user);
      res.json(user);
    }
  );
};

const logout = (req, res) => {
  res.json({ message: 'Выход выполнен' });
};

module.exports = { register, login, getMe, logout };
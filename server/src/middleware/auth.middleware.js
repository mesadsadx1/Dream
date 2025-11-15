const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    // Проверка токена
    const decoded = jwt.verify(token, 'your_secret_key_here');
    console.log('Token decoded:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Токен недействителен' });
  }
};

module.exports = authMiddleware;
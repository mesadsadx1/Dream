const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.simple'); // используем упрощенную версию
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
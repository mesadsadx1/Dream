const express = require('express');
const router = express.Router();
const dreamController = require('../controllers/dream.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware); // Все роуты требуют авторизацию

router.post('/', dreamController.createDream.bind(dreamController));
router.get('/', dreamController.getDreams.bind(dreamController));
router.get('/patterns', dreamController.getDreamPatterns.bind(dreamController));
router.get('/:id', dreamController.getDreamById.bind(dreamController));
router.delete('/:id', dreamController.deleteDream.bind(dreamController));

module.exports = router;
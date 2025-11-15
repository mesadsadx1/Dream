const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth.middleware');
const { getDatabase } = require('../database/db');

const db = getDatabase();

// Конфигурация Робокассы
const ROBOKASSA = {
  merchantLogin: process.env.ROBOKASSA_LOGIN || 'demo_shop',
  password1: process.env.ROBOKASSA_PASS1 || 'test_pass1',
  password2: process.env.ROBOKASSA_PASS2 || 'test_pass2',
  testMode: process.env.ROBOKASSA_TEST === 'true'
};

// Создание заказа
router.post('/create-order', authMiddleware, async (req, res) => {
  const {
    planId,
    planName,
    amount,
    billingPeriod,
    paymentMethod,
    email,
    phone,
    receiptEmail,
    userId,
    promoCode,
    discount
  } = req.body;

  try {
    // Создаем заказ в БД
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    db.run(
      `INSERT INTO orders (
        order_id, user_id, plan_id, plan_name, amount, 
        billing_period, payment_method, email, phone, 
        receipt_email, promo_code, discount, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      [
        orderId, userId, planId, planName, amount,
        billingPeriod, paymentMethod, email, phone,
        receiptEmail, promoCode, discount
      ],
      function(err) {
        if (err) {
          console.error('Error creating order:', err);
          return res.status(500).json({ error: 'Failed to create order' });
        }

        res.json({
          orderId,
          amount,
          merchantLogin: ROBOKASSA.merchantLogin,
          testMode: ROBOKASSA.testMode
        });
      }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обработка результата платежа (для Робокассы)
router.post('/result', (req, res) => {
  const {
    OutSum,
    InvId,
    SignatureValue,
    IsTest
  } = req.body;

  // Проверяем подпись
  const mySignature = crypto
    .createHash('md5')
    .update(`${OutSum}:${InvId}:${ROBOKASSA.password2}`)
    .digest('hex')
    .toUpperCase();

  if (mySignature !== SignatureValue.toUpperCase()) {
    return res.status(400).send('Invalid signature');
  }

  // Обновляем статус заказа
  db.run(
    `UPDATE orders SET 
      status = 'paid',
      paid_at = datetime('now'),
      updated_at = datetime('now')
    WHERE order_id = ?`,
    [InvId],
    (err) => {
      if (err) {
        console.error('Error updating order:', err);
        return res.status(500).send('Error');
      }

      // Активируем подписку для пользователя
      activateSubscription(InvId);
      
      // Отвечаем Робокассе
      res.send(`OK${InvId}`);
    }
  );
});

// Success URL (куда редиректит после успешной оплаты)
router.get('/success', (req, res) => {
  const { InvId } = req.query;
  
  res.redirect(`${process.env.CLIENT_URL}/payment/success?order=${InvId}`);
});

// Fail URL (куда редиректит после неудачной оплаты)
router.get('/fail', (req, res) => {
  const { InvId } = req.query;
  
  res.redirect(`${process.env.CLIENT_URL}/payment/fail?order=${InvId}`);
});

// Симуляция успешной оплаты (для демо)
router.post('/simulate-success', authMiddleware, (req, res) => {
  const { orderId, amount } = req.body;

  db.run(
    `UPDATE orders SET 
      status = 'paid',
      paid_at = datetime('now'),
      updated_at = datetime('now')
    WHERE order_id = ?`,
    [orderId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update order' });
      }

      // Активируем подписку
      activateSubscription(orderId);

      res.json({
        success: true,
        message: 'Payment simulated successfully',
        orderId
      });
    }
  );
});

// Активация подписки
function activateSubscription(orderId) {
  db.get(
    'SELECT * FROM orders WHERE order_id = ?',
    [orderId],
    (err, order) => {
      if (err || !order) {
        console.error('Order not found:', orderId);
        return;
      }

      const expiresAt = order.billing_period === 'monthly'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      db.run(
        `INSERT OR REPLACE INTO subscriptions (
          user_id, plan_id, plan_name, status, 
          expires_at, created_at, updated_at
        ) VALUES (?, ?, ?, 'active', ?, datetime('now'), datetime('now'))`,
        [order.user_id, order.plan_id, order.plan_name, expiresAt.toISOString()],
        (err) => {
          if (err) {
            console.error('Error activating subscription:', err);
          } else {
            console.log('Subscription activated for user:', order.user_id);
          }
        }
      );
    }
  );
}

// Получение истории платежей
router.get('/history', authMiddleware, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT * FROM orders 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [userId],
    (err, orders) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }
      res.json(orders);
    }
  );
});

// Проверка активной подписки
router.get('/subscription', authMiddleware, (req, res) => {
  const userId = req.user.id;

  db.get(
    `SELECT * FROM subscriptions 
     WHERE user_id = ? AND status = 'active' 
     AND expires_at > datetime('now')`,
    [userId],
    (err, subscription) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch subscription' });
      }
      
      res.json({
        hasActiveSubscription: !!subscription,
        subscription
      });
    }
  );
});

module.exports = router;
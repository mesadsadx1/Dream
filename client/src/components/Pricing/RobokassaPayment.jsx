import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiCreditCard, FiLock, FiCheck, 
  FiSmartphone, FiDollarSign, FiGlobe,
  FiShoppingCart, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import axios from '../../services/api';
import toast from 'react-hot-toast';

const RobokassaPayment = ({ plan, billingPeriod, onClose }) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState(user?.email || '');

  // Конфигурация Робокассы (заглушка)
  const ROBOKASSA_CONFIG = {
    merchantLogin: process.env.REACT_APP_ROBOKASSA_LOGIN || 'demo_shop',
    testMode: process.env.REACT_APP_ROBOKASSA_TEST === 'true',
    password1: process.env.REACT_APP_ROBOKASSA_PASS1 || 'test_pass1',
    password2: process.env.REACT_APP_ROBOKASSA_PASS2 || 'test_pass2'
  };

  const paymentMethods = [
    { id: 'card', name: 'Банковская карта', icon: FiCreditCard, commission: 0 },
    { id: 'sberpay', name: 'SberPay', icon: FiSmartphone, commission: 0 },
    { id: 'yoomoney', name: 'ЮMoney', icon: FiDollarSign, commission: 2 },
    { id: 'qiwi', name: 'QIWI Кошелек', icon: FiSmartphone, commission: 3 },
    { id: 'crypto', name: 'Криптовалюта', icon: FiGlobe, commission: 1 }
  ];

  const promoCodes = {
    'DREAM2024': 10,
    'STUDENT50': 50,
    'FIRST': 15,
    'WELCOME': 20
  };

  const calculateTotal = () => {
    const basePrice = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
    const discountAmount = (basePrice * discount) / 100;
    const method = paymentMethods.find(m => m.id === paymentMethod);
    const commission = method ? (basePrice * method.commission) / 100 : 0;
    return Math.round(basePrice - discountAmount + commission);
  };

  const applyPromoCode = () => {
    const code = promoCode.toUpperCase();
    if (promoCodes[code]) {
      setDiscount(promoCodes[code]);
      toast.success(`Промокод применен! Скидка ${promoCodes[code]}%`);
    } else {
      toast.error('Недействительный промокод');
    }
  };

  // Простая функция для генерации подписи (без crypto-js)
  const generateSignature = (params) => {
    // В реальном приложении подпись должна генерироваться на сервере!
    // Это только для демо
    const signatureString = `${params.MerchantLogin}:${params.OutSum}:${params.InvId}:${ROBOKASSA_CONFIG.password1}`;
    
    // Простой хеш для демо (в продакшене используйте серверную генерацию)
    let hash = 0;
    for (let i = 0; i < signatureString.length; i++) {
      const char = signatureString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase();
  };

  const createPayment = async () => {
    if (!agreementChecked) {
      toast.error('Необходимо принять условия оплаты');
      return;
    }

    if (!email || !receiptEmail) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setIsProcessing(true);

    try {
      // Создаем заказ на сервере
      const orderResponse = await axios.post('/payments/create-order', {
        planId: plan.id,
        planName: plan.name,
        amount: calculateTotal(),
        billingPeriod,
        paymentMethod,
        email,
        phone,
        receiptEmail,
        userId: user?.id,
        promoCode: promoCode || null,
        discount
      });

      const order = orderResponse.data;

      // В демо режиме просто симулируем оплату
      if (ROBOKASSA_CONFIG.testMode) {
        simulatePayment(order);
      } else {
        // В продакшене формируем редирект на Робокассу
        const robokassaParams = {
          MerchantLogin: ROBOKASSA_CONFIG.merchantLogin,
          OutSum: calculateTotal(),
          InvId: order.orderId,
          Description: `Подписка DreamAI ${plan.name}`,
          Email: email,
          IsTest: 1
        };
        
        // Подпись должна генерироваться на сервере!
        robokassaParams.SignatureValue = generateSignature(robokassaParams);
        
        const params = new URLSearchParams(robokassaParams);
        window.location.href = `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Ошибка создания платежа');
      setIsProcessing(false);
    }
  };

  const simulatePayment = async (order) => {
    // Имитация процесса оплаты для демо
    toast.loading('Обработка платежа...', { id: 'payment' });
    
    setTimeout(async () => {
      try {
        // Имитируем успешную оплату
        const response = await axios.post('/payments/simulate-success', {
          orderId: order.orderId,
          amount: calculateTotal()
        });

        toast.success('Оплата прошла успешно!', { id: 'payment' });
        
        // Показываем подтверждение
        setTimeout(() => {
          toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-white rounded-lg shadow-lg p-6 max-w-md"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <FiCheck className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Платеж успешен!</h3>
                  <p className="text-sm text-gray-600">Заказ #{order.orderId}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 mb-4">
                <p className="text-sm text-gray-700">
                  План <strong>{plan.name}</strong> активирован
                </p>
                <p className="text-sm text-gray-700">
                  Сумма: <strong>{calculateTotal()} ₽</strong>
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    onClose();
                    window.location.href = '/dashboard';
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Перейти в личный кабинет
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          ), { duration: Infinity });
        }, 1500);
        
      } catch (error) {
        toast.error('Ошибка обработки платежа', { id: 'payment' });
      } finally {
        setIsProcessing(false);
      }
    }, 3000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Оформление подписки</h2>
                <p className="text-gray-400 mt-1">
                  {plan.name} - {billingPeriod === 'monthly' ? 'ежемесячная' : 'годовая'} оплата
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiX className="text-gray-400 text-xl" />
              </button>
            </div>

            {/* Индикатор тестового режима */}
            {ROBOKASSA_CONFIG.testMode && (
              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/30 rounded-lg flex items-center">
                <FiAlertCircle className="text-yellow-500 mr-2" />
                <span className="text-yellow-400 text-sm">
                  Тестовый режим - реальные платежи не производятся
                </span>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Детали заказа */}
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <FiShoppingCart className="mr-2" />
                Детали заказа
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">План:</span>
                  <span className="text-white font-semibold">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Период:</span>
                  <span className="text-white">
                    {billingPeriod === 'monthly' ? '1 месяц' : '1 год'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Базовая цена:</span>
                  <span className="text-white">
                    {(billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Скидка ({discount}%):</span>
                    <span>
                      -{Math.round(((billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly) * discount) / 100)} ₽
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-700 flex justify-between">
                  <span className="text-white font-semibold">Итого:</span>
                  <span className="text-2xl font-bold text-white">
                    {calculateTotal().toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </div>

            {/* Промокод */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Промокод (необязательно)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Введите промокод"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                />
                <button
                  onClick={applyPromoCode}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Применить
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Попробуйте: DREAM2024, WELCOME
              </p>
            </div>

            {/* Способ оплаты */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Способ оплаты
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      paymentMethod === method.id
                        ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <method.icon className="text-xl mb-1 mx-auto" />
                    <p className="text-sm">{method.name}</p>
                    {method.commission > 0 && (
                      <p className="text-xs opacity-60">+{method.commission}%</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Контактные данные */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 999-99-99"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Email для чека */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email для отправки чека <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={receiptEmail}
                onChange={(e) => setReceiptEmail(e.target.value)}
                placeholder="receipt@email.com"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                required
              />
            </div>

            {/* Соглашение */}
            <div className="mb-6">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="mt-1 mr-3"
                />
                <span className="text-sm text-gray-400">
                  Я согласен с{' '}
                  <a href="/terms" className="text-purple-400 hover:underline" target="_blank">
                    условиями оплаты
                  </a>
                  {' '}и{' '}
                  <a href="/privacy" className="text-purple-400 hover:underline" target="_blank">
                    политикой конфиденциальности
                  </a>
                </span>
              </label>
            </div>

            {/* Кнопки */}
            <div className="flex space-x-4">
              <button
                onClick={createPayment}
                disabled={isProcessing || !agreementChecked}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <FiLock className="mr-2" />
                    Оплатить {calculateTotal().toLocaleString('ru-RU')} ₽
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
              >
                Отмена
              </button>
            </div>

            {/* Безопасность */}
            <div className="mt-6 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
              <div className="flex items-center text-green-400">
                <FiLock className="mr-2" />
                <span className="text-sm">
                  Безопасный платеж через Робокассу. Ваши данные защищены SSL-шифрованием.
                </span>
              </div>
            </div>

            {/* Логотипы платежных систем */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Принимаем карты Visa, Mastercard, МИР, а также электронные кошельки
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RobokassaPayment;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCheck, FiX, FiZap, FiStar, FiTrendingUp, 
  FiShield, FiCreditCard, FiGift, FiAward
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import RobokassaPayment from './RobokassaPayment';

const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Бесплатный',
      icon: FiGift,
      price: 0,
      priceMonthly: 0,
      priceYearly: 0,
      currency: '₽',
      description: 'Для начинающих сновидцев',
      color: 'from-gray-500 to-gray-600',
      features: [
        { name: 'До 10 снов в месяц', included: true },
        { name: 'Базовая интерпретация', included: true },
        { name: 'История снов (30 дней)', included: true },
        { name: 'Текстовый ввод', included: true },
        { name: 'Голосовой ввод', included: false },
        { name: 'Визуализация снов', included: false },
        { name: 'Экспорт данных', included: false },
        { name: 'Приоритетная поддержка', included: false },
        { name: 'API доступ', included: false }
      ],
      limits: {
        dreams: 10,
        interpretations: 10,
        visualizations: 0,
        storage: '100 MB'
      }
    },
    {
      id: 'premium',
      name: 'Премиум',
      icon: FiStar,
      price: 299,
      priceMonthly: 299,
      priceYearly: 2990, // скидка при годовой оплате
      currency: '₽',
      description: 'Для активных пользователей',
      color: 'from-purple-500 to-pink-500',
      popular: true,
      features: [
        { name: 'До 100 снов в месяц', included: true },
        { name: 'Расширенная интерпретация', included: true },
        { name: 'История снов (1 год)', included: true },
        { name: 'Текстовый ввод', included: true },
        { name: 'Голосовой ввод', included: true },
        { name: 'Визуализация снов (30/мес)', included: true },
        { name: 'Экспорт в PDF/CSV', included: true },
        { name: 'Email поддержка', included: true },
        { name: 'API доступ', included: false }
      ],
      limits: {
        dreams: 100,
        interpretations: 100,
        visualizations: 30,
        storage: '1 GB'
      }
    },
    {
      id: 'pro',
      name: 'Профессионал',
      icon: FiZap,
      price: 599,
      priceMonthly: 599,
      priceYearly: 5990,
      currency: '₽',
      description: 'Для исследователей и терапевтов',
      color: 'from-yellow-500 to-orange-500',
      features: [
        { name: 'Безлимитные сны', included: true },
        { name: 'AI Pro интерпретация', included: true },
        { name: 'Вечная история снов', included: true },
        { name: 'Все способы ввода', included: true },
        { name: 'Голосовой ввод', included: true },
        { name: 'Безлимитная визуализация', included: true },
        { name: 'Все форматы экспорта', included: true },
        { name: 'Приоритетная поддержка 24/7', included: true },
        { name: 'API доступ', included: true }
      ],
      limits: {
        dreams: -1, // unlimited
        interpretations: -1,
        visualizations: -1,
        storage: '10 GB'
      }
    }
  ];

  const handleSelectPlan = (plan) => {
    if (plan.id === 'free') {
      toast.success('Вы используете бесплатный план');
      return;
    }
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const calculateSavings = (plan) => {
    if (billingPeriod === 'yearly') {
      const monthlyCost = plan.priceMonthly * 12;
      const yearlyCost = plan.priceYearly;
      const savings = monthlyCost - yearlyCost;
      return savings > 0 ? Math.round(savings) : 0;
    }
    return 0;
  };

  const getCurrentPrice = (plan) => {
    if (plan.id === 'free') return 0;
    return billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Выберите ваш план
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-8"
          >
            Разблокируйте полный потенциал анализа снов
          </motion.p>

          {/* Переключатель периода оплаты */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center bg-gray-800/50 rounded-lg p-1"
          >
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Ежемесячно
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Ежегодно
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                Скидка 20%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Карточки тарифов */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className={`relative bg-gray-800/50 backdrop-blur-xl rounded-2xl border ${
                plan.popular 
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                  : 'border-gray-700'
              }`}
            >
              {/* Популярный баннер */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full">
                    Популярный выбор
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Заголовок */}
                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${plan.color} mb-4`}>
                    <plan.icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400">{plan.description}</p>
                </div>

                {/* Цена */}
                <div className="text-center mb-6">
                  <div className="flex items-end justify-center">
                    <span className="text-4xl font-bold text-white">
                      {getCurrentPrice(plan).toLocaleString('ru-RU')}
                    </span>
                    <span className="text-gray-400 ml-2 mb-1">
                      {plan.currency}/{billingPeriod === 'monthly' ? 'мес' : 'год'}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && calculateSavings(plan) > 0 && (
                    <p className="text-green-400 text-sm mt-2">
                      Экономия {calculateSavings(plan)} ₽/год
                    </p>
                  )}
                </div>

                {/* Лимиты */}
                <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Снов/мес</p>
                      <p className="text-white font-semibold">
                        {plan.limits.dreams === -1 ? '∞' : plan.limits.dreams}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Визуализаций</p>
                      <p className="text-white font-semibold">
                        {plan.limits.visualizations === -1 ? '∞' : plan.limits.visualizations}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Хранилище</p>
                      <p className="text-white font-semibold">{plan.limits.storage}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">API</p>
                      <p className="text-white font-semibold">
                        {plan.features.find(f => f.name === 'API доступ')?.included ? '✓' : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Функции */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      {feature.included ? (
                        <FiCheck className="text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                      ) : (
                        <FiX className="text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Кнопка */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      : plan.id === 'free'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {plan.id === 'free' ? 'Текущий план' : 'Выбрать план'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Гарантии */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div>
            <FiShield className="text-3xl text-purple-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Безопасные платежи</h4>
            <p className="text-gray-400 text-sm">Защита через Робокассу с SSL шифрованием</p>
          </div>
          <div>
            <FiTrendingUp className="text-3xl text-green-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">30 дней гарантии</h4>
            <p className="text-gray-400 text-sm">Полный возврат если не понравится</p>
          </div>
          <div>
            <FiAward className="text-3xl text-yellow-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Отмена в любое время</h4>
            <p className="text-gray-400 text-sm">Без скрытых платежей и комиссий</p>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-gray-800/30 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Часто задаваемые вопросы</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Можно ли изменить план?</h4>
              <p className="text-gray-400 text-sm">
                Да, вы можете изменить или отменить план в любое время в настройках аккаунта.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Какие способы оплаты доступны?</h4>
              <p className="text-gray-400 text-sm">
                Банковские карты, электронные кошельки, SberPay, криптовалюта через Робокассу.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Есть ли скидки для студентов?</h4>
              <p className="text-gray-400 text-sm">
                Да, студенты получают 50% скидку при подтверждении статуса.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Что происходит после отмены?</h4>
              <p className="text-gray-400 text-sm">
                Вы сохраняете доступ до конца оплаченного периода, затем переходите на бесплатный план.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Модальное окно оплаты */}
      {showPayment && selectedPlan && (
        <RobokassaPayment
          plan={selectedPlan}
          billingPeriod={billingPeriod}
          onClose={() => {
            setShowPayment(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </>
  );
};

export default PricingPlans;
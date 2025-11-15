import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiLock, FiUser, FiMoon, FiEye, FiEyeOff, 
  FiPhone, FiMessageCircle, FiCheck, FiArrowLeft 
} from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState('email'); // email или phone
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const { register: registerForm, handleSubmit, watch, formState: { errors } } = useForm();
  const { register } = useAuth();

  const formatPhoneNumber = (value) => {
    const phone = value.replace(/\D/g, '');
    const match = phone.match(/^(\d{1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (match) {
      const formatted = !match[2] ? match[1] : 
        `+${match[1]} (${match[2]}${match[3] ? ') ' + match[3] : ''}${match[4] ? '-' + match[4] : ''}${match[5] ? '-' + match[5] : ''}`;
      return formatted;
    }
    return value;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 11) {
      toast.error('Введите корректный номер телефона');
      return;
    }

    setIsLoading(true);
    
    // Заглушка для отправки OTP
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
      toast.success(`Код отправлен на ${phoneNumber}`);
      console.log('OTP Code (dev): 123456'); // Для разработки
    }, 1500);
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otpCode];
      newOtp[index] = value;
      setOtpCode(newOtp);

      // Автоматический переход к следующему полю
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }

      // Проверка полного кода
      if (newOtp.every(digit => digit)) {
        verifyOTP(newOtp.join(''));
      }
    }
  };

  const verifyOTP = async (code) => {
    setIsLoading(true);
    
    // Заглушка проверки OTP
    setTimeout(async () => {
      if (code === '123456') { // Тестовый код
        toast.success('Телефон подтвержден!');
        
        // Автоматическая регистрация после подтверждения
        const result = await register({
          username: `user_${phoneNumber.replace(/\D/g, '').slice(-4)}`,
          email: `${phoneNumber.replace(/\D/g, '')}@phone.local`,
          password: 'phone_' + phoneNumber.replace(/\D/g, ''),
          phone: phoneNumber
        });

        setIsLoading(false);
        
        if (!result.success) {
          toast.error(result.error || 'Ошибка регистрации');
        }
      } else {
        toast.error('Неверный код');
        setIsLoading(false);
      }
    }, 1000);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await register(data);
      if (!result.success) {
        toast.error(result.error || 'Ошибка регистрации');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4"
          >
            <FiMoon className="text-white text-3xl" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Создайте аккаунт</h1>
          <p className="text-gray-300">Начните путешествие в мир снов</p>
        </div>

        {/* Registration Type Selector */}
        <div className="mb-6">
          <div className="flex bg-gray-800/50 backdrop-blur-xl rounded-xl p-1">
            <button
              onClick={() => setRegistrationType('email')}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                registrationType === 'email'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiMail className="inline mr-2" />
              Email
            </button>
            <button
              onClick={() => setRegistrationType('phone')}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                registrationType === 'phone'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiPhone className="inline mr-2" />
              Телефон
            </button>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700"
        >
          <AnimatePresence mode="wait">
            {registrationType === 'phone' ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {!otpSent ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Номер телефона
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="+7 (999) 999-99-99"
                          className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={sendOTP}
                      disabled={isLoading || phoneNumber.length < 11}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <>
                          <FiMessageCircle className="mr-2" />
                          Получить код
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode(['', '', '', '', '', '']);
                      }}
                      className="flex items-center text-gray-400 hover:text-white mb-4"
                    >
                      <FiArrowLeft className="mr-2" />
                      Изменить номер
                    </button>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Код из SMS
                      </label>
                      <div className="flex space-x-2 justify-center">
                        {otpCode.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            className="w-12 h-12 text-center bg-gray-700/50 border border-gray-600 rounded-lg text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Для теста используйте: 123456
                      </p>
                    </div>

                    <button
                      onClick={() => sendOTP()}
                      className="w-full text-center text-purple-400 hover:text-purple-300"
                    >
                      Отправить код повторно
                    </button>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Имя пользователя
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      {...registerForm('username', { 
                        required: 'Имя пользователя обязательно',
                        minLength: {
                          value: 3,
                          message: 'Минимум 3 символа'
                        }
                      })}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ваше имя"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      {...registerForm('email', { 
                        required: 'Email обязателен',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Неверный формат email'
                        }
                      })}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Пароль
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      {...registerForm('password', { 
                        required: 'Пароль обязателен',
                        minLength: {
                          value: 6,
                          message: 'Минимум 6 символов'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    'Зарегистрироваться'
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Login Link */}
          <p className="text-center text-gray-300 mt-6">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Войти
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
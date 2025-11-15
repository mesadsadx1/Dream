import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiBell, FiLock, FiGlobe, FiDatabase,
  FiMoon, FiSun, FiSmartphone, FiMail, FiMusic, FiClock,
  FiShield, FiDownload, FiTrash2, FiVolume2, FiChevronRight, 
  FiInfo, FiHeart, FiSliders, FiCalendar, FiCheckCircle, 
  FiUpload, FiCommand, FiZap, FiAward, FiActivity,
  FiTrendingUp, FiPieChart, FiGitBranch, FiCoffee
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import axios from '../services/api';

const Settings = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const fileInputRef = useRef(null);
  
  // Загружаем настройки из localStorage при монтировании
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('dreamai_settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }
    return {
      // Общие настройки
      theme: 'dark',
      language: 'ru',
      dateFormat: 'DD.MM.YYYY',
      timeFormat: '24h',
      firstDayOfWeek: 'monday',
      
      // Внешний вид
      fontSize: 'medium',
      fontFamily: 'system',
      colorScheme: 'purple',
      animations: true,
      compactMode: false,
      
      // Звук и эффекты
      soundEffects: true,
      soundVolume: 50,
      voiceEnabled: true,
      hapticFeedback: true,
      
      // Уведомления
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      dreamReminders: true,
      reminderTime: '22:00',
      weeklyReport: true,
      achievementNotifications: true,
      
      // Приватность
      profileVisibility: 'private',
      shareAnalytics: false,
      allowDataCollection: true,
      twoFactorAuth: false,
      
      // Персонализация
      aiPersonality: 'friendly',
      interpretationDepth: 'detailed',
      autoSavesDreams: true,
      autoAnalysis: true,
      
      // Экспериментальные функции
      lucidDreamingMode: false,
      dreamIncubation: false,
      binausalBeats: false,
      
      // Резервное копирование
      autoBackup: false,
      backupFrequency: 'weekly',
    };
  });

  // Переводы
  const translations = {
    ru: {
      settings: 'Настройки',
      general: 'Общие',
      appearance: 'Внешний вид',
      notifications: 'Уведомления',
      privacy: 'Приватность',
      save: 'Сохранить',
      cancel: 'Отмена',
      theme: 'Тема',
      language: 'Язык',
      darkTheme: 'Темная тема',
      lightTheme: 'Светлая тема',
      soundEffects: 'Звуковые эффекты',
      fontSize: 'Размер шрифта',
      exportData: 'Экспорт данных',
      importData: 'Импорт данных',
      deleteAccount: 'Удалить аккаунт',
      personalizeApp: 'Персонализируйте ваше приложение'
    },
    en: {
      settings: 'Settings',
      general: 'General',
      appearance: 'Appearance',
      notifications: 'Notifications',
      privacy: 'Privacy',
      save: 'Save',
      cancel: 'Cancel',
      theme: 'Theme',
      language: 'Language',
      darkTheme: 'Dark theme',
      lightTheme: 'Light theme',
      soundEffects: 'Sound effects',
      fontSize: 'Font size',
      exportData: 'Export data',
      importData: 'Import data',
      deleteAccount: 'Delete account',
      personalizeApp: 'Personalize your app'
    },
    de: {
      settings: 'Einstellungen',
      general: 'Allgemein',
      appearance: 'Aussehen',
      notifications: 'Benachrichtigungen',
      privacy: 'Privatsphäre',
      save: 'Speichern',
      cancel: 'Abbrechen',
      theme: 'Thema',
      language: 'Sprache',
      darkTheme: 'Dunkles Thema',
      lightTheme: 'Helles Thema',
      soundEffects: 'Soundeffekte',
      fontSize: 'Schriftgröße',
      exportData: 'Daten exportieren',
      importData: 'Daten importieren',
      deleteAccount: 'Konto löschen',
      personalizeApp: 'Personalisieren Sie Ihre App'
    }
  };

  const t = (key) => {
    const lang = settings.language || 'ru';
    return translations[lang]?.[key] || translations.ru[key] || key;
  };

  // Статистика пользователя
  const [userStats, setUserStats] = useState({
    totalDreams: 0,
    streak: 0,
    achievements: [],
    lastBackup: null,
    storageUsed: '0 MB'
  });

  // Применение настроек при изменении
  useEffect(() => {
    applySettings();
  }, [settings]);

  const applySettings = () => {
    const root = document.documentElement;
    
    // Тема
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.style.backgroundColor = '#0f0f23';
      document.body.style.color = '#ffffff';
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    } else if (settings.theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }

    // Размер шрифта
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    root.style.fontSize = fontSizes[settings.fontSize] || '16px';

    // Семейство шрифтов
    const fontFamilies = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, "Times New Roman", serif',
      mono: 'Menlo, Monaco, "Courier New", monospace',
      comic: '"Comic Sans MS", cursive'
    };
    document.body.style.fontFamily = fontFamilies[settings.fontFamily] || fontFamilies.system;

    // Цветовая схема
    const colorSchemes = {
      purple: { primary: '#8B5CF6', secondary: '#EC4899' },
      blue: { primary: '#3B82F6', secondary: '#06B6D4' },
      green: { primary: '#10B981', secondary: '#84CC16' },
      orange: { primary: '#F97316', secondary: '#FACC15' }
    };
    const scheme = colorSchemes[settings.colorScheme] || colorSchemes.purple;
    root.style.setProperty('--color-primary', scheme.primary);
    root.style.setProperty('--color-secondary', scheme.secondary);

    // Анимации
    if (!settings.animations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Сохраняем в localStorage
    localStorage.setItem('dreamai_settings', JSON.stringify(settings));
    
    // Показываем индикатор сохранения
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Звуковая обратная связь
    if (settings.soundEffects) {
      playSound('toggle');
    }
    
    // Вибрация
    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Сохраняем на сервер
    try {
      await axios.put('/settings', { [key]: value });
    } catch (error) {
      console.log('Settings saved locally only');
    }
  };

  const playSound = (type) => {
    if (!settings.soundEffects) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const volume = (settings.soundVolume || 50) / 100;
      gainNode.gain.value = volume * 0.1;
      
      switch(type) {
        case 'toggle':
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          break;
        case 'success':
          oscillator.frequency.value = 1000;
          oscillator.type = 'sine';
          break;
        case 'error':
          oscillator.frequency.value = 300;
          oscillator.type = 'sawtooth';
          break;
      }
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  // Push уведомления
  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Ваш браузер не поддерживает уведомления');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('DreamAI', {
        body: 'Уведомления успешно включены! 🎉',
        icon: '/logo192.png',
      });
      return true;
    }
    
    toast.error('Разрешите уведомления в настройках браузера');
    return false;
  };

  // Экспорт данных
  const exportData = async (format = 'json') => {
    setIsLoading(true);
    try {
      const data = {
        settings: settings,
        exportDate: new Date().toISOString(),
        user: user
      };
      
      let content = JSON.stringify(data, null, 2);
      
      const blob = new Blob([content], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dreamai-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Данные экспортированы!');
      playSound('success');
    } catch (error) {
      toast.error('Ошибка экспорта');
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Импорт данных
  const importData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        if (data.settings) {
          setSettings(data.settings);
          toast.success('Настройки импортированы!');
        }
      } catch (error) {
        toast.error('Ошибка импорта');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'general', name: t('general'), icon: FiSliders },
    { id: 'appearance', name: t('appearance'), icon: FiMoon },
    { id: 'notifications', name: t('notifications'), icon: FiBell },
    { id: 'privacy', name: t('privacy'), icon: FiLock },
    { id: 'experimental', name: 'Beta', icon: FiDatabase },
    { id: 'account', name: 'Аккаунт', icon: FiShield }
  ];

  // Функция переключения
  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        enabled ? 'bg-purple-600' : 'bg-gray-600'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );

  // Рендер вкладок
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t('general')}</h3>
        
        <div className="space-y-4">
          {/* Язык */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">{t('language')}</p>
              <p className="text-sm text-gray-400">Выберите язык интерфейса</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="ru">🇷🇺 Русский</option>
              <option value="en">🇬🇧 English</option>
              <option value="de">🇩🇪 Deutsch</option>
            </select>
          </div>

          {/* Формат даты */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Формат даты</p>
              <p className="text-sm text-gray-400">Как отображать даты</p>
            </div>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="DD.MM.YYYY">31.12.2024</option>
              <option value="MM/DD/YYYY">12/31/2024</option>
              <option value="YYYY-MM-DD">2024-12-31</option>
            </select>
          </div>

          {/* Звуковые эффекты */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">{t('soundEffects')}</p>
              <p className="text-sm text-gray-400">Звуки при действиях</p>
            </div>
            <ToggleSwitch 
              enabled={settings.soundEffects}
              onChange={() => handleSettingChange('soundEffects', !settings.soundEffects)}
            />
          </div>

          {settings.soundEffects && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Громкость</p>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.soundVolume}
                onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0%</span>
                <span>{settings.soundVolume}%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              playSound('success');
              toast.success('Тест звука');
            }}
            className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 w-full"
          >
            Тестировать звук
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t('theme')}</h3>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => handleSettingChange('theme', 'light')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.theme === 'light'
                ? 'border-purple-500 bg-white/10'
                : 'border-gray-600 bg-gray-700/50'
            }`}
          >
            <FiSun className="text-2xl mb-2 mx-auto text-yellow-400" />
            <p className="text-sm text-gray-300">{t('lightTheme')}</p>
          </button>
          
          <button
            onClick={() => handleSettingChange('theme', 'dark')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.theme === 'dark'
                ? 'border-purple-500 bg-gray-900/50'
                : 'border-gray-600 bg-gray-700/50'
            }`}
          >
            <FiMoon className="text-2xl mb-2 mx-auto text-purple-400" />
            <p className="text-sm text-gray-300">{t('darkTheme')}</p>
          </button>
          
          <button
            onClick={() => handleSettingChange('theme', 'auto')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.theme === 'auto'
                ? 'border-purple-500 bg-gray-800/50'
                : 'border-gray-600 bg-gray-700/50'
            }`}
          >
            <FiCoffee className="text-2xl mb-2 mx-auto text-blue-400" />
            <p className="text-sm text-gray-300">Авто</p>
          </button>
        </div>

        {/* Размер шрифта */}
        <div>
          <p className="text-white mb-3">{t('fontSize')}</p>
          <div className="flex space-x-2">
            {['small', 'medium', 'large', 'xlarge'].map((size) => (
              <button
                key={size}
                onClick={() => handleSettingChange('fontSize', size)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  settings.fontSize === size
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
                style={{ fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : size === 'xlarge' ? '20px' : '14px' }}
              >
                Aa
              </button>
            ))}
          </div>
        </div>

        {/* Цветовая схема */}
        <div className="mt-6">
          <p className="text-white mb-3">Цветовая схема</p>
          <div className="grid grid-cols-4 gap-3">
            {['purple', 'blue', 'green', 'orange'].map((color) => {
              const colors = {
                purple: 'bg-purple-500',
                blue: 'bg-blue-500',
                green: 'bg-green-500',
                orange: 'bg-orange-500'
              };
              return (
                <button
                  key={color}
                  onClick={() => handleSettingChange('colorScheme', color)}
                  className={`h-12 rounded-lg ${colors[color]} ${
                    settings.colorScheme === color ? 'ring-2 ring-white' : ''
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t('notifications')}</h3>
        
        <div className="space-y-4">
          {/* Push уведомления */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Push-уведомления</p>
              <p className="text-sm text-gray-400">Браузерные уведомления</p>
            </div>
            <ToggleSwitch
              enabled={settings.pushNotifications}
              onChange={async () => {
                if (!settings.pushNotifications) {
                  const granted = await requestPushPermission();
                  if (granted) {
                    handleSettingChange('pushNotifications', true);
                  }
                } else {
                  handleSettingChange('pushNotifications', false);
                }
              }}
            />
          </div>

          {/* Email уведомления */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Email уведомления</p>
              <p className="text-sm text-gray-400">Получать на почту</p>
            </div>
            <ToggleSwitch
              enabled={settings.emailNotifications}
              onChange={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
            />
          </div>

          {/* Напоминания */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Напоминание записать сон</p>
              <p className="text-sm text-gray-400">Ежедневное напоминание</p>
            </div>
            <ToggleSwitch
              enabled={settings.dreamReminders}
              onChange={() => handleSettingChange('dreamReminders', !settings.dreamReminders)}
            />
          </div>

          {settings.dreamReminders && (
            <div>
              <label className="text-sm text-gray-400">Время напоминания</label>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                className="mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white w-full"
              />
            </div>
          )}

          <button
            onClick={() => {
              if (settings.pushNotifications && Notification.permission === 'granted') {
                new Notification('Тестовое уведомление 🔔', {
                  body: 'Уведомления работают!',
                  icon: '/logo192.png',
                });
              } else {
                toast.error('Включите push-уведомления');
              }
            }}
            className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 w-full"
          >
            Отправить тестовое уведомление
          </button>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t('privacy')}</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Двухфакторная аутентификация</p>
              <p className="text-sm text-gray-400">Дополнительная защита</p>
            </div>
            <ToggleSwitch
              enabled={settings.twoFactorAuth}
              onChange={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Сбор данных</p>
              <p className="text-sm text-gray-400">Для улучшения сервиса</p>
            </div>
            <ToggleSwitch
              enabled={settings.allowDataCollection}
              onChange={() => handleSettingChange('allowDataCollection', !settings.allowDataCollection)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderExperimentalSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-lg font-semibold text-white mb-4">Экспериментальные функции</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Осознанные сновидения</p>
              <p className="text-sm text-gray-400">Специальный режим</p>
            </div>
            <ToggleSwitch
              enabled={settings.lucidDreamingMode}
              onChange={() => handleSettingChange('lucidDreamingMode', !settings.lucidDreamingMode)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Инкубация снов</p>
              <p className="text-sm text-gray-400">Программирование тематики</p>
            </div>
            <ToggleSwitch
              enabled={settings.dreamIncubation}
              onChange={() => handleSettingChange('dreamIncubation', !settings.dreamIncubation)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Управление данными</h3>
        
        <div className="space-y-4">
          <button
            onClick={() => exportData('json')}
            disabled={isLoading}
            className="w-full p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <FiDownload className="text-green-400" />
              <div className="text-left">
                <p className="text-white">{t('exportData')}</p>
                <p className="text-sm text-gray-400">Скачать резервную копию</p>
              </div>
            </div>
          </button>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <FiUpload className="text-blue-400" />
                <div className="text-left">
                  <p className="text-white">{t('importData')}</p>
                  <p className="text-sm text-gray-400">Восстановить из файла</p>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={() => toast.error('Функция временно недоступна')}
            className="w-full p-4 bg-red-900/20 border border-red-500/30 rounded-lg hover:bg-red-900/30 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <FiTrash2 className="text-red-400" />
              <div className="text-left">
                <p className="text-white">{t('deleteAccount')}</p>
                <p className="text-sm text-gray-400">Удалить все данные</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general': 
        return renderGeneralSettings();
      case 'appearance': 
        return renderAppearanceSettings();
      case 'notifications': 
        return renderNotificationSettings();
      case 'privacy': 
        return renderPrivacySettings();
      case 'experimental': 
        return renderExperimentalSettings();
      case 'account': 
        return renderAccountSettings();
      default: 
        return (
          <div className="bg-gray-700/30 rounded-xl p-8 text-center">
            <p className="text-white">Раздел в разработке</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('settings')}</h1>
            <p className="text-gray-400">{t('personalizeApp')}</p>
          </div>
          <AnimatePresence>
            {saveIndicator && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg"
              >
                <FiCheckCircle />
                <span className="text-sm">{t('save')}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-gray-700">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <tab.icon />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
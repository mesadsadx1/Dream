# 🌙 DreamAI

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-16+-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Ollama-Mistral-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite" />
</p>

## ✨ Описание

DreamAI - современное веб-приложение для интерпретации снов с использованием искусственного интеллекта. Приложение анализирует описания снов и предоставляет психологическую интерпретацию, помогая пользователям лучше понять свое подсознание.

## 🚀 Основные функции

- 🤖 **AI интерпретация** - Анализ снов с помощью Ollama Mistral
- 🎙️ **Голосовой ввод** - Диктовка снов голосом
- 🎨 **Визуализация снов** - Генерация изображений на основе описаний
- 🎵 **Музыка для сна** - Белый шум и бинауральные ритмы
- 📊 **Аналитика** - Статистика и паттерны снов
- 📱 **Адаптивный дизайн** - Работает на всех устройствах
- 🔐 **Авторизация** - Безопасное хранение личных данных
- 📤 **Экспорт данных** - Сохранение снов в различных форматах
- 🌍 **Мультиязычность** - Поддержка нескольких языков
- 🎨 **Темы оформления** - Светлая/темная/автоматическая

## 📋 Требования

- Node.js 16+
- NPM или Yarn
- Ollama с моделью Mistral
- Современный браузер с поддержкой Web Speech API

## 🛠️ Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/ваш-username/dream-interpreter-ai.git
cd dream-interpreter-ai
Установите Ollama
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows - скачайте с https://ollama.ai

# Загрузите модель Mistral
ollama pull mistral
Установите зависимости
Bash

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
Настройте переменные окружения
Создайте файл .env в папке server:

env

PORT=5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_secret_key_here
OLLAMA_URL=http://localhost:11434
NODE_ENV=development
Запустите приложение
Bash

# Запустите Ollama (в отдельном терминале)
ollama serve

# Запустите backend (в папке server)
npm run dev

# Запустите frontend (в папке client)
npm start
Приложение будет доступно по адресу: http://localhost:3000

🔑 Доступы
Администратор:

Логин: admin
Пароль: admin
🏗️ Структура проекта
text

dream-interpreter/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/        # Страницы приложения
│   │   ├── services/     # API сервисы
│   │   ├── hooks/        # Custom hooks
│   │   └── context/      # React Context
│   └── public/
├── server/                # Backend (Node.js/Express)
│   ├── src/
│   │   ├── controllers/  # Контроллеры
│   │   ├── routes/       # API маршруты
│   │   ├── middleware/   # Middleware
│   │   ├── services/     # Бизнес-логика
│   │   └── database/     # База данных
│   └── .env
└── README.md
🎯 Использование
Регистрация/Вход - Создайте аккаунт или войдите как администратор
Запись сна - Опишите свой сон текстом или голосом
Интерпретация - Получите AI-анализ символов и значений
Визуализация - Создайте изображение вашего сна
История - Просматривайте все записанные сны
Аналитика - Изучайте паттерны и статистику
🤝 Вклад в проект
Мы приветствуем вклад в развитие проекта!

Fork репозиторий
Создайте ветку для функции (git checkout -b feature/AmazingFeature)
Commit изменения (git commit -m 'Add some AmazingFeature')
Push в ветку (git push origin feature/AmazingFeature)
Откройте Pull Request
📝 Лицензия
MIT License - смотрите файл LICENSE для деталей

👥 Авторы
Ваше Имя - @ваш-github
🙏 Благодарности
Ollama за отличную LLM платформу
Mistral AI за модель
React сообществу за великолепные библиотеки
📞 Контакты
Email: ваш-email@example.com
Telegram: @ваш-telegram
⭐ Если вам понравился проект, поставьте звезду на GitHub!

text


### 6. Создайте LICENSE файл

**Файл: `/dream-interpreter/LICENSE`**
MIT License

Copyright (c) 2024 [Ваше Имя]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

const axios = require('axios');

class OllamaService {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = 'mistral';
  }

  async generateInterpretation(dreamContent, userContext = {}) {
    const systemPrompt = `Ты профессиональный психолог-интерпретатор снов с глубоким пониманием психологии подсознания. 
    Твоя задача - дать психологическую, НЕ эзотерическую интерпретацию сна.
    
    Учитывай следующий контекст о пользователе:
    - Имя: ${userContext.name || 'не указано'}
    - Возраст: ${userContext.age || 'не указан'}
    - Предыдущие сны: ${userContext.previousDreams || 'нет данных'}
    - Паттерны: ${userContext.patterns || 'не выявлены'}
    
    Правила интерпретации:
    1. Используй психологический подход (Юнг, Фрейд, современная психология)
    2. Будь эмпатичным и поддерживающим
    3. Выделяй ключевые символы и их возможные значения
    4. Давай практические рекомендации для самоанализа
    5. Указывай на возможные эмоциональные состояния
    6. Если сон повторяющийся, обрати на это особое внимание
    
    Структура ответа:
    1. Общая интерпретация (2-3 предложения)
    2. Ключевые символы и их значения
    3. Эмоциональный контекст
    4. Рекомендации для размышления
    5. Вопросы для самоанализа`;

    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt: `${systemPrompt}\n\nСон пользователя:\n${dreamContent}\n\nИнтерпретация:`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 1000
        }
      });

      return this.formatInterpretation(response.data.response);
    } catch (error) {
      console.error('Ollama error:', error);
      throw new Error('Failed to generate interpretation');
    }
  }

  formatInterpretation(rawResponse) {
    // Парсим и структурируем ответ
    const sections = {
      general: '',
      symbols: [],
      emotions: [],
      recommendations: [],
      questions: []
    };

    // Простой парсер для структурирования ответа
    const lines = rawResponse.split('\n');
    let currentSection = 'general';

    lines.forEach(line => {
      if (line.includes('Ключевые символы') || line.includes('Символы')) {
        currentSection = 'symbols';
      } else if (line.includes('Эмоциональный контекст') || line.includes('Эмоции')) {
        currentSection = 'emotions';
      } else if (line.includes('Рекомендации')) {
        currentSection = 'recommendations';
      } else if (line.includes('Вопросы')) {
        currentSection = 'questions';
      } else if (line.trim()) {
        if (currentSection === 'general') {
          sections.general += line + ' ';
        } else if (Array.isArray(sections[currentSection])) {
          sections[currentSection].push(line.trim());
        }
      }
    });

    return {
      rawResponse,
      structured: sections,
      timestamp: new Date().toISOString()
    };
  }

  async analyzePatterns(dreams) {
    const prompt = `Проанализируй паттерны в следующих снах и выдели общие темы, символы и эмоциональные состояния:
    ${dreams.map((d, i) => `Сон ${i + 1}: ${d.content}`).join('\n')}`;

    try {
      const response = await axios.post(`${this.baseURL}/api/generate`, {
        model: this.model,
        prompt,
        stream: false
      });

      return response.data.response;
    } catch (error) {
      console.error('Pattern analysis error:', error);
      return null;
    }
  }
}

module.exports = new OllamaService();
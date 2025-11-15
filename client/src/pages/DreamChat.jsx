import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  FiMic, FiMicOff, FiSend, FiVolume2, FiSave,
  FiImage, FiMusic, FiMoon, FiSun, FiCoffee,
  FiZap, FiStar, FiTrendingUp, FiCpu
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from '../services/api';
import { useSpeechRecognition, useSpeechSynthesis } from '../hooks/useSpeech';
import DreamMoodSelector from '../components/Chat/DreamMoodSelector';
import InterpretationDisplay from '../components/Chat/InterpretationDisplay';
import TagInput from '../components/UI/TagInput';
import DreamVisualizer from '../components/DreamVisualizer/DreamVisualizer';
import SleepPlayer from '../components/SleepPlayer/SleepPlayer';

const DreamChat = () => {
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState(null);
  const [dreamText, setDreamText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [tags, setTags] = useState([]);
  const [lucidityLevel, setLucidityLevel] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [dreamPhase, setDreamPhase] = useState('night');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [dreamScore, setDreamScore] = useState(null);
  
  const { register, handleSubmit, reset, setValue } = useForm();
  const textareaRef = useRef(null);
  
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();
  
  const { speak, speaking, cancel: cancelSpeaking } = useSpeechSynthesis();

  // Фазы сна
  const dreamPhases = [
    { id: 'night', name: 'Ночной сон', icon: FiMoon, color: 'from-indigo-600 to-purple-600' },
    { id: 'morning', name: 'Утренний сон', icon: FiSun, color: 'from-orange-400 to-yellow-400' },
    { id: 'nap', name: 'Дневной сон', icon: FiCoffee, color: 'from-green-400 to-teal-400' }
  ];

  // AI подсказки для улучшения запоминания снов
  const dreamTips = [
    'Держите дневник снов рядом с кроватью',
    'Записывайте сны сразу после пробуждения',
    'Обращайте внимание на повторяющиеся символы',
    'Практикуйте технику "reality check" днем',
    'Спите не менее 7-8 часов для лучшего запоминания',
    'Избегайте алкоголя перед сном'
  ];

  useEffect(() => {
    if (transcript) {
      setDreamText(prev => prev + ' ' + transcript);
      setValue('dreamContent', dreamText + ' ' + transcript);
    }
  }, [transcript]);

  // Генерация AI подсказок на основе введенного текста
  useEffect(() => {
    if (dreamText.length > 50) {
      generateAISuggestions();
    }
  }, [dreamText]);

  const generateAISuggestions = () => {
    // Анализируем текст и предлагаем теги
    const suggestions = [];
    
    if (dreamText.toLowerCase().includes('лет')) {
      suggestions.push('полет');
    }
    if (dreamText.toLowerCase().includes('вод')) {
      suggestions.push('вода');
    }
    if (dreamText.toLowerCase().includes('животн')) {
      suggestions.push('животные');
    }
    if (dreamText.toLowerCase().includes('дом')) {
      suggestions.push('дом');
    }
    if (dreamText.toLowerCase().includes('человек') || dreamText.toLowerCase().includes('люд')) {
      suggestions.push('люди');
    }
    
    setAiSuggestions(suggestions);
  };

  const calculateDreamScore = () => {
    let score = 0;
    
    // Длина описания
    if (dreamText.length > 100) score += 20;
    if (dreamText.length > 300) score += 20;
    
    // Детализация
    if (tags.length > 3) score += 15;
    
    // Эмоциональная окраска
    if (selectedMood !== 'neutral') score += 10;
    
    // Качество сна
    score += sleepQuality * 3;
    
    // Осознанность
    score += lucidityLevel * 2;
    
    setDreamScore(Math.min(100, score));
    return score;
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      setIsRecording(false);
    } else {
      startListening();
      setIsRecording(true);
      resetTranscript();
    }
  };

  const onSubmit = async (data) => {
    if (!dreamText.trim()) {
      toast.error('Пожалуйста, опишите свой сон');
      return;
    }

    setIsInterpreting(true);
    const score = calculateDreamScore();
    
    try {
      const response = await axios.post('/dreams', {
        title: data.title || `${dreamPhases.find(p => p.id === dreamPhase)?.name} от ${new Date().toLocaleDateString()}`,
        content: dreamText,
        mood: selectedMood,
        tags: tags,
        isRecurring,
        lucidityLevel,
        sleepQuality,
        dreamPhase,
        score
      });

      setInterpretation(response.data.interpretation);
      
      if (data.autoSpeak) {
        speak(response.data.interpretation.general);
      }

      toast.success('Интерпретация готова!');
      
      // Показываем визуализатор если оценка высокая
      if (score > 70) {
        setShowVisualizer(true);
        toast.success('🌟 Отличное описание сна! Попробуйте визуализацию');
      }
      
    } catch (error) {
      toast.error('Ошибка при интерпретации сна');
      console.error(error);
    } finally {
      setIsInterpreting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основная форма */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700"
          >
            {/* Заголовок с фазами */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Интерпретация снов
              </h1>
              
              {/* Выбор фазы сна */}
              <div className="flex space-x-2 mb-4">
                {dreamPhases.map((phase) => (
                  <button
                    key={phase.id}
                    onClick={() => setDreamPhase(phase.id)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                      dreamPhase === phase.id
                        ? `bg-gradient-to-r ${phase.color} text-white`
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <phase.icon />
                    <span>{phase.name}</span>
                  </button>
                ))}
              </div>
              
              <p className="text-gray-400">
                Расскажите о своем сне, и искусственный интеллект поможет понять его значение
              </p>
            </div>

            {/* Быстрые действия */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setShowVisualizer(!showVisualizer)}
                className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                  showVisualizer
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FiImage />
                <span>Визуализация</span>
              </button>
              
              <button
                onClick={() => setShowMusicPlayer(!showMusicPlayer)}
                className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                  showMusicPlayer
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FiMusic />
                <span>Музыка</span>
              </button>
              
              <button
                onClick={() => {
                  const tip = dreamTips[Math.floor(Math.random() * dreamTips.length)];
                  toast(tip, { icon: '💡' });
                }}
                className="px-3 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                <FiCpu />
                <span>Совет</span>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Dream Content with Voice Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Опишите свой сон
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleVoiceToggle}
                      className={`p-2 rounded-lg transition-all ${
                        isRecording 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {isRecording ? <FiMicOff size={20} /> : <FiMic size={20} />}
                    </button>
                  </div>
                </div>
                
                <textarea
                  ref={textareaRef}
                  value={dreamText}
                  onChange={(e) => setDreamText(e.target.value)}
                  placeholder="Расскажите, что вам приснилось. Чем больше деталей, тем точнее интерпретация..."
                  className="w-full h-40 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                
                {/* AI подсказки для тегов */}
                {aiSuggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">AI предлагает теги:</p>
                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            if (!tags.includes(suggestion)) {
                              setTags([...tags, suggestion]);
                            }
                          }}
                          className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs hover:bg-purple-600/30"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mood Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Эмоциональный окрас
                  </label>
                  <DreamMoodSelector value={selectedMood} onChange={setSelectedMood} />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Теги
                  </label>
                  <TagInput tags={tags} setTags={setTags} />
                </div>

                {/* Lucidity Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Уровень осознанности
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={lucidityLevel}
                    onChange={(e) => setLucidityLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Обычный</span>
                    <span>{lucidityLevel}</span>
                    <span>Осознанный</span>
                  </div>
                </div>

                {/* Sleep Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Качество сна
                  </label>
                  <div className="flex space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSleepQuality(i + 1)}
                        className="flex-1"
                      >
                        <FiStar 
                          className={`w-full ${
                            i < sleepQuality 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isInterpreting || !dreamText.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isInterpreting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Анализирую...</span>
                  </>
                ) : (
                  <>
                    <FiZap />
                    <span>Интерпретировать</span>
                  </>
                )}
              </button>
            </form>

            {/* Dream Score */}
            {dreamScore !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white">Качество описания сна:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dreamScore}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                    <span className="text-purple-400 font-bold">{dreamScore}%</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Interpretation Display */}
            <AnimatePresence>
              {interpretation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8"
                >
                  <InterpretationDisplay interpretation={interpretation} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Статистика пользователя */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiTrendingUp className="mr-2" />
              Ваша статистика
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Записано снов:</span>
                <span className="text-white font-semibold">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Средняя осознанность:</span>
                <span className="text-purple-400 font-semibold">6.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Любимый символ:</span>
                <span className="text-blue-400 font-semibold">Вода</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Качество сна:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i}
                      className={`w-4 h-4 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Музыкальный плеер */}
          {showMusicPlayer && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <SleepPlayer />
            </motion.div>
          )}

          {/* Визуализатор */}
          {showVisualizer && dreamText && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <DreamVisualizer dreamContent={dreamText} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamChat;
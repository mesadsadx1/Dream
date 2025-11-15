import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiMic, FiMicOff, FiSend, FiVolume2, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from '../services/api';
import { useSpeechRecognition, useSpeechSynthesis } from '../hooks/useSpeech';
import DreamMoodSelector from '../components/Chat/DreamMoodSelector';
import InterpretationDisplay from '../components/Chat/InterpretationDisplay';
import TagInput from '../components/UI/TagInput';

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
  
  const { register, handleSubmit, reset, setValue } = useForm();
  const textareaRef = useRef(null);
  
  // Speech Recognition Hook
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();
  
  // Text to Speech Hook
  const { speak, speaking, cancel: cancelSpeaking } = useSpeechSynthesis();

  useEffect(() => {
    if (transcript) {
      setDreamText(prev => prev + ' ' + transcript);
      setValue('dreamContent', dreamText + ' ' + transcript);
    }
  }, [transcript]);

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
    
    try {
      const response = await axios.post('/dreams', {
        title: data.title || `Сон от ${new Date().toLocaleDateString()}`,
        content: dreamText,
        mood: selectedMood,
        tags: tags,
        isRecurring,
        lucidityLevel,
        sleepQuality
      });

      setInterpretation(response.data.interpretation);
      
      // Автоматически озвучиваем интерпретацию, если включено
      if (data.autoSpeak) {
        speak(response.data.interpretation.general);
      }

      toast.success('Интерпретация готова!');
    } catch (error) {
      toast.error('Ошибка при интерпретации сна');
      console.error(error);
    } finally {
      setIsInterpreting(false);
    }
  };

  const saveDream = async () => {
    if (!interpretation) return;
    
    try {
      await axios.post('/dreams/save', {
        dreamId: interpretation.id,
        title: interpretation.title
      });
      toast.success('Сон сохранен в вашем дневнике');
    } catch (error) {
      toast.error('Ошибка при сохранении');
    }
  };

  const speakInterpretation = () => {
    if (interpretation) {
      const text = `${interpretation.general}. 
        Ключевые символы: ${interpretation.symbols.join(', ')}.
        Рекомендации: ${interpretation.recommendations.join('. ')}`;
      speak(text);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Интерпретация снов
          </h1>
          <p className="text-gray-400">
            Расскажите о своем сне, и искусственный интеллект поможет понять его значение
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dream Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название сна (опционально)
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Например: Полет над городом"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Dream Content with Voice Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Опишите свой сон
              </label>
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
            
            <textarea
              ref={textareaRef}
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder="Расскажите, что вам приснилось. Чем больше деталей, тем точнее интерпретация..."
              className="w-full h-40 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 flex items-center space-x-2"
              >
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [10, 20, 10] }}
                      transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                      className="w-1 bg-red-500 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">Слушаю...</span>
              </motion.div>
            )}
          </div>

          {/* Additional Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mood Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Эмоциональный окрас сна
              </label>
              <DreamMoodSelector value={selectedMood} onChange={setSelectedMood} />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Теги (нажмите Enter для добавления)
              </label>
              <TagInput tags={tags} setTags={setTags} />
            </div>

            {/* Lucidity Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Уровень осознанности (0-10)
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
                <span>Обычный сон</span>
                <span>{lucidityLevel}</span>
                <span>Осознанный сон</span>
              </div>
            </div>

            {/* Sleep Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Качество сна (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Плохой</span>
                <span>{sleepQuality}</span>
                <span>Отличный</span>
              </div>
            </div>
          </div>

          {/* Recurring Dream Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="recurring" className="text-gray-300">
              Этот сон повторяется
            </label>
          </div>

          {/* Auto Speak Option */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoSpeak"
              {...register('autoSpeak')}
              className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="autoSpeak" className="text-gray-300">
              Озвучить интерпретацию
            </label>
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
                <FiSend />
                <span>Интерпретировать</span>
              </>
            )}
          </button>
        </form>

        {/* Interpretation Display */}
        <AnimatePresence>
          {interpretation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Интерпретация</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={speakInterpretation}
                    disabled={speaking}
                    className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                  >
                    <FiVolume2 />
                  </button>
                  <button
                    onClick={saveDream}
                    className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                  >
                    <FiSave />
                  </button>
                </div>
              </div>
              
              <InterpretationDisplay interpretation={interpretation} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DreamChat;
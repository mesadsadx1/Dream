import React from 'react';
import { motion } from 'framer-motion';

const DreamMoodSelector = ({ value, onChange }) => {
  const moods = [
    { id: 'positive', label: '😊 Позитивный', color: 'from-yellow-500 to-orange-500' },
    { id: 'neutral', label: '😐 Нейтральный', color: 'from-gray-500 to-gray-600' },
    { id: 'negative', label: '😰 Тревожный', color: 'from-red-500 to-pink-500' },
    { id: 'mysterious', label: '🌙 Загадочный', color: 'from-purple-500 to-indigo-500' }
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {moods.map((mood) => (
        <button
          key={mood.id}
          type="button"
          onClick={() => onChange(mood.id)}
          className={`p-3 rounded-lg border-2 transition-all ${
            value === mood.id
              ? 'border-purple-500 bg-purple-500/20'
              : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
          }`}
        >
          <span className="text-sm text-white">{mood.label}</span>
        </button>
      ))}
    </div>
  );
};

export default DreamMoodSelector;
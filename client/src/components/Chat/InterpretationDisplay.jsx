import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const InterpretationDisplay = ({ interpretation }) => {
  if (!interpretation) return null;

  return (
    <div className="space-y-6">
      {/* Общая интерпретация */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30"
      >
        <h3 className="text-lg font-semibold text-white mb-3">Интерпретация</h3>
        <div className="text-gray-300 prose prose-invert max-w-none">
          <ReactMarkdown>{interpretation.general || interpretation.rawResponse}</ReactMarkdown>
        </div>
      </motion.div>

      {/* Символы */}
      {interpretation.symbols && interpretation.symbols.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-gray-700/50 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-3">Ключевые символы</h3>
          <div className="flex flex-wrap gap-2">
            {interpretation.symbols.map((symbol, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm"
              >
                {symbol}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Рекомендации */}
      {interpretation.recommendations && interpretation.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-gray-700/50 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-3">Рекомендации</h3>
          <ul className="space-y-2">
            {interpretation.recommendations.map((rec, index) => (
              <li key={index} className="text-gray-300 flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default InterpretationDisplay;
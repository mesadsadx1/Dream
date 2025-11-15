import React from 'react';
import { motion } from 'framer-motion';
import { FiMoon } from 'react-icons/fi';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <FiMoon className="text-6xl text-purple-400 mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">DreamAI</h2>
        <p className="text-gray-400">Загружаем мир снов...</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
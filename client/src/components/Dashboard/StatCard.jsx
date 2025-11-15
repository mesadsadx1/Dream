import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon, title, value, change, color, subtitle }) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    pink: 'from-pink-500 to-pink-600'
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-r ${colorClasses[color]} rounded-lg text-white`}>
          {icon}
        </div>
        {change && (
          <span className={`text-sm ${change.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400 mt-1">{subtitle || title}</p>
      </div>
    </div>
  );
};

export default StatCard;
import React from 'react';

const DreamStatistics = ({ stats }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Статистика</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-400">{stats.totalDreams || 0}</p>
          <p className="text-sm text-gray-400">Всего снов</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-400">{stats.avgLucidity || 0}</p>
          <p className="text-sm text-gray-400">Ср. осознанность</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-400">{stats.recurringCount || 0}</p>
          <p className="text-sm text-gray-400">Повторяющихся</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-pink-400">{stats.thisMonth || 0}</p>
          <p className="text-sm text-gray-400">В этом месяце</p>
        </div>
      </div>
    </div>
  );
};

export default DreamStatistics;
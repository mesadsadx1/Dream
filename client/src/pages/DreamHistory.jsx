import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiCalendar, FiMoon, FiSun, FiCloud } from 'react-icons/fi';
import axios from '../services/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const DreamHistory = () => {
  const [dreams, setDreams] = useState([]);
  const [filteredDreams, setFilteredDreams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    try {
      const response = await axios.get('/dreams');
      setDreams(response.data);
      setFilteredDreams(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterDreams(term, filter);
  };

  const handleFilter = (filterType) => {
    setFilter(filterType);
    filterDreams(searchTerm, filterType);
  };

  const filterDreams = (search, filterType) => {
    let filtered = dreams;

    if (search) {
      filtered = filtered.filter(dream =>
        dream.title?.toLowerCase().includes(search.toLowerCase()) ||
        dream.content?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(dream => {
        const dreamDate = new Date(dream.created_at);
        if (filterType === 'week') return dreamDate >= weekAgo;
        if (filterType === 'month') return dreamDate >= monthAgo;
        if (filterType === 'recurring') return dream.is_recurring;
        return true;
      });
    }

    setFilteredDreams(filtered);
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'positive': return <FiSun className="text-yellow-400" />;
      case 'negative': return <FiCloud className="text-gray-400" />;
      default: return <FiMoon className="text-purple-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">История снов</h1>
        <p className="text-gray-400">Все ваши записанные сны в одном месте</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Поиск по снам..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => handleFilter('week')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'week'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => handleFilter('month')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'month'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Месяц
            </button>
            <button
              onClick={() => handleFilter('recurring')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'recurring'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Повторяющиеся
            </button>
          </div>
        </div>
      </div>

      {/* Dreams List */}
      <div className="space-y-4">
        {filteredDreams.length === 0 ? (
          <div className="text-center py-12">
            <FiMoon className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Сны не найдены</p>
          </div>
        ) : (
          filteredDreams.map((dream, index) => (
            <motion.div
              key={dream.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getMoodIcon(dream.mood)}
                    <h3 className="text-xl font-semibold text-white">
                      {dream.title || `Сон от ${format(new Date(dream.created_at), 'dd MMMM', { locale: ru })}`}
                    </h3>
                    {dream.is_recurring && (
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                        Повторяющийся
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 mb-3 line-clamp-2">{dream.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiCalendar />
                      {format(new Date(dream.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </span>
                    {dream.lucidity_level > 0 && (
                      <span>Осознанность: {dream.lucidity_level}/10</span>
                    )}
                    {dream.sleep_quality && (
                      <span>Качество сна: {dream.sleep_quality}/10</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default DreamHistory;
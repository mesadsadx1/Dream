import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiMoon, 
  FiTrendingUp, 
  FiCalendar, 
  FiBarChart2,
  FiClock,
  FiLayers,
  FiBookOpen
} from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from '../services/api';
import StatCard from '../components/Dashboard/StatCard';
import RecentDreams from '../components/Dashboard/RecentDreams';
import DreamCalendar from '../components/Dashboard/DreamCalendar';
import MoodTracker from '../components/Dashboard/MoodTracker';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDreams: 0,
    thisMonth: 0,
    avgLucidity: 0,
    recurringCount: 0,
    patterns: []
  });
  const [recentDreams, setRecentDreams] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, dreamsRes, moodRes] = await Promise.all([
        axios.get('/analytics/stats'),
        axios.get('/dreams?limit=5'),
        axios.get('/analytics/mood-trends')
      ]);

      setStats(statsRes.data);
      setRecentDreams(dreamsRes.data);
      setMoodData(moodRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Добро пожаловать в мир снов
        </h1>
        <p className="text-gray-400">
          Исследуйте свое подсознание через анализ сновидений
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <StatCard
            icon={<FiMoon />}
            title="Всего снов"
            value={stats.totalDreams}
            change="+12%"
            color="purple"
          />
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <StatCard
            icon={<FiCalendar />}
            title="В этом месяце"
            value={stats.thisMonth}
            change="+5"
            color="blue"
          />
        </motion.div>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <StatCard
            icon={<FiTrendingUp />}
            title="Осознанность"
            value={`${stats.avgLucidity}/10`}
            change="+0.5"
            color="green"
          />
        </motion.div>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <StatCard
            icon={<FiLayers />}
            title="Повторяющиеся"
            value={stats.recurringCount}
            subtitle="снов"
            color="pink"
          />
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Dreams */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Последние сны</h2>
              <Link
                to="/history"
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                Смотреть все →
              </Link>
            </div>
            <RecentDreams dreams={recentDreams} />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">Быстрые действия</h2>
            <div className="space-y-3">
              <Link
                to="/interpret"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <FiMoon className="text-purple-400" />
                  <span className="text-white">Записать новый сон</span>
                </div>
                <span className="text-purple-400">→</span>
              </Link>

              <Link
                to="/patterns"
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <FiLayers className="text-blue-400" />
                  <span className="text-white">Анализ паттернов</span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>

              <Link
                to="/journal"
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <FiBookOpen className="text-green-400" />
                  <span className="text-white">Дневник снов</span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Mood Trends */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Эмоциональная динамика</h2>
          <MoodTracker data={moodData} />
        </div>

        {/* Dream Calendar */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Календарь снов</h2>
          <DreamCalendar />
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 backdrop-blur-xl rounded-xl p-8 border border-purple-500/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          💡 Инсайт дня
        </h2>
        <p className="text-gray-300 mb-4">
          Ваши сны показывают увеличение осознанности на 15% за последний месяц. 
          Продолжайте вести дневник снов и практиковать техники осознанных сновидений.
        </p>
        <Link
          to="/analytics"
          className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300"
        >
          <FiBarChart2 />
          <span>Подробная аналитика</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default Dashboard;
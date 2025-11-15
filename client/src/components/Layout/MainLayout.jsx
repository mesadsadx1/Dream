import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiMessageCircle,
  FiBook,
  FiBarChart2,
  FiUser,
  FiSettings,
  FiMenu,
  FiX,
  FiMoon,
  FiSun,
  FiClock,
  FiLayers
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Дашборд', href: '/dashboard', icon: FiHome },
    { name: 'Интерпретация', href: '/interpret', icon: FiMessageCircle },
    { name: 'История снов', href: '/history', icon: FiClock },
    { name: 'Дневник снов', href: '/journal', icon: FiBook },
    { name: 'Паттерны', href: '/patterns', icon: FiLayers },
    { name: 'Аналитика', href: '/analytics', icon: FiBarChart2 },
    { name: 'Профиль', href: '/profile', icon: FiUser },
    { name: 'Настройки', href: '/settings', icon: FiSettings }
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-72 bg-gray-800/50 backdrop-blur-xl border-r border-gray-700"
          >
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <FiMoon className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">DreamAI</h1>
                    <p className="text-xs text-gray-400">Интерпретатор снов</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="text-xl" />
                    <span className="font-medium">{item.name}</span>
                  </NavLink>
                ))}
              </nav>

              {/* User section */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user?.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user?.username}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-all"
                >
                  Выйти
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800/30 backdrop-blur-md border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:text-white transition-all"
              >
                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
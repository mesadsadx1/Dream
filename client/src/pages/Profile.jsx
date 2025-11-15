import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from '../services/api';
import AvatarUpload from '../components/Profile/AvatarUpload';
import DreamStatistics from '../components/Profile/DreamStatistics';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchProfile();
    fetchUserStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/profile');
      setProfile(response.data);
      reset(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/profile/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await axios.put('/profile', data);
      setProfile(response.data);
      setIsEditing(false);
      toast.success('Профиль успешно обновлен');
    } catch (error) {
      toast.error('Ошибка при обновлении профиля');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Мой профиль</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-all"
          >
            {isEditing ? <FiX /> : <FiEdit2 />}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <AvatarUpload 
                currentAvatar={profile?.avatar}
                onUpload={(url) => setValue('avatar', url)}
                isEditing={isEditing}
              />
              
              {stats && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-400">{stats.totalDreams}</p>
                  <p className="text-sm text-gray-400">Записано снов</p>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                  <FiUser />
                  <span>Имя пользователя</span>
                </label>
                <input
                  {...register('username')}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                  <FiMail />
                  <span>Email</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                  <FiPhone />
                  <span>Телефон</span>
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  disabled={!isEditing}
                  placeholder="+7 (999) 999-99-99"
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                  <FiCalendar />
                  <span>Дата рождения</span>
                </label>
                <input
                  {...register('birthDate')}
                  type="date"
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                />
              </div>

              {isEditing && (
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
                >
                  <FiSave />
                  <span>Сохранить изменения</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>

      {/* Statistics */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DreamStatistics stats={stats} />
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
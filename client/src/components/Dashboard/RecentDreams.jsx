import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FiMoon } from 'react-icons/fi';

const RecentDreams = ({ dreams }) => {
  if (!dreams || dreams.length === 0) {
    return (
      <div className="text-center py-8">
        <FiMoon className="text-4xl text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400">Нет записанных снов</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dreams.map((dream) => (
        <div key={dream.id} className="p-4 bg-gray-700/50 rounded-lg">
          <h4 className="font-medium text-white mb-1">
            {dream.title || 'Без названия'}
          </h4>
          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
            {dream.content}
          </p>
          <p className="text-xs text-gray-500">
            {format(new Date(dream.created_at), 'dd MMMM yyyy', { locale: ru })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default RecentDreams;
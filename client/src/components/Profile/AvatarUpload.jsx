import React from 'react';
import { FiCamera, FiUser } from 'react-icons/fi';

const AvatarUpload = ({ currentAvatar, onUpload, isEditing }) => {
  return (
    <div className="relative">
      <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
        {currentAvatar ? (
          <img src={currentAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
        ) : (
          <FiUser className="text-white text-5xl" />
        )}
      </div>
      {isEditing && (
        <button
          type="button"
          className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white hover:bg-purple-700"
        >
          <FiCamera />
        </button>
      )}
    </div>
  );
};

export default AvatarUpload;
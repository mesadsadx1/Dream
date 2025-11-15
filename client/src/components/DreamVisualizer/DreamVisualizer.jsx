import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiImage, FiDownload, FiShare2, FiRefreshCw, 
  FiZap, FiLayers, FiEye, FiHeart, FiStar 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const DreamVisualizer = ({ dreamContent }) => {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState('surreal');
  const [favorites, setFavorites] = useState([]);
  const [gallery, setGallery] = useState([]);

  const artStyles = [
    { id: 'surreal', name: 'Сюрреализм', emoji: '🎭' },
    { id: 'fantasy', name: 'Фэнтези', emoji: '🧙‍♂️' },
    { id: 'abstract', name: 'Абстракция', emoji: '🎨' },
    { id: 'cosmic', name: 'Космос', emoji: '🌌' },
    { id: 'watercolor', name: 'Акварель', emoji: '💧' },
    { id: 'anime', name: 'Аниме', emoji: '🌸' },
    { id: 'oil', name: 'Масло', emoji: '🖼️' },
    { id: 'neon', name: 'Неон', emoji: '💜' }
  ];

  const generateDreamImage = async () => {
    setIsGenerating(true);
    
    // Имитация генерации изображения
    setTimeout(() => {
      // Генерируем градиентное изображение как заглушку
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      // Создаем красивый градиент на основе стиля
      const gradients = {
        surreal: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        fantasy: ['#667EEA', '#764BA2', '#F093FB'],
        abstract: ['#FA709A', '#FEE140', '#30CFD0'],
        cosmic: ['#0F0C29', '#302B63', '#24243E'],
        watercolor: ['#A8E6CF', '#FFDAC1', '#FFB7B2'],
        anime: ['#FFB6C1', '#FFE4E1', '#FFC0CB'],
        oil: ['#8B4513', '#D2691E', '#DEB887'],
        neon: ['#B721FF', '#21D4FD', '#FF21D0']
      };
      
      const colors = gradients[style] || gradients.surreal;
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[1]);
      gradient.addColorStop(1, colors[2]);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      
      // Добавляем случайные круги для эффекта
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * 512,
          Math.random() * 512,
          Math.random() * 50 + 10,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
        ctx.fill();
      }
      
      const imageUrl = canvas.toDataURL('image/png');
      setGeneratedImage(imageUrl);
      
      // Добавляем в галерею
      const newImage = {
        id: Date.now(),
        url: imageUrl,
        style: style,
        dreamContent: dreamContent,
        createdAt: new Date().toISOString(),
        likes: Math.floor(Math.random() * 100)
      };
      
      setGallery(prev => [newImage, ...prev].slice(0, 9));
      localStorage.setItem('dreamGallery', JSON.stringify([newImage, ...gallery].slice(0, 9)));
      
      setIsGenerating(false);
      toast.success('Изображение сна создано!');
    }, 3000);
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `dream-${Date.now()}.png`;
    a.click();
    toast.success('Изображение сохранено!');
  };

  const shareImage = async () => {
    if (!generatedImage) return;
    
    if (navigator.share) {
      try {
        const blob = await fetch(generatedImage).then(r => r.blob());
        const file = new File([blob], 'dream.png', { type: 'image/png' });
        await navigator.share({
          title: 'Мой сон в изображении',
          text: 'Посмотрите, какой сон мне приснился!',
          files: [file]
        });
      } catch (error) {
        toast.error('Не удалось поделиться');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована!');
    }
  };

  const addToFavorites = () => {
    if (!generatedImage) return;
    
    const newFavorite = {
      id: Date.now(),
      image: generatedImage,
      date: new Date().toISOString()
    };
    
    const updatedFavorites = [...favorites, newFavorite];
    setFavorites(updatedFavorites);
    localStorage.setItem('favoriteDreams', JSON.stringify(updatedFavorites));
    toast.success('Добавлено в избранное!');
  };

  useEffect(() => {
    // Загружаем галерею из localStorage
    const savedGallery = localStorage.getItem('dreamGallery');
    if (savedGallery) {
      setGallery(JSON.parse(savedGallery));
    }
    
    const savedFavorites = localStorage.getItem('favoriteDreams');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Стили генерации */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiImage className="mr-2" />
          Визуализация сна
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-3">Выберите стиль изображения:</p>
          <div className="grid grid-cols-4 gap-2">
            {artStyles.map((artStyle) => (
              <button
                key={artStyle.id}
                onClick={() => setStyle(artStyle.id)}
                className={`p-3 rounded-lg text-sm transition-all ${
                  style === artStyle.id
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-2xl block mb-1">{artStyle.emoji}</span>
                <span className="text-xs">{artStyle.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Генератор */}
        <button
          onClick={generateDreamImage}
          disabled={isGenerating || !dreamContent}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiRefreshCw />
              </motion.div>
              <span>Создаю визуализацию...</span>
            </>
          ) : (
            <>
              <FiZap />
              <span>Создать изображение сна</span>
            </>
          )}
        </button>
      </div>

      {/* Результат */}
      <AnimatePresence>
        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700"
          >
            <div className="relative group">
              <img 
                src={generatedImage} 
                alt="Dream visualization"
                className="w-full rounded-lg"
              />
              
              {/* Overlay с действиями */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-4">
                <button
                  onClick={downloadImage}
                  className="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-all"
                >
                  <FiDownload className="text-white text-xl" />
                </button>
                <button
                  onClick={shareImage}
                  className="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-all"
                >
                  <FiShare2 className="text-white text-xl" />
                </button>
                <button
                  onClick={addToFavorites}
                  className="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-all"
                >
                  <FiHeart className="text-white text-xl" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                  {artStyles.find(s => s.id === style)?.name}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <button className="flex items-center space-x-1 hover:text-white">
                  <FiEye />
                  <span className="text-sm">{Math.floor(Math.random() * 1000)}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-red-400">
                  <FiHeart />
                  <span className="text-sm">{Math.floor(Math.random() * 100)}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Галерея */}
      {gallery.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
          <h4 className="text-white font-semibold mb-4 flex items-center">
            <FiLayers className="mr-2" />
            Галерея визуализаций
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {gallery.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
              >
                <img 
                  src={item.url} 
                  alt="Dream"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs truncate">
                      {artStyles.find(s => s.id === item.style)?.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamVisualizer;
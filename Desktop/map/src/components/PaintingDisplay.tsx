import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';

export const PaintingDisplay: React.FC = () => {
  const { painting, gameState } = useGame();

  if (gameState === 'loading') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading painting...</p>
        </div>
      </div>
    );
  }

  if (!painting) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <p className="text-gray-600 text-lg">No painting loaded</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative overflow-hidden rounded-xl mb-4"
        >
          <img
            src={painting.imageUrl}
            alt={painting.title}
            className="w-full h-auto object-contain max-h-96 rounded-xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Painting+Image';
            }}
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{painting.title}</h2>
          <p className="text-lg text-gray-600 italic">by {painting.artist}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';

export const PaintingDisplay: React.FC = () => {
  const { painting, gameState } = useGame();

  if (gameState === 'loading') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading painting...</p>
        </div>
      </div>
    );
  }

  if (!painting) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-600 text-lg">No painting loaded</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex items-center justify-center p-4"
    >
      <img
        src={painting.imageUrl}
        alt={painting.title}
        className="w-full h-full object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Painting+Image';
        }}
      />
    </motion.div>
  );
};

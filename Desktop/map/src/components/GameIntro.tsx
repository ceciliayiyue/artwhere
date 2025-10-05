import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const GameIntro: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(true)}
            className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
          >
            Instructions
          </motion.button>
        ) : (
          <motion.div
            key="box"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-sm cursor-pointer hover:bg-white transition-colors duration-200"
          >
            <div className="space-y-2 text-gray-700">
              <p className="text-xs leading-relaxed">
                <strong>📍 GUESS WHERE IT WAS CREATED:</strong> Pin the location where the artist painted this masterpiece
              </p>
              <p className="text-xs leading-relaxed">
                <strong>📍 GUESS WHERE IT IS NOW:</strong> Pin where you think this artwork lives today
              </p>
              <p className="text-xs leading-relaxed">
                <strong>🚢 LEARN THE JOURNEY:</strong> Discover the amazing story behind the art!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
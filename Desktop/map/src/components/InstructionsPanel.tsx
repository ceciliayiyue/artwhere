import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';

export const InstructionsPanel: React.FC = () => {
  const { showInstructions, setShowInstructions } = useGame();

  return (
    <AnimatePresence>
      {showInstructions && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden bg-gradient-to-r from-primary to-indigo-600 text-white"
        >
          <div className="px-6 py-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-3xl font-black mb-3 tracking-tight">
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent drop-shadow-lg">
                    art
                  </span>
                  <span className="text-white">,</span>
                  <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg">
                    where
                  </span>
                  <span className="text-pink-300">?</span>
                </h3>
                <ol className="space-y-3 text-base">
                  <li className="flex items-center">
                    <span className="text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-black text-lg" style={{ backgroundColor: '#A0826D' }}>
                      1
                    </span>
                    <span className="font-medium">Drop the <strong className="text-amber-200 font-bold">light brown pin</strong> where you think the painting was created</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-black text-lg" style={{ backgroundColor: '#8B6F47' }}>
                      2
                    </span>
                    <span className="font-medium">Drop the <strong className="text-yellow-200 font-bold">dark brown pin</strong> where you think the painting is located now</span>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-black text-lg">
                      3
                    </span>
                    <span className="font-medium">Click Submit to check your answers</span>
                  </li>
                </ol>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="ml-4 text-white hover:text-gray-200 transition-colors"
                aria-label="Close instructions"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

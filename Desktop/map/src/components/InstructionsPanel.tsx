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
                <h3 className="text-xl font-bold mb-3">How to Play</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 font-bold">
                      1
                    </span>
                    <span>Drop the <strong className="text-blue-200">BLUE pin</strong> where you think the painting was created</span>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 font-bold">
                      2
                    </span>
                    <span>Drop the <strong className="text-red-200">RED pin</strong> where you think the painting is located now</span>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 font-bold">
                      3
                    </span>
                    <span>Click Submit to check your answers</span>
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

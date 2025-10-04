import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useGame } from '../contexts/GameContext';

export const ResultsDisplay: React.FC = () => {
  const { result, gameState, resetPins, setResult, round, setRound, setGameState } = useGame();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (gameState === 'submitted' && result) {
      if (result.createdCorrect && result.currentCorrect) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  }, [gameState, result]);

  // Keyboard shortcut: Press Enter to go to next painting
  useEffect(() => {
    if (gameState !== 'submitted') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  const handleNext = () => {
    resetPins();
    setResult(null);
    setRound(round + 1);
    setGameState('loading');
  };

  if (gameState !== 'submitted' || !result) return null;

  const perfectScore = result.createdCorrect && result.currentCorrect;
  const partialScore = result.createdCorrect || result.currentCorrect;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="fixed top-4 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-[calc(100%-1rem)] sm:max-w-md w-full mx-2 sm:mx-4"
        >
          <div
            className={`rounded-2xl shadow-2xl p-4 sm:p-6 ${
              perfectScore
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : partialScore
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                : 'bg-gradient-to-br from-red-500 to-rose-600'
            } text-white`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-center mb-3 sm:mb-4"
            >
              <div className="text-5xl sm:text-6xl mb-2">
                {perfectScore ? '🎉' : partialScore ? '😊' : '😅'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">
                {perfectScore
                  ? 'Perfect!'
                  : partialScore
                  ? 'Good Try!'
                  : 'Not Quite!'}
              </h2>
            </motion.div>

            <div className="space-y-2 sm:space-y-3">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`p-2 sm:p-3 rounded-lg ${
                  result.createdCorrect ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    <span className="font-semibold text-sm sm:text-base">Where Created?</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold">
                    {result.createdCorrect ? '✓' : '✗'}
                  </div>
                </div>
                {!result.createdCorrect && result.createdDistance && (
                  <p className="text-xs sm:text-sm mt-1 ml-5 sm:ml-7 opacity-90">
                    Off by {result.createdDistance.toLocaleString()} km
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`p-2 sm:p-3 rounded-lg ${
                  result.currentCorrect ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    <span className="font-semibold text-sm sm:text-base">Where Now?</span>
                  </div>
                  <div className="text-base sm:text-lg font-bold">
                    {result.currentCorrect ? '✓' : '✗'}
                  </div>
                </div>
                {!result.currentCorrect && result.currentDistance && (
                  <p className="text-xs sm:text-sm mt-1 ml-5 sm:ml-7 opacity-90">
                    Off by {result.currentDistance.toLocaleString()} km
                  </p>
                )}
              </motion.div>
            </div>

            {perfectScore && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mt-3 sm:mt-4 text-xs sm:text-sm opacity-90"
              >
                You got both locations correct! Amazing! 🌟
              </motion.p>
            )}

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              onClick={handleNext}
              className="w-full mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-800 rounded-xl font-bold hover:scale-105 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group text-sm sm:text-base"
            >
              <span>Next Painting</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center mt-2 sm:mt-3 text-[10px] sm:text-xs opacity-75 hidden sm:block"
            >
              Press <kbd className="px-2 py-1 bg-white/20 rounded">Enter</kbd> or <kbd className="px-2 py-1 bg-white/20 rounded">Space</kbd>
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

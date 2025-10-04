import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { calculateDistance, isGuessCorrect } from '../utils/distance';
import type { GameResult } from '../types/game';

export const ControlPanel: React.FC = () => {
  const {
    createdPin,
    currentPin,
    gameState,
    setGameState,
    painting,
    setResult,
    score,
    setScore,
    round,
    setRound,
    resetPins,
  } = useGame();

  const canSubmit = createdPin.location && currentPin.location && gameState === 'playing';

  const handleSubmit = () => {
    if (!canSubmit || !painting) return;

    const createdCorrect = isGuessCorrect(createdPin.location!, painting.createdLocation);
    const currentCorrect = isGuessCorrect(currentPin.location!, painting.currentLocation);

    const result: GameResult = {
      createdCorrect,
      currentCorrect,
      createdDistance: !createdCorrect
        ? calculateDistance(createdPin.location!, painting.createdLocation)
        : undefined,
      currentDistance: !currentCorrect
        ? calculateDistance(currentPin.location!, painting.currentLocation)
        : undefined,
    };

    setResult(result);
    setGameState('submitted');

    // Update score: 1 point for each correct guess
    const pointsEarned = (createdCorrect ? 1 : 0) + (currentCorrect ? 1 : 0);
    setScore(score + pointsEarned);
  };

  const handleNext = () => {
    resetPins();
    setResult(null);
    setRound(round + 1);
    setGameState('loading');
    // Parent component should handle loading next painting
  };

  const handleReset = () => {
    resetPins();
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-t-2xl p-3 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 sm:mb-4">
        <div className="flex items-center space-x-4 sm:space-x-8 w-full sm:w-auto justify-center sm:justify-start">
          <div className="text-center">
            <p className="text-xs sm:text-base text-gray-600 mb-1 sm:mb-2 font-semibold uppercase tracking-wide">Score</p>
            <motion.p
              key={score}
              initial={{ scale: 1.5, color: '#10B981' }}
              animate={{ scale: 1, color: '#6B1B9A' }}
              className="text-4xl sm:text-6xl font-spartan font-black text-purple-primary"
            >
              {score}
            </motion.p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-base text-gray-600 mb-1 sm:mb-2 font-semibold uppercase tracking-wide">Round</p>
            <p className="text-3xl sm:text-4xl font-spartan font-black text-purple-primary">{round}</p>
          </div>
        </div>

        <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
          {gameState === 'playing' && (
            <>
              <button
                onClick={handleReset}
                disabled={!createdPin.location && !currentPin.location}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-spartan font-bold text-sm sm:text-base uppercase"
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`flex-1 sm:flex-none px-5 sm:px-8 py-2 sm:py-3 rounded-2xl font-spartan font-black text-base sm:text-lg uppercase transition-all transform ${
                  canSubmit
                    ? 'bg-gradient-to-r from-purple-primary to-purple-dark text-white hover:scale-105 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit
              </button>
            </>
          )}

          {gameState === 'submitted' && (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-secondary to-green-600 text-white rounded-2xl font-spartan font-black text-base sm:text-lg uppercase hover:scale-105 transition-transform shadow-lg"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {gameState === 'playing' && (
        <div className="text-sm sm:text-base text-gray-600 text-center font-medium">
          {!createdPin.location && !currentPin.location && (
            <p>Place both pins on the map to submit your guess</p>
          )}
          {createdPin.location && !currentPin.location && (
            <p>Great! Now place the <span className="text-amber-600 font-bold">dark brown pin</span> for the current location</p>
          )}
          {createdPin.location && currentPin.location && (
            <p className="text-green-600 font-bold text-base sm:text-lg">Ready to submit! 🎨</p>
          )}
        </div>
      )}
    </motion.div>
  );
};

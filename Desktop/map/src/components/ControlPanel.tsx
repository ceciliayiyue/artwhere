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
      className="bg-white shadow-lg rounded-t-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Score</p>
            <motion.p
              key={score}
              initial={{ scale: 1.5, color: '#10B981' }}
              animate={{ scale: 1, color: '#1F2937' }}
              className="text-3xl font-bold text-gray-800"
            >
              {score}
            </motion.p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Round</p>
            <p className="text-2xl font-semibold text-gray-700">{round}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          {gameState === 'playing' && (
            <>
              <button
                onClick={handleReset}
                disabled={!createdPin.location && !currentPin.location}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Reset Pins
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`px-6 py-2 rounded-lg font-bold transition-all transform ${
                  canSubmit
                    ? 'bg-gradient-to-r from-primary to-indigo-600 text-white hover:scale-105 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Guess
              </button>
            </>
          )}

          {gameState === 'submitted' && (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-secondary to-green-600 text-white rounded-lg font-bold hover:scale-105 transition-transform shadow-lg"
            >
              Next Painting →
            </button>
          )}
        </div>
      </div>

      {gameState === 'playing' && (
        <div className="text-sm text-gray-500 text-center">
          {!createdPin.location && !currentPin.location && (
            <p>Place both pins on the map to submit your guess</p>
          )}
          {createdPin.location && !currentPin.location && (
            <p>Great! Now place the <span className="text-red-500 font-semibold">RED pin</span> for the current location</p>
          )}
          {createdPin.location && currentPin.location && (
            <p className="text-green-600 font-semibold">Ready to submit! 🎨</p>
          )}
        </div>
      )}
    </motion.div>
  );
};
